const HttpError = require('../models/http-error')

const API_KEY = 'AIzaSyDSbH2tL2kWa3xS1JjT-7fadsNs1qRl7UU'

async function getCoordinates(rawAddress) {
  const { default: fetch } = await import('node-fetch')
  const address = encodeURI(rawAddress)
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${API_KEY}`

  const res = await fetch(url, {
    headers: {
      'Content-Type': /application\/json/,
    },
  })

  const data = await res.json()

  if (!data || data.status === 'ZERO_RESULTS') {
    throw new HttpError(
      'Could not find location for the specified address',
      422
    )
  }
  return data.results.at(0).geometry.location
}

// getCoordinates('2110 Little Coyote Rd Big Sky, MT 59716, United States').then(
//   console.log
// )

module.exports = getCoordinates
