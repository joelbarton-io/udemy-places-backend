const express = require('express')
const { check } = require('express-validator')
const fileUpload = require('../middleware/file-upload')

const router = express.Router()

const {
  ALL,
  GETBYUSERID,
  GET,
  POST,
  PATCH,
  DELETE,
} = require('../controllers/places-controllers')

router.get('/', ALL)
router.post(
  '/',
  fileUpload.single('image'),
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
