'use strict'
var user;
var books;

$(document).ready(function (){
  $.get("/api/user/:id", function (d) {
    user = d;
  })
  search();
});

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

function findBook(i13) {
  var b;
  books.forEach(function (i){
    if (i13 === i.isbn13) {
      b = i;
    }
  })
  return b;
}

function search() {
  var q = window.location.search.substring(3);
  if (q.length > 0) {
    $.get("/api/books/" + q, function (d) {
      books = d;
      d.forEach(function (book) {
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
        <div class="col-3 border rounded" id="m-o-${book.isbn13}" onclick=offerBook('${book.isbn13}')>
          <div class="row py-2 mb-4">
            <div class="col-6 mb-4">
              Title: ${book.title}<br/>
              Author: ${book.author}<br/>
              Date: ${book.date}<br/>
              ISBN13: ${book.isbn13}<br/>
            </div>
            <div class="col-6 mb-4">
              <img src="${book.img_url}"/>
            </div>
          </div>
          <div class="row absolute-bottom px-2 py-2">
            <div class="col-12">
              <button type="button" class="btn btn-success btn-block" id="b-${book.isbn13}" type="button" onclick={ownBook("${book.isbn13}")}>
                Own${ownCount}
              </button>
            </div>
          </div>
        </div>
        `
        $("#c").append(h)
      })
    })
  }
}
