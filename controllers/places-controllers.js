const mongoose = require('mongoose')
const fs = require('fs')

const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error')
const getCoordinates = require('../util/location')
const Place = require('../models/place')
const User = require('../models/user')

module.exports = {
  async ALL(req, res, next) {
    // res.json(PLACES)
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

    const creator = req.userTokenData.userid

    const { title, description, address } = req.body
    let location
    try {
      location = await getCoordinates(address)
    } catch (excepshun) {
      return next(new HttpError('Fetching coordinates failed', 500))
    }

    const newPlace = new Place({
      title,
      description,
      image: req.file.path,
      address,
      location,
      creator,
    })

    let user
    try {
      user = await User.findById(creator)
      if (!user) {
        return next(new HttpError('Could not find user for provided id', 404))
      }
    } catch (excepshun) {
      console.log({ excepshun })
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

    /* 
    find place to update by id

    get info from req.userTokenData

    ensure the place's creator (a user id) matches the token's info

    then and only then, we can update the place
    */

    let place
    try {
      place = await Place.findById(req.params.placeid)
      if (place.creator.toString() !== req.userTokenData.userid) {
        return next(
          new HttpError(
            'Unauthorized update, current user does not own that place!',
            401
          )
        )
      }

      //   const place = await Place.findByIdAndUpdate(
      //     req.params.placeid,
      //     { title, description },
      //     { new: true }
      //   )

      //   return res.status(200).json({ place: place.toObject({ getters: true }) })
    } catch (exception) {
      return next(
        new HttpError('Something failed when trying to update a place', 500)
      )
    }

    try {
      place.title = title
      place.description = description
      const updatedPlace = await place.save()
      console.log({ updatedPlace })
    } catch (exception) {
      console.log({ exception })
      return next(new HttpError('updating place failed', 500))
    }

    res.status(200).json({ place: place.toObject({ getters: true }) })
  },
  async DELETE(req, res, next) {
    const { placeid } = req.params

    let place
    try {
      place = await Place.findById(placeid).populate('creator')
    } catch (excepshun) {
      return next(
        new HttpError(
          'Something went awry when deleting a place, could not delete',
          500
        )
      )
    }
    if (!place) {
      return next(new HttpError('Could not find place to delete', 404))
    }

    const imagePath = place.image

    if (place.creator.id !== req.userTokenData.userid) {
      return next(
        new HttpError(
          'Unauthorized delete, current user does not own that place!',
          401
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
      return next(
        new HttpError(
          'Something went awry when deleting a place, could not delete',
          500
        )
      )
    }

    fs.unlink(imagePath, (err) => {
      console.log(err)
    })

    return res.status(200).json({ message: 'Deleted place' })
  },
}
