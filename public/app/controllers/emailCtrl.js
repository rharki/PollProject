angular.module('emailController', ['userServices'])

    .controller('emailCtrl', ['$routeParams', 'User', '$timeout', '$location', function($routeParams, User, $timeout, $location) {
        console.log($routeParams.token);
        var app = this;

        User.activateaccount($routeParams.token).then(function(data) {
            app.successMsg = false;
            app.errorMsg = false;

            if (data.data.success) {
                app.successMsg = data.data.message + '... Redirecting to loing page';
                $timeout(function(){
                    $location.path('/login');
                }, 2000);
            } else {
                app.errorMsg = data.data.message + '... Redirecting to login page';
                $timeout(function(){
                    $location.path('/login');
                }, 2000);
            }
        });

    }])

    .controller('resendCtrl', ['User', function(User) {
        var app = this;
        app.loading = false;

        app.checkCredentials = function(logindata) {
            // console.log("before credentials check", this.logindata);
            app.disabled = true;
            app.loading = true;
            app.successMsg = false;
            app.errorMsg = false;

            User.checkCredentials(app.logindata).then(function(data) {
                if (data.data.success) {
                    // console.log("From inside sending mail loop", data.data.user);
                    User.resendAuthenticateEmail(data.data.user).then(function(data) {
                        // console.log('Returning from inside successfully re-sent activation link', data);
                        if (data.data.success) {
                            app.loading = false;
                            app.successMsg = true;
                            app.successMsg = "Actication email sent to the user successfully. Plese check email and activate account!";
                        } else {
                            app.loading = false;
                            app.errorMsg = true;
                            app.errorMsg = data.data.message;
                        }
                    });
                } else {
                    app.disabled = false;
                    app.loading = false;
                    app.errorMsg = true;
                    app.errorMsg = data.data.message;
                }
            });
        };
    }])

    .controller('emailidCtrl', ['User', function(User) {
        var app = this;
        app.loading = false;

        app.changeEmailId = function(changeemaildata) {
            app.disabled = true;
            app.loading = true;
            app.successMsg = false;
            app.errorMsg = false;
            User.changeEmailId(app.changeemaildata).then(function(data) {
                if (data.data.success) {
                    // console.log("From inside sending mail loop", data.data.user);
                    app.loading = false;
                    app.successMsg = true;
                    app.successMsg = data.data.message;
                } else {
                    app.disabled = false;
                    app.loading = false;
                    app.errorMsg = true;
                    app.errorMsg = data.data.message;
                }
            });
        };
    }])

    .controller('passwordCtrl', ['User', function(User) {
        var app = this;

        app.sendPassword = function(changepassworddata, valid) {
            app.loading = true;
            app.disabled = true;
            app.successMsg = false;
            app.errorMsg = false;

            if (!valid) {
                app.disabled = false;
                app.loading = false;
                app.errorMsg = true;
                app.errorMsg = 'Please enter a valid email id!';
            } else {
                console.log(app.changepassworddata);
                User.sendPassword(app.changepassworddata).then(function(data) {
                    if (data.data.success) {
                        app.loading = false;
                        app.successMsg = true;
                        app.successMsg = data.data.message;
                    } else {
                        app.disabled = false;
                        app.loading = false;
                        app.errorMsg = true;
                        app.errorMsg = data.data.message;
                    }
                });
            }
        };
    }])

    .controller('resetpasswordCtrl', ['$routeParams', 'User', '$location', function($routeParams, User, $location) {
        var app = this;
        app.hide = true;
        app.disabled = false;
        app.successMsg = false;
        app.errorMsg = false;
        // console.log($routeParams.token);
        var useremail = null;

        User.resetUser($routeParams.token).then(function(data) {
            console.log(data);
            if (data.data.success) {
                app.hide = false;
                app.successMsg = true;
                app.successMsg = 'Please enter a new password';
                useremail = data.data.user.email;
                // console.log(useremail);
            } else {
                app.loading = false;
                app.errorMsg = true;
                app.errorMsg = data.data.message;
            }
        });

        app.setNewPassword = function(newpassworddata, valid, confirmed) {
            app.loading = true;
            app.errorMsg = false;
            app.successMsg = false;
            // console.log(app.newpassworddata);
            // console.log(valid);
            // console.log(confirmed);

            if (valid && confirmed) {
                // console.log(app.data.)
                app.newpassworddata.email = useremail;
                console.log(app.newpassworddata);
                User.setNewPassword(app.newpassworddata).then(function(data) {
                    if (data.data.success) {
                        app.successMsg = true;
                        app.loading = false;
                        app.successMsg = data.data.message + 'redirecting ...';
                        $timeout(function(){
                            $location.path('/myhome');
                        }, 2000);
                    } else {
                        app.loading = false;
                        app.errorMsg = true;
                        app.errorMsg = data.data.message;
                    }
                });
            } else {
                app.loading = false;
                app.errorMsg = true;
                app.errorMsg = "Please ensure the form is filled out properly!";
            }
        };

    }]);
