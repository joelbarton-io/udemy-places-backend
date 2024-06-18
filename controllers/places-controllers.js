const mongoose = require('mongoose')
const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error')
const getCoordinates = require('../util/location')
const Place = require('../models/place')
const User = require('../models/user')

module.exports = {
  ALL(req, res, next) {
    res.json(PLACES)
  },
  async GETBYUSERID(req, res, next) {
    try {
      const { userid } = req.params
      if (!userid) {
        return next(
          new HttpError('Invalid userid or userid not provided in url', 404)
        )
      }

      // LATER: check if the supplied userid corresponds to an existing valid user in the db

      const user = await User.findById(userid).populate('places')

      if (!user || !user.places || !user.places.length) {
        return next(new HttpError('No places found for that user', 404))
      }

      return res.status(200).json({
        places: user.places.map((place) => place.toObject({ getters: true })),
      })
    } catch (excepshun) {
      return next(
        new HttpError(
          'Something failed when trying to fetch a users places',
          500
        )
      )
    }
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
    } catch (excepshun) {
      return next(new HttpError('Fetching coordinates failed', 500))
    }

    const newPlace = new Place({
      title,
      description,
      image,
      address,
      location,
      creator,
    })

    let user
    try {
      user = await User.findById(creator)

      // if this code triggers an error, it will be caught
      if (!user) {
        return next(new HttpError('Could not find user for provided id', 404))
      }
    } catch (excepshun) {
      return next(new HttpError('Creating place failed', 500))
    }

    try {
      const session = await mongoose.startSession()
      session.startTransaction()
      await newPlace.save({ session })
      user.places.push(newPlace)
      await user.save({ session })
      await session.commitTransaction()
    } catch (excepshun) {
      console.log({ excepshun })
      return next(new HttpError('place creation failed', 500))
    }

    return res.status(201).json({ newPlace })
  },
  async PATCH(req, res, next) {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return next(
        new HttpError('Invalid inputs passed, please check your data', 422)
      )
    }
    const { title, description } = req.body

    try {
      const updatedPlace = await Place.findByIdAndUpdate(
        req.params.placeid,
        { title, description },
        { new: true }
      )

      return res
        .status(200)
        .json({ place: updatedPlace.toObject({ getters: true }) })
    } catch (excepshun) {
      return next(
        new HttpError('Something failed when trying to update a place', 500)
      )
    }
  },
  async DELETE(req, res, next) {
    const { placeid } = req.params

    let place
    try {
      place = await Place.findById(placeid).populate('creator')
      if (!place) {
        return next(new HttpError('Could not find place to delete', 404))
      }

      if (!(place instanceof mongoose.Document)) {
        return next(new HttpError('Place is not a valid document', 500))
      }
    } catch (excepshun) {
      return next(
        new HttpError(
          'Something went awry when deleting a place, could not delete',
          500
        )
      )
    }

    try {
      const session = await mongoose.startSession()
      session.startTransaction()
      await place.deleteOne({ id: placeid, session })
      place.creator.places.pull(place) // moves `place` from user's `places`
      await place.creator.save({ session })
      await session.commitTransaction()
    } catch (excepshun) {
      console.log({ here: excepshun, place })

      return next(
        new HttpError(
          'Something went awry when deleting a place, could not delete',
          500
        )
      )
    }
    return res.status(200).json({ message: 'Deleted place' })
  },
}
