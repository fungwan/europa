/**
 * created by xdf on 2017/06/01 
 */
window.APP.controller('menuManageCtrl', [
    "$scope",
    "ValiService",
    "PostService",
    "MessageService",
    "UtilService",
    function(
        $scope,
        ValiService,
        PostService,
        MessageService,
        UtilService
    ) {
        function MenuManage() {
            this.menus = [];
            this.menutype = 'click';
            this.selectedMenu = {};
            this.selectedSubmenu = '';
            this.firstIndex = '';
            this.subIndex = '';
        };

        //获取所选一级二级菜单的index
        MenuManage.prototype.getIndex = function(submenu, menu) {
            var self = this;
            for (var i = 0; i < self.menus.length; i++) {
                if (self.menus[i].name == menu.name) {
                    self.firstIndex = i;
                    for (var j = 0; j < self.menus[i].sub_button.length; j++) {
                        if (self.menus[i].sub_button[j].name == submenu.name) {
                            self.subIndex = j;
                        }
                    }
                }
            }
        }

        //编辑二级菜单
        MenuManage.prototype.editSubmenu = function(submenu, menu) {
            var self = this;
            self.saveType = 'edit';
            self.getIndex(submenu, menu);
            self.selectedSubmenu = submenu;
            self.selectedMenu = menu;
            self.activeFirstMenu = self.selectedMenu.name;
            self.menutype = submenu.type;
        }

        //新增二级菜单
        MenuManage.prototype.addSubmenu = function(menu) {
            var self = this;
            self.saveType = 'add';
            for (var i = 0; i < self.menus.length; i++) {
                if (self.menus[i].name == menu.name) {
                    self.firstIndex = i;
                }
            }
            self.selectedSubmenu = {};
            self.selectedMenu = menu;
            self.activeFirstMenu = self.selectedMenu.name;
        }

        //修改一级菜单
        MenuManage.prototype.editFirstMenu = function(e, item, index) {
            $(e.target).replaceWith(`
                <input name="firstmenuname" 
                       type="text" 
                       value="${item.name}"
                       data-index="${index}" 
                       autofocus>
            `);
        }

        //预览图二级菜单开关
        MenuManage.prototype.submenuToggle = function(e) {
            $(e.target).siblings().find('div.submenu-container').addClass('hidden');
            $(e.target).find('div.submenu-container').toggleClass('hidden');
        }

        //保存
        MenuManage.prototype.saveMenu = function() {
            var self = this;

            MessageService.confirm({
                title: '保存菜单提醒',
                content: '确定要保存当前设置的公众号菜单吗？',
                confirm: function() {
                    $scope.$apply(function() {

                        var firstMenuList = $('input[name=firstmenuname]');
                        for (var i = 0; i < firstMenuList.length; i++) {
                            var index = firstMenuList[i].dataset['index'];
                            if (firstMenuList[i].value.length > 4) {
                                return MessageService.error($scope, '一级菜单名称最多为四个汉字')
                            }
                            self.menus[index].name = firstMenuList[i].value;
                        }

                        //未设置二级菜单则返回
                        if (!self.selectedSubmenu) return;
                        if (self.selectedSubmenu.name.length > 7) {
                            return MessageService.error($scope, '二级菜单名称最多为7个汉字');
                        }

                        //新增、编辑二级菜单
                        if (self.saveType == 'add') {
                            if (self.menus[self.firstIndex].sub_button.length >= 5) {
                                return MessageService.error($scope, '单个一级菜单下最多设置五个二级菜单');
                            }
                            self.selectedSubmenu.type = self.menutype;
                            self.menus[self.firstIndex].sub_button.push(self.selectedSubmenu);
                            console.log(self.menus);
                        } else if (self.saveType == 'edit') {
                            var item = self.menus[self.firstIndex].sub_button[self.subIndex];
                            if (self.menus[self.firstIndex].sub_button.length > 5) {
                                return MessageService.error($scope, '单个一级菜单下最多设置五个二级菜单');
                            }
                            if (self.menutype == 'view') {
                                delete self.selectedSubmenu.key;
                                item.name = self.selectedSubmenu.name;
                                item.type = self.selectedSubmenu.type;
                                if (!ValiService.isUrl(self.selectedSubmenu.url)) {
                                    return MessageService.error($scope, 'url地址输入有错');
                                }
                                item.url = self.selectedSubmenu.url;
                            } else if (self.menutype == 'click') {
                                delete self.selectedSubmenu.url;
                                item.name = self.selectedSubmenu.name;
                                item.type = self.menutype;
                                item.key = self.selectedSubmenu.key;
                            }
                        }

                        // 提交self.menus
                        self.updateMenu(self.menus);
                    })
                }
            });
        }

        // 更新菜单数据
        MenuManage.prototype.updateMenu = function(menulist) {
            var option = {
                button: menulist
            };

            UtilService.startLoading();
            PostService.request(
                '/wx/updatemenulist',
                $.param({
                    menuinfo: angular.toJson(option)
                })
            ).then(function(res) {
                if (!!res) {
                    MessageService.success($scope, '菜单更新成功！');
                }
            }).catch(function(error) {
                MessageService.error($scope, '菜单更新失败，错误为：' + error.message);
            }).finally(function() {
                UtilService.stopLoading();
            })
        }

        //删除
        MenuManage.prototype.deleteMenu = function() {
            var self = this;
            MessageService.confirm({
                title: '删除二级菜单提醒',
                content: '确定要删除当前所选的二级菜单吗？',
                confirm: function() {
                    $scope.$apply(function() {
                        self.getIndex(self.selectedSubmenu, self.selectedMenu);
                        self.menus[self.firstIndex].sub_button.splice(self.subIndex, 1);
                        //提交self.menus
                        self.updateMenu(self.menus);
                    })
                }
            });
        }

        //初始化
        MenuManage.prototype.init = function() {
            var self = this;
            //获取公众号菜单数据
            UtilService.startLoading();
            PostService.request(
                '/wx/getmenulist',
                ''
            ).then(function(res) {
                // if (res.errcode) {
                //     console.log(res.errmsg);
                //     if (res.errcode == 40001) {
                //         return MessageService.error($scope, '获取的access_token错误，请在下次token刷新后尝试修改')
                //     } else {
                //         return MessageService.error(
                //             $scope, 
                //             '微信官方接口访问出错，错误码：' + 
                //             res.errcode + ' 信息为：' + 
                //             res.errmsg);
                //     }
                // }
                // if (!res || !res.menu) {
                //     return MessageService.error($scope, '微信官方接口访问出错，请稍后刷新重试')
                // }
                self.menus = res.menu.button;
            }).catch(function(error) {
                MessageService.error($scope, '获取菜单数据失败，错误为：' + error.message);
            }).finally(function() {
                UtilService.stopLoading();
            })
        }

        $scope.menuManage = new MenuManage();
        $scope.menuManage.init();
    }
])