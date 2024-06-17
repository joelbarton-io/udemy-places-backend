const express = require('express')
const router = express.Router()
const { check } = require('express-validator')

const {
  ALL,
  GETBYUSERID,
  GET,
  POST,
  PATCH,
  DELETE,
} = require('../controllers/places-controllers')
//  title, description, coordinates, address, creator
router.get('/', ALL)
router.post(
  '/',
  [
    check('title').notEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').notEmpty(),
  ],
  POST
)
router.get('/user/:userid', GETBYUSERID)
router.get('/:placeid', GET)
router.patch(
  '/:placeid',
  [check('title').notEmpty(), check('description').isLength({ min: 5 })],
  PATCH
)
router.delete('/:placeid', DELETE)

module.exports = router
