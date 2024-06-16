const express = require('express')
const router = express.Router()

const PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: 'address',
    creator: 'u1',
  },
  {
    id: 'p2',
    title: 'Empress State Building',
    location: {
      lat: 30.7484474,
      lng: 73.9871516,
    },
    address: 'address',
    creator: 'u2',
  },
]

router.get('/', (req, res, next) => {
  res.json(PLACES)
})

router.post('/', (req, res, next) => {
  res.status(201).json({ newPlace: req.body })
})

router.get('/:pid', (req, res, next) => {
  res.json({
    specificPlace: {
      pid: req.params.pid,
    },
  })
})

router.get('/user/:id', (req, res, next) => {
  res.json({
    user: req.params.id,
    places: PLACES.filter(({ creator }) => creator === req.params.id),
  })
})

router.patch(`/:pid`, (req, res, next) => {
  res.status(200).json({ updatedPlace: 'p1' })
})

router.delete('/:pid', (req, res, next) => {
  res.status(204).end()
})

module.exports = router
