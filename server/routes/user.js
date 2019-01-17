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

router.get('/token', (req, res, next)=>{
  res.status(200).json({
    data:jwt.sign({userId:req.query.id}, secret)
  })
})

router.get('/result', (req, res, next) => {
  const qn = db().collection('questionnaire')
  const decoded = jwt.decode(req.get('Authorization'), secret)
  qn.aggregate([
    {$match: {owner: objectId(decoded.userId)}},
    {$group: {
      _id: '$owner',
      questionnaire: {
        $push: {_id: '$_id', id:'$id',name: '$name', answers: {$size: '$answers'}}
      }}
    }
  ]).toArray((err, result)=>{
    console.log(result[0])
    res.status(200).json({data:result[0] ? result[0].questionnaire : null})
  })
})

module.exports = router;
