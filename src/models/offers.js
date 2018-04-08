'use strict'

const path = process.cwd()
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = require(path + '/src/models/users.js').UserSchema
const Book = require(path + '/src/models/books.js').BookSchema

var Offer = new Schema({
  creator: {type: Schema.Types.ObjectId, ref: 'User'},
  creatorBook: {type: Schema.Types.ObjectId, ref: 'Book'},
  recipient: {type: Schema.Types.ObjectId, ref: 'User'},
  recipientBook: {type: Schema.Types.ObjectId, ref: 'Book'},
  status: String
})

module.exports = mongoose.model('Offer', Offer)
