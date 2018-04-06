'use strict';

var user;

$(document).ready(function () {
  getUser();
});

function getUser() {
  $.get("/api/user/:id", function (d, s) {
    if (d.id) {
      $("#lio").attr("href", "/logout").html("Logout");
      user = d;
    }
    else $("#lio").attr("href", "/login").html("Login");
  })
}
