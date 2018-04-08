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
    .then(function (ios) {
      incomingOffers = ios
      return Offers.find({'creator': user._id})
      .populate('creator')
      .populate('creatorBook')
      .populate('recipient')
      .populate('recipientBook')
      .exec()
    })
    .then(function (oos) {
      outgoingOffers = oos
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
  
  static acceptOffer(req, res) {
    let recipient,
        creator,
        offer

    Offers.findOne({'_id': req.body._id,})
    .populate('creator')
    .populate('creatorBook')
    .populate('recipient')
    .populate('recipientBook')
    .exec()
    .then(function (o) {
      offer = o
      if (
        String(o.creator._id) !== String(req.body.creator._id)
        && String(o.creatorBook._id) !== String(req.body.creatorBook._id)
        && String(o.recipient._id) !== String(req.body.recipient._id)
        && String(o.recipientBook._id) !== String(req.body.recipientBook._id)
      ) {
        throw new Error("User doesn't have credentials to accept")
        return res.sendStatus(500)
      } else {
        return Users.findOne({'twitter.id': req.user.twitter.id}).exec()
      }
    })
    .then(function (u) {
      recipient = u
      return Users.findOne({_id: req.body.creator._id}).exec()
    })
    .then(function (u) {
      creator = u
      let cOld, rOld

      // Remove recipient book from recipient
      for (let i = 0; i < recipient.books.length; i++) {
        if (recipient.books[i].isbn13 === offer.recipientBook.isbn13) {
          cOld = Object.assign(recipient.books[i])
          recipient.books.splice(i, 1)
          break
        }
      }

      // Remove creator book from creator
      for (let i = 0; i < creator.books.length; i++) {
        if (creator.books[i].isbn13 === offer.creatorBook.isbn13) {
          rOld = creator.books[i]
          creator.books.splice(i, 1)
          break
        }
      }

      // Add creator book to recipient
      recipient.books.push(rOld)

      // Add recipient book to creator
      creator.books.push(cOld)

      return Offers.remove({
        $or: [
          {'creator': offer.creator._id, 'creatorBook': offer.creatorBook._id},
          {'recipient': offer.creator._id, 'recipientBook': offer.creatorBook._id},
          {'creator': offer.recipient._id, 'creatorBook': offer.recipientBook._id},
          {'recipient': offer.recipient._id, 'recipientBook': offer.recipientBook._id},
        ]
      }).exec()
    })
    .then(function (os) {
      return recipient.save()
    })
    .then(function (u) {
      return creator.save()
    })
    .then(function (u) {
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

module.exports = Offer
