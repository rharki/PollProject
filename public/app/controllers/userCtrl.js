

angular.module('userControllers', ['userServices'])

  .controller('regCtrl', ['$scope', '$http', '$location', '$timeout', 'User', function($scope, $http, $location, $timeout, User){
    var app = this;

    this.regUser = function(newuser, valid){
        app.disabled = true;
      app.loading=true;
      app.errorMsg = false;
      // console.log('Register function has been triggered!');
      // console.log(this.newuser);
      if (valid) {
          User.create(this.newuser).then(function successCallback(data) {
          // $http.post('/api/users', this.newuser).then(function successCallback(data) {
            app.loading=false;
            console.log(data.data.success);
            console.log(data.data.message);
            if (data.data.success) {
              //create success message & redirect to home page
              app.successMsg = data.data.message + '... Redirecting';
              $timeout(function(){
                  $location.path('/');
              }, 2000);
            } else {
              //create failure message and refresh
              app.disabled = false;
              app.loading=false;
              app.errorMsg = data.data.message;
            }
          }, function errorCallback(response) {
            console.log('Server returned error!');
          });
      } else {
          //create failure message and refresh
          app.disabled = false;
          app.loading=false;
          app.errorMsg = 'Please ensure the form is filled out properly!';
      }
    };

    this.emailValidate = function(newuser){
        app.loadingUsername = true;
        app.usernameMsg = false;
        app.usernameInvalid = false;

        User.emailValidate(app.newuser).then(function successCallback(data) {
            console.log(data);
            if (data.data.success) {
                app.usernameMsg = data.data.message;
                app.usernameInvalid = false;
                app.loadingUsername = false;
            } else {
                app.usernameMsg = data.data.message ;
                app.usernameInvalid = true;
                app.loadingUsername = false;
            }
        }, function errorCallback(response) {
            console.log('Server returned error in validating the email id uniqueness!');
        });
    };
  }])

  .directive('match', function(){
    //   console.log("hello");
      return {
          restrict: 'A',
          controller: function($scope){
              $scope.confirmed = false;
              $scope.doConfirm = function(values){
                //   console.log("hello from match directive function!");
                    // console.log(values);
                    // console.log($scope.confirmPassword);
                    values.forEach(function(ele){
                        if ($scope.confirmPassword == ele) {
                            $scope.confirmed = true;
                        } else {
                            $scope.confirmed = false;
                        }
                    });
              };
          },
          link: function(scope, element, attrs){
              attrs.$observe('match', function(){
                //   console.log(JSON.parse("[" + attrs.match + "]"));
                //   scope.doConfirm(scope.matches);
                    scope.matches = JSON.parse(attrs.match);
                    scope.doConfirm(scope.matches);
              });

              scope.$watch('confirmPassword', function(){
                //   console.log(JSON.parse("[" + attrs.match + "]"));
                //   scope.doConfirm(scope.matches);
                  scope.matches = JSON.parse(attrs.match);
                  scope.doConfirm(scope.matches);
              });
          }
      };
  })


  .controller('facebookCtrl', ['$routeParams', '$location', 'Auth', '$timeout', '$window', function($routeParams, $location, Auth, $timeout, $window){
    // console.log('RouteParams inside FB controller ' + $routeParams.token);
    var app = this;
    app.errorMsg = this;
    app.expired = false;
    app.disabled = true;

    if ($window.location.pathname == '/facebookerror') {
      app.errorMsg = 'Facebook email not found in database!';
  } else if ($window.location.pathname == '/facebook/inactive/error') {
      app.errorMsg = 'User account has not been activated yet!!';
      app.expired = true;
  } else {
      Auth.facebook($routeParams.token);
      // var check = Auth.isLoggedIn();
      // window.alert("Logged in status from facebook controller is" + check);
      $timeout(function(){
          $location.path('/');
      }, 2000);
    }

  }])

  .controller('twitterCtrl', ['$routeParams', '$location', 'Auth', '$timeout', '$window', function($routeParams, $location, Auth, $timeout, $window){
    // console.log('RouteParams inside Twitter controller ' + $routeParams.token);
    var app = this;
    app.errorMsg = this;
    app.expired = false;
    app.disabled = true;

    if ($window.location.pathname == '/twittererror') {
      app.errorMsg = 'Twitter email not found in database!';
  } else if ($window.location.pathname == '/twitter/inactive/error') {
        app.errorMsg = 'User account has not been activated yet!!';
        app.expired = true;
    } else {
      Auth.facebook($routeParams.token);
      // var check = Auth.isLoggedIn();
      // window.alert("Logged in status from twitter controller is" + check);
      $timeout(function(){
          $location.path('/');
      }, 2000);
    }
  }])

  .controller('googleCtrl', ['$routeParams', '$location', 'Auth', '$timeout', '$window', function($routeParams, $location, Auth, $timeout, $window){
    // console.log('RouteParams inside Google controller ' + $routeParams.token);
    var app = this;
    app.errorMsg = this;
    app.expired = false;
    app.disabled = true;

    if ($window.location.pathname == '/googleerror') {
        app.errorMsg = 'Google email not found in database!';
    } else if ($window.location.pathname == '/google/inactive/error') {
        app.errorMsg = 'User account has not been activated yet!!';
        app.expired = true;
    }  else {
      Auth.facebook($routeParams.token);
      // var check = Auth.isLoggedIn();
      // window.alert("Logged in status from google controller is" + check);
      $timeout(function(){
          $location.path('/');
      }, 2000);
    }
  }]);
