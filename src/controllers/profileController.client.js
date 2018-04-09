'use strict'

$(document).ready(function () {
  $.get("/api/account/:id/", function (d) {
    $("#d-n-i").val(d.twitter.displayName);
    $("#l-i").val(d.twitter.location);
    $("#n-i").val(d.name);
  })
})

function submitData() {
  var body = {
    displayName: $("#d-n-i").val(),
    location: $("#l-i").val(),
    name: $("#n-i").val()
  }
  $.ajax({
    type: "POST",
    url: "/api/account/:id",
    data: body,
    dataType: "json",
    success: function (d) {
      if (d.redirect) {
        window.location.href = d.redirect;
      }
    },
    error: function (e) {
      console.log("ERROR")
      console.log(e)
    }
  })
}
