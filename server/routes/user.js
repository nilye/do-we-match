const {db} = require("../db");
const express = require('express')
const router = express.Router()
const objectId = require('mongodb').ObjectID
const jwt = require('jsonwebtoken')
const secret = require('./secret')

router.post('/signup', (req, res, next) => {
  const col = db().collection('user')
  col.insertOne({
    name:req.body.name,
    gender:req.body.gender // true -> male, false -> female
  }).then(newUser=>{
    const userId = newUser.ops[0]._id
    const token = jwt.sign({userId}, secret)
    res.status(200).json({
      data:Object.assign({token},newUser.ops[0])
    })
  })
})


router.get('/result', (req, res, next) => {
  const col = db().collection('user')
  col.findOne({_id: objectId(req.query.id)}).then(user=>{
    console.log(user)
    res.status(200).json({
      data:user
    })
  })
})

module.exports = router;
