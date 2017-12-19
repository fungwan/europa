window.APP.factory('CustomerGroupService', ['PostService', function(PostService) {
    // 提供核心数据交互功能:
    var listUrl = "/cgroup/list",
        deleteUrl = "/cgroup/deletegr",
        saveUrl = "/cgroup/update",
        defaultQueryOptions = {
            page: 1,
            size: 10,
            query: { grouptype: 1, groupname: "" }
        };

    // 格式化掉空字符串字段
    function formatEmptyField(obj) {
        var result = {};
        for (var key in obj) {
            if (obj.hasOwnProperty(key) && obj[key] != "") {
                result[key] = obj[key];
            }
        }
        return result;
    }

    var service = {};

    service.query = function(queryOptions) {
        // 深拷贝
        queryOptions = $.extend(true, {}, defaultQueryOptions, queryOptions);
        queryOptions.query = JSON.stringify(formatEmptyField(queryOptions.query));

        return PostService.request(listUrl, $.param(queryOptions));
    };

    service.deleteItems = function(ids) {
        return PostService.request(deleteUrl, $.param({
            listid: JSON.stringify({ list: ids })
        }));
    };

    service.save = function(group) {
        return PostService.request(saveUrl, $.param({
            group: JSON.stringify(group)
        }));
    };

    return service;
}]);