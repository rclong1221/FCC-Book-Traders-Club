'use strict'
var books;

$(document).ready(function () {
  getTrades();
});

function getTrades() {
  $.get("/api/books", function (data) {
    books = data;
    books.forEach(function (book) {
      var ownCount = 0;
      // TODO: Get user books
      // if (user.books) {
      //   user.books.forEach(function (ub) {
      //     console.log(ub)
      //     if (ub === book.isbn13) ownCount++;
      //   });
      // }
      ownCount = (ownCount === 0) ? "" : ` ${ownCount}`;
      var h = `
          <div class="col-6 col-sm-6 col-md-4 border rounded" id="${book.isbn13}">
            Title: ${book.title}<br/>
            Author: ${book.author}<br/>
            Date: ${book.date}<br/>
            ISBN10: ${book.isbn10}<br/>
            ISBN13: ${book.isbn13}<br/>
            <img src="${book.img_url}"/>
            <button class="btn btn-primary" id="b-${book.isbn13}" type="button" onclick={ownBook("${book.isbn13}")}>Own${ownCount}</button>
            <button class="btn btn-secondary" id="b-${book.isbn13}" type="button" onclick={tradeBook("${book.isbn13}")}>Trade</button>
          </div>
      `
      $("#c").append(h)
    })
  });
}
