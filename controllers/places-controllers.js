const HttpError = require('../models/http-error')
const uuid = require('uuid')

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
    console.log('ALL')
    res.json(PLACES)
  },
  ALLBYUSER(req, res, next) {
    console.log('ALL BY USER')

    const places = PLACES.filter(({ creator }) => creator === req.params.userid)

    if (!places.length)
      return next(new HttpError('No places found for user', 404))

    res.json({
      userid: req.params.userid,
      places,
    })
  },
  GET(req, res, next) {
    console.log('GET')
    const place = PLACES.find((place) => place.id === req.params.placeid)

    if (!place) throw new HttpError('Place not found', 404)

    res.json({ place })
  },
  CREATE(req, res, next) {
    console.log('CREATE')
    const { title, description, coordinates, address, creator } = req.body
    const createdPlace = {
      id: uuid.v4(),
      title,
      description,
      location: coordinates,
      address,
      creator,
    }
    console.log(createdPlace)
    PLACES.push(createdPlace)
    res.status(201).json({ place: createdPlace })
  },
  PATCH(req, res, next) {
    console.log('PATCH')
    const data = {
      patchedPlace: PLACES.find((place) => place.id === req.params.placeid),
    }
    res.status(200).json(data)
  },
  DELETE(req, res, next) {
    console.log('DELETE')
    res.status(204).end()
  },
}
