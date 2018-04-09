'use strict'

const path = process.cwd()
const Users = require(path + '/src/models/users.js').User

class User {
  static getProfile(req, res) {
    Users.findOne({'twitter.id': req.user.twitter.id}, function (err, d) {
      if (err) {
        console.log(err)
        return res.sendStatus(500)
      } else return res.status(201).json(d)
    })
  }
  static updateProfile(req, res) {
    Users.update({'twitter.id': req.user.twitter.id},
    {$set: {
      'twitter.displayName': req.body.displayName,
      'twitter.location': req.body.location,
      'name': req.body.name
    }}, function (err, u) {
      return res.status(200).json({redirect: '/profile'})
    })
  }
}

module.exports = User
