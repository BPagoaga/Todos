/*================
     REQUIRE
================*/

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//templating engine
var exphbs  = require('express-handlebars');

//css preprocessor
var sassMiddleware = require('node-sass-middleware');

//app build processor
var browserify = require('browserify-middleware');

// mongo DB
var mongoose = require('mongoose');
var dbConnectionString = process.env.MONGODB_URI || 'mongodb://localhost';
mongoose.connect(dbConnectionString + '/todos');

/*====================
      LOAD ROUTES
====================*/
var routes = require('./routes/index');
var users = require('./routes/users');

//load the todo router
var todos = require('./routes/todos/index');
var todosAPI = require('./routes/todos/api');

var app = express();


/*========================
    MIDDLEWARE SETUP
========================*/

// view engine setup
app.engine('hbs', exphbs({extname: '.hbs', defaultLayout: 'layout'}));
app.set('view engine', 'hbs');

// sass setup
app.use (
  sassMiddleware({
    src: __dirname + '/sass',
    dest: __dirname + '/public',
    //prefix: '/stylesheets',
    debug: true,
  }),
  express.static(path.join(__dirname, 'public'))
);
app.use('/fonts', express.static(path.join(__dirname, 'node_modules/bootstrap-sass/assets/fonts'))); // ADD THIS


browserify.settings({
  transform: ['hbsfy']
});

// browserify setup
app.get('/javascripts/bundle.js', browserify('./client/script.js'));
// dev environment
if (app.get('env') == 'development') {
  var browserSync = require('browser-sync');
  var config = {
    files: ["public/**/*.{js,css}", "client/*.js", "sass/**/*.scss", "views/**/*.hbs"],
    logLevel: 'debug',
    logSnippet: false,
    reloadDelay: 3000,
    reloadOnRestart: true
  };
  var bs = browserSync(config);
  app.use(require('connect-browser-sync')(bs));
}

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', routes);
app.use('/users', users);

//set our todo
app.use('/todos', todos);
app.use('/api/todos', todosAPI);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
