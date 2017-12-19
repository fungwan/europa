/**
 * created by xdf on 2017/06/01 
 */
window.APP.controller('shareAccountCtrl', [
    "$scope",
    "PostService",
    "MessageService",
    "UtilService",
    function (
        $scope,
        PostService,
        MessageService,
        UtilService
    ) {
        function Shareaccount () {
            this.defaultSetting = {
                projectid: '',
                enable: 0,
                sharePoint: 0,
                shareMaxPoint: 0,
                helpPoint: 0,
                helpMaxPoint: 0
            };
            this.setting = $.extend(true, {}, this.defaultSetting);
            this.errors = {};
        }

        //修改设置
        Shareaccount.prototype.updateSetting = function () {
            var self = this;
            //输入校验
            if (!self.validate()) return;
            MessageService.confirm({
                title: '修改分享设置提醒',
                content: '确定要应用当前微信公众号的分享设置吗？',
                confirm: function () {
                    //执行修改设置操作
                    PostService.request(
                        '/share/config/update',
                        $.param({
                            projectid: self.setting.projectid,
                            enable: self.setting.enable,
                            sharePoint: self.setting.sharePoint,
                            shareMaxPoint: self.setting.shareMaxPoint,
                            helpPoint: self.setting.helpPoint,
                            helpMaxPoint: self.setting.helpMaxPoint
                        })
                    ).then(function () {
                        MessageService.success($scope, "分配设置修改成功");
                    }).catch(function (error) {
                        MessageService.error($scope, "分配设置修改失败，请稍后重试！");
                    })
                }
            })
        }

        // 实现enable切换为关闭时，point和maxPoint设置为0
        Shareaccount.prototype.setDisable = function () {
            if (!this.setting.enable) {
                this.setting.sharePoint = this.setting.shareMaxPoint = 0;
                this.setting.helpPoint = this.setting.helpMaxPoint = 0;
            }
        };

        /*
         * 数据验证
         * 当enable为true时进行验证
         * point < maxPoint
         * 0 < point <= 100
         * 0 < maxPoint <= 10000
         */
        Shareaccount.prototype.validate = function () {
            // enable为false时返回true
            if (!this.setting.enable) return true;

            // enable 为true
            this.errors = {};
            var sharePoint = this.setting.sharePoint,
                shareMaxPoint = this.setting.shareMaxPoint,
                helpPoint = this.setting.helpPoint,
                helpMaxPoint = this.setting.helpMaxPoint;

            if (sharePoint === null) {
                this.errors.sharePoint = "分享积分数量为必填项";
            } else if (!(sharePoint % 1 == 0 && 0 < sharePoint && sharePoint <= 100)) {
                this.errors.sharePoint = "请输入大于0小于等于100的整数";
            }

            if (shareMaxPoint === null) {
                this.errors.shareMaxPoint = "分享积分上限为必填项";
            } else if (!(shareMaxPoint % 1 == 0 && 0 < shareMaxPoint && shareMaxPoint <= 10000)) {
                this.errors.shareMaxPoint = "请输入大于0小于等于10000的整数";
            }

            if (shareMaxPoint < sharePoint) {
                this.errors.shareMaxPoint = "分享积分上限应该大于等于分享积分数量";
            }

            if (helpPoint === null) {
                this.errors.helpPoint = "分享积分数量为必填项";
            } else if (!(helpPoint % 1 == 0 && 0 < helpPoint && helpPoint <= 100)) {
                this.errors.helpPoint = "请输入大于0小于等于100的整数";
            }

            if (helpMaxPoint === null) {
                this.errors.helpMaxPoint = "分享积分上限为必填项";
            } else if (!(helpMaxPoint % 1 == 0 && 0 < helpMaxPoint && helpMaxPoint <= 10000)) {
                this.errors.helpMaxPoint = "请输入大于0小于等于10000的整数";
            }

            if (helpMaxPoint < helpPoint) {
                this.errors.helpMaxPoint = "分享积分上限应该大于等于分享积分数量";
            }

            return angular.equals(this.errors, {});
        }

        //初始化
        Shareaccount.prototype.init = function () {
            var self = this;
            //获取当前设置
            PostService.request(
                '/share/config',
                $.param({
                    projectid: "",
                    update: true
                })
            ).then(function(res) {
                //传入数据
                if(!!res) {
                    self.setting = res;
                    self.setting.enable = self.setting.enable ? 1 : 0;
                }
            }).catch(function(error){
                if (error.code != "CONFIGNOTFOUND") {
                    MessageService.error($scope, "微信公众号分享设置获取失败");
                }
            })
        }

        $scope.shareaccount = new Shareaccount();
        $scope.shareaccount.init();
}]);