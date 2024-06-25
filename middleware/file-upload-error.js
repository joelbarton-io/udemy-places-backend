const fs = require('fs')
module.exports = (err, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err)
    })
  }
  if (res.headerSent) return next(err)
  res
    .status(err.code || 500)
    .json({ message: err.message || 'unknown error occurred' })
}
