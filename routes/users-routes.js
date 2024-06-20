const express = require('express')
const { check } = require('express-validator')

const { GET, SIGNUP, LOGIN } = require('../controllers/users-controllers')
const fileUpload = require('../middleware/file-upload')
const router = express.Router()

router.get('/', GET)

router.post(
  '/signup',
  fileUpload.single('image'),
  [
    check('name').notEmpty(),
    check('name').isLength({ min: 3 }),

    check('email').notEmpty(),
    check('email').normalizeEmail().isEmail(),

    check('password').isLength({ min: 6 }),
  ],
  SIGNUP
)

router.post(
  '/login',
  [
    check('email').notEmpty(),
    check('email').normalizeEmail().isEmail(),

    check('password').isLength({ min: 6 }),
  ],
  LOGIN
)

module.exports = router
