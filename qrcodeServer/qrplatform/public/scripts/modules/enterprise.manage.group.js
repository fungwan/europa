define(function () {
    var module = {}, loaded = false;

    // 显示消息
    var message = $("#groupMessage");

    // 分组列表构造函数
    function GroupManagement () {
        var _this = this;
        this.editGroup = null;
        this.datagrid = $(".groupList").datagrid({
            idField: "groupid",
            selectCell: false,
            uri: "cgroup/list",
            pagination: {
                info: "<div style='padding-left: 32px'>当前显示数量 <b style='font-size: 22px'>{end}</b> / 总数 <b style='font-size: 22px'>{total}</b></div>"
            },
            columns: [
                {
                    checkbox: true
                },
                {
                    field: "groupname",
                    caption: "名称",
                    width: 200,
                    editable: false,
                    dataType: "string"
                },
                {
                    field: "groupdesc",
                    caption: "描述",
                    width: 600,
                    editable: false,
                    dataType: "string"
                }
            ],
            params: {
                query: JSON.stringify({"grouptype": 1})
            }
        });
        this.query = function () {
            var groupName = $("#groupName").val();
            this.datagrid.action({
                url: "cgroup/list",
                data: {
                    page: 1,
                    size: 10,
                    query: JSON.stringify({grouptype: 1, groupname: groupName})
                }
            }).then(function (resp) {
                _this.datagrid.datagrid("setData", resp.data.data);
            }, function (error) {   
                message.notice(false, error.message);
            })
        };
        this.setForm = function (type, obj) {
            if (type == "ADD") {
                $(".form .header").text("添加分组");
            } else if (type == "EDIT") {
                $(".form .header").text("修改分组");
                $("#formGroupName").val(obj.groupname);
                $("#formGroupDesc").val(obj.groupdesc);
                this.editGroup = obj;
            }
        };
        this.showForm = function () {
            $(".mask").css("display", "block");
            $(".form").css("right", "0");
        };
        this.closeForm = function () {
            $(".mask").css("display", "none");
            $(".form").css("right", "-500px");
            $("#formGroupName").val("").clearError();
            $("#formGroupDesc").val("").clearError();
            this.editGroup = null;
        };
        this.checkForm = function (obj) {
            if (obj.groupname.trim() == "") {
                $("#formGroupName").setError("为必填项");
                return false;
            }
            return true;
        };
        this.saveGroup = function () {
            var group = {
                groupname: $("#formGroupName").val(),
                groupdesc: $("#formGroupDesc").val(),
                grouptype: 1
            };
            if (!this.checkForm(group)) {
                return false;
            }
            if (this.editGroup) {
                group.groupid = this.editGroup.groupid;
                this.datagrid.action({
                    url: "cgroup/update",
                    data: {
                        group: JSON.stringify(group)
                    }
                }, true).then(function (resp) {
                     _this.datagrid.datagrid("updateSelectedRow", group);
                    _this.closeForm();
                    message.notice(true, "修改分组成功！");
                }, function (error) {
                    _this.closeForm();
                    message.notice(false, error.message);
                });
               
            } else {
                // 添加一行...
                group.groupid = "";
                this.datagrid.action({
                    url: "cgroup/update",
                    data: {
                        group: JSON.stringify(group)
                    }
                }, true).then(function (resp) {
                    _this.datagrid.datagrid("insertData", resp.data);
                    _this.closeForm();
                    message.notice(true, "添加分组成功！");
                }, function (error) {
                    _this.closeForm();
                    message.notice(false, error.message);
                });
            }
        };
        this.deleteSelectedGroups = function () {
            var selectedGroups = this.datagrid.datagrid("getChecked");
            if (selectedGroups.length == 0) {
                message.notice(false, "您没有选择要删除的组别，请重试。");
            } else {
                var ids = [];
                $.each(selectedGroups, function (index, obj) {
                    ids.push(obj.id);
                });
                this.datagrid.action({
                    url: 'cgroup/deletegr',
                    data: {
                        listid: JSON.stringify({
                            list: ids
                        })
                    }
                }).then(function (resp) {
                    _this.datagrid.datagrid("removeCheckedRow");
                    message.notice(true, "成功删除分组");
                }, function () {
                    message.notice(false, "删除分组失败");
                });
            }
        };
    }
    // 分组列表实例对象
    var groupManagement = new GroupManagement();
    // 查询
    $("#query").on("click", function () {
        groupManagement.query();
    });
    // 展开新增弹窗
    $("#groupAdd").on("click", function () {
        groupManagement.setForm("ADD");
        groupManagement.showForm();
    });
    $("#groupEdit").on("click", function () {
        var selectedGroups = groupManagement.datagrid.datagrid("getChecked");
        if (selectedGroups.length == 1) {
            groupManagement.setForm("EDIT", selectedGroups[0]);
            groupManagement.showForm();
        } else {
            message.notice(false, "必须选中一个分组才能进行编辑");
        }
    });
    // 关闭弹窗
    $("#cancel").on("click", function () {
        groupManagement.closeForm();
    });
    // 保存分组
    $("#save").on("click", function () {
        groupManagement.saveGroup();
    });
    // 删除选中分组
    $("#groupDelete").on("click", function () {
        groupManagement.deleteSelectedGroups();
    });
    module.init = function () {
        if (!loaded) {
            loaded = true;
        }
    };
    return module;
});