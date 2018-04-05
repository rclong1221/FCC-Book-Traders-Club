'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

var OwnedBook = new Schema({
	id: String,
	trade: Boolean
})

var User = new Schema({
	twitter: {
		id: String,
		displayName: String,
		username: String,
		location: String
	},
	books: [OwnedBook]
})

module.exports = {
	User: mongoose.model('User', User),
	UserSchema: User
}
