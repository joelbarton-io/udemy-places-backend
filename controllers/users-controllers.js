const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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
    } catch (excepshun) {
      return next(new HttpError(excepshun._message, 500))
    }
  },
  async SIGNUP(req, res, next) {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return next(new HttpError('Invalid inputs, check your data', 422))
    }
    const { name, email, password } = req.body

    let existingUser
    try {
      existingUser = await User.findOne({ email })
    } catch (excepshun) {
      return next(new HttpError(excepshun.message, 500))
    }

    if (existingUser) {
      return next(
        new HttpError('existing user email detected, please login instead', 422)
      )
    }

    let hashedPassword
    try {
      hashedPassword = await bcrypt.hash(password, 12)
    } catch (error) {
      return next(
        new HttpError(
          'Could not create user, please try again',
          error.code || 500
        )
      )
    }

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      image: req.file.path,
      places: [],
    })

    try {
      await newUser.save()
    } catch (error) {
      return next(
        new HttpError('signup failed, please try again', error.code || 500)
      )
    }

    let token

    try {
      token = jwt.sign(
        { userid: newUser.id, email: newUser.email },
        'supersecret',
        { expiresIn: '1h' }
      )
    } catch (error) {
      return next(
        new HttpError('signup failed, please try again', error.code || 500)
      )
    }
    return res
      .status(201)
      .json({ userid: newUser.id, email: newUser.email, token })
  },
  async LOGIN(req, res, next) {
    if (!validationResult(req).isEmpty()) {
      return next(new HttpError('Invalid inputs, double check your data', 422))
    }
    const { email, password } = req.body

    let existingUser

    try {
      existingUser = await User.findOne({ email })
    } catch (excepshun) {
      return next(new HttpError(excepshun._message, 500))
    }

    if (!existingUser) {
      return next(
        new HttpError(
          'the supplied email is not associated with an existing user account',
          403
        )
      )
    }

    let validPassword = false

    try {
      validPassword = await bcrypt.compare(password, existingUser.password)
    } catch (error) {
      return next(
        new HttpError(
          'Could not log you in, please check your credentials and try again',
          500
        )
      )
    }

    if (!validPassword) {
      return next(
        new HttpError('incorrect password for existing user email', 403)
      )
    }

    let token

    try {
      token = jwt.sign(
        { userid: existingUser.id, email: existingUser.email },
        'supersecret',
        { expiresIn: '1h' }
      )
    } catch (error) {
      return next(
        new HttpError('login failed, please try again', error.code || 500)
      )
    }

    // something "happens" for login on the backend with token auth...
    return res
      .status(200)
      .json({ userid: existingUser.id, email: existingUser.email, token })
  },
}
