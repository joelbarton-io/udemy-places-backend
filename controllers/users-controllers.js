const uuid = require('uuid')
const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error')
const USERS = [
  {
    id: 'u1',
    name: 'Max Schwarz',
    email: 'test@test.com',
    password: 'test',
  },
  {
    id: 'u2',
    name: 'Mark Dong',
    email: 'test1@test.com',
    password: 'test',
  },
]

module.exports = {
  GET(req, res, next) {
    res.status(200).json({ users: [...USERS] })
  },
  SIGNUP(req, res, next) {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      throw new HttpError('Invalid inputs, check your data', 422)
    }
    const { name, email, password } = req.body

    // assuming input is valid & a unique email...
    if (USERS.some((user) => user.email === email))
      throw new HttpError(
        'That email is already in use by another user account',
        422
      )

    const newUser = { name, email, password, id: uuid.v4() }

    USERS.push(newUser)
    res.status(201).json({ user: newUser })
  },
  LOGIN(req, res, next) {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      throw new HttpError('Invalid inputs, check your data', 422)
    }

    const { email, password } = req.body

    const existingUser = USERS.find((user) => user.email === email)

    if (!existingUser || existingUser.password !== password)
      throw new HttpError(
        'Incorrect Login credentials or non-existing user',
        401
      )

    // something "happens" for login on the backend with token auth...
    res.status(200).json({ message: 'successful login' })
  },
}
