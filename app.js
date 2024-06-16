const express = require('express')
const bodyParser = require('body-parser')
const HttpError = require('./models/http-error')
// const helmet = require('helmet')

const app = express()
const placesRoutes = require('./routes/places-routes')
// const usersRoutes = require('./routes/users-routes')

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'", 'http://localhost:5001'],
//       // other directives...
//     },
//   })
// )

app.use(bodyParser.json())
app.use('/api/places', placesRoutes)
// app.use('/api/users', usersRoutes)

app.use((req, res, next) => {
  throw new HttpError('Could not find this route', 404)
})
app.use((err, req, res, next) => {
  if (res.headerSent) return next(err)
  res
    .status(err.code || 500)
    .json({ message: err.message || 'unknown error occurred' })
})

const PORT = 5001
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
