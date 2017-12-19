window.APP.factory('PaginationService', ['$compile', function($compile){
    var $container, service = {};

    service.setContainer = function (selector) {
        $container = $(selector);
        return this;
    };

    service.render = function (paginationOptions) {
        paginationOptions.eventName = paginationOptions.eventName || 'goPage';
        var html = '<div m-pagination' 
                + ' m-record-total="' + paginationOptions.total + '"'
                + ' m-page-num="' + paginationOptions.page + '"'
                + ' m-event-name="' + paginationOptions.eventName + '"' 
                + ' m-page-count="' + paginationOptions.pageCount + '">'
                + '</div>';
        $container.find("[m-pagination]")
            .remove()
            .end()
            .append($compile(html)(paginationOptions.scope));
    };

    return service;
}]);