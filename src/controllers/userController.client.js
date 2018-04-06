'use strict';

$(document).ready(function () {
  $.get("/api/user/:id", function (d, s) {
    if (d.id) $("#lio").attr("href", "/logout").html("Logout");
    else $("#lio").attr("href", "/login").html("Login");
  })
});
