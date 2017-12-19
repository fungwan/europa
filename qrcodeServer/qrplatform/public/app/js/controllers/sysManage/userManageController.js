window.APP.controller('userManageCtrl', [
    '$scope',
    'userManageService',
    'PaginationService',
    'MessageService',
    'UtilService',
    function(
        $scope,
        userManageService,
        PaginationService,
        MessageService,
        UtilService) {
        function roleList() {
            this.items = [];
            this.roles=[];
            this.selectedItems = [];
            this.queryOptions = {
                page: 1,
                size: 10,
                query: { useraccount: "" }
            };
            this.pagination = {
                page: this.queryOptions.page,
                size: this.queryOptions.size,
                total: 0,
                pageCount: 0,
                scope: $scope
            };
        }
        roleList.prototype.role=function(){
            var self=this;
            userManageService.rolelist().then(function(data){
                for(var role in data){
                    if(role!="erathink"){
                        self.roles.push(data[role])
                    }

                }
            }).catch(function(data){
                console.log(data)
            })
        }
        roleList.prototype.query = function(page) {
            var self = this;
            UtilService.startLoading();

            self.queryOptions.page = page || self.queryOptions.page;
            userManageService.query(self.queryOptions).then(function(data) {
                self.items = data.data;
                self.pagination.page = data.page;
                self.pagination.total = data.total;
                self.pagination.pageCount = data.totalpage;
                self.selectedItems = [];
                PaginationService.setContainer(".view-table").render(self.pagination);
            }).catch(function(error) {
                MessageService.error($scope, "数据获取失败，请稍后尝试！");
            }).finally(function() {
                UtilService.stopLoading();
            });
        };

        roleList.prototype.resetQuery = function() {
            this.queryOptions.query.useraccount = "";
            this.query(1);
        };

        roleList.prototype.frozen = function (item) {
            var self=this;
            var action,desc;
            var State=$.extend({},item);
            if(!item.confirmed){
                State.confirmed="1";
                action='启用用户';
                desc="启用后将恢复该用户所有操作！"
            }else{
                State.confirmed="0";
                action='停用用户';
                desc="停用后将暂停该用户所有操作！"
            }

            MessageService.confirm({
                title: "提示",
                content: "确定"+action+"吗?"+desc,
                confirm: function () {
                    UtilService.startLoading();
                    userManageService.frozen({
                        userid:item.userid,
                        disabled:State.confirmed
                    }).then(function (data) {
                        MessageService.success($scope, "已"+action+"！");
                        self.query();
                    }).catch(function (error) {
                        MessageService.error($scope, "操作失败，请稍后尝试！");
                    }).finally(function () {
                        UtilService.stopLoading();
                    });
                }
            });
        };
        roleList.prototype.Thaw = function (item) {
            var self=this;
            MessageService.confirm({
                title: "提示",
                content: "确定解冻用户吗？",
                confirm: function () {
                    UtilService.startLoading();
                    userManageService.frozen(item.artid).then(function (data) {
                        MessageService.success($scope, "已解冻！");
                        self.query();
                    }).catch(function (error) {
                        MessageService.error($scope, "操作失败，请稍后尝试！");
                    }).finally(function () {
                        UtilService.stopLoading();
                    });
                }
            });
        };


        function roleForm(roleList) {
            this.roleList = roleList;
            this.useraccount="";
            this.roleid="";
            this.userid="";
            this.showEdit = false;
        }


        //关闭弹出框
        roleForm.prototype.closeForm = function() {
            this.showSetRole = false;
        };
        roleForm.prototype.showSetRoleForm=function(item){
            this.showSetRole=true;
            this.useraccount=item.useraccount;
            this.roleid=item.roleid;
            this.userid=item.userid;
        }
        //保存角色
        roleForm.prototype.saveRole = function() {
            var self = this;
            UtilService.startLoading();
            userManageService.save({
                userid:self.userid,
                roleid:self.roleid
            }).then(function(data) {
                self.roleList.query(1);
                self.closeForm();
                MessageService.success($scope, "角色保存成功！");
            }).catch(function(error) {
                var msg = "角色保存失败，请稍后尝试！";
                MessageService.error($scope, msg);
            }).finally(function() {
                UtilService.stopLoading();
            });
        };

        $scope.roleList = new roleList();
        $scope.roleForm = new roleForm($scope.roleList);
        $scope.$on("goPage", function(event, page) {
            $scope.roleList.query(page);
        });
        $scope.roleList.query();
        $scope.roleList.role();
    }
]);