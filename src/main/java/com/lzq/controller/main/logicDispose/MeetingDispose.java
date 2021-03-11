package com.lzq.controller.main.logicDispose;

import com.lzq.bean.meeting.Meeting;
import com.lzq.bean.user.User;
import com.lzq.service.main.janus.MeetingService;
import com.lzq.util.randomNumber.RandomNumber;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @ClassName: MeetingDispose
 * @Author: 中都
 * @Date: 2021/2/17 10:29
 * @Description: 视频会议相关处理
 */
@RequestMapping(value = "/meeting")
@Controller
public class MeetingDispose {
    @Autowired
    private RedisTemplate<String,String> redisTemplate;

    @Autowired
    private MeetingService meetingService;

    private static final Logger logger = LogManager.getLogger(MainPageLoginDispose.class);

    //创建房间,能到后端必然前端已经判断登录了
    @RequestMapping(value = "/createRoom")
    @ResponseBody
    public Map<String,Object> createRoom(HttpSession session,String remark) {
        Map<String,Object> hashmap = new HashMap<>();
        User user = (User) session.getAttribute("user");
        if(user == null) {
            hashmap.put("flag",false);
            hashmap.put("msg","服务端无法获取你的会话信息，请验证是否已经登录或登录已过期");
            return hashmap;
        }
        try {
            //找到一个未被使用的房间号
            Meeting meeting = null;
            List<Meeting> list = meetingService.getUnFlagMetings();
            for (Meeting m : list) {
                if (m.getFlag() == 0) {
                    meeting = m;
                    break;
                }
            }
            if (meeting == null) {
                hashmap.put("flag", false);
                hashmap.put("msg","服务端繁忙，创建房间数已达上限，为防止服务器过载，请稍后再试");
                return hashmap;
            }
            meeting.setFlag(1);
            meeting.setRemark(remark);
            meeting.setPresider(user.getName());
            //修改这个会议房间信息
            meetingService.updateMeeting(meeting);
            //存储到redis
            redisTemplate.opsForValue().set(String.valueOf(meeting.getId()), "1");
            hashmap.put("flag", true);
            hashmap.put("msg", meeting);
            logger.info(user.getName() + "创建视频会议房间成功" + meeting.getId() + "备注 " + remark);
            return hashmap;
        }catch (Exception e) {
            hashmap.put("flag", false);
            hashmap.put("msg","数据库操作异常");
            logger.error(user.getName() + "创建视频会议房间失败 备注 " + remark);
            return hashmap;
        }
    }

    //添加到会议房间
    @RequestMapping(value = "/addRoom")
    @ResponseBody
    public Map<String,Object> addRoom(HttpSession session,String roomId) {
        Map<String,Object> hashmap = new HashMap<>();
        User user = (User) session.getAttribute("user");
        if(user == null) {
            hashmap.put("flag",false);
            hashmap.put("msg","服务端无法获取你的会话信息，请验证是否已经登录或登录已过期");
            return hashmap;
        }
        String houseOwner = redisTemplate.opsForValue().get(roomId);
        if(houseOwner == null) {
            //房间已经被销毁或者房间号错误
            hashmap.put("flag",false);
            hashmap.put("msg","该房间已经被销毁或者输入的房间号不存在！");
            logger.info(user.getName()+"加入房间"+roomId+"失败，该房间已经被销毁或者输入的房间号不存在！");
        }else {
            Meeting meeting1 = meetingService.getMeeting(Integer.valueOf(roomId));
            if(meeting1.getFlag() == 0) {
                hashmap.put("flag",false);
                hashmap.put("msg","该房间已经被销毁或者输入的房间号不存在！");
                logger.info(user.getName()+"加入房间"+roomId+"失败，该房间已经被销毁或者输入的房间号不存在！");
                return hashmap;
            }
            int x = Integer.valueOf(houseOwner)+1;
            redisTemplate.opsForValue().set(roomId, String.valueOf(x));
            try {
                Meeting meeting = meetingService.getMeeting(Integer.valueOf(roomId));
                hashmap.put("flag",true);
                hashmap.put("msg",meeting);
                logger.info(user.getName()+"加入房间"+roomId+"成功");
            }catch (Exception e) {
                hashmap.put("flag", false);
                hashmap.put("msg","数据库操作异常");
                logger.error(user.getName() + "加入视频会议房间失败 备注 ");
                return hashmap;
            }
        }
        return hashmap;
    }

    //离开房间事件处理
    @RequestMapping(value = "/leaveRoom",produces = {"text/plain;charset=UTF-8"})
    @ResponseBody
    public String leaveRoom(HttpSession session,String roomId) {
        User user = (User) session.getAttribute("user");
        if(user == null) {
            return "服务端无法获取你的会话信息，请验证是否已经登录或登录已过期";
        }
        String s = redisTemplate.opsForValue().get(roomId);
        int x = Integer.valueOf(s)-1; //走一个
        if(x == 0) {
            //这个房间已经没人了，修改数据库对应房间标记位
            Meeting meeting = new Meeting();
            meeting.setId(Integer.valueOf(roomId));
            meeting.setFlag(0);
            meetingService.updateMeeting(meeting);
            logger.info("销毁房间"+roomId);
            return "ok";
        }else {
            redisTemplate.opsForValue().set(roomId, String.valueOf(x));
            return "数据库修改失败";
        }
    }

}
