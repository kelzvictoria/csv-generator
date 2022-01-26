(function () {
  //"use strict";
  var timerHandle = setInterval(function () {
    if (window.location.href.indexOf("access_token") !== -1) {
      var access_token = window.location.href
        .match(/#access_token=(.*)$/)[1]
        .split("&")[0];
      clearInterval(timerHandle);

      let window_location = window.location;

      localStorage.setItem("access_token", access_token);

      window.location.href = `${window_location.origin}/bulk-import-test/csv-generator`;
    }
  }, 3000);
  return true;
})();
