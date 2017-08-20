angular.module('managementController', [])

    .controller('managementCtrl', ['User', '$scope', function(User, $scope) {
        // console.log('test mgmt controller');
        var app = this;
        this.defaultlimit = 10;
        app.limit = this.defaultlimit;
        app.loading = true;
        app.accessDeined = true;
        app.errorMsg = false;
        app.editAccess = false;
        app.deleteAccess = false;
        app.searchLimit = 0;
        app.sort = false;

        function getUsers() {
            User.getUsers().then(function(data) {
                if (data.data.success) {
                    if (data.data.permission === 'admin' || data.data.permission === 'moderator') {
                        app.users = data.data.users;
                        app.loading = false;
                        app.accessDeined = false;
                        app.editAccess = true;
                        if (data.data.permission === 'admin') {
                            app.deleteAccess = true;
                        }
                    } {
                        app.errorMsg = "Insufficient Permissions to view this page";
                        app.loading = false;
                    }
                } else {
                    app.errorMsg = data.data.message;
                    app.loading = false;
                }
            });
        }

        getUsers();

        app.showMore = function(number) {
            app.showMoreError = false;
            if (number > 0) {
                app.limit = number;
            } else {
                app.showMoreError = 'Please enter a valid number';
            }
        };

        app.showAll = function() {
            app.limit = undefined;
            app.showMoreError = false;
            $scope.number = null;
        };

        app.deleteUser = function(useremail) {
            User.deleteUser(useremail).then(function(data) {
                if (data.data.success) {
                    getUsers();
                } else {
                    app.showMoreError = data.data.message;
                }
            });
        };

        app.search = function(searchKeyword, number) {
            if (searchKeyword) {
                if (searchKeyword.length > 0 ) {
                    app.limit = 0;
                    $scope.searchFilter = searchKeyword;
                    app.limit = number;
                }
            } else {
                $scope.searchFilter = undefined;
                app.limit = 0;
            }
        };

        app.clear = function() {
            app.limit = this.defaultlimit;
            $scope.number = undefined;
            $scope.searchKeyword = undefined;
            $scope.searchFilter = undefined;
            app.showMoreError = false;
        };

        app.advancedSearch = function(searchByName, searchByEmail, searchByPermission) {
            if (searchByName || searchByEmail || searchByPermission) {
                $scope.advancedSearchFilter = {};
                // console.log($scope.advancedSearchFilter.name, $scope.advancedSearchFilter.email, $scope.advancedSearchFilter.permission);
                if (searchByName) {
                    $scope.advancedSearchFilter.name = searchByName;
                }
                if (searchByEmail) {
                    $scope.advancedSearchFilter.email = searchByEmail;
                }
                if (searchByPermission) {
                    $scope.advancedSearchFilter.permission = searchByPermission;
                }
                app.searchLimit = undefined;
            }
        };

        app.sortOrder = function(order) {
            app.sort = order;
        };

    }])

    .controller('editCtrl', ['$scope', 'User', '$routeParams', '$timeout', function($scope, User, $routeParams, $timeout){
        var app = this;
        $scope.nameTab = 'active';
        app.phase1 = true;

        User.getUser($routeParams.id).then(function(data) {
            if (data.data.success) {
                $scope.newName = data.data.user.name;
                $scope.newEmail = data.data.user.email;
                $scope.newPermission = data.data.user.permission;
                app.currentUser = data.data.user._id;
            } else {
                app.errorMsg = data.data.message;
            }
        });

        app.namePhase = function() {
            $scope.nameTab = 'active';
            $scope.emailTab = 'default';
            $scope.permissionsTab = 'default';
            app.phase1 = true;
            app.phase2 = false;
            app.phase3 = false;
            app.errorMsg = false;
        };

        app.emailPhase = function() {
            $scope.nameTab = 'default';
            $scope.emailTab = 'active';
            $scope.permissionsTab = 'default';
            app.phase1 = false;
            app.phase2 = true;
            app.phase3 = false;
            app.errorMsg = false;
        };

        app.permissionsPhase = function() {
            $scope.nameTab = 'default';
            $scope.emailTab = 'default';
            $scope.permissionsTab = 'active';
            app.phase1 = false;
            app.phase2 = false;
            app.phase3 = true;
            app.disabledUser = false;
            app.disabledModerator = false;
            app.disabledAdmin = false;
            app.errorMsg = false;

            if ($scope.newPermission === 'user') {
                app.disabledUser = true;
            } else if ($scope.newPermission === 'moderator') {
                app.disabledModerator = true;
            } else {
                app.disabledAdmin = true;
            }
        };

        app.updateName = function(newName, valid){
            app.errorMsg = false;
            app.disabled = true;
            var userObject = {};
            if (valid) {
                userObject._id = app.currentUser;
                userObject.name = $scope.newName;
                User.editUser(userObject).then(function(data) {
                    if (data.data.success) {
                        app.successMsg = data.data.message;
                        $timeout(function() {
                            app.nameForm.name.$setPristine();
                            app.nameForm.name.$setUntouched();
                            app.successMsg = false;
                            app.disabled = false;

                        }, 2000);
                    } else {
                        app.errorMsg = data.data.message;
                        app.disabled = false;
                    }
                });
            } else {
                app.errorMsg = 'Please ensure the form is filled out properly!';
                app.disabled = false;
            }
        };

        app.updateEmail = function(newEmail, valid){
            app.errorMsg = false;
            app.disabled = true;
            var userObject = {};
            // console.log(newEmail);
            if (valid) {
                userObject._id = app.currentUser;
                userObject.email = newEmail;
                // console.log(userObject);
                User.editUser(userObject).then(function(data) {
                    if (data.data.success) {
                        console.log("Success at least");
                        app.successMsg = data.data.message;
                        $timeout(function() {
                            app.emailForm.email.$setPristine();
                            app.emailForm.email.$setUntouched();
                            app.successMsg = false;
                            app.disabled = false;

                        }, 2000);
                    } else {
                        app.errorMsg = data.data.message;
                        app.disabled = false;
                    }
                });
            } else {
                app.errorMsg = 'Please ensure the form is filled out properly!';
                app.disabled = false;
            }
        };

        app.updatePermission = function(newPermission){
            app.errorMsg = false;
            app.disabledUser = true;
            app.disabledModerator = true;
            app.disabledAdmin = true;

            var userObject = {};
            // console.log(newEmail);
            userObject._id = app.currentUser;
            userObject.permission = newPermission;
            // console.log(userObject);
            User.editUser(userObject).then(function(data) {
                if (data.data.success) {
                    console.log("Success at least");
                    app.successMsg = data.data.message;
                    $timeout(function() {
                        app.successMsg = false;
                        if (newPermission === 'user') {
                            $scope.newPermission = 'user';
                            app.disabledUser = true;
                            app.disabledModerator = false;
                            app.disabledAdmin = false;
                        } else if (newPermission === 'moderator') {
                            $scope.newPermission = 'moderator';
                            app.disabledUser = false;
                            app.disabledModerator = true;
                            app.disabledAdmin = false;
                        } else {
                            $scope.newPermission = 'admin';
                            app.disabledUser = false;
                            app.disabledModerator = false;
                            app.disabledAdmin = true;

                        }
                    }, 2000);
                } else {
                    app.errorMsg = data.data.message;
                    app.disabled = false;
                }
            });
        };

    }]);
