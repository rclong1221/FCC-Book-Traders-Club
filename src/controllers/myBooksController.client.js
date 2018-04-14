'use strict';

var noTrades = `<h4 class="col-12 text-center">You have made no trade offers =((</h4>`;
var noOffers = `<h4 class="col-12 text-center">You have no trade offers =((</h4>`;
var nobooks = `<h4 class="col-12 text-center">You have no books =((</h4>`

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
    makeBooksDiv();
    if (booksDiv.length > 0) $("#m").append(booksDiv);
    else $("#m").append(noBooks);
  })
  getUserOffers();
});

function getUserBooks() {
  return $.get("/api/user/:id/books");
}

function getUserOffers() {
  $.get("/api/offer/", function (d) {
    offers = d;
    makeOffersDiv();
    if (offersDiv.length > 0) $("#o").append(offersDiv);
    else $("#o").append(noOffers);
    makeTradesDiv();
    if (tradesDiv.length > 0) $("#t").append(tradesDiv);
    else $("#t").append(noTrades);
  });
}

function makeBooksDiv() {
  myBooks.forEach((b) => {
    booksDiv += `
    <div class="col-3 border rounded px-2 py-2" id="m-o-${b.info.isbn13}">
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
  offers.oo.forEach((o) => {
    if (o.recipient.twitter.id !== "") {
      tradesDiv += `
      <div class="col-3 border rounded px-2 py-2" id="m-o-${o.creatorBook.isbn13}">
        <div class="row mb-4">
          <h4 class="col-12 text-center">You</h4>
          <div class="col-7">
            Title: ${o.creatorBook.title}<br/>
            Author: ${o.creatorBook.author}<br/>
            Date: ${o.creatorBook.date}<br/>
            ISBN13: ${o.creatorBook.isbn13}<br/>
          </div>
          <div class="col-5">
            <img src="${o.creatorBook.img_url}"/>
          </div>
        </div>
        <div class="row absolute-bottom my-2 px-2">
          <div class="col-12">
            <button type="button" class="btn btn-danger" onclick="deleteOffer('${o._id}')">Rescind Offer</button>
          </div>
        </div>
      </div>
      <div class="col-3 border rounded px-2 py-2" id="t-o-${o.recipientBook.isbn13}">
        <div class="row mb-4">
          <h4 class="col-12 text-center">${o.recipient.twitter.displayName}</h4>
          <div class="col-5">
            <img src="${o.recipientBook.img_url}"/>
          </div>
          <div class="col-7">
            Title: ${o.recipientBook.title}<br/>
            Author: ${o.recipientBook.author}<br/>
            Date: ${o.recipientBook.date}<br/>
            ISBN13: ${o.recipientBook.isbn13}<br/>
          </div>
        </div>
      </div>
      `
    }
  });
}

function makeOffersDiv() {
  offers.io.forEach((o, index) => {
    if (o.creator.twitter.id !== "") {
      offersDiv += `
      <div class="col-3 border rounded px-2 py-2" id="t-o-${o.recipientBook.isbn13}">
        <div class="row">
          <h4 class="col-12 text-center">You</h4>
          <div class="col-5">
            <img src="${o.recipientBook.img_url}"/>
          </div>
          <div class="col-7">
            Title: ${o.recipientBook.title}<br/>
            Author: ${o.recipientBook.author}<br/>
            Date: ${o.recipientBook.date}<br/>
            ISBN13: ${o.recipientBook.isbn13}<br/>
          </div>
        </div>
      </div>
      <div class="col-3 border rounded px-2 py-2" id="m-o-${o.creatorBook.isbn13}">
        <div class="row mb-4">
          <h4 class="col-12 text-center">${o.creator.twitter.displayName}</h4>
          <div class="col-7 mb-4">
            Title: ${o.creatorBook.title}<br/>
            Author: ${o.creatorBook.author}<br/>
            Date: ${o.creatorBook.date}<br/>
            ISBN13: ${o.creatorBook.isbn13}<br/>
          </div>
          <div class="col-5 mb-4">
            <img src="${o.creatorBook.img_url}"/>
          </div>
        </div>
        <div class="row absolute-bottom my-2 px-2">
          <div class="col-12 col-sm-6 col-6">
            <button type="button" class="btn btn-primary btn-block" onclick="changeOffer(${index})">Accept</button>
          </div>
          <div class="col-12 col-sm-6 col-6">
            <button type="button" class="btn btn-danger btn-block" onclick="deleteOffer('${o._id}')">Reject</button>
          </div>
        </div>
      </div>
      `
    }
  });
}

function changeOffer(i) {
  var body = offers.io[i]

  $.ajax({
    type: "PUT",
    url: "/api/offer/",
    data: body,
    dataType: "json",
    success: function (d) {
      if (d.redirect) {
        window.location.href = d.redirect;
      }
    },
    error: function (d) {
      console.log("Error");
      console.log(d);
    }
  })
}

function deleteOffer(id) {
  $.ajax({
    type: "DELETE",
    url: "/api/offer/",
    data: {id: id},
    dataType: "json",
    success: function(d) {
      if (d.redirect) {
        window.location.href = d.redirect;
      }
    },
    error: function (d) {
      console.log("Error");
      console.log(d);
    }
  })
}
