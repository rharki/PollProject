var myPollingApp = angular.module('myPollingApp', ['myPollingAppRoutes', 'userControllers', 'emailController', 'mainController', 'managementController', 'userServices',
              'authServices', 'ngAnimate']);

myPollingApp.config(['$httpProvider', function($httpProvider){
  // console.log('from app.js file - testing user application!');
  $httpProvider.interceptors.push('AuthInterceptors');
}]);
