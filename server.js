'use strict'

const path = require('path')
const express = require('express')
const routes = require('./src/routes/index.js')
const mongoose = require('mongoose')
const passport = require('passport')
const session = require('express-session')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')

const app = express()
require('dotenv').load()
require('./src/lib/twitterPassport')(passport)

mongoose.connect(process.env.MONGO_URI)
mongoose.Promise = global.Promise

// View engine
app.engine('handlebars', handlebars({
	extname: 'handlebars',
	// defaultLayout: 'layout',
	// layoutsDir: __dirname + '/src/views/layouts'
}))
app.set('views', path.join(__dirname, 'src/views'))
app.set('view engine', 'handlebars')


app.use('/controllers', express.static(process.cwd() + '/src/controllers'))
app.use('/public', express.static(process.cwd() + '/public'))
app.use('/common', express.static(process.cwd() + '/src/common'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(session({
	secret: 'secretClementine',
	resave: false,
	saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

routes(app, passport)

var port = process.env.PORT || 8080
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...')
})
