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

router.get('/create', (req, res, next)=>{
  const qn = db().collection('questionnaire')
  const decoded = jwt.decode(req.get('Authorization'), secret)
  if (!decoded){
    res.status(403).json({msg:'unauthorized'})
  }
  const id = shortid.generate()
  qn.insertOne({
    id: id,
    isParent: true,
    name: id,
    owner: objectId(decoded.userId),
    answers:[],
    questions: []
  }).then(newQuestionnaire=>{
    res.status(200).json({
      data:newQuestionnaire.ops[0]
    })
  })
})

router.get('/questionnaire', (req, res, next)=>{
  const qn = db().collection('questionnaire')
  let pipelines = [
    {$match: {id:req.query.id}},
    {$unwind: {path:'$questions', preserveNullAndEmptyArrays: true}},
    {$lookup: {from: 'question', localField: 'questions.question', foreignField: '_id', as: 'questions.question'}},
    {$unwind: {path:'$questions.question', preserveNullAndEmptyArrays: true}},
    {$lookup: {from: 'user', localField: 'owner', foreignField: '_id', as: 'owner'}},
    {$unwind: '$owner'},
    {$group: {
        _id:'$_id',
        id: {$first:'$id'},
        isParent: {$first: '$isParent'},
        name: {$first: '$name'},
        owner: {$first: '$owner'},
        answers:{$first: '$answers'},
        questions: {
          $push: {question: '$questions.question', choice: '$questions.choice'}
        }
      }
    }
  ]
  if (req.query.a){
    pipelines = pipelines.concat([
      {$unwind:'$answers'},
      {$match:{'answers.id':req.query.a}},
      {$lookup:{from: 'user', localField: 'answers.userId', foreignField: '_id', as: 'answers.user'}},
      {$unwind:"$answers.user"}
    ])
  } else {
    pipelines.push({$project: {answers: 0}})
  }
  qn.aggregate(pipelines).toArray((err, result)=>{
    let data = result[0], isOwner = false
    if (!data) res.status(400).json({msg:'no data'})
    if (!data.questions[0].question){
      data.questions = []
    }
    const decoded = jwt.decode(req.get('Authorization'), secret)
    if (decoded && decoded.userId === data.owner._id.toHexString()){
      isOwner = true
    }
    Object.assign(data, {isOwner})
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
