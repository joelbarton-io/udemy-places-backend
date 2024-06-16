const express = require('express')
const bodyParser = require('body-parser')
const helmet = require('helmet')

const app = express()

const placesRoutes = require('./routes/places-routes')
const usersRoutes = require('./routes/users-routes')

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'http://localhost:5001'],
      // other directives...
    },
  })
)

app.use(bodyParser.json())
app.use('/api/places', placesRoutes)
app.use('/api/users', usersRoutes)

const PORT = 5001
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
