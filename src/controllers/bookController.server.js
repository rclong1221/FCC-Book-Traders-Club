'use strict'

const path = process.cwd()
const Books = require(path + '/src/models/books.js')
const Users = require(path + '/src/models/users.js').User

class Book {
  static addBook(req, res) {
    // NOTE: Change.  Implement search first.
    function addOwnedBook(bId) {
      // find user
      Users.findOne({"twitter.id": req.user.twitter.id}, function (err, u) {
        if (err) console.error(err)
        // save bookid to User.ownedBooks
        if (u) {
          console.log(u)
          u.books.push(bId)
          u.save(function (err, d) {
            if (err) console.error(err)
            console.log(d)
          })
        }
      })
    }

    let title = req.body.title
    let author = "James Jones"
    let year = 2000
    let isbn = "12-34-56"

    let newBook = new Books({
      title: title,
      author: author,
      year: year,
      isbn: isbn
    })

    Books.findOne({title: newBook.title, author: newBook.author, year: newBook.year, isbn: newBook.isbn}, function(err, data) {
      console.log(data)
      // if book not in db
      if (!data) {
        // call book api
        let img_url = ""

        // set newBook image address
        newBook["img_url"] = img_url

        // save book
        newBook.save(newBook, function (err, b) {
          console.log("Saved book")
          if (err) console.error(err)
          else addOwnedBook(b._id)
        })
      }
      else {
        console.log("Did not save book")
        addOwnedBook(data._id)
      }
    })

    res.sendStatus(200)
  }
}

module.exports = Book
