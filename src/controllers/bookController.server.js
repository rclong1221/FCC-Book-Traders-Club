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
              // u.books[j].book = b[k]
              // console.log(u.books[j].book)
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

  static getMyOffers(req, res) {
    let user,
        usersResponse;

    Users.findOne({"twitter.id": req.user.twitter.id}).exec()
    .then(function (u) {
      if (u) {
        user = u

        let bookList = user.offers.map((book) => { return book.isbn13 })
        user.offers.forEach((offer) => {
          if (!bookList.includes(offer.offerIsbn13)) bookList.push(offer.offerIsbn13)
        })

        return Books.find({isbn13: {$in: bookList}}).exec()
      }
      else return res.sendStatus(500)
    })
    .then(function (b) {
      let response = []

      for (var j = 0; j < user.offers.length; j++) {
        for (var k = 0; k < b.length; k++) {
          if (b[k].isbn13 === user.offers[j].isbn13) {
            let x = Object.assign({info: user.offers[j]}, {book: b[k]})
            response.push(x)
            break;
          }
        }
      }

      response.forEach((item) => {
        b.forEach((bs) => {
          if (bs.isbn13 === item.info.offerIsbn13) item.offer = bs
        })
      })

      return res.status(201).json(response)
    })
    .catch(function (err) {
      if (err) {
        console.log(err)
        return res.sendStatus(500)
      }
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
            u.books.push({
              isbn13: bId,
              trade: false,
              offerUserId: "",
              offerIsbn13: ""
            })
            u.save(function (err, d) {
              if (err) {
                console.log(err)
                return res.sendStatus(500)
              }
              return res.status(201).json({books: d.books})
            })
          } else return res.sendStatus(500)
        }
      })
      .catch(function (err) {
        if (err) {
          console.log(err)
          return res.sendStatus(500)
        }
      })
    }

    let newBook = new Books(req.body)

    Books.findOne({
      title: newBook.title,
      author: newBook.author,
      date: newBook.date,
      isbn13: newBook.isbn13
    }).exec()
    .then(function(data) {
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
    .catch(function (err) {
      if (err) {
        console.log(err)
        return res.sendStatus(500)
      }
    })
  }
// TODO: Remove.  Pointless.
  static tradeBook(req, res) {
    function flagBook(bId) {
      // find user
      Users.findOne({"twitter.id": req.user.twitter.id}).exec()
      .then(function (u) {
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
      .catch(function (err) {
        if (err) {
          console.log(err)
          return res.sendStatus(500)
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
// TODO: Change name to get books
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
    if (req.body.offerUId === req.body.uId) return res.sendStatus(500)
    if (req.body.uId !== req.user.twitter.id) return res.sendStatus(400)

    let user

    function flagBook() {
      // find user
      Users.findOne({"twitter.id": req.body.offerUId}).exec()
      .then(function (u) {
        if (u) {
          user = u
          user.books.forEach((item) => {
            if (item.isbn13 === req.body.offerBId) {
              if (item.offerUserId === "") {
                item.offerUserId = req.body.uId
                item.offerIsbn13 = req.body.bId
              }
            }
          })
          user.offers.push({
            isbn13: req.body.offerBId,
            trade: true,
            offerIsbn13: req.body.bId,
            offerUserId: req.body.uId
          })
          return user.save()
        } else return res.sendStatus(500)
      })
      .then(function (d) {
        return Users.findOne({"twitter.id": req.user.twitter.id}).exec()
      })
      .then(function (me) {
        me.offers.push({
          isbn13: req.body.bId,
          trade: true,
          offerIsbn13: req.body.offerBId,
          offerUserId: req.body.offerUId
        })
        me.save(function (err, d) {
          if (err) {
            console.log(err)
            return res.sendStatus(500)
          }
          return res.status(201).json({text: "Offer successfully made"})
        })
      })
      .catch(function (err) {
        if (err) {
          console.log(err)
          return res.sendStatus(500)
        }
      })
    }
    flagBook()
  }

  static changeOffer(req, res) {
    if (req.body.offerUId === req.body.uId) return res.sendStatus(500)
    if (req.body.uId !== req.user.twitter.id) return res.sendStatus(400)
    console.log(req.body)

    // req.user.twitter.id YOU
    // req.body.bId        YOU
    // req.body.offerUId      RECIPIENT
    // req.body.offerBId   RECIPIENT

    console.log("HERE 1")
    function rejectTrade() {
      let user
      console.log("REJECT 1")
      // find recipient
      Users.findOne({"twitter.id": req.body.offerUId}).exec()
      .then(function (u) {
        if (u) {
          user = u
          console.log("REJECT 3")
          // Remove offers with their old book
          user.books.forEach((item) => {
            if (item.isbn13 === req.body.offerBId) {
              item.trade = true
              item.offerUserId = ""
              item.offerIsbn13 = ""
            }
          })
          console.log()
          console.log()
          console.log(user)
          console.log()
          console.log()
          user.offers = user.offers.filter((item) => {
            return !(item.isbn13 === req.body.offerBId && item.offerIsbn13 === req.body.bId)
          })
          console.log()
          console.log()
          console.log(user)
          console.log()
          console.log()
          return user.save()
        } else {
          console.log("REJECT 8")
          return res.sendStatus(500)
        }
      })
      .then(function (d) {
        console.log("REJECT 5")
        return Users.findOne({"twitter.id": req.user.twitter.id}).exec()
      })
      .then(function (me) {
        // Remove offers with your old book
        me.books.forEach((item) => {
          if (item.isbn13 === req.body.bId) {
            item.trade = true
            item.offerUserId = ""
            item.offerIsbn13 = ""
          }
        })
        console.log()
        console.log()
        console.log(me)
        console.log()
        console.log()
        me.offers = user.offers.filter((item) => {
          return !(item.isbn13 === req.body.isbn13 && item.offerIsbn13 === req.body.offerBId)
        })
        console.log()
        console.log()
        console.log(me)
        console.log()
        console.log()
        return me.save()
      })
      .then(function (d) {
        return res.status(201).json({text: "Offer successfully made"})
      })
      .catch(function (err) {
        if (err) {
          console.log("ERROR")
          console.log(err)
          return res.sendStatus(500)
        }
      })
    }

    function acceptTrade() {
      let user
      console.log("ACCEPT 1")
      // find recipient
      Users.findOne({"twitter.id": req.body.offerUId}).exec()
      .then(function (err, u) {
        if (u) {
          user = u
          console.log("ACCEPT 3")
          // Remove offers and books with their old book
          user.books = user.books.filter((item) => {
            return item.isbn13 !== req.body.offerBId
          })
          user.offers = user.offers.filter((item) => {
            return item.isbn13 !== req.body.offerBId
          })
          // recipient gets your book
          user.books.push({
            isbn13: req.body.bId,
            trade: false,
            offerIsbn13: "",
            offerUserId: ""
          })
          return user.save()
        } else {
          console.log("ACCEPT 8")
          return res.sendStatus(500)
        }
      })
      .then(function (err, d) {
        return Users.findOne({"twitter.id": req.user.twitter.id}).exec()
      })
      .then(function (err, me) {
        console.log("ACCEPT 6")
        // Remove offers and books with their old book
        me.books = me.books.filter((item) => {
          return item.isbn13 !== req.body.bId
        })
        me.offers = me.offers.filter((item) => {
          return item.isbn13 !== req.body.bId
        })
        // recipient gets your book
        me.books.push({
          isbn13: req.body.offerBId,
          trade: false,
          offerIsbn13: "",
          offerUserId: ""
        })
        return me.save()
      })
      .then(function (d) {
        return res.status(201).json({text: "Offer successfully made"})
      })
      .catch(function (err) {
        if (err) {
          console.log("ERROR")
          console.log(err)
          return res.sendStatus(500)
        }
      })
    }

    if (req.body.accept === true) acceptTrade()
    else if (!req.body.accept === false) rejectTrade()
    else return res.sendStatus(400)
  }
}

module.exports = Book
