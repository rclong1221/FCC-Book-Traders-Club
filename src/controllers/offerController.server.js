'use strict'

const path = process.cwd()
const Offers = require(path + '/src/models/offers.js')
const Books = require(path + '/src/models/books.js').Book
const Users = require(path + '/src/models/users.js').User

class Offer {
  static addOffer(req, res) {
    let users, books
    console.log(req.body)
    Users.find({'twitter.id': {$in: [req.body.creator, req.body.recipient]}}).exec()
    .then(function (us) {
      console.log(us)
      users = us
      return Books.find({isbn13: {$in: [req.body.creatorBook, req.body.recipientBook]}}).exec()
    })
    .then(function (bs) {
      console.log(bs)
      books = bs
      let newOffer = new Offers({
        creator: users[0],
        creatorBook: books[0],
        recipient: users[1],
        recipientBook: books[1]
      })
      return newOffer.save()
    })
    .then(function (o) {
      console.log(o)
      return res.status(201).json(o)
    })
    .catch(function (err) {
      console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!ERROR!!!!!!!!!!!!!!!!!!!!!!!!!!!')
      console.log(err)
      return res.sendStatus(500)
    })
  }
  static getOffers(req, res) {

  }
}

function findUsers(ul) {
  return Users.find(ul)
}

function findBooks(bl) {
  return Books.find(bl)
}

module.exports = Offer
