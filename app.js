const express = require('express')
const mongoose = require('mongoose')
const path = require('path')

const bodyParser = require('body-parser')
const reqLogger = require('./middleware/req-logger')
const setCorsHeaders = require('./middleware/set-cors-headers')
const routeNotFound = require('./middleware/route-not-found')
const fileUploadError = require('./middleware/file-upload-error')
const app = express()
const placesRoutes = require('./routes/places-routes')
const usersRoutes = require('./routes/users-routes')

app.use(setCorsHeaders)
app.use(bodyParser.json())
app.use('/uploads/images', express.static(path.join('uploads', 'images')))
app.use(express.static(path.join('public')))

app.use(reqLogger)
app.use('/api/places', placesRoutes)
app.use('/api/users', usersRoutes)

app.use((req, res, next) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'))
})
// app.use(routeNotFound)
app.use(fileUploadError)

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ymntqea.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    const PORT = 5001
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
  })
  .catch((err) => {
    console.log('connection failed')
    console.error(err)
  })
