'use strict';

var myBooks;
var booksDiv = "";
var offersDiv = "";
var tradesDiv = "";

$(document).ready(function () {
  $.when(getUserBooks()).done(function (r) {
    myBooks = r;
    makeOffersDiv();
    $("#o").append(offersDiv);
    makeTradesDiv();
    $("#t").append(tradesDiv);
    makeBooksDiv();
    $("#m").append(booksDiv);
  })
});

function getUserBooks() {
  return $.get("/api/user/:id/books");
}

function makeBooksDiv() {
  myBooks.forEach((b) => {
    booksDiv += `
    <div class="col-3 border rounded" id="m-o-${b.info.isbn13}">
      <div class="row">
        <div class="col-7">
          Title: ${b.book.title}<br/>
          Author: ${b.book.author}<br/>
          Date: ${b.book.date}<br/>
          ISBN13: ${b.book.isbn13}<br/>
        </div>
        <div class="col-5">
          <img src="${b.book.img_url}"/>
        </div>
      </div>
    </div>
    `
  });
}

function makeTradesDiv() {
  myBooks.forEach((b) => {
    if (b.info.trade) {
      tradesDiv += `
      <div class="col-3 border rounded" id="m-o-${b.info.isbn13}">
        <div class="row">
          <div class="col-7">
            Title: ${b.book.title}<br/>
            Author: ${b.book.author}<br/>
            Date: ${b.book.date}<br/>
            ISBN13: ${b.book.isbn13}<br/>
          </div>
          <div class="col-5">
            <img src="${b.book.img_url}"/>
          </div>
        </div>
      </div>
      `
    }
  });
}

function makeOffersDiv() {
  myBooks.forEach((b) => {
    if (b.info.offerUserId !== "") {
      offersDiv += `
      <div class="col-3 border rounded" id="m-o-${b.info.isbn13}">
        <div class="row">
          <h4 class="col-12 text-center">You</h4>
          <div class="col-7">
            Title: ${b.book.title}<br/>
            Author: ${b.book.author}<br/>
            Date: ${b.book.date}<br/>
            ISBN13: ${b.book.isbn13}<br/>
            <button type="button" class="btn btn-primary" onclick="changeOffer(true)">Accept</button>
          </div>
          <div class="col-5">
            <img src="${b.book.img_url}"/>
          </div>
        </div>
      </div>
      <div class="col-3 border rounded" id="m-o-${b.info.isbn13}">
        <div class="row">
          <h4 class="col-12 text-center">Somedude</h4>
          <div class="col-5">
            <img src="${b.book.img_url}"/>
          </div>
          <div class="col-7">
            Title: ${b.book.title}<br/>
            Author: ${b.book.author}<br/>
            Date: ${b.book.date}<br/>
            ISBN13: ${b.book.isbn13}<br/>
            <button type="button" class="btn btn-danger" onclick="changeOffer(false)">Reject</button>
          </div>
        </div>
      </div>
      `
    }
  });
}

function changeOffer(accept) {

  var uId = "950699122289344512";
  var bId = "9780295741352";
  var offerUId = "982048743275941888";
  var offerBId = "0374706344";
  
  var body = {
    accept: accept,
    uId: uId,
    bId: bId,
    tradeUId: offerUId,
    tradeBId: offerBId,
  }
  $.ajax({
    type: "PUT",
    url: "/api/user/:id/offer/:id",
    data: body,
    dataType: "json",
    success: function (d) {
      console.log("Success");
      console.log(d);
    },
    error: function (d) {
      console.log("Error");
      console.log(d);
    }
  })
}
