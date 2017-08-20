var express = require('express');
var app = express();

var morgan = require('morgan');
var mongooseConnect = require('./app/models/mongo-utils');
var bodyParser = require('body-parser');
var router = express.Router();
var appRoutes = require('./app/routes/api')(router);
// var viewRoutes = require('./public/app/views');
var PORT = process.env.PORT || 3000;
var path = require('path');
var passport = require('passport');
var social = require('./app/passport/passport')(app, passport);

app.use(morgan('dev'));
app.use(bodyParser.json()); // for parsing applications/JSON
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: true
}));

//handles all the static front-end routes
app.use(express.static(__dirname + '/public'));
//handles all api requests to http://localhost:3000/api/users
app.use('/api', appRoutes);

// app.set('view engine', 'ejs');
// app.engine('html', require('ejs').renderFile);

//Connect to Mongoose
mongooseConnect();

app.get('*', function(request, response) {
  // response.render('./index.html');
  response.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

app.listen(PORT, function() {
  console.log("Harki's Polling App - Server is listening on port " + PORT);
});
