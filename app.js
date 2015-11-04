var express = require('express');
var path = require('path');
var routes = require('./routes/index');
var bodyParser = require('body-parser');
var notesRoute = require('./routes/notesRoutes');
var mongoose = require('mongoose');

//var mongoURI = "mongodb://localhost:27017/NotesDatabase";
var mongoURI = "mongodb://grid:gridapp@ds049864.mongolab.com:49864/heroku_p4mp1bvf";
var mongoDB = mongoose.connect(mongoURI).connection;

mongoDB.once('open', function() {
    console.log("[" + new Date() + "] Connected to Mongo");
});

mongoDB.on('error', function(err) {
    if (err) { console.log('Mongo error', err); }
});

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));

//set paths for javascript files
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/js', express.static(__dirname + '/public/javascripts'));

app.use('/', routes);
app.use('/notes', notesRoute);
//app.use('/item', itemsRoute);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;