const directory = "../uploadedFolder";

const APP_PORT = 8080;
const APP_PATH = "localhost:" + APP_PORT;

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
  (refreshDiv = document.querySelector(".refresh-page"));

let is_file_uploaded = false;
let is_network_error = false;

let timer = 5000;

function checkForCSV() {
  let csvFileExists = FileExists(
    "../generated-csv/generated-bulk-upload-csv.csv"
  );

  let errorsFileExist = FileExists("../errors.js");

  fileExists = csvFileExists ? true : false;
  errorsExists = errorsFileExist ? true : false;

  console.log("fileExisits", fileExists, "errorsExists", errorsExists);

  if (fileExists) {
    HideMessage();
    clearInterval(interval);
  }

  if (errorsExists || is_network_error) {
    //console.log("error exists");
    ShowErrors();
  }
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

const toggleDisplayUploadBtn = () => {
  if (is_file_uploaded) {
    p.style.display = "none";
    uploadIcon.style.display = "none";
    ShowMessage();
  } else {
    p.style.display = "block";
    uploadIcon.style.display = "block";
    HideMessage();
  }
};

p.addEventListener("click", () => {
  fileInput.click();
});

refreshBtn.addEventListener("click", (e) => {
  e.preventDefault();
  location.reload();
});

fileInput.onchange = ({ target }) => {
  let file = target.files[0];
  if (file) {
    let fileName = file.name;
    if (fileName.length >= 12) {
      let splitName = fileName.split(".");
      fileName = splitName[0].substring(0, 13) + "... ." + splitName[1];
    }
    uploadFile(fileName, file);
  }
};

// let xhr = new XMLHttpRequest();

// let resp = "";
// xhr.onreadystatechange = () => {

//   if (xhr.readyState == 4 && xhr.status == 200) {
//     resp = xhr.responseText;
//   }
// };

let upload_file_path = `//${APP_PATH}/tools-test/upload-file`;
//let download_file_path = `//${APP_PATH}/tools-test/download-csv`;

function uploadFile(name, file) {
  console.log("changed input");

  var formData = new FormData();
  formData.set("file", file);

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
      const cancelButton =
        document.querySelector(".btnCancel"); /*(".fa-times")*/
      cancelButton.addEventListener("click", () => {
        console.log("clicked cancel");
        form.reset();
        uploadedArea.innerHTML = "";
        xhr.abort();
        location.reload();
      });
      toggleIsFileUploaded();
      console.log("is_file_uploaded", is_file_uploaded);
      toggleDisplayUploadBtn();
    }
  });

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

function ShowErrors() {
  $("#message-text2").hide();

  if (is_network_error) {
    $("#message-text3").text("A network error has occured...");
  }
  if (FileExists("../errors.js")) {
    let errors = readTextFile("../errors.js");
    console.log("errors", errors);
    $("#message-text3").text(errors);
  }

  $("#message-text3").show();
  clearInterval(interval);
  $(".refresh-page").show();
}

function buildErrorMsg() {}

function HideErrors() {}

function ShowMessage() {
  $("#message-text1").text("Zip file has been uploaded successfully.");
  $("#message-text2").text("Please wait while CSV file is being generated...");
  $("#message").show();
  $("#message-text2").hide();
  $("#download-link").hide();
  interval = setInterval(function () {
    $("#message-text1").hide();
    $("#message-text2").show();
    checkForCSV();
  }, timer);
}

function HideMessage() {
  //$("#message").hide();
  $("#message-text1").show();
  $("#message-text2").hide();
  $("#message-text1").text("CSV File is ready for download.");

  $("#message").hide();
  $("#download-link").show();
  $(".refresh-page").show();
}

(function () {
  "use strict";
  var timerHandle = setInterval(function () {
    if (window.location.href.indexOf("access_token") !== -1) {
      var access_token = window.location.href
        .match(/#access_token=(.*)$/)[1]
        .split("&")[0];
      clearInterval(timerHandle);
      // USE THE TOKEN...
      console.log("token", access_token);
    }
  }, 3000);
  return true;
})();
