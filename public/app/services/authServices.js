
angular.module('authServices', [])

  .factory('Auth', ['$http', 'AuthToken', function($http, AuthToken){
    var authFactory = {};
    //Auth.login(logindata)
    authFactory.login = function(logindata){
      return $http.post('/api/login', logindata).then(function(data){
        // console.log(data.data.token);
        AuthToken.setToken(data.data.token);
        return data;
      });
    };

    //Auth.isLoggedIn()
    authFactory.isLoggedIn = function(){
      return AuthToken.getToken();
    };

    //Auth.facebook(token)
    authFactory.facebook = function(token){
      AuthToken.setToken(token);
    };

    //Auth.getUser()
    authFactory.getUser = function(){
      if (AuthToken.getToken()) {
        return $http.post('/api/me');
      } else {
        $q.reject({message: 'User has no token'});
      }
    };

    //Auth.logout()
    authFactory.logout = function(){
      AuthToken.setToken();
    };

    //Putting AuthInterceptors here to check understanding!
    // Auth.interceptors()
    // authFactory.request = function(config) {
    //   var token = AuthToken.getToken();
    //   if (token) {
    //     config.headers['x-access-token'] = token;
    //     return config;
    //   }
    // };


    return authFactory;
  }])

  .factory('AuthToken', ['$window', function($window){
    var authTokenFactory = {};
    authTokenFactory.setToken = function(token){
      if (token) {
        $window.localStorage.setItem('token', token);
      } else {
        $window.localStorage.removeItem('token');
      }
    };
    authTokenFactory.getToken = function(){
      // console.log('AuthToken requested!');
      return $window.localStorage.getItem('token');
    };

    return authTokenFactory;
  }])

  .factory('AuthInterceptors', ['AuthToken', '$log', function(AuthToken, $log){
    var authInterceptorsFactory = {};

    authInterceptorsFactory.request = function(config) {
      // console.log('Hi from AuthInterceptors');
      var token = AuthToken.getToken();
      if (token) {
        // console.log('Speaking from inside the if token loop' + token);
        config.headers['x-access-token'] = token;
        return config;
      } else {
        // console.log('this returned from my point!');
        return config;
      }
    };
    // console.log('this returned from the authors point!');
    return authInterceptorsFactory;
  }]);
