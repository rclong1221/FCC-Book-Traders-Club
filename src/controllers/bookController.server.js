'use strict'

const path = process.cwd()
const Books = require(path + '/src/models/books.js')
const Users = require(path + '/src/models/users.js').User

const {google} = require('googleapis')
const books = google.books('v1')

const API_KEY = process.env.GOOGLE_KEY

class Book {
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
            if (item.id === bId) unowned = false
          })
          if (unowned) {
            u.books.push({id: bId, trade: false})
            u.save(function (err, d) {
              console.log("USAVE")
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
      isbn13: newBook.isbn13,
      isbn10: newBook.isbn10
    }, function(err, data) {
      if (err) {
        console.log(err)
        return res.sendStatus(500)
      }
      // if book not in db
      if (!data) {
        // save book
        newBook.save(newBook, function (err, b) {
          console.log("SAVE")
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
    console.log("!!!!!!!!!!!!!!!!!!!!TRADE BOOK!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
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
            if (item.id === bId) item.trade = (item.trade) ? false : true
          })
          u.save(function (err, d) {
            console.log("USAVE")
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
      isbn13: newBook.isbn13,
      isbn10: newBook.isbn10
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
              isbn13: item.volumeInfo.industryIdentifiers[0].identifier,
              isbn10: item.volumeInfo.industryIdentifiers[1].identifier
          }
          newBooks.push(nb)
        })

        return res.status(201).json(newBooks)

        // Books.findAll(newBooks, function(err, b) {
        //   if(err) { return handleError(res, err) }
        //   console.log(b)
        //   return res.status(201).json(b)
        // })

        // Books.create(newBooks, function(err, b) {
        //   if(err) { return handleError(res, err) }
        //   console.log(b)
        //   return res.status(201).json(b)
        // })
      })
  }
}

module.exports = Book
