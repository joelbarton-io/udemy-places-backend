const express = require('express')
const router = express.Router()
const {
  ALL,
  ALLBYUSER,
  GET,
  CREATE,
  PATCH,
  DELETE,
} = require('../controllers/places-controllers')

router.get('/', ALL)
router.post('/', CREATE)
router.get('/user/:userid', ALLBYUSER)
router.get('/:placeid', GET)
router.patch('/:placeid', PATCH)
router.delete('/:placeid', DELETE)

module.exports = router
