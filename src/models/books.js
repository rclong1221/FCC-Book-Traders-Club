'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

var Books = new Schema({
  name: String,
  author: String,
  year: Number,
  isbn: String,
})

module.exports = mongoose.model('Books', Books)
