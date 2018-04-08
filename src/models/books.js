'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

var Books = new Schema({
  title: String,
  author: String,
  date: String,
  isbn13: String,
  img_url: String
})

module.exports = {
  Book: mongoose.model('Books', Books),
  BookSchema: Books
}
