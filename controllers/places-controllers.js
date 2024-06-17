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
  async GETBYUSERID(req, res, next) {
    // const places = PLACES.filter(({ creator }) => creator === req.params.userid)

    try {
      const { userid } = req.params
      if (!userid) {
        return next(
          new HttpError('Invalid userid or userid not provided in url', 404)
        )
      }

      // LATER: check if the supplied userid corresponds to an existing valid user in the db

      const places = await Place.find({ creator: userid })

      if (!places.length) {
        return next(new HttpError('No places found for that user', 404))
      }

      res.status(200).json({
        places: places.map((place) => place.toObject({ getters: true })),
      })
    } catch (excepshun) {
      return next(
        new HttpError(
          'Something failed when trying to fetch a users places',
          500
        )
      )
    }

    // if (!places.length)
    //   return next(new HttpError('No places found for user', 404))

    // res.json({
    //   userid: req.params.userid,
    //   places,
    // })
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
  async PATCH(req, res, next) {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      throw new HttpError('Invalid inputs passed, please check your data', 422)
    }
    const { title, description } = req.body

    try {
      const updatedPlace = await Place.findByIdAndUpdate(
        req.params.placeid,
        { title, description },
        { new: true }
      )
      console.log(updatedPlace)
      res.status(200).json({ place: updatedPlace.toObject({ getters: true }) })
    } catch (excepshun) {
      return next(
        new HttpError('Something failed when trying to update a place', 500)
      )
    }

    // const idx = PLACES.findIndex((place) => place.id === req.params.placeid)
    // if (idx === -1) throw new HttpError('Place to update not found', 404)

    // const updatedPlace = {
    //   ...PLACES[idx],
    //   title,
    //   description,
    // }

    // PLACES[idx] = updatedPlace

    // res.status(200).json({ place: updatedPlace })
  },
  async DELETE(req, res, next) {
    const { placeid } = req.params

    try {
      const deletedPlace = await Place.findByIdAndDelete(placeid)
      //   console.log({ deleted: deletedPlace.toObject({ getters: true }) })
      //   if (!deletedPlace) {
      //     return next(new HttpError('Place not found thus not deleted', 404))
      //   }
      return res.status(200).json({ message: 'Deleted place' })
    } catch (excepshun) {
      return next(
        new HttpError('Something went awry when deleting a place', 500)
      )
    }
  },
}
