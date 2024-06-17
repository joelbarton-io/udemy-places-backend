const HttpError = require('../models/http-error')
const Place = require('../models/place')
const getCoordinates = require('../util/location')
const { validationResult } = require('express-validator')

// const uuid = require('uuid')

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

module.exports = {
  ALL(req, res, next) {
    res.json(PLACES)
  },
  ALLBYUSER(req, res, next) {
    const places = PLACES.filter(({ creator }) => creator === req.params.userid)

    if (!places.length)
      return next(new HttpError('No places found for user', 404))

    res.json({
      userid: req.params.userid,
      places,
    })
  },
  async GET(req, res, next) {
    const { placeid } = req.params

    try {
      const place = await Place.findById(placeid)
      if (!place) {
        return next(new HttpError('Place not found', 404))
      }
      return res.json({ place: place.toObject({ getters: true }) })
    } catch (excepshun) {
      return next(
        new HttpError('Something went wrong, failed to find place by id'),
        500
      )
    }
  },
  async POST(req, res, next) {
    if (!validationResult(req).isEmpty()) {
      return next(
        new HttpError('Invalid inputs passed, please check your data', 422)
      )
    }

    const { title, description, image, address, creator } = req.body

    let location
    try {
      location = await getCoordinates(address)
    } catch (error) {
      return next(new HttpError('Fetching coordinates failed', 500))
    }

    try {
      const newPlace = new Place({
        title,
        description,
        image,
        address,
        location,
        creator,
      })
      await newPlace.save()
      return res.status(201).json({ newPlace })
    } catch (error) {
      return next(new HttpError('place creation failed', 500))
    }
  },
  PATCH(req, res, next) {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      throw new HttpError('Invalid inputs passed, please check your data', 422)
    }
    const { title, description } = req.body

    const idx = PLACES.findIndex((place) => place.id === req.params.placeid)
    if (idx === -1) throw new HttpError('Place to update not found', 404)

    const updatedPlace = {
      ...PLACES[idx],
      title,
      description,
    }

    PLACES[idx] = updatedPlace

    res.status(200).json({ place: updatedPlace })
  },
  DELETE(req, res, next) {
    const idx = PLACES.findIndex((place) => place.id === req.params.placeid)

    if (idx === -1) throw new HttpError('Not deleted, place not found', 404)

    PLACES.splice(idx, 1)

    res.status(204).json({ message: 'Deleted place' })
  },
}
