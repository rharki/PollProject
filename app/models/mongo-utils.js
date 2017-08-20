var mongoose = require('mongoose');

function mongooseConnect() {
  // console.log("Hi from mongooseConnect!");
  mongoose.Promise = global.Promise;
  // mongoose.connect('mongodb://localhost:27017/pollMasterdb');
  mongoose.connect('mongodb://rharki:rharki123@ds149603.mlab.com:49603/pollprojectdb');
  mongoose.connection
  .on('error', function(error) {
    console.log('Connection  Error: ', error);
    throw err;
  })
  .once('open', function() {
    // console.log('connection with the aliens has been made!');
    // done();
  });
}

module.exports = mongooseConnect;
