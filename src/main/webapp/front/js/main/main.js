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


/*创建会议*/
function createMeeting() {
    if(!loginFlag) {
        /*未登录的话，提示登录*/
        window.wxc.xcConfirm("请先登录！",window.wxc.xcConfirm.typeEnum.info);
        return
    }
    var txt=  "请输入会议备注信息";
    window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.input,{
        onOk:function(remark){
            if(remark === null || remark.length < 1) {
                window.wxc.xcConfirm('必须输会议备注信息，以方便通知参会人员',window.wxc.xcConfirm.typeEnum.error);
                return;
            }
            $.post( {
                url:'/meeting/createRoom',
                data:{
                    "remark":remark
                },
                success:function (data) {
                    var msg = data["msg"];
                    var flag = data["flag"];
                    if(flag) {
                        var meeting = msg;
                        var url = meeting.url;
                        var presider = meeting.presider;
                        var remark = meeting.remark;
                        var dateTime = meeting.dateTime;
                        window.wxc.xcConfirm("创建成功 \n网站地址："+url+"\n主持者："+presider+"\n备注："+remark+"\n创建时间："+dateTime,window.wxc.xcConfirm.typeEnum.success);
                    }else {
                        window.wxc.xcConfirm(msg,window.wxc.xcConfirm.typeEnum.error);
                    }
                }
            });
        }
    });
}

/*加入会议*/
function addMeeting() {
    if(!loginFlag) {
        /*未登录的话，提示登录*/
        window.wxc.xcConfirm("请先登录！",window.wxc.xcConfirm.typeEnum.info);
        return
    }
    var txt=  "请输入房间号";
    window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.input,{
        onOk:function(roomId){
            if(roomId === null || roomId.length < 10) {
                window.wxc.xcConfirm('必须输入正确格式的房间号，否则无法加入',window.wxc.xcConfirm.typeEnum.error);
                return;
            }
            $.post( {
                url:'/meeting/addRoom',
                data:{
                    "roomId":roomId
                },
                success:function (data) {
                    var msg = data["msg"];
                    var flag = data["flag"];
                    if(flag) {
                        window.wxc.xcConfirm(msg,window.wxc.xcConfirm.typeEnum.success);
                    }else {
                        window.wxc.xcConfirm(msg,window.wxc.xcConfirm.typeEnum.error);
                    }
                }
            });
        }
    });
}