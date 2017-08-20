var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var titlize = require('mongoose-title-case');
var validate = require('mongoose-validator');

var nameValidator = [
  validate({
    validator: 'matches',
    arguments: /^(([a-zA-Z]{2,20}))+[ ]+([a-zA-Z]{2,20})+$/,
    message: 'Name must be between 2 and 20 characters & no special characters, per part of name'
  })
];

var emailValidator = [
    validate({
        validator: 'isEmail',
        message: 'Please enter a valid email!'
    }),
    validate({
        validator: 'isLength',
        arguments: [5, 30],
        message: 'Email length should be b/w 5 and 30 characters'
  })
];

var PollSchema = new Schema({
  pollname: { type: String },
  createdon: {type : Date, default: Date.now},
  pollquestions: [{
    option: { type: String},
    votedby: [{type : mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
});

var UserSchema = new Schema({
  email: { type: String, required: true, lowercase: true, unique: true, validate: emailValidator},
  password: { type: String, required: true, select: false},
  name: { type: String, required: true, validate: nameValidator},
  active: { type: Boolean, required: true, default: false},
  temporarytoken: {type: String, required: true },
  resettoken: {type:String, required: false},
  permission: {type: String, required: true, default: 'user'},
  polls: [PollSchema]
});

UserSchema.plugin(titlize, {
  paths: [ 'name' ], // Array of paths
});

UserSchema.pre('save', function(next) {
  // do stuff
  var user = this;
  if (!user.isModified('password')) return next();
  bcrypt.hash(user.password, null, null, function(err, hash){
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

UserSchema.methods.comparePassword = function(password){
  return bcrypt.compareSync(password, this.password);
};

var User = mongoose.model("user", UserSchema);
module.exports = User;
