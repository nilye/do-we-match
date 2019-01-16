const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const { initDb } = require('./db')
let app = express()
let router = express.Router();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(function(req, res, next){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
  next();
});

const userRoutes = require('./routes/user')
const questionRoutes = require('./routes/question')
app.use('/user', userRoutes)
app.use('/q', questionRoutes)

initDb((err, db)=>{
  if (err) {
    console.log(err)
  } else {
    app.listen(3000)
  }
})
