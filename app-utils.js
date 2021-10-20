var FormData = require("form-data");
const axios = require("axios");
const fs = require("fs");

let jsonFormat = {
  "media.identity.passport_photo_source_url":
    "${media.identity.passport_photo_source_url}",
  "media.documentation.employment_letter_source_url":
    "${media.documentation.employment_letter_source_url}",
  "media.documentation.official_id_source_url":
    "${media.documentation.official_id_source_url}",
  "media.documentation.proof_of_address_source_url":
    "${media.documentation.proof_of_address_source_url}",
  "employer.name": "${employer.name}",
  "employer.sector_classification": "${employer.sector_classification}",
  "param.search_pin": "${param.search_pin}",
  "param.pin": "${param.pin}",
  "param.first_name": "${param.first_name}",
  "param.last_name": "${param.last_name}",
  "param.mobile_phone_number": "${param.mobile_phone_number}",
  "param.birth_date": "${param.birth_date}",
  "media.documentation.nin_enrolment_slip_source_url":
    "${media.documentation.nin_enrolment_slip_source_url}",
  "param.proof_of_address_type": "${param.proof_of_address_type}",
  "param.id_type": "${param.id_type}",
};

let proof_of_id_types = {
  1: "intl_passport",
  2: "emp_id_card",
  3: "drivers_lic",
  4: "nat_id_nin",
  6: "voters_card",
  7: "none",
};

let proof_of_address_types = {
  1: "utility_bill",
  2: "nat_id_nin",
  3: "drivers_lic",
  4: "tenancy_agrmt",
  5: "bank_statement",
  6: "voters_card",
  7: "none",
};

const getProofOfAddressType = (file_name) => {
  let suffix = file_name.split("-")[1].split(".")[0];
  let id, name;

  // console.log("proof_of_address suffix", suffix);
  switch (suffix) {
    case "utility_bill":
      id = "1";
      value = "UTILITY BILL";
      break;
    case "nat_id_nin":
      id = "2";
      value = "NATIONAL ID CARD / NIN ENROLMENT SLIP";
      break;
    case "drivers_lic":
      id = "3";
      value = "VALID DRIVERS LICENSE";
      break;
    case "tenancy_agrmt":
      id = "4";
      value = "RECENT TENANCY AGREEMENT";
      break;
    case "bank_statement":
      id = "5";
      value = "ACTIVE BANK STATEMENT";
      break;
    case "voters_card":
      id = "6";
      value = "VOTERS CARD";
      break;
    default:
      id = "7";
      value = "NONE";
      break;
  }

  return {
    id,
    name,
  };
};

const getProofOfIdType = (file_name) => {
  let suffix = file_name.split("-")[1].split(".")[0];
  let id, name;

  // console.log("proof_of_id suffix", suffix);
  switch (suffix) {
    case "intl_passport":
      id = "1";
      value = "INTERNATIONAL PASSPORT";
      break;
    case "emp_id_card":
      id = "2";
      value = "EMPLOYEE ID CARD";
      break;
    case "drivers_lic":
      id = "3";
      value = "DRIVERS LICENSE CARD";
      break;
    case "nat_id_nin":
      id = "4";
      value = "NATIONAL ID CARD / NIN ENROLMENT SLIP";
      break;
    case "voters_card":
      id = "6";
      value = "VOTERS CARD";
      break;
    default:
      id = "7";
      value = "NONE";
      break;
  }

  return {
    id,
    name,
  };
};

const getCDNURL = async (file_path, token) => {
  let url;
  var data = new FormData();
  data.append("file", fs.createReadStream(file_path));
  //console.log("demoRealmToken", token);
  await axios
    .post("https://demo.formelo.com/api/files", data, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "multipart/form-data; boundary=" + data._boundary,
      },
    })
    .then((res) => {
      //console.log("res.data[0].url", res.data[0].url);
      //return
      url = res.data[0].url;
    })
    .catch((err) => {
      console.log("POST Error: ", err);
    });

  return url;
};

const getAPIDATA = async (pin, token) => {
  let data;
  //console.log("stanbicRealmToken", token);
  await axios
    .get(`https://formelo.stanbicibtcpension.com/master-data-test?pin=${pin}`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    })
    .then((res) => {
      console.log("res.data[0]", res.data[0]);
      //return
      data = res.data[0];
    })
    .catch((err) => {
      console.log("GET Error: ", err);
    });

  return data;
};

module.exports = {
  jsonFormat,
  proof_of_address_types,
  proof_of_id_types,
  getProofOfAddressType,
  getProofOfIdType,
  getCDNURL,
  getAPIDATA,
};
