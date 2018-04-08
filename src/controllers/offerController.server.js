'use strict'

const path = process.cwd()
const Offers = require(path + '/src/models/offers.js')
const Books = require(path + '/src/models/books.js').Book
const Users = require(path + '/src/models/users.js').User

class Offer {
  static addOffer(req, res) {
    let users, books

    Users.find({'twitter.id': {$in: [req.body.creator, req.body.recipient]}}).exec()
    .then(function (us) {
      users = us
      return Books.find({isbn13: {$in: [req.body.creatorBook, req.body.recipientBook]}}).exec()
    })
    .then(function (bs) {
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
      return res.status(201).json(o)
    })
    .catch(function (err) {
      if (err) {
        console.log(err)
        return res.sendStatus(500)
      }
    })
  }
  static getOffers(req, res) {
    Users.find({'twitter.id': req.user.twitter.id}).exec()
    .then(function (user) {
      return Offers.find({$or: [{'creator.$oid': user._id}, {'recipient.$oid': user._id}]})
      .populate('creator')
      .populate('creatorBook')
      .populate('recipient')
      .populate('recipientBook')
      .exec()
    })
    .then(function (offers) {
      return res.status(201).json(offers)
    })
    .catch(function (err) {
      console.log(err)
      return res.sendStatus(500)
    })
  }
}

function findUsers(ul) {
  return Users.find(ul)
}

function findBooks(bl) {
  return Books.find(bl)
}

module.exports = Offer
