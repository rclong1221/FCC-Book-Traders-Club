'use strict'

const path = process.cwd()
const Books = require(path + '/src/models/books.js').Book
const Users = require(path + '/src/models/users.js').User

const {google} = require('googleapis')
const books = google.books('v1')

const API_KEY = process.env.GOOGLE_KEY

class Book {
  static getMyBooks(req, res) {
    let user
    Users.findOne({"twitter.id": req.user.twitter.id}).exec()
      .then(function (u) {
        if (u) {
          user = u
          let bookList = u.books.map((book) => { return book.isbn13 })

          return Books.find({isbn13: {$in: bookList}}).exec()
        }
        else return res.sendStatus(500)
      })
      .then(function (b) {
        let response = []

        for (var j = 0; j < user.books.length; j++) {
          for (var k = 0; k < b.length; k++) {
            if (b[k].isbn13 === user.books[j].isbn13) {
              let x = Object.assign({info: user.books[j]}, {book: b[k]})
              response.push(x)
              break;
            }
          }
        }

        return res.status(201).json(response)
      })
      .catch(function (err) {
        console.log(err)
        return res.sendStatus(500)
      })
  }

  static addBook(req, res) {

    function addOwnedBook(bId) {
      // find user
      Users.findOne({"twitter.id": req.user.twitter.id}).exec()
      .then(function (u) {
        // save bookid to User.ownedBooks
        if (u) {
          let unowned = true
          u.books.forEach((item) => {
            if (item.isbn13 === bId) unowned = false
          })
          if (unowned) {
            u.books.push({isbn13: bId,})
            return u.save()
          } else return res.sendStatus(500)
        }
      })
      .then(function (d) {
        return res.status(201).json({books: d.books})
      })
      .catch(function (err) {
        if (err) {
          console.log(err)
          return res.sendStatus(500)
        }
      })
    }

    let newBook = new Books(req.body)

    Books.findOne({isbn13: newBook.isbn13}).exec()
    .then(function(data) {
      // if book not in db, save book
      if (!data) return newBook.save()
      else addOwnedBook(data.isbn13)
    })
    .then(function (b) {
      addOwnedBook(b.isbn13)
    })
    .catch(function (err) {
      if (err) {
        console.log(err)
        return res.sendStatus(500)
      }
    })
  }

  static search(req, res) {
    if (req.params.q.length > 0) {
      books.volumes.list({
        auth: API_KEY,
        q: req.params.q
      }, function(err, data) {
        if (err) {
          console.log(err)
          return res.sendStatus(500)
        }

        let newBooks = data.data.items.map((item) => {
          return {
              title: decodeURI(item.volumeInfo.title),
              date: item.volumeInfo.publishedDate,
              author: item.volumeInfo.authors ? item.volumeInfo.authors[0] : '',
              img_url: item.volumeInfo.imageLinks === undefined ? '' : item.volumeInfo.imageLinks.thumbnail,
              isbn13: item.volumeInfo.industryIdentifiers[0].identifier
          }
        })

        return res.status(201).json(newBooks)
      })
    }
  }

  static getBooks(req, res) {
    Users.find({ "books.0": { "$exists": true } }, function(err, users) {
      if (err) {
        console.log(err)
        return res.sendStatus(500)
      } else {
        let bookIds = []
        users.forEach((user) => {
          user.books.forEach((book) => {
            if (!bookIds.includes(book.isbn13)) bookIds.push(book.isbn13)
          })
        })
        Books.find({isbn13: {$in: bookIds }}, function (err, books) {
          if (err) {
            console.log(err)
            return res.sendStatus(500)
          } else {
            return res.status(201).json({users: users, books: books})
          }
        })
        return res.status(500)
      }
    })
  }
}

module.exports = Book
