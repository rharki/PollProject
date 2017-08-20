
angular.module('mainController', ['authServices', 'userServices'])

  .controller('mainCtrl', ['$timeout', '$location', 'Auth', '$rootScope', '$window', '$interval', '$route', 'User', 'AuthToken', function($timeout, $location, Auth, $rootScope, $window, $interval, $route, User, AuthToken){
      // console.log('hi from mainCtrl page');
      var app = this;
      app.loadme = false;

      app.checkSession = function() {
          if (Auth.isLoggedIn()) {
              app.checkingSession = true;
              var interval = $interval(function() {
                  var token = $window.localStorage.getItem('token');
                  if (token == null) {
                    $interval.cancel(interval);
                  } else {
                      self.parseJwt = function(token) {
                        var base64Url = token.split('.')[1];
                        var base64 =  base64Url.replace('-','+').replace('_','/');
                        return JSON.parse($window.atob(base64));
                      };
                      var expireTime = self.parseJwt(token);
                      var timeStamp = Math.floor(Date.now() / 1000);
                    //   console.log(expireTime.exp, timeStamp);
                      var timeCheck = expireTime.exp - timeStamp;
                      if (timeCheck <= 25) {
                        //   console.log('Token has expired');
                          showModal(1);
                          $interval.cancel(interval);
                      } else {
                        //   console.log('Token not yet expired');
                      }
                  }
                //   console.log('test');
                }, 5000);
            }
        };

      app.checkSession();

      var showModal = function(option) {
        app.choiceMade = false;
        app.modalHeader = undefined;
        app.modalBody = undefined;
        app.hideButton = false;

        if (option === 1) {
            app.modalHeader = 'Timeout Warning';
            app.modalBody = 'Your session will expire in 5 mins. Do you want to continue to remain logged in?';
            $('#myModal').modal({ backdrop:"static"});
        } else if (option === 2) {
            // Logout portion of code
            app.hideButton = true;
            app.modalHeader = 'Logging out';
            // app.modalBody = "You are being logged out of Harki's Polling App";
            $('#myModal').modal({ backdrop:"static"});
            $timeout(function() {
                Auth.logout();
                $location.path('/home');
                hideModal();
                $route.reload();
            }, 5000);
        }
        $timeout(function(){
            if (!app.choiceMade) {
                // console.log('Logged out automatically');
                hideModal();
            }
        }, 4000);
      };

      app.renewSession = function() {
          app.choiceMade = true;
          User.renewSession(app.email).then(function(data) {
            if (data.data.success) {
                AuthToken.setToken(data.data.token);
                app.checkSession();
            } else {
                app.modalBody = data.data.message;
            }
          });
        //   console.log('Session Renewed');
          hideModal();
      };

      app.endSession = function() {
          app.choiceMade = true;
          $timeout(function() {
            showModal(2);
          }, 1000);
          console.log('Session ended by logout');
          hideModal();
      };

      var hideModal = function() {
        $('#myModal').modal('hide');
      };

      $rootScope.$on('$routeChangeStart', function(){

          if (!app.checkingSession) {
              app.checkSession();
          }

        // var check = Auth.isLoggedIn();
        // window.alert("Logged in status from main controller is " + check);
        if (Auth.isLoggedIn()) {
          // console.log('User already logged in!');
            app.isLoggedIn = true;
            Auth.getUser().then(function(data){
                // console.log(data.data.name, data.data.email);
                app.name = data.data.name;
                app.email = data.data.email;

                User.getPermission().then(function(data) {
                    if (data.data.permission === 'admin' || data.data.permission === 'moderator') {
                        app.authorized = true;
                        app.loadme = true;
                    } else {
                        app.loadme = true;
                    }
                });
            });
        } else {
          // console.log('Failure! User is not logged in!');
          app.name = "";
          app.isLoggedIn = false;
          app.loadme = true;
        }
        if ($location.hash() == "_=_") $location.hash(null);
      });

      this.facebook = function(){
        // console.log('testing facebook button');
        app.disabled = true;
        $window.location = $window.location.protocol + '//' + $window.location.host + '/auth/facebook';
      };

      this.twitter = function(){
        // console.log('testing twitter button');
        app.disabled = true;
        $window.location = $window.location.protocol + '//' + $window.location.host + '/auth/twitter';
      };

      this.google = function(){
        // console.log('testing google button');
        app.disabled = true;
        $window.location = $window.location.protocol + '//' + $window.location.host + '/auth/google';
      };

      this.doLogin = function(logindata){
        // console.log('login form submitted');
        app.loading=true;
        app.errorMsg = false;
        app.successMsg = false;
        app.expired = false;
        app.disabled = true;

        Auth.login(this.logindata).then(function successCallback(data) {
            app.loading = false;
            // console.log(data.data.success);
            // console.log(data.data.message);
            if (data.data.success) {
              //create success message & redirect to home page
              app.successMsg = data.data.message + '... Redirecting';
              $timeout(function(){
                  app.logindata = '';
                  app.successMsg = false;
                  app.checkSession();
                  $location.path('/myhome');
              }, 2000);
            } else {
              if (data.data.expired) {
                  app.errorMsg = true;
                  app.errorMsg = data.data.message;
                  app.expired = true;
              } else {
                  //create failure message and refresh
                  app.errorMsg = true;
                  app.disabled = false;
                  app.errorMsg = data.data.message;
              }
            }
          }, function errorCallback(response) {
            console.log('Server returned error!');
          });
      };

      this.logout = function(){
    //     Auth.logout();
    //     $location.path('/logout');
    //     $timeout(function(){
    //         $location.path('/');
    //     }, 4000);
        showModal(2);
      };

  }]);
