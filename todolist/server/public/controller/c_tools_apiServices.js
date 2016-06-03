/**
 * Created by LAU TAK-WAH on 2016/5/20.
 */

var RESTfulUrl = '';

function doRefreshToken(refreshInfoObj,cb){

    var settings = {
        type: "POST",
        url:RESTfulUrl + "/api/refreshToken",
        data:refreshInfoObj,
        dataType:"json",
        error: function(XHR,textStatus,errorThrown) {
            //console.log (errorThrown);
            if(errorThrown === 'Unauthorized')
                console.log('refresh token is expire...' + errorThrown);

            cb('error',errorThrown);
        },
        success: function(data,textStatus) {
            if(data.result === 'fail'){
                cb('error',data.content.error_msg);
            }else{
                cb(null,data);
            }
        }
    };

    $.ajax(settings);
}


function ApiService(){

}

ApiService.prototype.get = function(url,cb){

    url = RESTfulUrl + url;
    if(window.localStorage.getItem("tokenInfo") === null){
        cb('err','Unauthorized');
    }else{

        //var buffer = new Buffer(access_token);
        //var base64Code = buffer.toString('base64');
        var tokenInfo = JSON.parse(window.localStorage.getItem("tokenInfo"));

        var settings = {
            type: "GET",
            url:url,
            dataType:"json",
            error: function(XHR,textStatus,errorThrown) {
                if(errorThrown !== 'Unauthorized'){
                    console.log(errorThrown);
                    cb('error',errorThrown);
                    return;
                }

                //cb('error',errorThrown);
                var that = this;
                doRefreshToken({
                    refresh_token:tokenInfo.refresh_token,
                    owner_id:tokenInfo.owner_id},function(err,data){
                    if(err === null){

                        tokenInfo.exp = data.content.exp;
                        tokenInfo.access_token = data.content.access_token;
                        window.localStorage.setItem("tokenInfo",JSON.stringify(tokenInfo));

                        var base64Code = Base64.encode(tokenInfo.owner_id+':'+data.content.access_token);
                        that.headers.Authorization = 'Bearer '+ base64Code;

                        $.ajax(that);

                    }else{
                        cb('err','Unauthorized');
                    }
                });
            },
            success: function(data,textStatus) {
                var that = this;
                //console.log(this);
                if(data.result === 'fail'){
                    cb('error',data.content.error_msg);
                }else{
                    cb(null,data);
                }
            },
            headers: {
                'Accept': '/',
                'Content-Type':'application/json'//,
                //'Authorization': 'Bearer ' + base64Code
            }
        };

        var exp_time = tokenInfo.exp;
        //console.log('每次发送请求前的时间检查...' +  exp_time);
        if (exp_time <= Date.now()) {// access_token has expired

            doRefreshToken({
                refresh_token:tokenInfo.refresh_token,
                owner_id:tokenInfo.owner_id},function(err,data){
                if(err === null){

                    tokenInfo.exp = data.content.exp;
                    tokenInfo.access_token = data.content.access_token;
                    window.localStorage.setItem("tokenInfo",JSON.stringify(tokenInfo));

                    var base64Code = Base64.encode(tokenInfo.owner_id+':'+data.content.access_token);
                    settings.headers.Authorization = 'Bearer '+ base64Code;

                    $.ajax(settings);

                }else{
                    cb('err','Unauthorized');
                }
            });

        }else{
            var base64Code = Base64.encode(tokenInfo.owner_id+':'+tokenInfo.access_token);
            settings.headers.Authorization = 'Bearer '+ base64Code;

            $.ajax(settings);
        }
    }
};

ApiService.prototype.post = function(url,data,cb){

    url = RESTfulUrl + url;

    if(window.localStorage.getItem("tokenInfo") === null){
        cb('err','Unauthorized');
    }else{

        //var buffer = new Buffer(access_token);
        //var base64Code = buffer.toString('base64');
        var tokenInfo = JSON.parse(window.localStorage.getItem("tokenInfo"));
        var settings = {
            type: "POST",
            url:url,
            dataType:"json",
            data:JSON.stringify(data),
            error: function(XHR,textStatus,errorThrown) {
                if(errorThrown !== 'Unauthorized'){
                    console.log(errorThrown);
                    cb('error',errorThrown);
                    return;
                }

                var that = this;
                doRefreshToken({
                    refresh_token:tokenInfo.refresh_token,
                    owner_id:tokenInfo.owner_id},function(err,data){
                    if(err === null){

                        tokenInfo.exp = data.content.exp;
                        tokenInfo.access_token = data.content.access_token;
                        window.localStorage.setItem("tokenInfo",JSON.stringify(tokenInfo));

                        var base64Code = Base64.encode(tokenInfo.owner_id+':'+data.content.access_token);
                        that.headers.Authorization = 'Bearer '+ base64Code;

                        $.ajax(that);

                    }else{
                        cb('err','Unauthorized');
                    }
                });
            },
            success: function(data,textStatus) {
                //console.log(data);
                if(data.result === 'fail'){
                    cb('error',data.content.error_msg);
                }else{
                    cb(null,data);
                }
            },
            headers: {
                'Accept': '/',
                'Content-Type':'application/json'//,
                //'Authorization': 'Bearer ' + base64Code
            }
        };

        var exp_time = tokenInfo.exp;
        //console.log('每次发送请求前的时间检查...' +  exp_time);
        if (exp_time <= Date.now()) {// access_token has expired

            doRefreshToken({
                refresh_token:tokenInfo.refresh_token,
                owner_id:tokenInfo.owner_id},function(err,data){
                if(err === null){

                    tokenInfo.exp = data.content.exp;
                    tokenInfo.access_token = data.content.access_token;
                    window.localStorage.setItem("tokenInfo",JSON.stringify(tokenInfo));

                    var base64Code = Base64.encode(tokenInfo.owner_id+':'+data.content.access_token);
                    settings.headers.Authorization = 'Bearer '+ base64Code;

                    $.ajax(settings);

                }else{
                    cb('err','Unauthorized');
                }
            });

        }else{
            var base64Code = Base64.encode(tokenInfo.owner_id+':'+tokenInfo.access_token);
            settings.headers.Authorization = 'Bearer '+ base64Code;

            $.ajax(settings);
        }
    }
};

ApiService.prototype.put = function(url,data,cb){

    url = RESTfulUrl + url;

    if(window.localStorage.getItem("tokenInfo") === null){
        cb('err','Unauthorized');
    }else{

        //var buffer = new Buffer(access_token);
        //var base64Code = buffer.toString('base64');
        var tokenInfo = JSON.parse(window.localStorage.getItem("tokenInfo"));
        var settings = {
            type: "PUT",
            url:url,
            dataType:"json",
            data:JSON.stringify(data),
            error: function(XHR,textStatus,errorThrown) {
                if(errorThrown !== 'Unauthorized'){
                    console.log(errorThrown);
                    cb('error',errorThrown);
                    return;
                }

                var that = this;
                doRefreshToken({
                    refresh_token:tokenInfo.refresh_token,
                    owner_id:tokenInfo.owner_id},function(err,data){
                    if(err === null){

                        tokenInfo.exp = data.content.exp;
                        tokenInfo.access_token = data.content.access_token;
                        window.localStorage.setItem("tokenInfo",JSON.stringify(tokenInfo));

                        var base64Code = Base64.encode(tokenInfo.owner_id+':'+data.content.access_token);
                        that.headers.Authorization = 'Bearer '+ base64Code;

                        $.ajax(that);

                    }else{
                        cb('err','Unauthorized');
                    }
                });
            },
            success: function(data,textStatus) {
                //console.log(data);
                if(data.result === 'fail'){
                    cb('error',data.content.error_msg);
                }else{
                    cb(null,data);
                }
            },
            headers: {
                'Accept': '/',
                'Content-Type':'application/json'//,
                //'Authorization': 'Bearer ' + base64Code
            }
        };

        var exp_time = tokenInfo.exp;
        //console.log('每次发送请求前的时间检查...' +  exp_time);
        if (exp_time <= Date.now()) {// access_token has expired

            doRefreshToken({
                refresh_token:tokenInfo.refresh_token,
                owner_id:tokenInfo.owner_id},function(err,data){
                if(err === null){

                    tokenInfo.exp = data.content.exp;
                    tokenInfo.access_token = data.content.access_token;
                    window.localStorage.setItem("tokenInfo",JSON.stringify(tokenInfo));

                    var base64Code = Base64.encode(tokenInfo.owner_id+':'+data.content.access_token);
                    settings.headers.Authorization = 'Bearer '+ base64Code;

                    $.ajax(settings);

                }else{
                    cb('err','Unauthorized');
                }
            });

        }else{
            var base64Code = Base64.encode(tokenInfo.owner_id+':'+tokenInfo.access_token);
            settings.headers.Authorization = 'Bearer '+ base64Code;

            $.ajax(settings);
        }
    }
};

ApiService.prototype.delete = function(url,cb){

    url = RESTfulUrl + url;

    if(window.localStorage.getItem("tokenInfo") === null){
        cb('err','Unauthorized');
    }else{

        //var buffer = new Buffer(access_token);
        //var base64Code = buffer.toString('base64');
        var tokenInfo = JSON.parse(window.localStorage.getItem("tokenInfo"));

        var settings = {
            type: "DELETE",
            url:url,
            dataType:'text',
            error: function(XHR,textStatus,errorThrown) {
                if(errorThrown !== 'Unauthorized'){
                    console.log(errorThrown);
                    cb('error',errorThrown);
                    return;
                }

                var that = this;
                doRefreshToken({
                    refresh_token:tokenInfo.refresh_token,
                    owner_id:tokenInfo.owner_id},function(err,data){
                    if(err === null){

                        tokenInfo.exp = data.content.exp;
                        tokenInfo.access_token = data.content.access_token;
                        window.localStorage.setItem("tokenInfo",JSON.stringify(tokenInfo));

                        var base64Code = Base64.encode(tokenInfo.owner_id+':'+data.content.access_token);
                        that.headers.Authorization = 'Bearer '+ base64Code;

                        $.ajax(that);

                    }else{
                        cb('err','Unauthorized');
                    }
                });
            },
            success: function(data,textStatus) {
                var that = this;
                //console.log(this);
                if(data.result === 'fail'){
                    cb('error',data.content.error_msg);
                }else{
                    cb(null,data);
                }
            },
            headers: {
                'Accept': '/'
            }
        };

        var exp_time = tokenInfo.exp;
        //console.log('每次发送请求前的时间检查...' +  exp_time);
        if (exp_time <= Date.now()) {// access_token has expired

            doRefreshToken({
                refresh_token:tokenInfo.refresh_token,
                owner_id:tokenInfo.owner_id},function(err,data){
                if(err === null){

                    tokenInfo.exp = data.content.exp;
                    tokenInfo.access_token = data.content.access_token;
                    window.localStorage.setItem("tokenInfo",JSON.stringify(tokenInfo));

                    var base64Code = Base64.encode(tokenInfo.owner_id+':'+data.content.access_token);
                    settings.headers.Authorization = 'Bearer '+ base64Code;

                    $.ajax(settings);

                }else{
                    cb('err','Unauthorized');
                }
            });

        }else{
            var base64Code = Base64.encode(tokenInfo.owner_id+':'+tokenInfo.access_token);
            settings.headers.Authorization = 'Bearer '+ base64Code;

            $.ajax(settings);
        }
    }
};



