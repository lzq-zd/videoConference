var regBox = {
    regEmail : /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/,   //邮箱
    regName : /^[\u4e00-\u9fa5_\-a-zA-Z0-9]{2,12}$/,                 //用户名
    regPassword : /^[\-a-zA-Z0-9]{6,18}$/             //密码
};

var nameFlag = false;
var emailFlag = false;
var passwordFlag = false;
var codeFlag  = false;

/*判断注册的用户名*/
function registerUserName() {
    var name = $("#userName").val();
    nameFlag = regBox.regName.test(name);

    if(!nameFlag) {
        //邮箱和用户名格式皆不正确
        $("#userNameInfo").css("color","red");
        $("#userNameInfo").html("请输入正确的用户名(中英文/数字/_/- 的2-12位组合)");
        return;
    }

    $.post({
        url:'/login/judgeUserNameOrEmail',
        data:{"nameOrEmail":name,"type":"name"},
        success:function (data) {
            var msg = "用户名可用";
            if(data.toString() === 'ok') {
                //信息已经注册
                nameFlag = false;
                $("#userNameInfo").css("color","red");
                msg = "该用户名已被注册！请重新填写";
            }else {
                nameFlag = true;
                $("#userNameInfo").css("color","green");
            }
            $("#userNameInfo").html(msg);
        }
    });
}

/*判断注册的邮箱*/
function registerEmail() {
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
            var msg = "邮箱可用";
            if(data.toString() === 'ok') {
                //信息核对成功
                emailFlag = false;
                $("#emailInfo").css("color","red");
                msg = "该邮箱已被注册，请重新填写";
            }else {
                emailFlag = true;
                $("#emailInfo").css("color","green");
            }
            $("#emailInfo").html(msg);
        }
    });
}

/*判断注册的密码*/
function registerPassword() {
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
function registerCode() {
    var code = $("#registerCode").val();
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
        window.wxc.xcConfirm('请先输入邮箱！',window.wxc.xcConfirm.typeEnum.confirm);
        return;
    }
    $("#codeButton").attr('disabled', true);
    $("#codeButton").css({'background-color' : 'gray'});
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
                window.wxc.xcConfirm(msg,window.wxc.xcConfirm.typeEnum.info);
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

/*注册按钮*/
function registerButton() {
    var flag = nameFlag && emailFlag && passwordFlag && codeFlag;
    if (!flag) {
        var msg = '请检查输入的用户名、邮箱、密码、验证码格式是否正确或已经被注册！';
        window.wxc.xcConfirm(msg,window.wxc.xcConfirm.typeEnum.warning);
        return
    }

    var name = $("#userName").val();
    var email = $("#email").val();
    var password = $("#password").val();
    var code = $("#registerCode").val();

    $.post({
        url:'/register/userRegister',
        data:{
            "name":name,
            "email":email,
            "password":password,
            "code":code
        },
        success:function (data) {
            var msg = '';
            if(data.toString() === 'ok') {
                msg = "注册成功";
                window.wxc.xcConfirm(msg,window.wxc.xcConfirm.typeEnum.success);
                window.location.href = '/mainPage/index';
            }else if(data.toString() === 'code error'){
                msg = "验证码错误";
                window.wxc.xcConfirm(msg,window.wxc.xcConfirm.typeEnum.error);
            }else {
                msg = "注册失败,请重新注册";
                window.wxc.xcConfirm(msg,window.wxc.xcConfirm.typeEnum.error);
            }
        }
    });
}
