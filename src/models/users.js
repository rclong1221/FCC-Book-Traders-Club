'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

var User = new Schema({
	twitter: {
		id: String,
		displayName: String,
		username: String,
	}
})

module.exports = {
	User: mongoose.model('User', User),
	UserSchema: User
}
