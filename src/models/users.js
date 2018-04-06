'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

var OwnedBook = new Schema({
	isbn13: String,
	trade: Boolean,
	offerIsbn13: String,
	offerUserId: String
})

var User = new Schema({
	twitter: {
		id: String,
		displayName: String,
		username: String,
		location: String
	},
	books: [OwnedBook],
	trades: [OwnedBook],
	offers: [OwnedBook]
})

module.exports = {
	User: mongoose.model('User', User),
	UserSchema: User
}
