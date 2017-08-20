var User = require('../models/polls');
var jwt = require('jsonwebtoken');
var secret = 'rahulharkisanka';
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

//http://localhost:3000/users
var router = function (router) {

    var options = {
      auth: {
        api_user: 'rharki',
        api_key: 'iluvyou1'
      }
    };
    var client = nodemailer.createTransport(sgTransport(options));


  //USER REGISTRATION ROUTE
  //http://localhost:3000/api/users
  router.post('/users', function(req, res) {
    // res.send('testing new user creation request');
    var user = new User();
    user.email = req.body.email;
    user.password = req.body.password;
    user.name = req.body.name;
    user.temporarytoken = jwt.sign({email: user.email, name: user.name}, secret, {expiresIn: '24h'});
    user.save(function(err, user) {
      if (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
          // console.log('Entered the first 500 loop! ' + err);
          return res.json({ success: false, message: 'User already exists!' });
        } else if (err.errors.name) {
            console.log('name error ' + err.errors.name);
            return res.json({ success: false, message: err.errors.name.message});
        } else if (err.errors.email) {
            console.log('email error');
            return res.json({ success: false, message: err.errors.email.message});
        } else {
          // console.log('Entered the second 500 loop! ' + err);
          return res.json({ success: false, message: err});
        }
      } else
          var email = {
            from: 'Localhost Staff, staff@localhost.com',
            to: user.email,
            subject: "Activation email for Harki's PollingApp",
            text: 'Please copy paste the URL in this email to confirm your email account!',
            html: 'Hello <strong>' + user.name + '</strong>, <br><br>Thank you for registering at Harki Polling App. Please click on the link provided below to complete your activation: <br><br><a href="http://localhost:3000/activate/' + user.temporarytoken + '">http://localhost:3000/activate/</a>'
          };

          console.log('Starting to send the sendgrid email');
          console.log(email.from, email.subject);

          client.sendMail(email, function(err, info){
              console.log('entered sending email loop');
              if (err) {
                console.log('function returned error in sending the email');
                console.log(err);
              }
              else {
                console.log('Message sent: ' + info.response);
              }
          });
        // console.log("New user has been created!");
        res.status(200).json({success: true, message: 'Account created, please check your email for actiation link! '});
      });
  });

  //USER LOGIN ROUTE
  //http://localhost:3000/api/login
  router.post('/login', function(req, res){
    User.findOne({email: req.body.email}).select('email password name active').exec(function(err, user){
      if (err) throw err;

      if (!user) {
        return res.json({ success: false, message: 'user by email not found!' });
      } else if (user) {
        if (req.body.password) {
          var validPassword = user.comparePassword(req.body.password);
          if (!validPassword){
              return res.json({ success: false, message: 'Wrong password!' });
          } else if (!user.active) {
              return res.json({ success: false, message: 'User account has not been activated yet!!', expired: true });
          } else {
            // SET TOKEN TIME DURING LOGIN
            var token = jwt.sign({email: user.email, name: user.name}, secret, {expiresIn: '4h'});
            return res.json({ success: true, message: 'User successfully validated!', token: token });
          }
        } else {
          return res.json({ success: false, message: 'no password provided!' });
        }
      }
    });
    // res.json({ success: true, message: 'login works fine!' });
  });


  //EMAIL ID AUTHENTICATION
  //http://localhost:3000/api/emailvalidate
    router.post('/emailvalidate', function(req, res){
        User.findOne({email: req.body.email}).select('email').exec(function(err, user){
            if (err) throw err;
            // res.json({ success: true, message: 'login validation works fine!' });
            // console.log('into the email availability loop!');

            if (user) {
                return res.json({ success: false, message: 'This email id is already registered!' });
            } else {
                return res.json({ success: true, message: 'Email id is available :)' });
            }
        });
    });


    router.put('/activate/:token', function(req, res) {
        User.findOne({ temporarytoken: req.params.token }, function(err, user) {
            if (err) throw err;
            // res.json({ success: true, message: 'login validation works fine!' });
            console.log('into the email activation loop!');
            var token = req.params.token;

            jwt.verify(token, secret, function(err, decoded){
              if (err) {
                    res.json({ success: false, message: 'activation link has expired!!' });
                } else if (!User) {
                    res.json({ success: false, message: 'activation link has expired!!' });
                } else {
                    user.temporarytoken = false;
                    user.active = true;
                    user.save(function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            var email = {
                              from: 'Localhost Staff, staff@localhost.com',
                              to: user.email,
                              subject: "Account successfully activated on Harki's PollingApp!",
                              text: 'Welcome to Harki Polling App - Have a great time!!',
                              html: 'Hello <strong>' + user.name + '</strong>, <br><br>Your account has been activated at Harki Polling App.'
                            };

                            client.sendMail(email, function(err, info){
                                if (err) {
                                  console.log(err);
                                }
                                else {
                                  console.log('Message sent: ' + info.response);
                                }
                            });
                            res.json({ success: true, message: 'Account activated successfully!' });
                        }
                    });
                }
            });
        });
    });


    //USER CREDENTIALS CHECKING ROUTE
    //http://localhost:3000/api/checkcredentials
    router.post('/checkcredentials', function(req, res){
      User.findOne({email: req.body.email}).select('email password active').exec(function(err, user){
        if (err) throw err;

        if (!user) {
          return res.json({ success: false, message: 'user by email not found!' });
        } else if (user) {
          if (req.body.password) {
            var validPassword = user.comparePassword(req.body.password);
            if (!validPassword){
                return res.json({ success: false, message: 'Wrong password entered, please re-try!!' });
            } else if (user.active) {
                return res.json({ success: false, message: 'User already activated!!' });
            } else {
              var token = jwt.sign({email: user.email, name: user.name}, secret, {expiresIn: '24h'});
              return res.json({ success: true, message: 'User authenticated!!', user: user });
            }
          } else {
            return res.json({ success: false, message: 'no password provided for user authentication!' });
          }
        }
      });
      // res.json({ success: true, message: 'login works fine!' });
    });

    // Re-sending the Authenticaion Email to User
    //http://localhost:3000/api/resendauthenticateemail
    router.put('/resendauthenticateemail', function(req, res) {
        User.findOne({email: req.body.email}).select('email name temporarytoken').exec(function(err, user) {
            if (err) {
                console.log(err);
                // console.log('Returning error from API page on searching user email id' + err);
                return res.json({success: false, message: 'Error occured in re-sending the activation email'});
            }
            console.log("passing till here!");
            console.log(req.body.email);
            user.temporarytoken = jwt.sign({email: user.email, name: user.name}, secret, {expiresIn: '24h'});
            user.save(function(err, user) {
                if (err) {
                    // console.log('Returning error from API page' + err);
                    return res.json({success: false, message: 'Error occured in re-sending the activation email'});
                } else {
                    var email = {
                      from: 'Localhost Staff, staff@localhost.com',
                      to: user.email,
                      subject: "Request: Activation email for Harki's PollingApp",
                      text: 'Please copy paste the URL in this email to confirm your email account!',
                      html: 'Hello <strong>' + user.name + '</strong>, this is your re-requst for activation link email. <br><br>Please click on the link provided below to complete your activation: <br><br><a href="http://localhost:3000/activate/' + user.temporarytoken + '">http://localhost:3000/activate/' + user.temporarytoken + '</a>'
                    };

                    console.log('Starting to re-send the authenticatiom email');
                    console.log(email.from, email.subject);

                    client.sendMail(email, function(err, info){
                        console.log('entered re-sending authentication email');
                        if (err) {
                          console.log('function returned error in re-sending the auth email');
                          console.log(err);
                        }
                        else {
                          console.log('Message sent: ' + info.response);
                        }
                    });
                    return res.status(200).json({success: true, message: 'Activation Email sent to ' + user.email + ' successfully !'});
                }
            });

        });
    });

    // http://localhost:3000/api/changemailid/
    router.put('/api/changemailid', function(req, res) {
        User.findOne({ email: req.params.email}).select('email name').exec(function(err, user) {
            if (err) {
                return res.json({success: false, message: err});
            } else {
                if (!user) {
                    return res.json({success: false, message: 'Email id was not found in the database'});
                } else {
                    var newemailid = req.params.newemail;
                    // PUT CODE TO CHANGE EMAIL ID TO A NEW ONE HERE, AFTER VERIFICATION EMAIL IS SENT TO OLD EMAIL ID (OPTIONAL)

                    var email = {
                      from: 'Localhost Staff, staff@localhost.com',
                      to: user.email,
                      subject: "Request: Change of email-id for Harki's PollingApp",
                      text: "Your email id on Harki's Polling app has been changed!",
                      html: 'Hello <strong>' + user.name + '</strong>, we have changed the email id for your account, as per your request. This is a confirmation email for the same.'
                    };

                    console.log('Starting to send the email change confirmation email');
                    console.log(email.from, email.subject);

                    client.sendMail(email, function(err, info){
                        if (err) {
                          console.log('function returned error in sending email change email');
                          console.log(err);
                        }
                        else {
                          console.log('Message sent: ' + info.response);
                        }
                    });
                    return res.json({success: true, message: 'Email has been changed and a confirmation mail send to your new email id inbox.'});
                }
            }
        });
    });


    router.put('/resetpassword', function(req, res) {
        User.findOne({email: req.body.email}).select('email name active resettoken').exec(function(err, user){
            if (err) {
                return res.json({success: false, message: err});
            } else {
                if (!user) {
                    return res.json({success: false, message: 'Email id was not found in the database'});
                } else if (!user.active) {
                    return res.json({success: false, message: 'Account has not been activated yet!'});
                } else {
                    user.resettoken = jwt.sign({email: user.email, name: user.name}, secret, {expiresIn: '24h'});
                    user.save(function(err, user) {
                        if (err) {
                            return res.json({success: false, message: err});
                        } else {
                            var email = {
                              from: 'Localhost Staff, staff@localhost.com',
                              to: user.email,
                              subject: "Request: Change of password for Harki's PollingApp",
                              text: "Your password change request on Harki's Polling app!",
                              html: 'Hello <strong>' + user.name + '</strong>, please click on the below link and change your password, as per your request. <br><br><a href="http://localhost:3000/resetpassword/' + user.resettoken + '">http://localhost:3000/resetpassword/</a>'
                            };

                            console.log('Starting to send the password change confirmation email');
                            console.log(email.from, email.subject);

                            client.sendMail(email, function(err, info){
                                if (err) {
                                  console.log('function returned error in sending password change email');
                                  console.log(err);
                                }
                                else {
                                  console.log('Message sent: ' + info.response);
                                }
                            });
                            return res.json({success: true, message: 'Password change link has been sent to your email.'});
                        }
                    });
                }
            }
        });
    });

    router.get('/resetpassword/:token', function(req, res) {
        User.findOne({ resettoken: req.params.token }).select('email name active resettoken').exec(function(err, user) {
            if (err) {
                return res.json({success: false, message: err});
            } else if (!user) {
                return res.json({success: false, message: 'Password link has expired!!'});
            } else if (!user.active) {
                return res.json({success: false, message: 'Account has not been activated yet!'});
            } else {
                var token = req.params.token;
                //verify token
                jwt.verify(token, secret, function(err, decoded){
                  if (err) {
                    res.json({ success: false, message: 'Password link has expired!!' });
                    } else {
                        if (!user) {
                            res.json({ success: false, message: 'Password link has expired!!' });
                        } else {
                            return res.json({success: true, user: user, message: 'User for which this was requested found!'});
                        }
                    }
                });
            }
        });
    });

    router.put('/setnewpassword', function(req, res) {
        User.findOne({ email: req.body.email }).select('email password name resettoken ').exec(function(err, user) {
            if (req.body.password == null || req.body.password == '') {
                return res.json({success: false, message: 'Password not provided'});
            } else {
                user.password = req.body.password;
                user.resettoken = false;
                user.save(function(err) {
                    if (err) {
                        return res.json({success: false, message: err});
                    } else {
                        var email = {
                          from: 'Localhost Staff, staff@localhost.com',
                          to: user.email,
                          subject: "Request: Password changed for Harki's PollingApp",
                          text: "Your password has been changed on Harki's Polling app!",
                          html: 'Hello <strong>' + user.name + '</strong>, your password has been successfully reset, as per your request!'
                        };

                        console.log('Starting to send the password change done email');
                        console.log(email.from, email.subject);

                        client.sendMail(email, function(err, info){
                            if (err) {
                              console.log('function returned error in sending password change done email');
                              console.log(err);
                            }
                            else {
                              console.log('Message sent: ' + info.response);
                            }
                        });
                    }
                });
                return res.json({success: true, message: 'Password has been successfully reset and email sent for confimation!!'});
            }
        });
    });


  router.use(function(req, res, next){
    var token = req.body.token || req.body.query || req.headers['x-access-token'];
    if (token) {
      //verify token
      jwt.verify(token, secret, function(err, decoded){
        if (err) {
          res.json({ success: false, message: 'token invalid!' });
          } else {
            req.decoded = decoded;
            console.log(decoded.name);
            next();
          }
      });
    } else {
      res.json({ success: false, message: 'no token provided!' });
    }
  });

  // USER TOKEN IDENTIFICATION ROUTE
  //http://localhost:3000/api/me
  router.post('/me', function(req, res){
    // res.send('testing me route');
    res.json(req.decoded);
  });

  router.get('/renewtoken/:email', function(req, res) {
    User.findOne({ email: req.params.email}).select('email name').exec(function(err, user) {
        if (err) {
            res.json({ success: false, message: 'error occured in finding user!' });
        } else if (!user) {
            res.json({ success: false, message: 'no user found!' });
        } else {
            var newtoken = jwt.sign({email: user.email, name: user.name}, secret, {expiresIn: '4h'});
            res.json({ success: true, message: 'token renewed!', token: newtoken });
        }
    });
  });

  router.get('/permission', function(req, res) {
    User.findOne({ email: req.decoded.email}, function(err, user) {
        if (!user) {
            res.json({ success: false, message: 'error occured in finding user!' });
        } else {
            res.json({ success: true, message: 'permission derived!', permission: user.permission });
        }
    });
  });

  router.get('/management', function(req, res) {
    User.find({}, function(err, users) {
        if (err) throw err;
        User.findOne({ email: req.decoded.email}, function(err, mainUser) {
            if (!mainUser) {
                res.json({ success: false, message: 'error occured in finding user!' });
            } else {
                if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {

                    if (!users) {
                        res.json({ success: false, message: 'No user found in the database!' });
                    } else {
                        res.json({ success: true, message: 'Returning all users with their permissions!', users: users, permission: mainUser.permission });
                    }

                } else {
                    res.json({ success: false, message: 'user does not have required permissions!' });
                }
            }
        });
    });
  });

    router.delete('/management/:email', function(req, res) {
        var deletedUser = req.params.email;
        User.findOne({ email: req.decoded.email }, function(err, mainUser) {
            if (err) throw err;
            if (!mainUser) {
                res.json({ success: false, message: 'error occured in finding user!' });
            } else {
                if (mainUser.permission !== 'admin') {
                    res.json({ success: false, message: 'Insufficient permissions to the main user' });
                } else {
                    User.findOneAndRemove({ email: deletedUser }, function(err, user) {
                        if (err) throw err;
                        res.json({ success: true, message: 'User has been successfully deleted!'});
                    });
                }
          }
        });
    });

    router.get('/edit/:id', function(req, res) {
        var editUser = req.params.id;
        User.findOne({ email: req.decoded.email }, function(err, mainUser) {
            if (err) throw err;
            if (!mainUser) {
                res.json({ success: false, message: 'error occured in finding user!' });
            } else {
                if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                    User.findOne({ _id: editUser}, function(err, user) {
                        if (err) throw err;
                        if (!user) {
                            res.json({ success: false, message: 'no user with this id exists!!' });
                        } else {
                            res.json({ success: true, message: 'User profile located', user: user });
                        }
                    });
                } else {
                    res.json({ success: false, message: 'Insufficient permissions to the main user' });
                }
            }
        });
    });

    router.put('/edit', function(req, res) {
        var editUser = req.body._id;
        if (req.body.name) var newName = req.body.name;
        if (req.body.email) var newEmail = req.body.email;
        if (req.body.permission) var newPermission = req.body.permission;
        User.findOne({ email: req.decoded.email }, function(err, mainUser) {
            if (err) throw err;
            if (!mainUser) {
                res.json({ success: false, message: 'error occured in finding user!' });
            } else {
                if (newName) {
                    if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                        User.findOne({ _id: editUser}).select('email name').exec(function(err, user) {
                            if (err) throw err;
                            if (!user) {
                                res.json({ success: false, message: 'Could not lcoate user with this email id' });
                            } else {
                                user.name = newName;
                                user.save(function(err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        res.json({ success: true, message: 'User name has been updated in this profile!' });
                                    }
                                });
                            }
                        });
                    } else {
                        res.json({ success: false, message: 'Insufficient permissions to the main user' });
                    }
                }
                if (newEmail) {
                    if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                        // console.log(newEmail);
                        User.findOne({ _id: editUser }).select('email name').exec(function(err, user) {
                            if (err) throw err;
                            if (!user) {
                                res.json({ success: false, message: 'Could not lcoate user with this email id' });
                            } else {
                                user.email = newEmail;
                                user.save(function(err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        res.json({ success: true, message: 'User email id has been updated in this profile! Please note that email id for login is now different!' });
                                    }
                                });
                            }
                        });
                    } else {
                        res.json({ success: false, message: 'Insufficient permissions to the main user' });
                    }
                }
                if (newPermission) {
                    if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                        User.findOne({ _id: editUser}).select('email name').exec(function(err, user) {
                            if (err) throw err;
                            if (!user) {
                                res.json({ success: false, message: 'Could not lcoate user with this email id' });
                            } else {
                                // NEW PERMISSION = USER
                                if (newPermission === 'user') {
                                    if (user.permission === 'admin') {
                                        if (mainUser.permisssion !== 'admin') {
                                            res.json({ success: false, message: 'Failed! You need to be admin to downgrade another admin.'});
                                        } else {
                                            user.permisssion = newPermission;
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    res.json({ success: true, message: 'New Permissions have been saved!' });
                                                }
                                            });
                                        }
                                    } else {
                                        user.permisssion = newPermission;
                                        user.save(function(err) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                res.json({ success: true, message: 'New Permissions have been saved!' });
                                            }
                                        });
                                    }
                                }
                                // NEW PERMISSION = MODERATOR
                                if (newPermission === 'moderator') {
                                    if (user.permission === 'admin') {
                                        if (mainUser.permission !== 'admin') {
                                            res.json({ success: false, message: 'Failed! You need to be admin to downgrade another admin.'});
                                        } else {
                                            user.permisssion = newPermission;
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    res.json({ success: true, message: 'New Permissions have been saved!' });
                                                }
                                            });
                                        }
                                    } else {
                                        user.permisssion = newPermission;
                                        user.save(function(err) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                res.json({ success: true, message: 'New Permissions have been saved!' });
                                            }
                                        });
                                    }
                                }
                                // NEW PERMISSION = ADMIN
                                if (newPermission === 'admin') {
                                    if (mainUser.permission === 'moderator') {
                                        res.json({ success: false, message: 'You need to be an admin to give someone else Admin access'});
                                    } else {
                                        user.permisssion = newPermission;
                                        user.save(function(err) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                res.json({ success: true, message: 'New Permissions have been saved!' });
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    } else {
                        res.json({ success: false, message: 'Insufficient permissions to the main user' });
                    }
                }
            }
        });
    });

  return router;
};

module.exports = router;
