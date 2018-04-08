'use strict';

var myBooks;
var offers;
var booksDiv = "";
var offersDiv = "";
var tradesDiv = "";
var user;

$(document).ready(function () {
  $.get("/api/user/:id", function (d, s) {
    user = d;
  });
  $.when(getUserBooks()).done(function (r) {
    myBooks = r;
    makeTradesDiv();
    $("#t").append(tradesDiv);
    makeBooksDiv();
    $("#m").append(booksDiv);
  })
  getUserOffers();
});

function getUserBooks() {
  return $.get("/api/user/:id/books");
}

function getUserOffers() {
  $.get("/api/user/:id/offer/", function (d) {
    offers = d;
    makeOffersDiv();
    $("#o").append(offersDiv);
  });
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
  offers.forEach((b) => {
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
            <button type="button" class="btn btn-primary" onclick="changeOffer(true, '${user.id}', '${b.info.isbn13}', '${b.info.offerUserId}', '${b.info.offerIsbn13}')">Accept</button>
          </div>
          <div class="col-5">
            <img src="${b.book.img_url}"/>
          </div>
        </div>
      </div>
      <div class="col-3 border rounded" id="t-o-${b.info.isbn13}">
        <div class="row">
          <h4 class="col-12 text-center">${b.info.offerUserId}</h4>
          <div class="col-5">
            <img src="${b.offer.img_url}"/>
          </div>
          <div class="col-7">
            Title: ${b.offer.title}<br/>
            Author: ${b.offer.author}<br/>
            Date: ${b.offer.date}<br/>
            ISBN13: ${b.offer.isbn13}<br/>
            <button type="button" class="btn btn-danger" onclick="changeOffer(false, '${user.id}', '${b.info.isbn13}', '${b.info.offerUserId}', '${b.info.offerIsbn13}')">Reject</button>
          </div>
        </div>
      </div>
      `
    }
  });
}

function changeOffer(accept, uId, bId, offerUId, offerBId) {
  var body = {
    accept: accept,
    uId: uId,
    bId: bId,
    offerUId: offerUId,
    offerBId: offerBId,
  }

  console.log(body);
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
