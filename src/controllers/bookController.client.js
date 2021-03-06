'use strict'
var books;
var userBooks = [];
var myBooks;
var offer;
var offerUId;
var offerBId;
var booksDiv = "";
var user;

$(document).ready(function () {
  $.get("/api/user/:id", function (d, s) {
    user = d;
    if (d.id) getTradesAndUserBooksTrades();
    else getTradesOnly();
  })
});

function makeBooksDiv() {
  myBooks.forEach((b) => {
    booksDiv += `
    <div class="col-12 border rounded" id="m-o-${b.info.isbn13}" onclick=offerBook('${b.info.isbn13}')>
      <div class="row py-2">
        <div class="col-8">
          Title: ${b.book.title}<br/>
          Author: ${b.book.author}<br/>
          Date: ${b.book.date}<br/>
          ISBN13: ${b.book.isbn13}<br/>
        </div>
        <div class="col-4">
          <img src="${b.book.img_url}"/>
        </div>
      </div>
      <div class="row py-2">
        <div class="col-12">
          <button type="button" class="btn btn-success btn-block" data-toggle="modal" data-target="#myModal" id="b-o-${b.book.isbn13}" type="button" onclick="makeOffer('${b.book.isbn13}')">
            Submit Offer
          </button>
        </div>
      </div>
    </div>
    `
  });
}

function setUserBooks(r2) {
  for (var i = 0; i < r2[0].users.length; i++) {
    for (var j = 0; j < r2[0].users[i].books.length; j++) {
      for (var k = 0; k < r2[0].books.length; k++) {
        if (r2[0].books[k].isbn13 === r2[0].users[i].books[j].isbn13) {
          r2[0].users[i].books[j].book = r2[0].books[k];
          break;
        }
      }
    }
  }
  userBooks = r2[0].users;
}

function updateDOM() {
  userBooks.forEach(function (u) {
    u.books.forEach(function (book) {
      var name = (user.id === u.twitter.id) ? "You" : `${u.twitter.displayName}`;
      var modal = "";
      if (user.id) {
        if (user.id !== u.twitter.id) modal = `
          <div class="row absolute-bottom my-2 px-2">
            <div class="col-12 col-sm-12 col-md-12 col-lg-6">
              <button class="btn btn-primary btn-block" id="b-${book.book.isbn13}" type="button" onclick={ownBook("${book.book.isbn13}")}>Add to Shelf</button>
              </div>
              <div class="col-12 col-sm-12 col-md-12 col-lg-6">
              <!-- Button to Open the Modal -->
              <button type="button" class="btn btn-success btn-block" data-toggle="modal" data-target="#myModal" id="b-o-${book.book.isbn13}" type="button" onclick="selectTrade('${book.book.isbn13}', '${u.twitter.id}')">
                Make Offer
              </button>
            </div>
          </div>
          <!-- The Modal -->
          <div class="modal fade" id="myModal">
            <div class="modal-dialog">
              <div class="modal-content">

                <!-- Modal Header -->
                <div class="modal-header">
                  <h4 class="modal-title">Make an offer</h4>
                  <button type="button" class="close" data-dismiss="modal">&times;</button>
                </div>

                <!-- Modal body -->
                <div class="modal-body">
                  ${booksDiv}
                </div>

                <!-- Modal footer -->
                <div class="modal-footer">
                  <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
                </div>

              </div>
            </div>
          </div>
        `;
      }

      var h = `
          <div class="col-6 col-sm-4 col-md-3 border rounded px-2 py-2" id="${book.book.isbn13}">
            <div class="row mb-4">
              <h4 class="col-12 text-center">${name}</h4>
              <div class="col-12 col-sm-12 col-md-6 mb-3">
                Title: ${book.book.title}<br/>
                Author: ${book.book.author}<br/>
                Date: ${book.book.date}<br/>
                ISBN13: ${book.book.isbn13}<br/>
              </div>
              <div class="col-12 col-sm-12 col-md-6 mb-3">
                <img src="${book.book.img_url}"/>
              </div>
            </div>
            ${modal}

          </div>
      `
      $("#c").append(h)
    })
  })
}

function getTradesOnly() {
  $.when(getTrades()).done(function(r2){
    books = r2.books;

    setUserBooks([r2]);

    updateDOM();
  });
}

function getTradesAndUserBooksTrades() {
  $.when(getUserBooks(),getTrades()).done(function(r1, r2){
    myBooks = r1[0];
    books = r2[0].books;

    setUserBooks(r2);

    makeBooksDiv();

    updateDOM();
  });
}

function makeOffer(bId) {
  var b = {
    creator: user.id,
    creatorBook: bId,
    recipient: offerUId,
    recipientBook: offerBId
  };

  $.ajax({
    type: "POST",
    url: `/api/offer/`,
    data: b,
    dataType: "json",
    success: function (d) {
      // TODO: Use return data to toast
      console.log(d);
    },
    error: function (d) {
    }
  });
}

function selectTrade(bId, uId) {
  offerBId = bId;
  offerUId = uId;
  $(".selected").removeClass("selected");
}

function offerBook(bId) {
  $(".selected").removeClass("selected");
  $(`#m-o-${bId}`).addClass("selected");
}

function getUserBooks() {
  return $.get("/api/user/:id/books");
}

function getTrades() {
  return $.get("/api/books");
}

function ownBook(i13) {
  var b = findBook(i13);

  $.ajax({
    type: "POST",
    url: `/api/user/${user.id}/books`,
    data: b,
    dataType: "json",
    success: function (d) {
      // TODO: Toast
      console.log(d);
    },
    error: function (d) {
    }
  });
}

function findBook(i13) {
  var b;
  books.forEach(function (i){
    if (i13 === i.isbn13) {
      b = i;
    }
  })
  return b;
}
