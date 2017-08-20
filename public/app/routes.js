// console.log('testing routes js file inclusion');

var myPollingAppRoutes = angular.module('myPollingAppRoutes', ['ngRoute']);

myPollingAppRoutes.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

  // console.log('testing myPollingAppRoutes');
  // $locationProvider.html5Mode(true);
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });

  $routeProvider
  .when('/home', {
    templateUrl: 'app/views/pages/home.html'
    // controller: 'HomePageController'
  })
  .when('/myhome', {
    templateUrl: 'app/views/pages/myhome.html',
    // controller: 'MyHomeController',
    authenticated: true
  })
  .when('/settings', {
    templateUrl: 'app/views/pages/users/settings.html',
    authenticated: true
  })
  .when('/logout', {
    templateUrl: 'app/views/pages/users/logout.html',
    authenticated: true
  })
  .when('/login', {
    templateUrl: 'app/views/pages/users/login.html',
    authenticated: false
  })
  .when('/register', {
    templateUrl: 'app/views/pages/users/register.html',
    controller: 'regCtrl',
    controllerAs: 'register',
    authenticated: false
  })
  .when('/facebook/:token', {
    templateUrl: 'app/views/pages/users/social/social.html',
    controller: 'facebookCtrl',
    controllerAs: 'facebook',
    authenticated: false
  })
  .when('/facebookerror', {
    templateUrl: 'app/views/pages/users/login.html',
    controller: 'facebookCtrl',
    controllerAs: 'facebook',
    authenticated: false
  })
  .when('/twitter/:token', {
    templateUrl: 'app/views/pages/users/social/social.html',
    controller: 'twitterCtrl',
    controllerAs: 'twitter',
    authenticated: false
  })
  .when('/twittererror', {
    templateUrl: 'app/views/pages/users/login.html',
    controller: 'twitterCtrl',
    controllerAs: 'twitter',
    authenticated: false
  })
  .when('/google/:token', {
    templateUrl: 'app/views/pages/users/social/social.html',
    controller: 'googleCtrl',
    controllerAs: 'google',
    authenticated: false
  })
  .when('/googleerror', {
    templateUrl: 'app/views/pages/users/login.html',
    controller: 'googleCtrl',
    controllerAs: 'google',
    authenticated: false
  })
  .when('/facebook/inactive/error', {
    templateUrl: 'app/views/pages/users/login.html',
    controller: 'facebookCtrl',
    controllerAs: 'facebook',
    authenticated: false
  })
  .when('/twitter/inactive/error', {
    templateUrl: 'app/views/pages/users/login.html',
    controller: 'twitterCtrl',
    controllerAs: 'twitter',
    authenticated: false
  })
  .when('/google/inactive/error', {
    templateUrl: 'app/views/pages/users/login.html',
    controller: 'googleCtrl',
    controllerAs: 'google',
    authenticated: false
  })
  .when('/activate/:token', {
    // templateUrl: 'app/views/pages/users/login.html',
    templateUrl: 'app/views/pages/users/activation/activate.html',
    controller: 'emailCtrl',
    controllerAs: 'email',
    authenticated: false
  })
  .when('/resend', {
    // templateUrl: 'app/views/pages/users/login.html',
    templateUrl: 'app/views/pages/users/activation/resend.html',
    controller: 'resendCtrl',
    controllerAs: 'resend',
    authenticated: false
  })
  .when('/changepassword', {
    // templateUrl: 'app/views/pages/users/login.html',
    templateUrl: 'app/views/pages/users/reset/password.html',
    controller: 'passwordCtrl',
    controllerAs: 'password',
    authenticated: false
  })
  .when('/resetpassword/:token', {
    // templateUrl: 'app/views/pages/users/login.html',
    templateUrl: 'app/views/pages/users/reset/resetpassword.html',
    controller: 'resetpasswordCtrl',
    controllerAs: 'resetpassword',
    authenticated: false
  })
  .when('/changemailid', {
    // templateUrl: 'app/views/pages/users/login.html',
    templateUrl: 'app/views/pages/users/reset/emailid.html',
    controller: 'emailidCtrl',
    controllerAs: 'emailid',
    authenticated: true
  })
  .when('/management', {
    // templateUrl: 'app/views/pages/users/login.html',
    templateUrl: 'app/views/pages/management/management.html',
    controller: 'managementCtrl',
    controllerAs: 'management',
    authenticated: true,
    permission: ['admin', 'moderator']
  })
  .when('/edit/:id', {
    // templateUrl: 'app/views/pages/users/login.html',
    templateUrl: 'app/views/pages/management/editprofile.html',
    controller: 'editCtrl',
    controllerAs: 'edit',
    authenticated: true,
    permission: ['admin', 'moderator']
  })
  .when('/search', {
    // templateUrl: 'app/views/pages/users/login.html',
    templateUrl: 'app/views/pages/management/search.html',
    controller: 'managementCtrl',
    controllerAs: 'management',
    authenticated: true,
    permission: ['admin', 'moderator']
  })
  .otherwise({
    redirectTo: '/home'
  });
}]);

myPollingAppRoutes.run(['$rootScope', 'Auth', '$location', 'User', function($rootScope, Auth, $location, User) {

    $rootScope.$on('$routeChangeStart', function(event, next, current){
        // console.log(next.$$route.authenticated);
        if (next.$$route !== undefined) {
            if (next.$$route.authenticated == true) {
                // console.log('needs to be logged in/authenticated');
                // console.log(!Auth.isLoggedIn());
                if (!Auth.isLoggedIn()) {
                    event.preventDefault();
                    $location.path('/');
                } else if (next.$$route.permission) {
                    User.getPermission().then(function(data) {
                        // console.log(data);
                        if (next.$$route.permission[0] !== data.data.permission && next.$$route.permission[1] !== data.data.permission) {
                            event.preventDefault();
                            $location.path('/');
                        }
                    });
                }
            } else if (next.$$route.authenticated == false) {
                // console.log('can pass through only when logged out');
                if (Auth.isLoggedIn()) {
                    event.preventDefault();
                    $location.path('/myHome');
                }
            } else {
              // console.log('authenticated does not matter');
            }
        }
    });
}]);

// myPollingApp.controller('HomePageController', ['$scope', '$http', function($scope, $http){
//
// }]);
