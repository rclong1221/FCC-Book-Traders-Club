'use strict'

const path = process.cwd()
const Book = require(path + '/src/controllers/bookController.server.js')
const Offer = require(path + '/src/controllers/offerController.server.js')
const User = require(path + '/src/controllers/userController.server.js')

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next()
		} else {
			res.redirect('/login')
		}
	}

	app.route('/')
		.get(function (req, res) {
			res.sendFile(path + '/public/index.html')
		})

	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html')
		})

	app.route('/logout')
		.get(function (req, res) {
			req.logout()
			res.redirect('/login')
		})

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/profile.html')
		})

	app.route('/api/user/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.twitter)
		})

	app.route('/api/account/:id')
		.get(isLoggedIn, User.getProfile)
		.post(isLoggedIn, User.updateProfile)

	app.route('/auth/twitter')
		.get(passport.authenticate('twitter'))

	app.route('/auth/twitter/callback')
		.get(passport.authenticate('twitter', {
			successRedirect: '/',
			failureRedirect: '/login'
		}))

	app.route('/search/')
		.get(function (req, res) {
			res.sendFile(path + '/public/search.html')
		})

	app.route('/api/books/:q')
		.get(Book.search)

	app.route('/api/user/:id/books/')
		.get(isLoggedIn, Book.getMyBooks)
		.post(isLoggedIn, Book.addBook)

	app.route('/api/books')
		.get(Book.getBooks)

	app.route('/my-books')
		.get(isLoggedIn, function(req, res) {
			res.sendFile(path + '/public/my-books.html')
		})

	app.route('/api/offer/')
		.get(isLoggedIn, Offer.getOffers)
		.post(isLoggedIn, Offer.addOffer)
		.put(isLoggedIn, Offer.acceptOffer)
		.delete(isLoggedIn, Offer.deleteOffer)
}
