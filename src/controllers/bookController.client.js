'use strict'
var user;
var books;

$(document).ready(function (){
  search();
});

function ownBook() {
  $.get("/api/user/:id", function (d) {
    user = d;
    console.log(books[0]);
    $.ajax({
      type: "POST",
      url: `/api/user/${user.id}/books`,
      data: books[0],
      dataType: "json",
      success: function (d) {
        console.log(d);
      },
      error: function (d) {
      }
    });
  })
}

function search() {
  var q = "Jack";
  $.get("/api/books/" + q, function (d) {
    // console.log(d);
    books = d;
    ownBook();
  })
}
