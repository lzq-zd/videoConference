/*服务器地址*/
var server = null;
if(window.location.protocol === 'http:')
	server = "http://" + window.location.hostname + ":8088/janus";
else
	server = "https://" + window.location.hostname + ":8089/janus";

/*Janus处理与服务器的交互*/
var janus = null;
/*插件句柄*/
var sfutest = null;
/*一个可选的不透明字符串，对你的应用程序有意义(例如，映射同一个用户的所有句柄);*/
var opaqueId = "videoroomtest-"+Janus.randomString(12);

/*发起者*/
var meetinPresider = null;
if(getQueryStringValue("meetinPresider") !== "")
    meetinPresider = getQueryStringValue("meetinPresider");

/*房间号*/
var myroom = 1234;	//Demo ro om
if(getQueryStringValue("room") !== "")
	myroom = parseInt(getQueryStringValue("room"));

/*描述*/
var remark = null;
if(getQueryStringValue("remark") !== "")
    remark = getQueryStringValue("remark");

/*用户名*/
var myusername = null;
/*用户id*/
var myid = null;
var mystream = null;
// 我们使用另一个ID将订阅映射到我们自己
var mypvtid = null;

var feeds = [];
var bitrateTimer = [];

/*转播*/
var doSimulcast = (getQueryStringValue("simulcast") === "yes" || getQueryStringValue("simulcast") === "true");
var doSimulcast2 = (getQueryStringValue("simulcast2") === "yes" || getQueryStringValue("simulcast2") === "true");
/*只有音频*/
var acodec = (getQueryStringValue("acodec") !== "" ? getQueryStringValue("acodec") : null);
/*视频*/
var vcodec = (getQueryStringValue("vcodec") !== "" ? getQueryStringValue("vcodec") : null);
/*是否有订阅者*/
var subscriber_mode = (getQueryStringValue("subscriber-mode") === "yes" || getQueryStringValue("subscriber-mode") === "true");

/*加载页面时需要获取的后台信息*/
$(document).ready(function() {
    $("#meetinPresider").html('发起者：'+meetinPresider);
    $("#meetinRemark").html('备注/描述：'+remark);
    $("#meetinRoomId").html('房间号：'+myroom);
    /*初始化库(all,启用了所有控制台调试器)*/
    Janus.init({
        debug: "all", callback: function () {
            /*开始按钮*/
            $('#start').one('click', function () {
                $(this).attr('disabled', true).unbind('click');
                /*确保浏览器支持WebRTC*/
                if (!Janus.isWebrtcSupported()) {
                    bootbox.alert("当前浏览器不支持WebRTC，请升级当前浏览器版本或者更换其他浏览器... ");
                    return;}/*创建会话*/
                janus = new Janus({
                    server: server,
                    success: function () {
                        //创建成功之后，添加插件
                        janus.attach(
                            {
                                plugin: "janus.plugin.videoroom",
                                /*一个可选的不透明字符串，对你的应用程序有意义(例如，映射同一个用户的所有句柄);*/
                                opaqueId: opaqueId,
                                /*回调事件：句柄已经成功创建并且准备好被使用;*/
                                /*'pluginHandle'是我们的插件句柄*/
                                success: function (pluginHandle) {
                                    $('#details').remove();
                                    sfutest = pluginHandle;
                                    Janus.log("  -- 附加插件! (" + sfutest.getPlugin() + ", id=" + sfutest.getId() + ")");
                                    Janus.log("  -- 这是一个发起者");
                                    //准备用户名注册
                                    $('#videojoin').removeClass('hide').show();
                                    $('#registernow').removeClass('hide').show();
                                    $('#register').click(registerUsername);
                                    $('#username').focus();
                                    $('#start').removeAttr('disabled').html("退出房间")
                                        .click(function () {
                                            $(this).attr('disabled', true);
                                            janus.destroy();});},
                                error: function (error) {
                                    Janus.error("  -- 附加插件错误...", error);
                                    bootbox.alert("附加插件错误... " + error);},
                                /*这个回调在getUserMedia被调用之前(parameter=true)和它被完成之后(parameter=false)被触发;
                                   这意味着它可以用来相应地修改UI，例如，提示用户需要接受设备访问许可请求;*/
                                consentDialog: function (on) {
                                    Janus.debug("同意对话否？" + (on ? "on" : "off") + " now");
                                    if (on) {
                                        // 屏幕变暗并显示提示
                                        $.blockUI({
                                            message: '<div><img src="/front/img/main/janus/up_arrow.png"/></div>',
                                            css: {
                                                border: 'none',
                                                padding: '15px',
                                                backgroundColor: 'transparent',
                                                color: '#aaa',
                                                top: '10px',
                                                left: (navigator.mozGetUserMedia ? '-100px' : '300px')
                                            }});} else {
                                        //恢复屏幕
                                        $.unblockUI();}},
                                /*当与句柄关联的PeerConnection的ICE状态改变时，这个回调被触发:回调的参数是一个新的状态字符串
                                   (例如，“connected”或“failed”);*/
                                iceState: function (state) {
                                    Janus.log("ICE state changed to " + state);},
                                /*当Janus开始或停止接收你的媒体时，这个回调被触发:例如，带有type=audio和on=true的mediaState
                                   表示Janus开始接收你的音频流(或在超过一秒的暂停后开始再次获得它们);带有type=video和on=false的
                                   纵膈表示Janus在检测到之前的开始后的最后一秒没有收到来自您的任何视频;用于判断Janus何时开始处理
                                   你的媒体，或检测媒体路径上的问题(例如，媒体从未启动，或在某个时间停止);*/
                                mediaState: function (medium, on) {
                                    Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);},
                                /*从Janus的角度来看，当与句柄关联的PeerConnection变得活跃(因此ICE、DTLS和其他一切都成功了)时，
                                   这个回调被true值触发，而当PeerConnection停止时触发false值;用于判断你和Janus之间的WebRTC何时
                                   启动并运行(例如，通知用户他们现在在会议中处于活跃状态);注意，在false的情况下，reason字符串可
                                   以作为可选参数出现;*/
                                webrtcState: function (on) {
                                    Janus.log("Janus说我们的WebRTC PeerConnection是？" + (on ? "up" : "down") + " now");
                                    $("#videolocal").parent().parent().unblock();
                                    if (!on)
                                        return;
                                    $('#publish').remove();
                                    // 这个控制允许我们覆盖全局房间比特率上限
                                    $('#bitrate').parent().parent().removeClass('hide').show();
                                    $('#bitrate a').click(function () {
                                        var id = $(this).attr("id");
                                        var bitrate = parseInt(id) * 1000;
                                        if (bitrate === 0) {
                                            Janus.log("不限制带宽通过REMB");} else {
                                            Janus.log("限制带宽" + bitrate + " 通过 REMB");}$('#bitrateset').html($(this).html() + '<span class="caret"></span>').parent().removeClass('open');
                                        sfutest.send({message: {request: "configure", bitrate: bitrate}});
                                        return false;});},
                                /*从插件接收到消息/事件;*/
                                onmessage: function (msg, jsep) {
                                    Janus.debug(" ::: 插件收到消息 :::", msg);
                                    var event = msg["videoroom"];
                                    Janus.debug("事件: " + event);
                                    if (event) {
                                        if (event === "joined") {
                                            // 插件插件成功, 协商WebRTC并附加到现有的提要(如果有的话)
                                            myid = msg["id"];
                                            mypvtid = msg["private_id"];
                                            Janus.log("成功的加入房间" + msg["room"] + " with ID " + myid);
                                            /*是否有订阅者，有的话需要转发自己的流*/
                                            if (subscriber_mode) {
                                                $('#videojoin').hide();
                                                $('#videos').removeClass('hide').show();} else {
                                                /*转发自己的流*/
                                                publishOwnFeed(true);}// 有没有新的链接?
                                            if (msg["publishers"]) {
                                                var list = msg["publishers"];
                                                Janus.debug("得到一个可用的列表提要:", list);
                                                /*遍历列表*/
                                                for (var f in list) {
                                                    var id = list[f]["id"];
                                                    var display = list[f]["display"];
                                                    var audio = list[f]["audio_codec"];
                                                    var video = list[f]["video_codec"];
                                                    Janus.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                                                    newRemoteFeed(id, display, audio, video);}}} else if (event === "destroyed") {
                                            // 房间已经被销毁
                                            Janus.warn("房间已被销毁!");
                                            bootbox.alert("房间已被销毁", function () {
                                                window.location.reload();});} else if (event === "event") {
                                            // 有没有新的连接
                                            if (msg["publishers"]) {
                                                var list = msg["publishers"];
                                                Janus.debug("Got a list of available publishers/feeds:", list);
                                                for (var f in list) {
                                                    var id = list[f]["id"];
                                                    var display = list[f]["display"];
                                                    var audio = list[f]["audio_codec"];
                                                    var video = list[f]["video_codec"];
                                                    Janus.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                                                    newRemoteFeed(id, display, audio, video);}} else if (msg["leaving"]) {
                                                // 一个走了
                                                var leaving = msg["leaving"];
                                                Janus.log("Publisher left: " + leaving);
                                                var remoteFeed = null;
                                                /*找到离开房间的那个人*/
                                                for (var i = 1; i < msg["publishers"].length; i++) {
                                                    if (feeds[i] && feeds[i].rfid == leaving) {
                                                        remoteFeed = feeds[i];
                                                        break;}}if (remoteFeed != null) {
                                                    Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") 已经离开房间了吗");
                                                    $('#remote' + remoteFeed.rfindex).empty().hide();
                                                    $('#videoremote' + remoteFeed.rfindex).empty();
                                                    feeds[remoteFeed.rfindex] = null;
                                                    remoteFeed.detach();}} else if (msg["unpublished"]) {
                                                // One of the publishers has unpublished?
                                                var unpublished = msg["unpublished"];
                                                Janus.log("Publisher left: " + unpublished);
                                                if (unpublished === 'ok') {
                                                    // That's us
                                                    sfutest.hangup();
                                                    return;}var remoteFeed = null;
                                                for (var i = 1; i < msg["publishers"].length; i++) {
                                                    if (feeds[i] && feeds[i].rfid == unpublished) {
                                                        remoteFeed = feeds[i];
                                                        break;}}if (remoteFeed != null) {
                                                    Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
                                                    $('#remote' + remoteFeed.rfindex).empty().hide();
                                                    $('#videoremote' + remoteFeed.rfindex).empty();
                                                    feeds[remoteFeed.rfindex] = null;
                                                    remoteFeed.detach();}} else if (msg["error"]) {
                                                if (msg["error_code"] === 426) {
                                                    // 这是一个“no such room”错误:给出一个更有意义的描述
                                                    bootbox.alert(
                                                        "<p>不存在房间<code>" + myroom + "</code>" +
                                                        "</p><p>请配置文件<code>janus.plugin.videoroom.jcfg</code></p>"
                                                    );} else {
                                                    bootbox.alert(msg["error"]);}}}}if (jsep) {
                                        Janus.debug("Handling SDP as well...", jsep);
                                        sfutest.handleRemoteJsep({jsep: jsep});
                                        // Check if any of the media we wanted to publish has
                                        // been rejected (e.g., wrong or unsupported codec)
                                        var audio = msg["audio_codec"];
                                        if (mystream && mystream.getAudioTracks() && mystream.getAudioTracks().length > 0 && !audio) {
                                            // Audio has been rejected
                                            toastr.warning("Our audio stream has been rejected, viewers won't hear us");}var video = msg["video_codec"];
                                        if (mystream && mystream.getVideoTracks() && mystream.getVideoTracks().length > 0 && !video) {
                                            // Video has been rejected
                                            toastr.warning("Our video stream has been rejected, viewers won't see us");
                                            // Hide the webcam video
                                            $('#myvideo').hide();
                                            $('#videolocal').append(
                                                '<div class="no-video-container">' +
                                                '<i class="fa fa-video-camera fa-5 no-video-icon" style="height: 100%;"></i>' +
                                                '<span class="no-video-text" style="font-size: 16px;">Video rejected, no webcam</span>' +
                                                '</div>');}}},
                                onlocalstream: function (stream) {
                                    Janus.debug(" ::: Got a local stream :::", stream);
                                    mystream = stream;
                                    $('#videojoin').hide();
                                    $('#videos').removeClass('hide').show();
                                    if ($('#myvideo').length === 0) {
                                        $('#videolocal').append('<video class="rounded centered" id="myvideo" width="100%" height="100%" autoplay playsinline muted="muted"/>');
                                        // Add a 'mute' button
                                        $('#videolocal').append('<button class="btn btn-warning btn-xs" id="mute" style="position: absolute; bottom: 0px; left: 0px; margin: 15px;">禁音</button>');
                                        $('#mute').click(toggleMute);
                                        // Add an 'unpublish' button
                                        $('#videolocal').append('<button class="btn btn-warning btn-xs" id="unpublish" style="position: absolute; bottom: 0px; right: 0px; margin: 15px;">停止上传</button>');
                                        $('#unpublish').click(unpublishOwnFeed);}$('#publisher').removeClass('hide').html(myusername).show();
                                    Janus.attachMediaStream($('#myvideo').get(0), stream);
                                    $("#myvideo").get(0).muted = "muted";
                                    if (sfutest.webrtcStuff.pc.iceConnectionState !== "completed" &&
                                        sfutest.webrtcStuff.pc.iceConnectionState !== "connected") {
                                        $("#videolocal").parent().parent().block({
                                            message: '<b>上传中...</b>',
                                            css: {
                                                border: 'none',
                                                backgroundColor: 'transparent',
                                                color: 'white'
                                            }});}var videoTracks = stream.getVideoTracks();
                                    if (!videoTracks || videoTracks.length === 0) {
                                        // No webcam
                                        $('#myvideo').hide();
                                        if ($('#videolocal .no-video-container').length === 0) {
                                            $('#videolocal').append(
                                                '<div class="no-video-container">' +
                                                '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
                                                '<span class="no-video-text">没有可用摄像头</span>' +
                                                '</div>');}} else {
                                        $('#videolocal .no-video-container').remove();
                                        $('#myvideo').removeClass('hide').show();}},
                                onremotestream: function (stream) {
                                    // The publisher stream is sendonly, we don't expect anything here
                                },
                                oncleanup: function () {
                                    Janus.log(" ::: Got a cleanup notification: we are unpublished now :::");
                                    mystream = null;
                                    $('#videolocal').html('<button id="publish" class="btn btn-primary">上传</button>');
                                    $('#publish').click(function () {
                                        publishOwnFeed(true);});
                                    $("#videolocal").parent().parent().unblock();
                                    $('#bitrate').parent().parent().addClass('hide');
                                    $('#bitrate a').unbind('click');}});},
                    error: function (error) {
                        Janus.error(error);
                        bootbox.alert(error, function () {
                            window.location.reload();});},
                    destroyed: function () {
                    	console.log("退出房间");
                        window.location.reload();}});});}});

});

function checkEnter(field, event) {
	var theCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
	if(theCode == 13) {
		registerUsername();
		return false;
	} else {
		return true;
	}
}

/*注册用户信息*/
function registerUsername() {
	if($('#username').length === 0) {
		//创建要注册的字段
		$('#register').click(registerUsername);
		$('#username').focus();
	} else {
		// 开始注册
		$('#username').attr('disabled', true);
		$('#register').attr('disabled', true).unbind('click');
		var username = $('#username').val();
		if(username === "") {
			$('#you')
				.removeClass().addClass('label label-warning')
				.html("输入您的名称 (例如：张三)");
			$('#username').removeAttr('disabled');
			$('#register').removeAttr('disabled').click(registerUsername);
			return;
		}
		if(/[^\u4e00-\u9fa5_\-a-zA-Z0-9]/.test(username)) {
			$('#you')
				.removeClass().addClass('label label-warning')
				.html('输入的不是字母数字汉字');
			$('#username').removeAttr('disabled').val("");
			$('#register').removeAttr('disabled').click(registerUsername);
			return;
		}
        var register = {
                request: "join",
                room: myroom,
                ptype: "publisher",
                display: username
            };
		}
		myusername = username;
		sfutest.send({ message: register });
}

function publishOwnFeed(useAudio) {
	//发布我们的流
	$('#publish').attr('disabled', true).unbind('click');
	sfutest.createOffer(
		{
			// 如果你也想发布数据通道，这里添加数据:true
			media: { audioRecv: false, videoRecv: false, audioSend: useAudio, videoSend: true },	// Publishers are sendonly
			/*如果你想测试simulcast(仅Chrome和Firefox)，然后在打开这个演示页面时传递?simulcast=true:
			它将把以下'simulcast'属性传递给janus.js为true*/
			simulcast: doSimulcast,
			simulcast2: doSimulcast2,
			success: function(jsep) {
				Janus.debug("Got publisher SDP!", jsep);
				var publish = { request: "configure", audio: useAudio, video: true };
				/*属性时，可以强制使用特定的编解码器audiocodec和videocodec属性，例如:
				发布(“audiocodec”)= "作品"强制Opus作为音频编解码器使用，或:
				发布(“videocodec”)= " vp9 "强制VP9作为视频编解码器使用。不过，
				这两种情况都是强迫编解码器将只在以下情况下工作:(
				1)编解码器实际上是在SDP(和因此浏览器支持它)，和
				(2)编解码器在列表允许在房间里有编解码器。对于上述(2)点，
				参考janus.plugin.videoroom中的文本。jcfg文件获取更多细节。
				我们允许人通过查询字符串指定一个编解码器，用于演示目的*/
				if(acodec)
					publish["audiocodec"] = acodec;
				if(vcodec)
					publish["videocodec"] = vcodec;
				sfutest.send({ message: publish, jsep: jsep });
			},
			error: function(error) {
				Janus.error("WebRTC 错误:", error);
				if(useAudio) {
					/*重新发送*/
					 publishOwnFeed(false);
				} else {
					bootbox.alert("WebRTC 错误... " + error.message);
					$('#publish').removeAttr('disabled').click(function() { publishOwnFeed(true); });
				}
			}
		});
}

/*禁音/取消按钮*/
function toggleMute() {
	var muted = sfutest.isAudioMuted();
	Janus.log((muted ? "Unmuting" : "Muting") + " local stream...");
	if(muted)
		sfutest.unmuteAudio();
	else
		sfutest.muteAudio();
	muted = sfutest.isAudioMuted();
	$('#mute').html(muted ? "取消禁音" : "禁音");
}

/*上传/停止*/
function unpublishOwnFeed() {
	// Unpublish our stream
	$('#unpublish').attr('disabled', true).unbind('click');
	var unpublish = { request: "unpublish" };
	sfutest.send({ message: unpublish });
}

/*新的远程提要*/
function newRemoteFeed(id, display, audio, video) {
	//发布了一个新的提要，创建一个新的插件句柄并作为订阅者附加到它
	var remoteFeed = null;
	janus.attach(
		{
			plugin: "janus.plugin.videoroom",
			opaqueId: opaqueId,
			success: function(pluginHandle) {
				remoteFeed = pluginHandle;
				remoteFeed.simulcastStarted = false;
				Janus.log("附加插件! (" + remoteFeed.getPlugin() + ", id=" + remoteFeed.getId() + ")");
				Janus.log("  -- 这是一个订阅者");
				// 我们等待插件发送给我们提要
				var subscribe = {
					request: "join",
					room: myroom,
					ptype: "subscriber",
					feed: id,
					private_id: mypvtid
				};
				/*如果你不想接收音频，视频或数据，即使发布者发送他们，设置'offer_audio'，
				'offer_video'或'offer_data'属性为false(默认为true)，例如:
				订阅(“offer_video”)= false;
				例如，如果发布者是VP8，而这是Safari，那么我们就避免使用视频*/
				if(Janus.webRTCAdapter.browserDetails.browser === "safari" &&
						(video === "vp9" || (video === "vp8" && !Janus.safariVp8))) {
					if(video)
						video = video.toUpperCase()
					toastr.warning("发布者正在使用" + video + ", 但是Safari不支持:禁用视频");
					subscribe["offer_video"] = false;
				}
				remoteFeed.videoCodec = video;
				remoteFeed.send({ message: subscribe });
			},
			error: function(error) {
				Janus.error("  -- 附加插件失败...", error);
				bootbox.alert("附加插件失败... " + error);
			},
			onmessage: function(msg, jsep) {
				Janus.debug(" ::: 订阅者收到消息 :::", msg);
				var event = msg["videoroom"];
				Janus.debug("事件: " + event);
				if(msg["error"]) {
					bootbox.alert(msg["error"]);
				} else if(event) {
					if(event === "attached") {
						//创建并附加订阅者
						for(var i=1;i<6;i++) {
							if(!feeds[i]) {
								feeds[i] = remoteFeed;
								remoteFeed.rfindex = i;
								break;
							}
						}
						remoteFeed.rfid = msg["id"];
						remoteFeed.rfdisplay = msg["display"];
						if(!remoteFeed.spinner) {
							var target = document.getElementById('videoremote'+remoteFeed.rfindex);
							remoteFeed.spinner = new Spinner({top:100}).spin(target);
						} else {
							remoteFeed.spinner.spin();
						}
						Janus.log("成功添加反馈 " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") in room " + msg["room"]);
						$('#remote'+remoteFeed.rfindex).removeClass('hide').html(remoteFeed.rfdisplay).show();
					} else if(event === "event") {
						// 检查我们是否从这个出版商得到了一个同步相关的事件
						var substream = msg["substream"];
						var temporal = msg["temporal"];
						if((substream !== null && substream !== undefined) || (temporal !== null && temporal !== undefined)) {
							if(!remoteFeed.simulcastStarted) {
								remoteFeed.simulcastStarted = true;
								// 添加一些新按钮
								addSimulcastButtons(remoteFeed.rfindex, remoteFeed.videoCodec === "vp8" || remoteFeed.videoCodec === "h264");
							}
							// 我们刚刚收到一个通知，有一个开关，更新按钮
							updateSimulcastButtons(remoteFeed.rfindex, substream, temporal);
						}
					} else {
						// What has just happened?
					}
				}
				if(jsep) {
					Janus.debug("Handling SDP as well...", jsep);
					// 附加回答
					remoteFeed.createAnswer(
						{
							jsep: jsep,
							// Add data:true here if you want to subscribe to datachannels as well
							// (obviously only works if the publisher offered them in the first place)
							media: { audioSend: false, videoSend: false },	// We want recvonly audio/video
							success: function(jsep) {
								Janus.debug("Got SDP!", jsep);
								var body = { request: "start", room: myroom };
								remoteFeed.send({ message: body, jsep: jsep });
							},
							error: function(error) {
								Janus.error("WebRTC error:", error);
								bootbox.alert("WebRTC error... " + error.message);
							}
						});
				}
			},
			iceState: function(state) {
				Janus.log("ICE state of this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") changed to " + state);
			},
			webrtcState: function(on) {
				Janus.log("Janus says this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") is " + (on ? "up" : "down") + " now");
			},
			onlocalstream: function(stream) {
				// The subscriber stream is recvonly, we don't expect anything here
			},
			onremotestream: function(stream) {
				Janus.debug("Remote feed #" + remoteFeed.rfindex + ", stream:", stream);
				var addButtons = false;
				if($('#remotevideo'+remoteFeed.rfindex).length === 0) {
					addButtons = true;
					// No remote video yet
					$('#videoremote'+remoteFeed.rfindex).append('<video class="rounded centered" id="waitingvideo' + remoteFeed.rfindex + '" width="100%" height="100%" />');
					$('#videoremote'+remoteFeed.rfindex).append('<video class="rounded centered relative hide" id="remotevideo' + remoteFeed.rfindex + '" width="100%" height="100%" autoplay playsinline/>');
					$('#videoremote'+remoteFeed.rfindex).append(
						'<span class="label label-primary hide" id="curres'+remoteFeed.rfindex+'" style="position: absolute; bottom: 0px; left: 0px; margin: 15px;"></span>' +
						'<span class="label label-info hide" id="curbitrate'+remoteFeed.rfindex+'" style="position: absolute; bottom: 0px; right: 0px; margin: 15px;"></span>');
					// Show the video, hide the spinner and show the resolution when we get a playing event
					$("#remotevideo"+remoteFeed.rfindex).bind("playing", function () {
						if(remoteFeed.spinner)
							remoteFeed.spinner.stop();
						remoteFeed.spinner = null;
						$('#waitingvideo'+remoteFeed.rfindex).remove();
						if(this.videoWidth)
							$('#remotevideo'+remoteFeed.rfindex).removeClass('hide').show();
						var width = this.videoWidth;
						var height = this.videoHeight;
						$('#curres'+remoteFeed.rfindex).removeClass('hide').text(width+'x'+height).show();
						if(Janus.webRTCAdapter.browserDetails.browser === "firefox") {
							// Firefox Stable has a bug: width and height are not immediately available after a playing
							setTimeout(function() {
								var width = $("#remotevideo"+remoteFeed.rfindex).get(0).videoWidth;
								var height = $("#remotevideo"+remoteFeed.rfindex).get(0).videoHeight;
								$('#curres'+remoteFeed.rfindex).removeClass('hide').text(width+'x'+height).show();
							}, 2000);
						}
					});
				}
				Janus.attachMediaStream($('#remotevideo'+remoteFeed.rfindex).get(0), stream);
				var videoTracks = stream.getVideoTracks();
				if(!videoTracks || videoTracks.length === 0) {
					// No remote video
					$('#remotevideo'+remoteFeed.rfindex).hide();
					if($('#videoremote'+remoteFeed.rfindex + ' .no-video-container').length === 0) {
						$('#videoremote'+remoteFeed.rfindex).append(
							'<div class="no-video-container">' +
								'<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
								'<span class="no-video-text">No remote video available</span>' +
							'</div>');
					}
				} else {
					$('#videoremote'+remoteFeed.rfindex+ ' .no-video-container').remove();
					$('#remotevideo'+remoteFeed.rfindex).removeClass('hide').show();
				}
				if(!addButtons)
					return;
				if(Janus.webRTCAdapter.browserDetails.browser === "chrome" || Janus.webRTCAdapter.browserDetails.browser === "firefox" ||
						Janus.webRTCAdapter.browserDetails.browser === "safari") {
					$('#curbitrate'+remoteFeed.rfindex).removeClass('hide').show();
					bitrateTimer[remoteFeed.rfindex] = setInterval(function() {
						// Display updated bitrate, if supported
						var bitrate = remoteFeed.getBitrate();
						$('#curbitrate'+remoteFeed.rfindex).text(bitrate);
						// Check if the resolution changed too
						var width = $("#remotevideo"+remoteFeed.rfindex).get(0).videoWidth;
						var height = $("#remotevideo"+remoteFeed.rfindex).get(0).videoHeight;
						if(width > 0 && height > 0)
							$('#curres'+remoteFeed.rfindex).removeClass('hide').text(width+'x'+height).show();
					}, 1000);
				}
			},
			oncleanup: function() {
				Janus.log(" ::: Got a cleanup notification (remote feed " + id + ") :::");
				if(remoteFeed.spinner)
					remoteFeed.spinner.stop();
				remoteFeed.spinner = null;
				$('#remotevideo'+remoteFeed.rfindex).remove();
				$('#waitingvideo'+remoteFeed.rfindex).remove();
				$('#novideo'+remoteFeed.rfindex).remove();
				$('#curbitrate'+remoteFeed.rfindex).remove();
				$('#curres'+remoteFeed.rfindex).remove();
				if(bitrateTimer[remoteFeed.rfindex])
					clearInterval(bitrateTimer[remoteFeed.rfindex]);
				bitrateTimer[remoteFeed.rfindex] = null;
				remoteFeed.simulcastStarted = false;
				$('#simulcast'+remoteFeed.rfindex).remove();
			}
		});
}

// 去url中的参数
function getQueryStringValue(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// Helpers to create Simulcast-related UI, if enabled
function addSimulcastButtons(feed, temporal) {
	var index = feed;
	$('#remote'+index).parent().append(
		'<div id="simulcast'+index+'" class="btn-group-vertical btn-group-vertical-xs pull-right">' +
		'	<div class"row">' +
		'		<div class="btn-group btn-group-xs" style="width: 100%">' +
		'			<button id="sl'+index+'-2" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to higher quality" style="width: 33%">SL 2</button>' +
		'			<button id="sl'+index+'-1" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to normal quality" style="width: 33%">SL 1</button>' +
		'			<button id="sl'+index+'-0" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to lower quality" style="width: 34%">SL 0</button>' +
		'		</div>' +
		'	</div>' +
		'	<div class"row">' +
		'		<div class="btn-group btn-group-xs hide" style="width: 100%">' +
		'			<button id="tl'+index+'-2" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 2" style="width: 34%">TL 2</button>' +
		'			<button id="tl'+index+'-1" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 1" style="width: 33%">TL 1</button>' +
		'			<button id="tl'+index+'-0" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 0" style="width: 33%">TL 0</button>' +
		'		</div>' +
		'	</div>' +
		'</div>'
	);
	// Enable the simulcast selection buttons
	$('#sl' + index + '-0').removeClass('btn-primary btn-success').addClass('btn-primary')
		.unbind('click').click(function() {
			toastr.info("Switching simulcast substream, wait for it... (lower quality)", null, {timeOut: 2000});
			if(!$('#sl' + index + '-2').hasClass('btn-success'))
				$('#sl' + index + '-2').removeClass('btn-primary btn-info').addClass('btn-primary');
			if(!$('#sl' + index + '-1').hasClass('btn-success'))
				$('#sl' + index + '-1').removeClass('btn-primary btn-info').addClass('btn-primary');
			$('#sl' + index + '-0').removeClass('btn-primary btn-info btn-success').addClass('btn-info');
			feeds[index].send({ message: { request: "configure", substream: 0 }});
		});
	$('#sl' + index + '-1').removeClass('btn-primary btn-success').addClass('btn-primary')
		.unbind('click').click(function() {
			toastr.info("Switching simulcast substream, wait for it... (normal quality)", null, {timeOut: 2000});
			if(!$('#sl' + index + '-2').hasClass('btn-success'))
				$('#sl' + index + '-2').removeClass('btn-primary btn-info').addClass('btn-primary');
			$('#sl' + index + '-1').removeClass('btn-primary btn-info btn-success').addClass('btn-info');
			if(!$('#sl' + index + '-0').hasClass('btn-success'))
				$('#sl' + index + '-0').removeClass('btn-primary btn-info').addClass('btn-primary');
			feeds[index].send({ message: { request: "configure", substream: 1 }});
		});
	$('#sl' + index + '-2').removeClass('btn-primary btn-success').addClass('btn-primary')
		.unbind('click').click(function() {
			toastr.info("Switching simulcast substream, wait for it... (higher quality)", null, {timeOut: 2000});
			$('#sl' + index + '-2').removeClass('btn-primary btn-info btn-success').addClass('btn-info');
			if(!$('#sl' + index + '-1').hasClass('btn-success'))
				$('#sl' + index + '-1').removeClass('btn-primary btn-info').addClass('btn-primary');
			if(!$('#sl' + index + '-0').hasClass('btn-success'))
				$('#sl' + index + '-0').removeClass('btn-primary btn-info').addClass('btn-primary');
			feeds[index].send({ message: { request: "configure", substream: 2 }});
		});
	if(!temporal)	// No temporal layer support
		return;
	$('#tl' + index + '-0').parent().removeClass('hide');
	$('#tl' + index + '-0').removeClass('btn-primary btn-success').addClass('btn-primary')
		.unbind('click').click(function() {
			toastr.info("Capping simulcast temporal layer, wait for it... (lowest FPS)", null, {timeOut: 2000});
			if(!$('#tl' + index + '-2').hasClass('btn-success'))
				$('#tl' + index + '-2').removeClass('btn-primary btn-info').addClass('btn-primary');
			if(!$('#tl' + index + '-1').hasClass('btn-success'))
				$('#tl' + index + '-1').removeClass('btn-primary btn-info').addClass('btn-primary');
			$('#tl' + index + '-0').removeClass('btn-primary btn-info btn-success').addClass('btn-info');
			feeds[index].send({ message: { request: "configure", temporal: 0 }});
		});
	$('#tl' + index + '-1').removeClass('btn-primary btn-success').addClass('btn-primary')
		.unbind('click').click(function() {
			toastr.info("Capping simulcast temporal layer, wait for it... (medium FPS)", null, {timeOut: 2000});
			if(!$('#tl' + index + '-2').hasClass('btn-success'))
				$('#tl' + index + '-2').removeClass('btn-primary btn-info').addClass('btn-primary');
			$('#tl' + index + '-1').removeClass('btn-primary btn-info').addClass('btn-info');
			if(!$('#tl' + index + '-0').hasClass('btn-success'))
				$('#tl' + index + '-0').removeClass('btn-primary btn-info').addClass('btn-primary');
			feeds[index].send({ message: { request: "configure", temporal: 1 }});
		});
	$('#tl' + index + '-2').removeClass('btn-primary btn-success').addClass('btn-primary')
		.unbind('click').click(function() {
			toastr.info("Capping simulcast temporal layer, wait for it... (highest FPS)", null, {timeOut: 2000});
			$('#tl' + index + '-2').removeClass('btn-primary btn-info btn-success').addClass('btn-info');
			if(!$('#tl' + index + '-1').hasClass('btn-success'))
				$('#tl' + index + '-1').removeClass('btn-primary btn-info').addClass('btn-primary');
			if(!$('#tl' + index + '-0').hasClass('btn-success'))
				$('#tl' + index + '-0').removeClass('btn-primary btn-info').addClass('btn-primary');
			feeds[index].send({ message: { request: "configure", temporal: 2 }});
		});
}

function updateSimulcastButtons(feed, substream, temporal) {
	// Check the substream
	var index = feed;
	if(substream === 0) {
		toastr.success("Switched simulcast substream! (lower quality)", null, {timeOut: 2000});
		$('#sl' + index + '-2').removeClass('btn-primary btn-success').addClass('btn-primary');
		$('#sl' + index + '-1').removeClass('btn-primary btn-success').addClass('btn-primary');
		$('#sl' + index + '-0').removeClass('btn-primary btn-info btn-success').addClass('btn-success');
	} else if(substream === 1) {
		toastr.success("Switched simulcast substream! (normal quality)", null, {timeOut: 2000});
		$('#sl' + index + '-2').removeClass('btn-primary btn-success').addClass('btn-primary');
		$('#sl' + index + '-1').removeClass('btn-primary btn-info btn-success').addClass('btn-success');
		$('#sl' + index + '-0').removeClass('btn-primary btn-success').addClass('btn-primary');
	} else if(substream === 2) {
		toastr.success("Switched simulcast substream! (higher quality)", null, {timeOut: 2000});
		$('#sl' + index + '-2').removeClass('btn-primary btn-info btn-success').addClass('btn-success');
		$('#sl' + index + '-1').removeClass('btn-primary btn-success').addClass('btn-primary');
		$('#sl' + index + '-0').removeClass('btn-primary btn-success').addClass('btn-primary');
	}
	// Check the temporal layer
	if(temporal === 0) {
		toastr.success("Capped simulcast temporal layer! (lowest FPS)", null, {timeOut: 2000});
		$('#tl' + index + '-2').removeClass('btn-primary btn-success').addClass('btn-primary');
		$('#tl' + index + '-1').removeClass('btn-primary btn-success').addClass('btn-primary');
		$('#tl' + index + '-0').removeClass('btn-primary btn-info btn-success').addClass('btn-success');
	} else if(temporal === 1) {
		toastr.success("Capped simulcast temporal layer! (medium FPS)", null, {timeOut: 2000});
		$('#tl' + index + '-2').removeClass('btn-primary btn-success').addClass('btn-primary');
		$('#tl' + index + '-1').removeClass('btn-primary btn-info btn-success').addClass('btn-success');
		$('#tl' + index + '-0').removeClass('btn-primary btn-success').addClass('btn-primary');
	} else if(temporal === 2) {
		toastr.success("Capped simulcast temporal layer! (highest FPS)", null, {timeOut: 2000});
		$('#tl' + index + '-2').removeClass('btn-primary btn-info btn-success').addClass('btn-success');
		$('#tl' + index + '-1').removeClass('btn-primary btn-success').addClass('btn-primary');
		$('#tl' + index + '-0').removeClass('btn-primary btn-success').addClass('btn-primary');
	}
}
