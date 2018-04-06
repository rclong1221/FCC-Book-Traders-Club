'use strict'
var books;
var userBooks = [];
var user;

$(document).ready(function () {
  getTrades();
  getUser();
});

function getTrades() {
  $.get("/api/books", function (data) {
    for (var i = 0; i < data.users.length; i++) {
      for (var j = 0; j < data.users[i].books.length; j++) {
        for (var k = 0; k < data.books.length; k++) {
          if (data.books[k].isbn13 === data.users[i].books[j].isbn13) {
            data.users[i].books[j].book = data.books[k];
            break;
          }
        }
      }
    }
    userBooks = data.users;

    userBooks.forEach(function (user) {
      console.log(user)
      user.books.forEach(function (book) {
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
            <div class="col-6 col-sm-4 col-md-3 border rounded" id="${book.book.isbn13}">
              <h4 class="text-center">${user.twitter.displayName} is trading...</h4>
              Title: ${book.book.title}<br/>
              Author: ${book.book.author}<br/>
              Date: ${book.book.date}<br/>
              ISBN13: ${book.book.isbn13}<br/>
              <img src="${book.book.img_url}"/>
              <button class="btn btn-primary" id="b-${book.book.isbn13}" type="button" onclick={ownBook("${book.book.isbn13}")}>Own${ownCount}</button>
              <button class="btn btn-secondary" id="b-${book.book.isbn13}" type="button" onclick={tradeBook("${book.book.isbn13}")}>Trade</button>
            </div>
        `
        $("#c").append(h)
      })
    })

    console.log(userBooks);

    books = data.books;
    // books.forEach(function (book) {
    //   var ownCount = 0;
    //   // TODO: Get user books
    //   // if (user.books) {
    //   //   user.books.forEach(function (ub) {
    //   //     console.log(ub)
    //   //     if (ub === book.isbn13) ownCount++;
    //   //   });
    //   // }
    //   ownCount = (ownCount === 0) ? "" : ` ${ownCount}`;
    //   var h = `
    //       <div class="col-6 col-sm-6 col-md-4 border rounded" id="${book.isbn13}">
    //         Title: ${book.title}<br/>
    //         Author: ${book.author}<br/>
    //         Date: ${book.date}<br/>
    //         ISBN13: ${book.isbn13}<br/>
    //         <img src="${book.img_url}"/>
    //         <button class="btn btn-primary" id="b-${book.isbn13}" type="button" onclick={ownBook("${book.isbn13}")}>Own${ownCount}</button>
    //         <button class="btn btn-secondary" id="b-${book.isbn13}" type="button" onclick={tradeBook("${book.isbn13}")}>Trade</button>
    //       </div>
    //   `
    //   $("#c").append(h)
    // })
  });
}

function ownBook(i13) {
  var b = findBook(i13);

  $.ajax({
    type: "POST",
    url: `/api/user/${user.id}/books`,
    data: b,
    dataType: "json",
    success: function (d) {
      // TODO: Use return data to populate owned book button in ui
      console.log(d);
    },
    error: function (d) {
    }
  });
}

function tradeBook(i13) {
  var b = findBook(i13);

  $.ajax({
    type: "PUT",
    url: `/api/user/${user.id}/trade`,
    data: b,
    dataType: "json",
    success: function (d) {
      // TODO: Use return data to populate owned book button in ui
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

function getUser() {
  $.get("/api/user/:id", function (d) {
    user = d;
  })
}
