const express = require('express');//библиотека для быстрого создания проекта
const router = express.Router();//обработка входящих запросов

//подключение бд
let db;
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = "mongodb://localhost:27017/";
MongoClient.connect(url, {useUnifiedTopology: true}, function (err, client) {
  if(err){
    return console.log(err);
  }
  db = client.db("records");
})


router.get('/', function(req, res, next){
  res.render('index');
});

router.get('/user', function(req, res, next){
  res.render('user');
});

router.post('/user', function(req, res, next){
  let fio = req.body.fio
  let phone = req.body.phone
  let problem = req.body.problem
  db.collection('problems').insertOne({"fio": fio, "phone": phone, "problem": problem, "solved": false}, function (err, result) {
    if (err) {
      console.log(err);
    }
    res.render('user');
  })

});

router.get('/boss', function(req, res, next){
  db.collection('problems').find({"solved": false, "rab": {$exists: false}}).toArray(function (err, result) {
    if (err) {
      console.log(err);
    }
    //console.log(result)
    if (result) {
      let problems_list = result
      db.collection('rabs').findOne({}, function (err, result) {
        if (err) {
          console.log(err);
        }
        console.log(problems_list, result)
        if (result) {
          res.render('boss', {problems_list: problems_list, rabs: result.rabs});
        }
      })
    }
  })

});

router.post('/boss', function(req, res, next){
  let rab = req.body.select_name
  let problem = req.body.problem
  let fio = req.body.fio
  db.collection('problems').updateOne({"problem": problem, "fio": fio}, {$set: {"rab": rab}}, function (err, result) {
    if (err) {
      console.log(err);
    }
    db.collection('problems').find({"solved": false, "rab": {$exists: false}}).toArray(function (err, result) {
      if (err) {
        console.log(err);
      }
      //console.log(result)
      if (result) {
        let problems_list = result
        db.collection('rabs').findOne({}, function (err, result) {
          if (err) {
            console.log(err);
          }
          console.log(problems_list, result)
          if (result) {
            res.render('boss', {problems_list: problems_list, rabs: result.rabs});
          }
        })
      }
    })
  })
});

router.get('/rab', function(req, res, next){
  res.render('rab');
});

router.post('/rab', function(req, res, next){
  let rab = req.body.rab
  if (rab){
    db.collection('problems').find({"solved": false, "rab": rab}).toArray(function (err, result) {
      if (err) {
        console.log(err);
      }
      console.log(result)
      if (result) {
        res.render('rab', {problems_list: result});
      }
    })
  }
  let problem = req.body.problem
  let fio = req.body.fio
  let comment = req.body.comment
  if (problem){
    db.collection('problems').updateOne({"problem": problem, "fio": fio}, {$set: {"solved": true, "comment": comment}}, function (err, result) {
      if (err) {
        console.log(err);
      }
      if (result) {
        res.render('rab');
      }
    })
  }

});


module.exports = router;
