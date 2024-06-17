const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')

const locationSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
})
const placeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  location: locationSchema,
  creator: {
    type: ObjectId,
    required: true,
  },
})

module.exports = mongoose.model('Place', placeSchema)
