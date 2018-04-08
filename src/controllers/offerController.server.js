'use strict'

const path = process.cwd()
const Offers = require(path + '/src/models/offers.js')
const Books = require(path + '/src/models/books.js').Book
const Users = require(path + '/src/models/users.js').User

class Offer {
  static addOffer(req, res) {
    let users = [],
        books = []

    Users.findOne({'twitter.id': req.body.creator}).exec()
    .then(function (us) {
      users.push(us)
      return Books.findOne({isbn13: req.body.creatorBook}).exec()
    })
    .then(function (bs) {
      books.push(bs)
      return Users.findOne({'twitter.id': req.body.recipient}).exec()
    })
    .then(function (us) {
      users.push(us)
      return Books.findOne({isbn13: req.body.recipientBook}).exec()
    })
    .then(function (bs) {
      books.push(bs)
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
    let user, incomingOffers, outgoingOffers
    Users.findOne({'twitter.id': req.user.twitter.id}).exec()
    .then(function (u) {
      user = u
      return Offers.find({'recipient': user._id})
      .populate('creator')
      .populate('creatorBook')
      .populate('recipient')
      .populate('recipientBook')
      .exec()
    })
    .then(function (oos) {
      outgoingOffers = oos
      return Offers.find({'creator': user._id})
      .populate('creator')
      .populate('creatorBook')
      .populate('recipient')
      .populate('recipientBook')
      .exec()
    })
    .then(function (ios) {
      incomingOffers = ios
      return res.status(201).json({
        io: incomingOffers,
        oo: outgoingOffers
      })
    })
    .catch(function (err) {
      console.log(err)
      return res.sendStatus(500)
    })
  }
  static deleteOffer(req, res) {
    let user

    Users.findOne({'twitter.id': req.user.twitter.id}).exec()
    .then(function (u) {
      user = u
      return Offers.findOne({_id: req.body.id}).exec()
    })
    .then(function (o) {
      if (String(o.creator) != String(user._id) && String(o.recipient) != String(user._id)) {
        throw new Error("User doesn't have credentials to delete")
        return res.sendStatus(500)
      }
      else {
        return o.remove()
      }
    })
    .then(function (s) {
      return res.status(200).send({ redirect: '/my-books' })
    })
    .catch(function (err) {
      if (err) {
        console.log(err)
        return res.sendStatus(500)
      }
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
