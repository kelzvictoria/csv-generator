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
  (downloadBtnDiv = document.querySelector(".btn-download-div"));

let is_file_uploaded = false;

let timer = 5000;

function checkForCSV() {
  let csvFileExists = FileExists(
    "../generated-csv/generated-bulk-upload-csv.csv"
  );
  fileExists = csvFileExists ? true : false;
  console.log("fileExisits", fileExists);

  if (fileExists) {
    HideMessage();
    clearInterval(interval);
  }
}

function FileExists(urlToFile) {
  var xhr = new XMLHttpRequest();
  xhr.open("HEAD", urlToFile, false);
  xhr.send();

  if (xhr.status == "404") {
    console.log("File doesn't exist");
    return false;
  } else {
    console.log("File exists");
    return true;
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

let xhr = new XMLHttpRequest();

let resp = "";

xhr.onreadystatechange = () => {
  if (xhr.readyState == 4 && xhr.status == 200) {
    resp = xhr.responseText;
  }
};

let upload_file_path = `//${APP_PATH}/tools-test/upload-file`;
let download_file_path = `//${APP_PATH}/tools-test/download-csv`;

function uploadFile(name, file) {
  console.log("changed input");

  var formData = new FormData();
  formData.set("file", file);

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
                            <i id="fa-times" class="fas fa-times"></i>
                          </li>`;
      uploadedArea.classList.remove("onprogress");
      uploadedArea.innerHTML = uploadedHTML;
      const cancelButton = document.querySelector(".fa-times");
      cancelButton.addEventListener("click", () => {
        console.log("clicked cancel");
        form.reset();
        uploadedArea.innerHTML = "";
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

function downloadCSV(event) {
  event.preventDefault();

  var data = {};
  $.ajax({
    type: "POST",
    url: download_file_path, //"./download-csv",
    data: data,
  });
}

var downloadCSVForm = document.getElementById("download-csv-form");
if (downloadCSVForm) {
  downloadCSVForm.addEventListener("submit", downloadCSV);
}

$(function () {
  $(".download").click(function () {
    ShowDownloadMessage();
  });
});

let interval = null;

function ShowMessage() {
  $("#message-text").text("CSV file is being generated...");
  $("#message").show();
  $("#download-link").hide();
  interval = setInterval(function () {
    checkForCSV();
  }, timer);
}

function HideMessage() {
  $("#message").hide();

  $("#download-link").show();
}
