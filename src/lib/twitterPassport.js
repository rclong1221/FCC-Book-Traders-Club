'use strict'

var TwitterStrategy = require('passport-twitter').Strategy
var User = require('../models/users').User
var configAuth = require('./twitterAuth')

module.exports = function (passport) {
	passport.serializeUser(function (user, done) {
		done(null, user.id)
	})

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user)
		})
	})

	passport.use(new TwitterStrategy({
		consumerKey: configAuth.twitterAuth.clientID,
		consumerSecret: configAuth.twitterAuth.clientSecret,
		callbackURL: configAuth.twitterAuth.callbackURL
	},
	function (token, refreshToken, profile, done) {
		process.nextTick(function () {
			User.findOne({ 'twitter.id': profile.id }, function (err, user) {
				if (err) {
					return done(err)
				}

				if (user) {
					return done(null, user)
				} else {
					var newUser = new User()

					newUser.id = profile.id
					newUser.username = profile.username
					newUser.displayName = profile.displayName
					newUser.location = profile.location

					newUser.save(function (err) {
						if (err) {
							throw err
						}

						return done(null, newUser)
					})
				}
			})
		})
	}))
}
