const {db} = require('../db');
const express = require('express')
const router = express.Router()
const objectId = require('mongodb').ObjectID
const jwt = require('jsonwebtoken')
const shortid = require('shortid')
const secret = require('./secret')

router.get('/acquire', (req, res, next) => {
  /*
    query:
    qn - questionnaire, to exclude question already added
    c - category,
    l - lastId, to make not to be repeated
  */
  const q = db().collection('question')
  const qn = db().collection('questionnaire')
  let nin = req.query.l ? [objectId(req.query.l)] : []
  qn.findOne({id: req.query.qn}).then(questionnaire=>{
    if (questionnaire){
      nin = nin.concat(questionnaire['questions'].map(c=>objectId(c.question)))
    }
    q.aggregate([
      {'$match': {category:req.query.c, _id: {'$nin': nin}}},
      {'$sample':{size:1}}
    ]).toArray((err, questions)=>{
      res.status(200).json({
        data:questions[0]?questions[0]:null
      })
    })
  })
})

router.post('/create', (req, res, next)=>{
  const qn = db().collection('questionnaire')
  const decoded = jwt.decode(req.get('Authorization'), secret)
  if (!decoded){
    res.status(403).json({msg:'unauthorized'})
  }
  qn.insertOne({
    id: shortid.generate(),
    isParent: true,
    name: req.body.name,
    owner: objectId(decoded.userId),
    questions: []
  }).then(newQuestionnaire=>{
    res.status(200).json({
      data:newQuestionnaire.ops[0]
    })
  })
})

router.get('/questionnaire', (req, res, next)=>{
  const qn = db().collection('questionnaire')
  qn.aggregate([
    {$match: {id:req.query.id}},
    {$unwind: '$questions'},
    {$lookup: {from: 'question', localField: 'questions.question', foreignField: '_id', as: 'questions.question'}},
    {$unwind: '$questions.question'},
    {$lookup: {from: 'user', localField: 'owner', foreignField: '_id', as: 'owner'}},
    {$unwind: '$owner'},
    {$group: {
        _id:'$_id',
        id: {$first:'$id'},
        isParent: {$first: '$isParent'},
        name: {$first: '$name'},
        owner: {$first: '$owner'},
        answerer: {$first: '$answer'},
        questions: {
          $push: {question: '$questions.question', choice: '$questions.choice'}
        }
      }
    }
  ]).toArray((err, result)=>{
    let data = result[0]
    const decoded = jwt.decode(req.get('Authorization'), secret)
    if (decoded && decoded.userId === data.owner._id.toHexString()){
      Object.assign({isOwner: true},data)
    }
    res.status(200).json({data})
  })
})


router.post('/edit', (req, res, next)=>{
  const qn = db().collection('questionnaire')
  const update = (()=>{
    if (req.body.questions) {
      return {
        questions:req.body.questions.map(q=>({
          question:objectId(q.question._id || q.question),
          choice:q.choice
        }))
      }
    } else if (req.body.isPublished){
      return {isPublished: req.body.isPublished}
    }
  })()
  qn.updateOne(
    {id:req.body.id},
    {$set: update}).then(result=>{
    res.status(200).json({
      msg: result.result.ok
    })
  })
})

router.post('/answer', (req, res, next)=>{
  const qn = db().collection('questionnaire')
  const decoded = jwt.decode(req.get('Authorization'), secret)
  const id = shortid.generate()
  qn.updateOne(
    {id:req.body.id},
    {$push:{answers:{
      id: id,
      userId: objectId(decoded.userId),
      answer: req.body.answers,
      score: req.body.score
    }}}).then(result=>{
    res.status(200).json({
      msg: result.result.ok,
      data:{id}
    })
  })
})

module.exports = router