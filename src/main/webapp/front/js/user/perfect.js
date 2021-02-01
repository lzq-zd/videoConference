$(function () {
    $.getJSON({
        url:"/user/getMyMsg",
        success:function (data) {
            if(data.success === 'ok') {
                var user = data.user;
                $("#addComment").val(user.intro);
                $("#oldEmail").val(user.email);
                $("#oldEmail").attr('disabled', true);
            }else {
                window.wxc.xcConfirm('用户信息获取失败！无法回显',window.wxc.xcConfirm.typeEnum.error);
            }
        }
    })
})


//上传图片的显示
function imgPreview(fileDom) {
    //判断是否支持FileReader
    if(window.FileReader) {
        var reader = new FileReader();
    } else {
        window.wxc.xcConfirm('您的设备不支持图片预览功能，如需该功能请升级您的设备！',window.wxc.xcConfirm.typeEnum.info);
    }
    //获取文件
    var file = fileDom.files[0];
    var imageType = /^image\//;
    //是否是图片
    if(!imageType.test(file.type)) {
        window.wxc.xcConfirm('请选择图片！',window.wxc.xcConfirm.typeEnum.info);
        return;
    }
    //读取完成
    reader.onload = function(e) {
        //获取图片dom
        var img = document.getElementById("headPhoto");
        //图片路径设置为读取的图片
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}


/*修改头像*/
function updateHeadPhoto() {
    var formData = new FormData();
   /* var file = $('#inputFile')[0].files[0];*/
    formData.append('file', $('#inputFile')[0].files[0]);  //添加图片信息的参数
    $.post({
        url:'/file/headPhoto',
        processData: false,
        contentType:false,
        data:formData,
        success:function(data) {
            if(data === 'ok') {
                window.wxc.xcConfirm('修改成功！',window.wxc.xcConfirm.typeEnum.success);
            }else {
                window.wxc.xcConfirm('修改失败！',window.wxc.xcConfirm.typeEnum.error);
            }
        }
    })
}

/*个人简介修改*/
function submitIntro() {
    var intro = $("#addComment").val();

    $.post({
        url:'/user/updateIntro',
        data:{
            "intro":intro
        },
        success:function (data) {
            if(data === 'ok') {
                window.wxc.xcConfirm('提交成功！',window.wxc.xcConfirm.typeEnum.success);
            }else {
                window.wxc.xcConfirm('提交失败！ '+data,window.wxc.xcConfirm.typeEnum.error);
            }
        }
    })
}

var emailFlag = false;
var codeFlag = false;

/*判断邮箱的输入格式*/
function judgeEmail() {
    var email = $("#newEmail").val();
    emailFlag = regBox.regEmail.test(email);
    if(!emailFlag) {
        //邮箱格式不正确
        $("#newEmailInfo").css("color","red");
        $("#newEmailInfo").html("请确认你的邮箱输入是否正确");
        return;
    }
    var oldEmail = $("#oldEmail").val();
    if(oldEmail === email) {
        $("#newEmailInfo").css("color","red");
        $("#newEmailInfo").html("新邮箱不能和旧邮箱相同");
        return;
    }
    /*判断邮箱是否已经被注册*/
    $.post({
        url:'/login/judgeUserNameOrEmail',
        data:{
            "nameOrEmail":email,
            "type":"email"
        },
        success:function (data) {
            var msg = "邮箱可用";
            if(data.toString() === 'ok') {
                //信息核对成功
                emailFlag = false;
                $("#newEmailInfo").css("color","red");
                msg = "该邮箱已被注册，请重新填写";}else {
                emailFlag = true;
                $("#newEmailInfo").css("color","green");
            }
            $("#newEmailInfo").html(msg);
        }
    });
}

/*判断验证码格式是否正确*/
function judgeCode() {
    var code = $("#code").val();
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
    $("#codeButton").attr('disabled', true);
    $("#codeButton").css({'background-color' : 'gray'});
    var email = $("#oldEmail").val();
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

var regBox = {
    regEmail: /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/   //邮箱
}

/*修改邮箱*/
function updateEmail() {
    var flag = emailFlag && codeFlag;
    var email = $("#newEmail").val();
    var code = $("#code").val();
    var oldEmail = $("#oldEmail").val();
    $.post({
        url:'/user/updateEmail',
        data:{
            "oldEmail":oldEmail,
            "email":email,
            "code":code
        },
        success:function (data) {
            if(data === 'ok') {
                window.wxc.xcConfirm('更换成功！',window.wxc.xcConfirm.typeEnum.success);
            }else {
                window.wxc.xcConfirm('更换失败！ '+data,window.wxc.xcConfirm.typeEnum.error);
            }
        }
    })
}

/*刷新父页面，关闭当前页面*/
function returnUpdate() {
    window.parent.opener.location.reload();
    window.close();
}