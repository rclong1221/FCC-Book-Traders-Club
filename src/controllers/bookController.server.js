'use strict'

const path = process.cwd()
const Books = require(path + '/src/models/books.js')
const Users = require(path + '/src/models/users.js')

class Book {
  static addBook(req, res) {

    function addOwnedBook(bId) {
      // find user
      User.findOne({"twitter.id": req.user.twitter.id}, function (err, u) {
        if (err) console.error(err)
        // save bookid to User.ownedBooks
        if (!u.length === 0) {
          u.ownedBooks.push(bId)
          u.save(function (err) {
            if (err) console.error(err)
          })
        }
      })
    }

    let title = req.body.title

    let newBook = new Books()
    newBook = {
      title: title,
      author: author,
      year: year,
      isbn: isbn
    }
    newBook.findOne(newBook, function(err, data) {
      // if book not in db
      if (data.length === 0) {
        // call book api
        img_url = ""

        // set newBook image address
        newBook["img_url"] = img_url

        // save book
        newBook.save(function (err, b) {
          if (err) console.error(err)
          else addOwnedBook(b._id)
        })
      }
      else {
        addOwnedBook(data._id)
      }
    })

    res.send(200)
  }
}

module.exports = Book
