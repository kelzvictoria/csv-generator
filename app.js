require("dotenv").config();

const express = require("express");
const Tokens = require("csrf");
const cors = require("cors");
const fs = require("fs");
const formidable = require("formidable");
const decompress = require("decompress");
const path = require("path");
const empty = require("empty-folder");
const dirTree = require("directory-tree");
var stringify = require("csv-stringify");

const auth = require("./auth");
const utils = require("./app-utils");

var session = require("express-session");
var flash = require("connect-flash");

const {
  jsonFormat,
  getProofOfAddressType,
  getProofOfIdType,
  getCDNURL,
  getAPIDATA,
} = utils;

var isProd = process.env["NODE_ENV"] == "production";

var port = process.env["APP_PORT"] || 8080;
var appPath =
  process.env["APP_PATH"] ||
  //(isProd ? "/tools" :
  "/tools-test";
//);
appPath = appPath.endsWith("/")
  ? appPath.substring(0, appPath.length - 1)
  : appPath;
var protocol = process.env["APP_SCHEME"] || "http";

varOutstandingDocColID = process.env["OUTSTANDING_DOC_COL_ID"];

const csrfTokenManager = new Tokens();
var csrfSecret =
  process.env["CSRF_SECRET_KEY"] || csrfTokenManager.secretSync();

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

const staticDataPath = __dirname + "/public";
const filesStaticDataPath = __dirname + "/uploads";

const viewDataPath = __dirname + "/views/_partials";

let csv_template_path = path.join(
  staticDataPath,
  "bulk-upload-template",
  "live_registration_outstanding_docs_tmpl.csv"
);

let duplicated_csv_template_path = path.join(
  filesStaticDataPath,
  "generated-csv",
  "bulk-upload-file.csv"
);

let generated_csv_path = path.join(
  filesStaticDataPath,
  "generated-csv"
  // "/generated-bulk-upload-csv.csv"
);

let err_path = path.join(staticDataPath, `errors.json`);

const err_file = require(err_path);

const app = express();
const router = express.Router();

let demoRealmToken, stanbicRealmToken;

router.use(function (req, res, next) {
  next();
});

// Handler for Static Files
app.use(
  appPath + "",
  express.static(staticDataPath, {
    maxAge: "1d",
  })
);

app.use(
  appPath + "",
  express.static(filesStaticDataPath, {
    maxAge: "1d",
  })
);

app.use(
  session({
    secret: "secret",
    cookie: {
      maxAge: 20000,
    },
    saveUninitialized: true,
    resave: true,
  })
);

app.use(flash());
app.use(express.static("public"));

// Handler for parsing cookies

// Handler for parsing "application/json" data
app.use(express.json());

// Handler for parsing form / "application/x-www-form-urlencoded" data
app.use(express.urlencoded({ extended: true }));

// Handler for managing CORS requests
app.use(appPath + "", cors(corsOptions), router);

// Custom error handler for CSRF errors
app.use(function (err, req, res, next) {
  if (err.code !== "EBADCSRFTOKEN") return next(err);

  // handle CSRF token errors here
  res.status(403);
  res.send("form tampered with");
});

app.set("view engine", "ejs");

app.get(appPath, function (req, res) {
  res.redirect(appPath + "/outstanding-docs");
});

app.get(appPath + "/outstanding-docs", async (req, res) => {
  //stanbicRealmToken = await auth.stanbicRealmToken;

  console.log("req.get('host')", req.get("host"));
  var baseUrl = protocol + "://" + req.get("host") + appPath + "/";
  console.log("baseUrl", baseUrl);
  var redirect_uri = baseUrl + "progress";
  var next_uri =
    baseUrl + (req.path.startsWith("/") ? req.path.substring(1) : req.path);
  console.log("next_uri", next_uri);
  /*if (next_uri != redirect_uri && (config.appPath + req.path) != defaultPath) {
      redirect_uri += '?next_uri=' + encodeURIComponent(next_uri);
/  } */
  // res.redirect(appPath + '/login' + '?redirect_uri=' + encodeURIComponent(redirect_uri));

  res.render(viewDataPath + "/index", {
    appPath: appPath,
    pageName: "outstandingdocs",
    csrfToken: csrfTokenManager.create(csrfSecret),
    client_id: process.env["STANBIC_IBTC_CLIENT_ID"],
    port: process.env["APP_PORT"],
    redirect_uri: redirect_uri,
  });
});

app.get(appPath + "/progress", async (req, res) => {
  var baseUrl = protocol + "://" + req.get("host") + appPath + "/";
  var redirect_uri = baseUrl + "progress";

  res.render(viewDataPath + "/progress", {
    appPath: appPath,
    pageName: "progress",
    csrfToken: csrfTokenManager.create(csrfSecret),
    client_id: process.env["STANBIC_IBTC_CLIENT_ID"],
    redirect_uri: redirect_uri,
  });
});

app.get(appPath + "/csv-generator", async (req, res) => {
  //demoRealmToken = await auth.demoRealmToken;
  /* await empty(zipUploadFolder, false, (o) => {
    if (o.error) console.error(o.error);
  });

  await empty(uploaded_folder_path, false, (o) => {
    if (o.error) console.error(o.error);
  });

  await empty(path.join(staticDataPath, "generated-csv"), false, (o) => {
    if (o.error) console.error(o.error);
  }); */

  /* fs.exists(err_path, function (exists) {
    if (exists) {
      fs.unlinkSync(err_path);
    }

  }); */

  var baseUrl = protocol + "://" + req.get("host") + appPath + "/";
  var redirect_uri = baseUrl + "progress";
  res.render(viewDataPath + "/csvGenerator", {
    appPath: appPath,
    pageName: "csv-generator",
    csrfToken: csrfTokenManager.create(csrfSecret),
    client_id: process.env["STANBIC_IBTC_CLIENT_ID"],
    redirect_uri: redirect_uri,
  });
});

router.post("/upload-file", async (req, res) => {
  let uploaded_folder_path = path.join(filesStaticDataPath, "uploaded-folder/");
  let uploadedFolder, zipFile, fileN;
  const zipUploadFolder = path.join(filesStaticDataPath, "files");

  let fileUploadErrorArr;

  let stanbic_access_token;
  let api_data_fetch = [];

  //https://www.section.io/engineering-education/uploading-files-using-formidable-nodejs/
  var form = new formidable.IncomingForm();
  //console.log("form", form);
  fileUploadErrorArr = [];

  const buildErrObj = (folder_name, pin, error) => {
    fileUploadErrorArr.push({
      folder_name,
      pin,
      error,
    });
  };

  const getCSVCellValue = async (col, pin, uploaded_data, user_details_obj) => {
    let file = uploaded_data.filter((u) => u.name.includes(col))[0];
    let cdn_url, val, value_from_user_details_obj;
    if (file) {
      let file_path = file.path;
      cdn_url = await getCDNURL(file_path, stanbic_access_token);

      if (cdn_url) {
        console.log("CDN URL received for " + pin + ": ", cdn_url);
        val = cdn_url;
        return val;
      } else {
        buildErrObj(pin, col, fileN);
        return;
      }
    } else {
      // value_from_user_details_obj =
      //   user_details_obj.media.identity.passport_photo_source_url.toLowerCase();

      // if (value_from_user_details_obj) {
      //   val = value_from_user_details_obj;
      //   return val;
      // }
      buildErrObj(pin, col, fileN);
      return;
    }
  };

  form.multiples = false;
  form.uploadDir = zipUploadFolder;
  //console.log("form", form);

  try {
    form.parse(req, async function (err, fields, files) {
      stanbic_access_token = fields.access_token;

      console.log("stanbic_access_token", stanbic_access_token);
      let filePath = files.file.path;
      zipFile = filePath;
      console.log("filePath", filePath);
      let fileName = files.file.name.split(".")[0];
      fileN = fileName;
      let errorFileName = fileName;

      if (err_file[errorFileName]) {
        delete err_file[errorFileName];
        //+ timeStamp
        fs.writeFile(
          err_path,
          //errors,
          // `let ${errorFileName} =  ${JSON.stringify(fileUploadErrorArr)}`,
          JSON.stringify(err_file),
          (err) => {
            err && console.log("err", err);
          }
        );
      }

      console.log(fileName + ".csv", fileName + ".csv");
      fs.exists(
        path.join(filesStaticDataPath, "generated-csv", fileName + ".csv"),
        function (exists) {
          // console.log("exists", exists);
          if (exists) {
            fs.unlinkSync(
              path.join(filesStaticDataPath, "generated-csv", fileName + ".csv")
            );
          }
        }
      );

      fs.exists(
        path.join(uploaded_folder_path, fileName),
        async function (exists) {
          console.log(
            path.join(uploaded_folder_path, fileName) + " exists",
            exists
          );
          if (exists) {
            await empty(
              path.join(uploaded_folder_path, fileName),
              false,
              (o) => {
                if (o.error) {
                  console.error(o.error);
                } else {
                  fs.rmdir(path.join(uploaded_folder_path, fileName), (err) => {
                    if (err) throw err;
                    console.log("successfully deleted directory");
                  });
                  //fs.unlinkSync(path.join(uploaded_folder_path, fileName));
                }
              }
            );
          }
        }
      );

      try {
        await decompress(filePath, uploaded_folder_path);
        console.log(`decompressed ${fileName}`);

        fs.copyFile(csv_template_path, duplicated_csv_template_path, (err) => {
          if (err) throw err;
          console.log("bulk-upload-template was copied to destination");
        });

        const tree = dirTree(uploaded_folder_path);
        let folder = tree.children.length
          ? tree.children.filter((c) => c.name === fileName)[0]
          : undefined;
        // console.log("folder", folder);
        uploadedFolder = folder.path;
        let folder_content = folder ? folder.children : undefined;
        // console.log("folder_content", folder_content);

        if (folder_content) {
          let PINS_Arr = folder.children.map((c) => c.name);

          let csvJSON = [];

          for (let i = 0; i < PINS_Arr.length; i++) {
            if (PINS_Arr[i].substring(0, 3) === "PEN") {
              let final = JSON.stringify(jsonFormat);
              let api_data = await getAPIDATA(
                PINS_Arr[i],
                stanbic_access_token
              ); //.filter((s) => s.pin === PINS_Arr[i])[0];
              console.log("api_data for " + PINS_Arr[i] + ": ", api_data);
              if (api_data == "Error: Invalid Access Token") {
                buildErrObj(
                  PINS_Arr[i],
                  "The api details of " +
                    PINS_Arr[i] +
                    " could not be fetched due to Invalid Access Token",
                  fileN
                );
              } else if (api_data == "Error: Record not found") {
                buildErrObj(PINS_Arr[i], "Error: Record not found", fileN);
              } else {
                api_data["search_pin"] = PINS_Arr[i];

                let uploaded_data = folder_content.filter(
                  (c) => c.name === PINS_Arr[i]
                )[0].children;

                if (api_data && uploaded_data) {
                  for (key in jsonFormat) {
                    var regex = new RegExp("\\${" + key + "}", "g");

                    switch (key) {
                      case "media.identity.passport_photo_source_url":
                        let file = uploaded_data.filter((u) =>
                          u.name.includes("passport_photo")
                        )[0];
                        val = file
                          ? await getCSVCellValue(
                              "passport_photo",
                              PINS_Arr[i],
                              uploaded_data,
                              api_data
                            )
                          : api_data.media.identity.passport_photo_source_url.toLowerCase();
                        break;

                      case "media.documentation.employment_letter_source_url":
                        let empl = uploaded_data.filter((u) =>
                          u.name.includes("employment_letter")
                        )[0];
                        val = empl
                          ? await getCSVCellValue(
                              "employment_letter",
                              PINS_Arr[i],
                              uploaded_data,
                              api_data
                            )
                          : api_data.media.documentation.employment_letter_source_url.toLowerCase();
                        break;

                      case "media.documentation.official_id_source_url":
                        let id = uploaded_data.filter((u) =>
                          u.name.includes("official_id")
                        )[0];
                        val = id
                          ? await getCSVCellValue(
                              "official_id",
                              PINS_Arr[i],
                              uploaded_data,
                              api_data
                            )
                          : api_data.media.documentation.official_id_source_url.toLowerCase();
                        break;

                      case "media.documentation.proof_of_address_source_url":
                        let poa = uploaded_data.filter((u) =>
                          u.name.includes("proof_of_address")
                        )[0];
                        val = poa
                          ? await getCSVCellValue(
                              "proof_of_address",
                              PINS_Arr[i],
                              uploaded_data,
                              api_data
                            )
                          : api_data.media.documentation.proof_of_address_source_url.toLowerCase();
                        break;

                      case "employer.name":
                        val = api_data.employer.name;
                        break;

                      case "employer.sector_classification":
                        val = api_data.employer.sector_classification;
                        break;

                      case "param.search_pin":
                        val = api_data.search_pin;
                        break;

                      case "param.pin":
                        val = api_data.pin;
                        break;

                      case "param.first_name":
                        val = api_data.first_name;
                        break;

                      case "param.last_name":
                        val = api_data.last_name;
                        break;

                      case "param.mobile_phone_number":
                        val = api_data.mobile_phone_number;
                        break;

                      case "param.birth_date":
                        val = api_data.birth_date;
                        break;

                      case "media.documentation.nin_enrolment_slip_source_url":
                        let nin = uploaded_data.filter((u) =>
                          u.name.includes("nin_enrolment")
                        )[0];
                        val = nin
                          ? await getCSVCellValue(
                              "nin_enrolment",
                              PINS_Arr[i],
                              uploaded_data,
                              api_data
                            )
                          : api_data.media.documentation.nin_enrolment_slip_source_url.toLowerCase();
                        break;

                      case "param.proof_of_address_type":
                        let proof_of_address_file_name = uploaded_data.filter(
                          (u) => u.name.includes("proof_of_address")
                        )[0].name;

                        let address_type;

                        if (proof_of_address_file_name) {
                          console.log(
                            "proof_of_address_file_name",
                            proof_of_address_file_name
                          );
                          address_type = proof_of_address_file_name.split(
                            "-"
                          )[1]
                            ? await getProofOfAddressType(
                                proof_of_address_file_name
                              ).id
                            : "";
                        } else {
                          buildErrObj(
                            PINS_Arr[i],
                            "proof of address type",
                            fileN
                          );
                        }

                        val = address_type
                          ? address_type
                          : api_data.proof_of_address_type;
                        break;

                      case "param.id_type":
                        let file_name = uploaded_data.filter((u) =>
                          u.name.includes("official_id")
                        )[0].name;

                        let id_type;

                        if (file_name) {
                          id_type = file_name.split("-")[1]
                            ? await getProofOfIdType(file_name).id
                            : "";
                        } else {
                          buildErrObj(PINS_Arr[i], "proof of id type", fileN);
                        }

                        val = id_type ? id_type : api_data.id_type;
                        break;

                      default:
                        val = "";
                        break;
                    }
                    final = final.replace(regex, val);
                    final = final
                      .replace(/\${[A-Za-z0-9_]*}/g, "")
                      .replace(/(\r\n|\n|\r)/gm, " ");
                  }
                  csvJSON.push(JSON.parse(final));
                }
              }
            }
          }

          for (let i = 0; i < csvJSON.length; i++) {
            csvJSON[i]["search_pin"] = csvJSON[i]["param.search_pin"];
            csvJSON[i]["pin"] = csvJSON[i]["param.pin"];
            csvJSON[i]["first_name"] = csvJSON[i]["param.first_name"];
            csvJSON[i]["last_name"] = csvJSON[i]["param.last_name"];
            csvJSON[i]["mobile_phone_number"] =
              csvJSON[i]["param.mobile_phone_number"];
            csvJSON[i]["birth_date"] = csvJSON[i]["param.birth_date"];
            csvJSON[i]["proof_of_address_type"] =
              csvJSON[i]["param.proof_of_address_type"];
            csvJSON[i]["id_type"] = csvJSON[i]["param.id_type"];

            delete csvJSON[i]["param.search_pin"];
            delete csvJSON[i]["param.pin"];
            delete csvJSON[i]["param.first_name"];
            delete csvJSON[i]["param.last_name"];
            delete csvJSON[i]["param.mobile_phone_number"];
            delete csvJSON[i]["param.birth_date"];
            delete csvJSON[i]["param.proof_of_address_type"];
            delete csvJSON[i]["param.id_type"];
          }
          // errorFileName = fileN;
          //https://stackabuse.com/reading-and-writing-csv-files-in-nodejs-with-node-csv/

          let error_files = fileUploadErrorArr.map((f) => f.error);
          let is_folder_error = error_files.includes(fileN);
          console.log(
            " error_files.includes(fileN)",
            error_files.includes(fileN)
          );
          if (
            (fileUploadErrorArr.length && !is_folder_error) ||
            (fileUploadErrorArr && is_folder_error)
          ) {
            // console.log(
            //   "CSV Generation Error: ",
            //   JSON.stringify(fileUploadErrorArr)
            // );
            //let errors = "";

            // fileUploadErrorArr.map((f) => {
            //buildErrObj(f.pin, f.error);
            // errors += f.error + " for " + f.pin + " not provided. ";
            //});

            console.log("fileUploadErrorArr", fileUploadErrorArr);
            let timeStamp = new Date().getTime();

            err_file[errorFileName] = fileUploadErrorArr;
            //+ timeStamp
            fs.writeFile(
              err_path,
              //errors,
              // `let ${errorFileName} =  ${JSON.stringify(fileUploadErrorArr)}`,
              JSON.stringify(err_file),
              (err) => {
                err && console.log("err", err);
              }
            );
            res.send({
              status: 500,
              msg: fileUploadErrorArr,
            });
          } // else if (fileUploadErrorArr && is_folder_error )
          else {
            stringify(csvJSON, { header: true }, (err, output) => {
              fs.writeFile(
                `${generated_csv_path}/${fileName}.csv`,
                output,
                (err) => {
                  err && console.log("err", err);
                }
              );
            });
            res.send({
              status: 201,
              msg: "csv has been generated",
            });
            console.log("done with loop; csv file generated");
            fs.exists(zipFile, function (exists) {
              if (exists) {
                fs.unlinkSync(zipFile);
              }
            });
            // fs.exists(path.join(staticDataPath, "generated-csv" + fileName + ".csv"), function (exists) {
            //   if (exists) {
            //     fs.unlinkSync(path.join(staticDataPath, "generated-csv" + fileName + ".csv"));
            //   }
            // });
            //   await empty(zipUploadFolder, false, (o) => {
            //   if (o.error) console.error(o.error);
            // });

            // await empty(uploaded_folder_path, false, (o) => {
            //   if (o.error) console.error(o.error);
            // });

            // await empty(
            //   path.join(staticDataPath, "generated-csv"),
            //   false,
            //   (o) => {
            //     if (o.error) console.error(o.error);
            //   }
            // );
          }
        } else {
          //let errors = "Folder content not found";

          console.log("errors", errors);
          err_file[errorFileName] = fileUploadErrorArr;
          fs.writeFile(
            err_path,
            // errors,
            // "let errors = " + JSON.stringify(fileUploadErrorArr),
            JSON.stringify(err_file),
            (err) => {
              err && console.log("err", err);
            }
          );
        }
      } catch (error) {
        console.log("error", error);
      }
    });
  } catch (err) {
    console.log("/upload-post error", err);
  }
});

app.listen(port, function () {
  console.log("tools listening at port: " + port);
});
