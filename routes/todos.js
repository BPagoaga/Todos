var express = require('express');
var router = express.Router();

//get the model
var todos = require('../models/todos');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('todos', { title: 'Todos', todos: todos });
});

module.exports = router;
