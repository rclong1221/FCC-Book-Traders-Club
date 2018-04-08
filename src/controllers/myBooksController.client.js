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
    makeBooksDiv();
    $("#m").append(booksDiv);
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
    $("#o").append(offersDiv);
    makeTradesDiv();
    $("#t").append(tradesDiv);
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
  offers.oo.forEach((o) => {
    if (o.recipient.twitter.id !== "") {
      tradesDiv += `
      <div class="col-3 border rounded" id="t-o-${o.recipientBook.isbn13}">
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
            <button type="button" class="btn btn-danger" onclick="deleteOffer('${o._id}')">Rescind</button>
          </div>
        </div>
      </div>
      <div class="col-3 border rounded" id="m-o-${o.creatorBook.isbn13}">
        <div class="row">
          <h4 class="col-12 text-center">${o.creator.twitter.displayName}</h4>
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
      </div>
      `
    }
  });
}

function makeOffersDiv() {
  console.log(offers)
  offers.io.forEach((o) => {
    if (o.creator.twitter.id !== "") {
      offersDiv += `
      <div class="col-3 border rounded" id="m-o-${o.creatorBook.isbn13}">
        <div class="row">
          <h4 class="col-12 text-center">You</h4>
          <div class="col-7">
            Title: ${o.creatorBook.title}<br/>
            Author: ${o.creatorBook.author}<br/>
            Date: ${o.creatorBook.date}<br/>
            ISBN13: ${o.creatorBook.isbn13}<br/>
            <button type="button" class="btn btn-primary" onclick="changeOffer(true, '${o.creator.twitter.id}', '${o.creatorBook.isbn13}', '${o.creator.twitter.id}', '${o.creatorBook.isbn13}')">Accept</button>
          </div>
          <div class="col-5">
            <img src="${o.creatorBook.img_url}"/>
          </div>
        </div>
      </div>
      <div class="col-3 border rounded" id="t-o-${o.recipientBook.isbn13}">
        <div class="row">
          <h4 class="col-12 text-center">${o.recipient.twitter.displayName}</h4>
          <div class="col-5">
            <img src="${o.recipientBook.img_url}"/>
          </div>
          <div class="col-7">
            Title: ${o.recipientBook.title}<br/>
            Author: ${o.recipientBook.author}<br/>
            Date: ${o.recipientBook.date}<br/>
            ISBN13: ${o.recipientBook.isbn13}<br/>
            <button type="button" class="btn btn-danger" onclick="deleteOffer('${o._id}')">Reject</button>
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
