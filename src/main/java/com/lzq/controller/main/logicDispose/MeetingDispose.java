package com.lzq.controller.main.logicDispose;

import com.lzq.bean.meeting.Meeting;
import com.lzq.bean.user.User;
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
        //生成随机房间号
        String roomId = RandomNumber.generateShortUuid();
        //存储到redis
        redisTemplate.opsForValue().set(roomId,user.getName());
        hashmap.put("flag",true);
        Meeting meeting = new Meeting(user.getName(),remark);
        hashmap.put("msg",meeting);
        logger.info(user.getName()+"创建视频会议房间成功"+roomId+"备注 "+remark);
        return hashmap;
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
            hashmap.put("flag",true);
            hashmap.put("msg","欢迎加入由 ["+houseOwner+"] 创建的会议房间 ("+roomId+")");
            logger.info(user.getName()+"加入房间"+roomId+"成功");
        }
        return hashmap;
    }
}
