const mongodb = require('mongodb')


const url = 'mongodb://104.248.152.52:27017';
// const url = 'mognodb://localhost:27017';
const MongoClient = new mongodb.MongoClient(url, {
  poolSize:10,
  useNewUrlParser: true
})
const dbName = "do-we-match"

let _db

const initDb = callback => {
  if (_db) callback(null, _db)
  MongoClient.connect().then(client=>{
    _db = client.db(dbName)
    console.log('mongodb initialized')
    callback(null, _db)
  }).catch(err=>{+
    callback(err)
  })
}

const db = () => {
  if (!_db) throw Error('db is not connnected')
  return _db
}

module.exports = {initDb, db}
