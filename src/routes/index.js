'use strict'

const path = process.cwd()
const Book = require(path + '/src/controllers/bookController.server.js')

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

	app.route('/auth/twitter')
		.get(passport.authenticate('twitter'))

	app.route('/auth/twitter/callback')
		.get(passport.authenticate('twitter', {
			successRedirect: '/',
			failureRedirect: '/login'
		}))

	app.route('/api/user/:id/books/')
		.post(isLoggedIn, Book.addBook)
}