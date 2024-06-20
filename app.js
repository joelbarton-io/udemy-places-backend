const express = require('express')
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

const bodyParser = require('body-parser')
const HttpError = require('./models/http-error')

const app = express()
const placesRoutes = require('./routes/places-routes')
const usersRoutes = require('./routes/users-routes')

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  next()
})

app.use(bodyParser.json())

app.use('/uploads/images', express.static(path.join('uploads', 'images')))
app.use((req, res, next) => {
  console.log(req?.method, req?.url, req?.body)
  next()
})

app.use('/api/places', placesRoutes)
app.use('/api/users', usersRoutes)

app.use((req, res, next) => {
  throw new HttpError('Could not find this route', 404)
})

app.use((err, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err)
    })
  }
  if (res.headerSent) return next(err)
  res
    .status(err.code || 500)
    .json({ message: err.message || 'unknown error occurred' })
})

mongoose
  .connect(
    'mongodb+srv://joel-udemy:XrjvPwfpzkEDwjPL@cluster0.ymntqea.mongodb.net/mernApp?retryWrites=true&w=majority&appName=Cluster0'
  )
  .then(() => {
    const PORT = 5001
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
  })
  .catch((err) => {
    console.log('connection failed')
    console.error(err)
  })
