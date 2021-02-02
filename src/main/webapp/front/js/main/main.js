var loginFlag = false;

$(document).ready(function(){
    $.getJSON({
        url:"/mainPageLogin/getUserLoginCookie",
        dataType:"json",
        success:function (data) {
            var msg = data["msg"];
            var flag = data["flag"];
            if(flag) {
                loginFlag = true;
                $("#welcome").css("color","green");
                $("#welcome").attr("href","#");
            }else {
                $("#welcome").css("color","red");
                $("#welcome").attr("href","/user/login");
            }
            $("#welcome").html(msg);
        }
    });
});

/*显示用户头像*/
$(function () {
    /*用户未登录，不做处理，显示默认图像*/
    if(!loginFlag) {
        return;
    }
    $.getJSON({
        url:'/user/getHeadPhoto',
        success:function (data) {

        }
    })
});

//写博客事件
function writeBlog() {
    if(loginFlag) {
        //打开一个新的页面
        window.open('/blog/redact');
    }else {
        window.wxc.xcConfirm("请先登录！",window.wxc.xcConfirm.typeEnum.info);
    }
}

function addMusic() {
    if(loginFlag) {
        window.location.href = '#';
    }else {
        window.wxc.xcConfirm("请先登录！",window.wxc.xcConfirm.typeEnum.info);
    }
}

function addVideo() {
    if(loginFlag) {
        window.location.href = '#';
    }else {
        window.wxc.xcConfirm("请先登录！",window.wxc.xcConfirm.typeEnum.info);
    }
}

function addPhoto() {
    if(loginFlag) {
        window.location.href = '#';
    }else {
        window.wxc.xcConfirm("请先登录！",window.wxc.xcConfirm.typeEnum.info);
    }
}