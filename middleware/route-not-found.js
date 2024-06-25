const HttpError = require('../models/http-error')

module.exports = (req, res, next) => {
  throw new HttpError('Could not find this route', 404)
}
