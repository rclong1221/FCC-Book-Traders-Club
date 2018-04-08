'use strict'

const path = process.cwd()
const mongoose = require('mongoose')
const Schema = mongoose.Schema

var Offer = new Schema({
  creator: {type: Schema.Types.ObjectId, ref: 'User'},
  creatorBook: {type: Schema.Types.ObjectId, ref: 'Books'},
  recipient: {type: Schema.Types.ObjectId, ref: 'User'},
  recipientBook: {type: Schema.Types.ObjectId, ref: 'Books'},
  status: String
})

module.exports = mongoose.model('Offer', Offer)
