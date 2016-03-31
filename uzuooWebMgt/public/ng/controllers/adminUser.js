'use strict';

angular.module('myApp').controller('BgUserCtrl', ['$scope', '$location', '$rootScope', 'ApiService',
    function ($scope, $location, $rootScope, ApiService) {
        $scope.initPage();
        $rootScope.sideBarSelect = {
            firstClassSel: 'userAdmin',
            secondSel: 'backgrdUsr'
        };
        $scope.currUsersPage = 1;
        $scope.selectEditUsr = {};
        $scope.currUser = $rootScope.userInfo;

        $scope.roleArray = ['客服', '财务初审员', '财务复核员', '财务经理', '运营', '城市管理员'];

        $scope.onProvinceSelect = function () {
            $scope.selectEditUsr.cityArray = $scope.selectEditUsr.provinceSel.cities;
            $scope.selectEditUsr.citySel = $scope.selectEditUsr.cityArray[0];
        }

        $scope.onProvinceSelectInCreate = function () {
            $scope.createUsrInfo.cityArray = $scope.createUsrInfo.provinceSel.cities;
            if ($scope.createUsrInfo.cityArray[$scope.createUsrInfo.cityArray.length - 1].id) {
                var nilCity = { name: '-- 请选择城市 --' };
                $scope.createUsrInfo.cityArray.push(nilCity);
            }
            $scope.createUsrInfo.citySel = $scope.createUsrInfo.cityArray[$scope.createUsrInfo.cityArray.length - 1];
        }

        $scope.getCityName = function (city) {
            var cityArray = city.split(',');
            if (!$scope.regionsArray[1][cityArray[1]])
                return;
            return $scope.regionsArray[1][cityArray[1]].name;
        }

        $scope.onShowEditUsrDlg = function (usr) {
            $scope.selectEditUsr = cloneObj(usr);
            var cityArray = usr.city.split(',');
            $scope.selectEditUsr.provinceSel = $scope.provinceArray[0];
            $scope.selectEditUsr.cityArray = $scope.selectEditUsr.provinceSel.cities;
            $scope.selectEditUsr.citySel = $scope.selectEditUsr.cityArray[0];
            for (var i = 0; i < $scope.provinceArray.length; i++) {
                if ($scope.provinceArray[i].id == cityArray[0]) {
                    $scope.selectEditUsr.provinceSel = $scope.provinceArray[i];
                    $scope.selectEditUsr.cityArray = $scope.selectEditUsr.provinceSel.cities;
                    for (var j = 0; j < $scope.selectEditUsr.cityArray.length; j++) {
                        if ($scope.selectEditUsr.cityArray[j].id = cityArray[1]) {
                            $scope.selectEditUsr.citySel = $scope.selectEditUsr.cityArray[j];
                            break;
                        }
                    }
                    break;
                }
            }

            if(usr.role != 99 && $rootScope.userInfo.role == 99){
                $scope.selectEditUsr.roleArray = [
                    { value: 0, name: '客服', style: 'badge badge-default' },
                    { value: 1, name: '财务初审员', style: 'badge badge-blue' },
                    { value: 2, name: '财务复核员', style: 'badge badge-info' },
                    { value: 3, name: '财务经理', style: 'badge badge-info' },
                    { value: 4, name: '运营', style: 'badge badge-warning' },
                    { value: 5, name: '城市管理员', style: 'badge badge-dark' }
                ];
            }

            if(usr.role != 5 && $rootScope.userInfo.role == 5){
                $scope.selectEditUsr.roleArray = [
                    { value: 0, name: '客服', style: 'badge badge-default' },
                    { value: 1, name: '财务初审员', style: 'badge badge-blue' },
                    { value: 2, name: '财务复核员', style: 'badge badge-info' },
                    { value: 3, name: '财务经理', style: 'badge badge-info' },
                    { value: 4, name: '运营', style: 'badge badge-warning' }
                ];
            }

            if (usr.role == 5 && $rootScope.userInfo.role != 99) {
                $scope.selectEditUsr.roleArray = [{ value: 5, name: '城市管理员', style: 'badge badge-dark' }];
            }

            if (usr.role == 99) {
                $scope.selectEditUsr.roleArray = [{ value: 99, name: '超级管理员', style: 'badge badge-primary' }];
            }
        };

        $scope.onShowCreateUsr = function () {
            $scope.createUsrInfo = {
                username: '',
                password: '',
                confirmpwd: '',
                provinceSel: '',
                citySel: '',
                role: '0'
            }
            if ($scope.provinceArray[$scope.provinceArray.length - 1].id) {
                var nilProvince = { name: '-- 请选择省份 --' };
                $scope.provinceArray.push(nilProvince);
            }
            $scope.createUsrInfo.provinceSel = $scope.provinceArray[$scope.provinceArray.length - 1];

            if($rootScope.userInfo.role == 5){
                $scope.createUsrInfo.roleArray = [
                    { value: 0, name: '客服', style: 'badge badge-default' },
                    { value: 1, name: '财务初审员', style: 'badge badge-blue' },
                    { value: 2, name: '财务复核员', style: 'badge badge-info' },
                    { value: 3, name: '财务经理', style: 'badge badge-info' },
                    { value: 4, name: '运营', style: 'badge badge-warning' }
                ];
            }else if($rootScope.userInfo.role == 99){
                $scope.createUsrInfo.roleArray = [
                    { value: 0, name: '客服', style: 'badge badge-default' },
                    { value: 1, name: '财务初审员', style: 'badge badge-blue' },
                    { value: 2, name: '财务复核员', style: 'badge badge-info' },
                    { value: 3, name: '财务经理', style: 'badge badge-info' },
                    { value: 4, name: '运营', style: 'badge badge-warning' },
                    { value: 5, name: '城市管理员', style: 'badge badge-dark' }
                ];
            }
        }

        $scope.onEditUsername = function () {
            if ($scope.createUsrInfo.username == "") {
                return;
            }
            var reg = /^[a-zA-Z]+[a-zA-Z0-9_]*$/;
            if (!reg.test($scope.createUsrInfo.username)) {
                $scope.createUsrInfo.disable = true;
                $scope.createUsrInfo.errorTip = "用户名只能由数字字母下划线构成，且必须以字母开头..."
                return;
            }
            if ($scope.createUsrInfo.username.length > 20) {
                $scope.createUsrInfo.disable = true;
                $scope.createUsrInfo.errorTip = "用户名长度超过20个字符...";
                return;
            }
            var obj = {
                params: {
                    username: $scope.createUsrInfo.username
                }
            }
            ApiService.get('/doFindUserByName', obj, function (data) {
                if (data.result == 'success') {
                    $scope.createUsrInfo.disable = false;
                    $scope.createUsrInfo.errorTip = "";
                } else {
                    $scope.createUsrInfo.disable = true;
                    $scope.createUsrInfo.errorTip = "账号已经存在！";
                }
            }, function (errMsg) {
                //alert(errMsg.message);
            });
        }

        $scope.onCreateUsr = function () {
            if ($scope.createUsrInfo.password != "" && $scope.createUsrInfo.password == $scope.createUsrInfo.confirmpwd) {
                var hash = hex_md5($scope.createUsrInfo.password);
                var uuidVaule = UUID.prototype.createUUID();
                var roleValue = $scope.createUsrInfo.role;
                var locationValue = '';
                if ($scope.createUsrInfo.provinceSel.id && $scope.createUsrInfo.citySel.id) {
                    locationValue = $scope.createUsrInfo.provinceSel.id + ',' + $scope.createUsrInfo.citySel.id;
                }else if($rootScope.userInfo.role == 5){
                    locationValue = $rootScope.userInfo.city;
                }
                else {
                    $scope.createUsrInfo.errorTip = "请选择城市！"
                    return;
                }
                if (roleValue === undefined || roleValue === '') {
                    $scope.createUsrInfo.errorTip = "请选择角色！"
                    return;
                }
                var obj = {
                    username: $scope.createUsrInfo.username,
                    password: hash,
                    uuid: uuidVaule,
                    role: roleValue,
                    city: locationValue
                }
                ApiService.post('/doCreateAccount', obj, function (data) {
                    $("#create_account_dlg").modal("hide");
                    getBgUsersBypage($scope.currUsersPage);
                }, function (errMsg) {
                    alert(errMsg.message);
                });
            }
        }

        $scope.onUpdateAccount = function () {
            if ($scope.selectEditUsr.username == '') {
                return;
            }
            var locationValue = '';
            if ($scope.selectEditUsr.provinceSel.id && $scope.selectEditUsr.citySel.id) {
                locationValue = $scope.selectEditUsr.provinceSel.id + ',' + $scope.selectEditUsr.citySel.id;
            } else {
                return;
            }

            var obj = {
                id: $scope.selectEditUsr.id,
                content: {
                    username: $scope.selectEditUsr.username,
                    role: $scope.selectEditUsr.role,
                    city: locationValue
                }
            }
            ApiService.post('/doUpdateUserById', obj, function (data) {
                $("#edit_account_dlg").modal("hide");
                getBgUsersBypage($scope.currUsersPage);
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }


        $scope.onShowDelOne = function (user) {
            $scope.selectEditUsr = user;
        }

        $scope.deleteOne = function () {
            deleteUser([$scope.selectEditUsr.id]);
        }

        $scope.deleteMulti = function () {
            //return;
            var deleteArray = [];
            angular.forEach($scope.bgUsers, function (item) {
                if (item.selected && item.role != '5') {
                    deleteArray.push(item.id);
                }
            });
            deleteArray;
            if (deleteArray.length == 0) {
                return;
            }
            deleteUser(deleteArray);
        }

        function deleteUser(userIdArray) {
            var obj = {
                ids: userIdArray
            };
            ApiService.post('/doDelUsersById', obj, function (data) {
                getBgUsersBypage($scope.currUsersPage);
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        //初始化城市列表和工人列表
        function getRoleAndRegionsInfo() {
            var obj = {};
            ApiService.get('/doGetRoleAndRegionsInfo', obj, function (data) {
                if (data.result == 'success') {

                    $scope.regionsArray = data.content.get_roleAndRegions[0];
                    $scope.provinceArray = $scope.regionsArray[0];

                    getBgUsersBypage(1);

                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        function getBgUsersBypage(pageIndex) {
            var obj = {
                params: {
                    page: pageIndex
                }
            }
            ApiService.get('/users', obj, function (data) {
                if (data.result == 'success') {
                    $scope.bgUsers = data.content;
                    $scope.totalUsersPages = data.pages;
                    if ($scope.bgUsers.length === 0 && $scope.currUsersPage > 1) {
                        getBgUsersBypage($scope.currUsersPage - 1);
                        return;
                    }
                    //分页控件
                    usersPaging(pageIndex);

                }else if(data.content === 'Permission Denied'){
                    window.location.href="/permissionError";
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        //jequry paging controll
        function usersPaging(pageIndex) {
            var firstScreeningPagination = false;
            laypage({
                cont: $('#bgUserPage'),
                pages: $scope.totalUsersPages,
                skip: true,
                skin: 'yahei',
                curr: pageIndex,//view上显示的页数是索引加1
                groups: 5,
                hash: false,
                jump: function (obj) {//一定要加上first的判断，否则会一直刷新
                    $scope.currUsersPage = obj.curr;
                    if (!firstScreeningPagination) {
                        firstScreeningPagination = true;
                    } else {
                        getBgUsersBypage(obj.curr);
                        firstScreeningPagination = false;
                    }
                }
            });
        }
        
        getRoleAndRegionsInfo();

    }]);