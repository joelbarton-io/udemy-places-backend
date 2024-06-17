const express = require('express')
const { GET, SIGNUP, LOGIN } = require('../controllers/users-controllers')
const { check } = require('express-validator')
const router = express.Router()

router.get('/', GET)

router.post(
  '/signup',
  [
    check('email').notEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  SIGNUP
)

router.post(
  '/login',
  [
    check('name').isLength({ min: 3 }),
    check('email').notEmpty(),
    check('password').isLength({ min: 5 }),
  ],
  LOGIN
)

module.exports = router
