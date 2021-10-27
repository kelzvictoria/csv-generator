const directory = "../uploaded-folder";

//const APP_PORT = 8080;
//const APP_PATH = "localhost:" + APP_PORT;

let stanbic_token;

const form = document.querySelector("form"),
  fileInput = document.querySelector(".file-input"),
  progressArea = document.querySelector(".progress-area"),
  uploadedArea = document.querySelector(".uploaded-area"),
  p = document.querySelector("p"),
  uploadIcon = document.querySelector(".fa-cloud-upload-alt");
(downloadBtn = document.querySelector("#download-csv")),
  (downloadLink = document.querySelector("#download-link")),
  (downloadBtnDiv = document.querySelector(".btn-download-div")),
  (refreshBtn = document.querySelector("#refresh")),
  (refreshDiv = document.querySelector(".refresh-page")),
  (btnLogin = document.querySelector("#login")),
  (btnLogout = document.querySelector("#logout"));

let is_file_uploaded = false;
let is_network_error = false;

let timer = 5000;

let fileContent;
let errors;
let window_location;

let errors_file_path;

function checkForCSV(file_name) {
  readErrorsFile(errors_file_path, function (text) {
    errors = JSON.parse(text);
  });

  let csvFileExists = FileExists(
    `../generated-csv/${file_name.split(".")[0]}.csv`
  );

  let fileExists = csvFileExists ? true : false;
  let errorsExists = false;

  if (errors) {
    errorsExists = errors[file_name.split(".")[0]] ? true : false;
  }

  console.log(
    "fileExisits",
    fileExists //, "errorsExists", errorsExists
  );

  if (fileExists) {
    HideMessage(file_name);
    clearInterval(interval);
  }

  console.log("errors", errors);

  if (
    errorsExists ||
    is_network_error
    // || errors[file_name]
  ) {
    console.log("error exists");
    ShowErrors(file_name);
  }
}

function readErrorsFile(file, callback) {
  var rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType("application/json");
  rawFile.open("GET", file, true);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4 && rawFile.status == "200") {
      callback(rawFile.responseText);
    }
  };
  rawFile.send(null);
}

function FileExists(urlToFile) {
  var xhr = new XMLHttpRequest();
  xhr.open("HEAD", urlToFile, false);
  try {
    xhr.send();

    if (xhr.status == "404") {
      console.log("File doesn't exist");
      return false;
    } else {
      console.log("xhr responseText", xhr.responseText);
      console.log("File exists");
      return true;
    }
  } catch (err) {
    console.log("err", err);
    is_network_error = true;
  }
}

const toggleIsFileUploaded = () => {
  is_file_uploaded = !is_file_uploaded;
};

const toggleDisplayUploadBtn = (file_name) => {
  if (is_file_uploaded) {
    p.style.display = "none";
    uploadIcon.style.display = "none";
    ShowMessage(file_name);
  } else {
    p.style.display = "block";
    uploadIcon.style.display = "block";
    HideMessage(file_name);
  }
};

p.addEventListener("click", () => {
  fileInput.click();
});

btnLogout.addEventListener("click", () => {
  localStorage.removeItem("access_token");
});

refreshBtn.addEventListener("click", (e) => {
  e.preventDefault();
  location.reload();
});

fileInput.onchange = ({ target }) => {
  let file = target.files[0];

  if (file) {
    let fileName = file.name;
    let timeStamp = new Date().getTime();
    var blob = file.slice(0, file.size, "file/zip");
    let nameArr = fileName.split(".");
    newFile = new File(
      [blob],
      nameArr[0] +
        // + "-" + timeStamp
        "." +
        nameArr[1],
      {
        type: "file/zip",
      }
    );

    fileName = newFile.name;
    file = newFile;

    console.log("fileName", fileName);
    console.log("newFile", newFile);

    if (fileName.length >= 12) {
      let splitName = fileName.split(".");
      fileName = splitName[0].substring(0, 13) + "... ." + splitName[1];
    }
    uploadFile(fileName, newFile);
  }
};

function uploadFile(name, file) {
  //console.log("window.location", window.location);
  window_location = window.location.href;
  let appPath = window.location.href
    .split(window.location.host)[1]
    .split("/")[1];
  let upload_file_path = `//${window.location.host}/${appPath}/upload-file`;
  errors_file_path = `../${appPath}/errors.json`;
  console.log("appPath", appPath);
  //console.log("upload_file_path", upload_file_path);
  // console.log("changed input");
  // let timeStamp = new Date().getTime();
  // file.name = file.name + "-" + timeStamp;

  console.log("file.name", file.name);
  let file_name = file.name;
  var formData = new FormData();
  formData.append("file", file);

  var xhr = new XMLHttpRequest();

  xhr.open("POST", upload_file_path, true);
  xhr.upload.addEventListener("progress", ({ loaded, total }) => {
    let fileLoaded = Math.floor((loaded / total) * 100);
    let fileTotal = Math.floor(total / 1000);
    let fileSize;
    fileTotal < 1024
      ? (fileSize = fileTotal + " KB")
      : (fileSize = (loaded / (1024 * 1024)).toFixed(2) + " MB");
    let progressHTML = `<li class="row">
                          <i class="fas fa-file-alt"></i>
                          <div class="content">
                            <div class="details">
                              <span class="name">${name} • Uploading</span>
                              <span class="percent">${fileLoaded}%</span>
                            </div>
                            <div class="progress-bar">
                              <div class="progress" style="width: ${fileLoaded}%"></div>
                            </div>
                          </div>
                        </li>`;
    uploadedArea.classList.add("onprogress");
    //downloadLink.style.display = "none";
    progressArea.innerHTML = progressHTML;
    if (loaded == total) {
      progressArea.innerHTML = "";
      let uploadedHTML = `<li class="row">
                            <div class="content upload">
                              <i class="fas fa-file-alt"></i>
                              <div class="details">
                                <span class="name">${name} • Uploaded</span>
                                <span class="size">${fileSize}</span>
                              </div>
                            </div>
                          </li>`;
      uploadedArea.classList.remove("onprogress");
      uploadedArea.innerHTML = uploadedHTML;
      const cancelButton = document.querySelector(".btnCancel");
      cancelButton.addEventListener("click", () => {
        console.log("clicked cancel");
        form.reset();
        uploadedArea.innerHTML = "";
        xhr.abort();
        location.reload();
      });
      toggleIsFileUploaded();
      console.log("is_file_uploaded", is_file_uploaded);
      toggleDisplayUploadBtn(file_name);
    }
  });

  let token = localStorage.getItem("access_token");
  console.log("token", token);
  formData.append("access_token", token);

  xhr.send(formData);
  //alert(resp);
}

let interval = null;

function readTextFile(file) {
  var rawFile = new XMLHttpRequest();
  var allText;
  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status == 0) {
        allText = rawFile.responseText;
        // alert(allText);
      }
    }
  };
  rawFile.send(null);
  return allText;
}

function ShowErrors(file_name) {
  console.log("file_name");
  $("#message-text2").hide();

  if (is_network_error) {
    $("#message-text3").text("A network error has occured...");
  }
  if (errors) {
    let error = errors[file_name.split(".")[0]];
    {
      if (error) {
        console.log("error", error);
        let errorMsg = "";

        for (let i = 0; i < error.length; i++) {
          errorMsg += `PIN: ${error[i].pin}, ${error[i].error}. `;
        }
        $("#message-text3").text(errorMsg.substring(0, 85) + "...");
      }
    }
  }

  $("#message-text3").show();
  clearInterval(interval);
  $(".refresh-page").show();
}

function buildErrorMsg() {}

function HideErrors() {}

function ShowMessage(file_name) {
  $("#message-text1").text("Zip file has been uploaded successfully.");
  $("#message-text2").text("Please wait while CSV file is being generated...");
  $("#message").show();
  $("#message-text2").hide();
  $("#download-link").hide();
  interval = setInterval(function () {
    $("#message-text1").hide();
    $("#message-text2").show();
    checkForCSV(file_name);
  }, timer);
}

function HideMessage(file_name) {
  //$("#message").hide();
  $("#message-text1").show();
  $("#message-text2").hide();
  $("#message-text1").text("CSV File is ready for download.");

  $("#message").hide();
  $("#download-link").show();
  $(".refresh-page").show();
  $("#download-link").attr(
    "href",
    `generated-csv/${file_name.split(".")[0]}.csv`
  );
}

(function () {
  console.log("in here");
  //"use strict";
  let local_token = localStorage.getItem("access_token");
  if (local_token) {
    btnLogout.style.display = "block";
    btnLogin.style.display = "none";
  }
  var timerHandle = setInterval(function () {
    if (window.location.href.indexOf("access_token") !== -1) {
      var access_token = window.location.href
        .match(/#access_token=(.*)$/)[1]
        .split("&")[0];
      clearInterval(timerHandle);
      // USE THE TOKEN...
      // console.log("token", access_token);
      localStorage.setItem("access_token", access_token);

      btnLogout.style.display = "block";
      btnLogin.style.display = "none";
      stanbic_token = access_token;
      // console.log("local_token", local_token);
      // if (access_token || local_token) {
      //   stanbic_token = access_token;
      // }
    }
  }, 3000);
  return true;
})();
