'use strict'

const path = process.cwd()
const Books = require(path + '/src/models/books.js')
const Users = require(path + '/src/models/users.js').User

const {google} = require('googleapis')
const books = google.books('v1')

const API_KEY = process.env.GOOGLE_KEY

class Book {
  static getMyBooks(req, res) {
    Users.findOne({"twitter.id": req.user.twitter.id}, function (err, u) {
      if (err) {
        console.log(err)
        return res.sendStatus(500)
      }
      if (u) {
        let bookList = u.books.map((book) => { return book.isbn13 })

        Books.find({isbn13: {$in: bookList}}, function (err, b) {
          if (err) {
            console.log(err)
            return res.sendStatus(500)
          }
          let response = []

          for (var j = 0; j < u.books.length; j++) {
            for (var k = 0; k < b.length; k++) {
              if (b[k].isbn13 === u.books[j].isbn13) {
                // u.books[j].book = b[k]
                // console.log(u.books[j].book)
                let x = Object.assign({info: u.books[j]}, {book: b[k]})
                response.push(x)
                break;
              }
            }
          }

          return res.status(201).json(response)
        })
      }
      else return res.sendStatus(500)
    })
  }

  static addBook(req, res) {

    function addOwnedBook(bId) {
      // find user
      Users.findOne({"twitter.id": req.user.twitter.id}, function (err, u) {
        if (err) {
          console.log(err)
          return res.sendStatus(500)
        }
        // save bookid to User.ownedBooks
        if (u) {
          let unowned = true
          u.books.forEach((item) => {
            if (item.isbn13 === bId) unowned = false
          })
          if (unowned) {
            u.books.push({isbn13: bId, trade: false, offerUserId: "", offerIsbn13: ""})
            u.save(function (err, d) {
              // console.log("USAVE")
              if (err) {
                console.log(err)
                return res.sendStatus(500)
              }
              return res.status(201).json({books: d.books})
            })
          } else return res.sendStatus(500)
        }
      })
    }

    let newBook = new Books(req.body)

    Books.findOne({
      title: newBook.title,
      author: newBook.author,
      date: newBook.date,
      isbn13: newBook.isbn13
    }, function(err, data) {
      if (err) {
        console.log(err)
        return res.sendStatus(500)
      }
      // if book not in db
      if (!data) {
        // save book
        newBook.save(newBook, function (err, b) {
          // console.log("SAVE")
          if (err) {
            console.log(err)
            return res.sendStatus(500)
          }
          else addOwnedBook(b.isbn13)
        })
      }
      else addOwnedBook(data.isbn13)
    })
  }

  static tradeBook(req, res) {
    // console.log("!!!!!!!!!!!!!!!!!!!!TRADE BOOK!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    function flagBook(bId) {
      // find user
      Users.findOne({"twitter.id": req.user.twitter.id}, function (err, u) {
        if (err) {
          console.log(err)
          return res.sendStatus(500)
        }
        // save bookid to User.ownedBooks
        if (u) {
          u.books.forEach((item) => {
            if (item.isbn13 === bId) item.trade = (item.trade) ? false : true
          })
          u.save(function (err, d) {
            // console.log("USAVE")
            if (err) {
              console.log(err)
              return res.sendStatus(500)
            }
            return res.status(201).json({books: d.books})
          })
        } else res.sendStatus(500)
      })
    }

    let newBook = new Books(req.body)

    Books.findOne({
      title: newBook.title,
      author: newBook.author,
      date: newBook.date,
      isbn13: newBook.isbn13
    }, function(err, data) {
      if (data) flagBook(data.isbn13)
    })
  }

  static search(req, res) {
      books.volumes.list({
        auth: API_KEY,
        q: req.params.q
      }, function(err, data) {
        if (err) {
          console.log(err)
          return res.sendStatus(500)
        }
        let newBooks = []
        data.data.items.forEach((item) => {
          let nb = {
              title: decodeURI(item.volumeInfo.title),
              date: item.volumeInfo.publishedDate,
              author: item.volumeInfo.authors[0],
              img_url: item.volumeInfo.imageLinks === undefined ? '' : item.volumeInfo.imageLinks.thumbnail,
              isbn13: item.volumeInfo.industryIdentifiers[0].identifier
          }
          newBooks.push(nb)
        })

        return res.status(201).json(newBooks)
      })
  }

  static getTrades(req, res) {
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
            // console.log(books)
            return res.status(201).json({users: users, books: books})
          }
        })
        return res.status(500)
      }
    })
  }

  static offerBook(req, res) {
    console.log("!!!!!!!!!!!!!!!!!!!!OFFER BOOK!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    function flagBook() {
      if (req.body.tradeUId === req.body.uId) return res.sendStatus(500)
      // find user
      Users.findOne({"twitter.id": req.body.tradeUId}, function (err, u) {
        if (err) {
          console.log(err)
          return res.sendStatus(500)
        }
        if (u) {
          u.books.forEach((item) => {
            if (item.isbn13 === req.body.tradeBId) {
              if (item.offerUserId === "") {
                console.log("IN4")
                item.offerUserId = req.body.uId
                item.offerIsbn13 = req.body.bId
              }
            }
          })
          u.save(function (err, d) {
            console.log("IN5")
            // console.log("USAVE")
            if (err) {
              console.log(err)
              return res.sendStatus(500)
            }
            return res.status(201).json({text: "Offer successfully made"})
          })
        } else return res.sendStatus(500)
      })
    }

    console.log(req.body)

    flagBook()
  }
}

module.exports = Book
