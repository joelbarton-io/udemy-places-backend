const { validationResult } = require('express-validator')
const User = require('../models/user')
const HttpError = require('../models/http-error')

module.exports = {
  async GET(req, res, next) {
    try {
      const allUsers = await User.find({}, '-password')

      if (!allUsers || !allUsers.length) {
        return next(new HttpError('No users found', 404))
      }

      return res.status(200).json({
        users: allUsers.map((user) => user.toObject({ getters: true })),
      })
      console.log({
        message: 'this message should never get logged'.toUpperCase(),
      })
    } catch (excepshun) {
      return next(new HttpError(excepshun._message, 500))
    }
  },
  async SIGNUP(req, res, next) {
    if (!validationResult(req).isEmpty()) {
      return next(new HttpError('Invalid inputs, check your data', 422))
    }
    const { name, email, password } = req.body

    try {
      const existingUser = await User.findOne({ email })

      // this should eventually pass existing user info into newly rendered `login` form input fields
      if (existingUser) {
        return next(
          new HttpError(
            'existing user email detected, please login instead',
            422
          )
        )
      }

      const newUser = new User({
        name,
        email,
        password,
        image: 'https://www.gravatar.com/avatar/',
        places: [],
      })

      await newUser.save()
      return res.status(201).json({ user: newUser.toObject({ getters: true }) })
    } catch (excepshun) {
      console.log({ here: excepshun })
      return next(new HttpError(excepshun._message, 500))
    }
  },
  async LOGIN(req, res, next) {
    if (!validationResult(req).isEmpty()) {
      return next(new HttpError('Invalid inputs, double check your data', 422))
    }
    const { email, password } = req.body

    try {
      const existingUser = await User.findOne({ email })

      if (!existingUser) {
        return next(
          new HttpError(
            'the supplied email is not associated with an existing user',
            422
          )
        )
      }

      // unhash the stored password on db and compare with request.body.password...
      if (existingUser.toObject({ getters: true }).password !== password) {
        return next(
          new HttpError('incorrect password for existing user email', 401)
        )
      }

      // something "happens" for login on the backend with token auth...
      return res.status(200).json({ message: 'successful login' })
    } catch (excepshun) {
      return next(new HttpError(excepshun._message, 500))
    }
  },
}
