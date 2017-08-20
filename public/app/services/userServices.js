
angular.module('userServices', [])

  .factory('User', ['$http', function($http){
    userFactory = {};

    // User.create(newuser)
    userFactory.create = function(newuser){
      return $http.post('/api/users', newuser);
    };

    // User.emailValidate(newuser)
    userFactory.emailValidate = function(newuser){
      return $http.post('/api/emailvalidate', newuser);
    };

    // User.activateaccount(newuser)
    userFactory.activateaccount = function(token) {
        return $http.put('/api/activate/' + token);
    };

    // User.checkCredentials(logindata);
    userFactory.checkCredentials = function(logindata) {
        return $http.post('/api/checkcredentials', logindata);
    };

    // User.resendAuthenticateEmail(logindata);
    userFactory.resendAuthenticateEmail = function(logindata) {
        return $http.put('/api/resendauthenticateemail', logindata);
    };

    // User.changeEmailId(changeemaildata);
    userFactory.changeEmailId = function(changeemaildata) {
        return $http.put('/api/changemailid', changeemaildata);
    };

    // User.sendPassword(changepassworddata);
    userFactory.sendPassword = function(changepassworddata) {
        return $http.put('/api/resetpassword', changepassworddata);
    };

    // User.resetUser(token);
    userFactory.resetUser = function(token) {
        return $http.get('/api/resetpassword/' + token);
    };

    // User.setNewPassword(changepassworddata);
    userFactory.setNewPassword = function(changepassworddata) {
        return $http.put('/api/setnewpassword', changepassworddata);
    };

    // User.renewSession(useremail);
    userFactory.renewSession = function(useremail) {
        return $http.get('/api/renewtoken/' + useremail);
    };

    // User.getPermission();
    userFactory.getPermission = function() {
        return $http.get('/api/permission/');
    };

    // User.getUsers();
    userFactory.getUsers = function() {
        return $http.get('/api/management/');
    };

    // User.getUsers();
    userFactory.getUser = function(id) {
        return $http.get('/api/edit/' + id);
    };

    // User.deleteUser(useremail);
    userFactory.deleteUser = function(useremail) {
        return $http.delete('/api/management/' + useremail);
    };

    // User.editUser(id);
    userFactory.editUser = function(id) {
        return $http.put('/api/edit', id);
    };


    return userFactory;
  }]);
