const HttpError = require('../models/http-error')
const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') return next()
  try {
    const token = req.headers.authorization.split(' ').at(1)

    console.log({ token, headers: req.headers }, 'HELLO WORLD')
    if (!token) throw new Error()

    const { userid, email, password } = jwt.verify(token, process.env.JWT_KEY)

    req.userTokenData = { userid }
    return next()
  } catch (error) {
    console.log({ error, msg: error.stack })
    return next(new HttpError('Auth failed', 403))
  }
}
