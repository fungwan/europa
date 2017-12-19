/**
 * Created by Yatagaras on 2016/1/12.
 */

var inx = 0, steps = 0, width = 0, height = 0, _body, _fixedBanner, _playing = false;


var swipe = {
    bind: function () {
        if (inx >= 0) {
            $(".panel[data-inx=" + inx + "]").addClass("selected");
        }
        _body.mousewheel(swipe.wheel);
        _fixedBanner.on("click", "button", swipe.jump)
    },
    wheel: function (e, delta) {
        var next = inx - (delta < 0 ? -1 : 1);
        swipe.to(next);
    },
    jump: function (e) {
        var next = Number($(e.currentTarget).val());
        if (isNaN(next)) next = inx;
        swipe.to(next);
    },
    to: function (next) {
        _fixedBanner.off();
        _body.unbind("mousewheel");
        if (next >= 0 && next < $(".panel").length && next !== inx) {
            inx = next;

            _body.stop(true).animate({
                "scrollTop": next * height
            }, {
                "duration": 500,
                "complete": swipe.bind
            });

            _body.removeClass("black");
            if ($(".panel[data-inx=" + inx + "]").attr("data-black") === "true")
                _body.addClass("black");

            _fixedBanner.children(".checked").removeClass("checked");
            _fixedBanner.children("[value=" + next + "]").addClass("checked");

            if (inx > 0) {
                video.pause();
                video.autoPlay = _playing;
            } else if (video.autoPlay)
                video.play();
        } else
            swipe.bind();
    }
};

function windowSizeChanged() {
    width = $(window).width();
    height = $(window).height();

    $(".panel").css({
        "width": width,
        "height": height
    });

    var fbh = _fixedBanner.outerHeight(true);
    _fixedBanner.css("top", Math.round((height - fbh) / 2));

    if (_body && inx >= 0)
        _body.stop(true).animate({"scrollTop": inx * height}, 500);
}

var video = {
    element: null,
    autoPlay: false,
    init: function () {
        video.element = document.getElementById("_mainVideo");
        video.progress.element = $("#_mainVideoController > .progress");
        video.element.addEventListener("timeupdate", video.progress.done);
        video.element.addEventListener("ended", video.progress.ended);
        if (video.autoPlay) video.play();
    },
    play: function () {
        video.element.play();
        $("#_mainVideoController_button").removeClass("play").addClass("pause").val("pause");
        $("#_mainVideoController").addClass("playing");
    },
    pause: function () {
        video.element.pause();
        $("#_mainVideoController_button").removeClass("pause").addClass("play").val("play");
        $("#_mainVideoController").removeClass("playing");
    },
    progress: {
        element: null,
        done: function (e) {
            video.progress.element.css("scale", [(video.element.currentTime / video.element.duration), 1]);
        },
        ended: function () {
            if (video.element.ended) {
                video.autoPlay = _playing = false;
                $("#_mainVideoController_button").removeClass("pause").addClass("play").val("play");
                $("#_mainVideoController").removeClass("playing");
            }
        }
    }
};

function onButtonClicked(e) {
    var t = $(e.currentTarget);
    switch (t.val()) {
        case "play":
            _playing = true;
            video.play();
            break;
        case "pause":
            _playing = false;
            video.pause();
            break;
    }
}

$(function () {
    _body = $(document.body);
    _body.off().on("click", "button[value]", onButtonClicked);
    _fixedBanner = $("#fixedBanner");

    video.init();
    swipe.to(0);

    $(window).resize(windowSizeChanged);
    windowSizeChanged();
});