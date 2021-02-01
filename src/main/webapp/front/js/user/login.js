var regBox = {
    regEmail : /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/,   //邮箱
    regName : /^[\u4e00-\u9fa5_\-a-zA-Z0-9]{2,12}$/,                 //用户名
    regPassword : /^[\-a-zA-Z0-9]{6,18}$/             //密码
};

var nameOrEmailFlag = false;
var passwordFlag = false;
var codeFlag  = false;


/*用户名/密码*/
function loginUserName() {
    var nameOrEmail = $("#userName").val();
    var nameFlag = regBox.regName.test(nameOrEmail);
    var emailFlag = regBox.regEmail.test(nameOrEmail);

    if(!emailFlag && !nameFlag) {
        //邮箱和用户名格式皆不正确
        $("#userNameInfo").css("color","red");
        $("#userNameInfo").html("请输入正确的用户名(中英文/数字/_/- 的2-12位组合)/邮箱");
        return;
    }

    $.post({
        url:'/login/judgeUserNameOrEmail',
        data:{"nameOrEmail":nameOrEmail,"type":emailFlag ? "email" : "name"},
        success:function (data) {
            var msg = data;
            if(data.toString() === 'ok') {
                //信息核对成功
                nameOrEmailFlag = true;
                $("#userNameInfo").css("color","green");
                msg = "信息正确";
            }else {
                nameOrEmailFlag = false;
                $("#userNameInfo").css("color","red");
            }
            $("#userNameInfo").html(msg);
        }
    });
}

/*密码*/
function loginPassword() {
    var password = $("#password").val();
    passwordFlag = regBox.regPassword.test(password);

    if(!passwordFlag) {
        $("#passwordInfo").css("color","red");
        $("#passwordInfo").html("请输入正确的密码(英文/数字/_/- 的6-18位组合)");
        return;
    }else {
        $("#passwordInfo").css("color","green");
        $("#passwordInfo").html("格式正确");
    }
}

/*验证码*/
function loginCode() {
    var code = $("#loginCode").val();
    if(code === null || code.length !== 4) {
        $("#codeInfo").css("color","red");
        var msg = "请输入四位的验证码！";
        $("#codeInfo").html(msg);
    }else {
        $.get({
            url:'/verification',
            data:{
                "code":code
            },
            success:function (data) {
                var msg = data;
                if(data.toString() === 'ok') {
                    msg = '验证码正确';
                    codeFlag = true;
                    $("#codeInfo").css("color","green");
                }else {
                    codeFlag = false;
                    $("#codeInfo").css("color","red");
                }
                $("#codeInfo").html(msg);
            }
        });

    }

}

/*刷新验证码*/
function lCode() {
    $("#verifyCodeImage").attr("src","/getVerifyCode?"+ Date.now());
}

/*登录*/
function loginButton() {
    var flag = nameOrEmailFlag && passwordFlag && codeFlag;
    if (!flag) {
        var txt = '请输入正确格式的 用户名/邮箱、密码、验证码 ';
        window.wxc.xcConfirm(txt,window.wxc.xcConfirm.typeEnum.warning);
        return
    }

    var nameOrEmail = $("#userName").val();
    var emailFlag = regBox.regEmail.test(nameOrEmail);
    var password = $("#password").val();
    var rememberMe = document.getElementById("rememberMe").checked;

    $.post({
        url:'/login/judgeUserNameOrEmailAndPassword',
        data:{
            "nameOrEmail":nameOrEmail,
            "type":emailFlag ? "email" : "name",
            "password":password,
            "rememberMe":rememberMe
        },
        success:function (data) {
            var msg = '';
            if(data.toString() === 'ok') {
                //信息核对成功
                msg = "登录成功";
                window.wxc.xcConfirm(msg,window.wxc.xcConfirm.typeEnum.success);
                window.location.href = '/mainPage/index';
            }else {
                msg = "登录失败,"+data;
                window.wxc.xcConfirm(msg,window.wxc.xcConfirm.typeEnum.error);
            }
        }
    });
}