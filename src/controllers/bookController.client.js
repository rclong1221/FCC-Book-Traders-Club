'use strict'
var user;

$(document).ready(function (){
  getData();
});

function getData() {
  $.get("/api/user/:id", function (d) {
    user = d;
    $.ajax({
      type: "POST",
      url: `/api/user/${user.id}/books`,
      data: { title: "Cat in the Hat" },
      dataType: "json",
      success: function (d) {
        console.log(d);
      },
      error: function (d) {
      }
    });
  })
}
