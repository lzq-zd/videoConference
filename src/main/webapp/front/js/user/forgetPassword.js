var regBox = {
    regEmail : /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/,   //邮箱
    regPassword : /^[\-a-zA-Z0-9]{6,18}$/             //密码
};

var emailFlag = false;
var passwordFlag = false;
var newPasswordFlag = false;
var codeFlag  = false;


/*判断邮箱*/
function forgetPasswordEmail() {
    var email = $("#email").val();
    emailFlag = regBox.regEmail.test(email);

    if(!emailFlag) {
        //邮箱和用户名格式皆不正确
        $("#emailInfo").css("color","red");
        $("#emailInfo").html("请确认你的邮箱输入是否正确");
        return;
    }

    $.post({
        url:'/login/judgeUserNameOrEmail',
        data:{"nameOrEmail":email,"type":"email"},
        success:function (data) {
            var msg = data;
            if(data.toString() === 'ok') {
                //信息核对成功
                emailFlag = true;
                $("#emailInfo").css("color","green");
                msg = "信息正确";
            }else {
                emailFlag = false;
                $("#emailInfo").css("color","red");
            }
            $("#emailInfo").html(msg);
        }
    });
}

/*判断密码*/
function forgetPasswordPassword() {
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


/*判断新密码*/
function forgetPasswordNewPassword() {
    var newPassword = $("#newPassword").val();
    newPasswordFlag = regBox.regPassword.test(newPassword);

    if(!passwordFlag) {
        $("#newPasswordInfo").css("color","red");
        $("#newPasswordInfo").html("请输入正确的密码(英文/数字/_/- 的6-18位组合)");
        return;
    }else {
        var password = $("#password").val();
        if(password.trim() !== newPassword.trim()) {
            newPasswordFlag = false;
            $("#newPasswordInfo").css("color","red");
            $("#newPasswordInfo").html("两次输入的密码不一致！");
        }else {
            $("#newPasswordInfo").css("color", "green");
            $("#newPasswordInfo").html("格式正确");
        }
    }
}

/*验证码*/
function forgetPasswordCode() {
    var code = $("#forgetPasswordCode").val();
    var msg = "格式正确";
    if(code === null || code.length !== 6) {
        $("#codeInfo").css("color","red");
        msg = "请输入六位的验证码！";
    }else {
        codeFlag = true;
        $("#codeInfo").css("color","green");
    }
    $("#codeInfo").html(msg);
}

var wait = 59;
/*验证码按钮*/
function emailCode() {
    var email = $("#email").val();
    if(email === "") {
        window.wxc.xcConfirm('请先输入邮箱！',window.wxc.xcConfirm.typeEnum.info);
        return;
    }
    $.post({
        url:'/email/code',
        data:{
            "email":email
        },
        success:function (data) {
            if(data.toString() === 'ok') {
                buttonDispose();
            }else {
                msg = "抱歉，验证码发送失败，请稍后重试";
                window.wxc.xcConfirm(msg,window.wxc.xcConfirm.typeEnum.error);
            }
        }
    });
}

function buttonDispose() {
    if (wait === 0) {
        $("#codeButton").attr('disabled', false);
        $("#codeButton").css({'background-color' : 'green'});
        $("#codeButton").html("点击发送");
        wait = 59;
    } else {
        $("#codeButton").attr('disabled', true);
        $("#codeButton").css({'background-color' : 'gray'});
        $("#codeButton").html('已发送('+wait + ")s");
        wait--;
        setTimeout(buttonDispose, 1000);
    }
}

/*提交*/
function forgetPasswordButton() {
    var flag = emailFlag && passwordFlag && newPasswordFlag && codeFlag;
    if (!flag) {
        var msg = '请检查输入的邮箱、密码、新密码、验证码格式是否正确或满足要求！';
        window.wxc.xcConfirm(msg,window.wxc.xcConfirm.typeEnum.warning);
        return
    }

    var email = $("#email").val();
    var password = $("#password").val();
    var code = $("#forgetPasswordCode").val();

    $.post({
        url:'/user/forgetPasswordDispose',
        data:{
            "email":email,
            "password":password,
            "code":code
        },
        success:function (data) {
            var msg = '';
            if(data.toString() === 'ok') {
                msg = "修改成功";
                window.wxc.xcConfirm(msg,window.wxc.xcConfirm.typeEnum.success);
            }else if(data.toString() === 'code error') {
                msg = "验证码错误";
                window.wxc.xcConfirm(msg,window.wxc.xcConfirm.typeEnum.error);
            }else {
                color = 'red';
                msg = data;
                window.wxc.xcConfirm(msg,window.wxc.xcConfirm.typeEnum.error);
            }
        }
    });
}
