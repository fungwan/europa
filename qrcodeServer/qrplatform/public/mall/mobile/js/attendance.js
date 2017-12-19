/**
 * Created by Yatagaras on 2017/6/7.
 */

var data = {}, uuid = {
    /**
     * 创建一个新的UUID
     * @returns {string}
     */
    get: function () {
        var d = new Date().getTime();
        var _uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return _uuid;
    },
    /**
     * 创建一个短格式的UUID
     * @returns {XML|void|string}
     */
    short: function (header) {
        return (header || "") + uuid.get().replace(/\-/ig, "");
    }
}, currency = function (s, n) {
    if (isNaN(s) || s == null) {
        return s;
    } else {
        n = (n != null && !isNaN(n) && n > 0) ? n : 0;
        var symbol = "";
        if (s < 0) {
            s *= -1;
            symbol = "-"
        }
        s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
        //s = parseFloat((s + "").replace(/[^\d\.-]/g, "")) + "";
        var l = s.split(".")[0].split("").reverse(),
            r = s.split(".")[1];
        var t = "";
        for (var i = 0; i < l.length; i++) {
            t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
        }
        if (r) {
            return symbol + t.split("").reverse().join("") + "." + r;
        } else {
            return symbol + t.split("").reverse().join("");
        }
    }
};


function showNumber(target, from, to, duration, precision) {
    if (target && target instanceof HTMLElement && from != null && to != null && !isNaN(from) && !isNaN(from)) {
        if (from == to) {
            target.innerText = to;
            return false;
        }
        duration = (duration == null || isNaN(duration)) ? 500 : duration;
        precision = (precision == null || isNaN(precision)) ? 0 : precision;

        var id = target.dataset.intervalId || uuid.short(), inval = 10;
        target.dataset.intervalId = id;
        document.getElementById('pr').classList.add('nl-' + String(to).length);

        var si = data[id];
        if (si != null) {
            clearInterval(si);
        }

        var step = (to - from) / (duration / inval), inx = 0;

        function r() {
            var stop = false, n = from + inx * step;
            if ((step > 0 && n >= to) || (step < 0 && n <= to)) {
                stop = true;
                n = to;
            }
            target.innerText = currency(n, precision);
            inx++;
            if (stop === true) {
                clearInterval(si);
            }
        }

        si = setInterval(r, inval);
        r();
        data[id] = si;
    }
}

function user(callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var d = JSON.parse(xhr.responseText);
                    if (d.error) {
                        if (d.error.code === 'unlogin') {
                            var thisurl = window.location.href;
                            window.sessionStorage.setItem('thisurl', thisurl);
                            window.location.href = './login.html';
                        } else {
                            document.getElementById('attendance-loader').classList.add('hide');
                            document.getElementById('attendance-success').classList.add('hide');
                            document.getElementById('attendance-fail').classList.remove('hide');
                        }
                    } else {
                        document.getElementById('nickname').innerText = d.data.nickname;
                        attendance.header.style.backgroundImage = 'url(' + d.data.headimgurl + ')';
                        attendance.begin();
                    }
                } catch (e) {
                    setTimeout(user, 2000);
                }
            } else {
                setTimeout(user, 2000);
            }
        }
    };
    xhr.open('post', '/mobile/checklogin');
    xhr.send();
}

var attendance = {
    checking: false,
    header: document.getElementById('head-image'),
    begin: function () {
        if (attendance.checking === false) {
            attendance.checking = true;
            attendance.header.classList.add('loading');
            document.getElementById('attendance-loader').classList.remove('hide');
            document.getElementById('attendance-fail').classList.add('hide');
            document.getElementById('attendance-success').classList.add('hide');

            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            var d = JSON.parse(xhr.responseText);
                            attendance.success(d.data);
                        } catch (e) {
                            attendance.fail();
                        }
                    } else {
                        attendance.fail();
                    }
                }
            };
            xhr.open('post', '/club/custsign');
            xhr.send();
        }
    },
    success: function (res) {
        document.getElementById('attendance-loader').classList.add('hide');
        document.getElementById('attendance-fail').classList.add('hide');
        document.getElementById('attendance-success').classList.remove('hide');
        attendance.header.classList.remove('loading');
        attendance.unlisten();
        attendance.checking = false;
        showNumber(document.getElementById('point'), 0, res.point);
        var ranker = document.getElementById('rank');
        showNumber(ranker, 1000, res.order);
        document.getElementById('attendance-success').innerText = '您今日已经成功签到，获得 ' + res.getpoint + ' 积分，请继续保持 :)';
        if (res.order <= 10) {
            ranker.classList.add('r1');
        } else if (res.order <= 100) {
            ranker.classList.add('r2');
        } else if (res.order <= 500) {
            ranker.classList.add('r3');
        }
    },
    fail: function () {
        document.getElementById('attendance-loader').classList.add('hide');
        document.getElementById('attendance-success').classList.add('hide');
        document.getElementById('attendance-fail').classList.remove('hide');
        attendance.header.classList.remove('loading');
        attendance.listen();
        attendance.checking = false;
    },
    listen: function () {
        attendance.unlisten();
        attendance.header.addEventListener('click', user);
    },
    unlisten: function () {
        attendance.header.removeEventListener('click', user);
    }
};

user();

/*app.checkLogin()
    .then(function () {
        attendance.begin();
        user();

    })*/

//showNumber(document.getElementById('point'), 0, Math.round((Math.random() * 300) * (Math.random() * 300) + 100));