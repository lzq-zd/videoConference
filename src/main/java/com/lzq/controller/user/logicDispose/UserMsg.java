package com.lzq.controller.user.logicDispose;

import com.lzq.bean.user.User;
import com.lzq.service.user.UserService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.*;
import java.util.HashMap;
import java.util.Map;

/**
 * @ClassName: UserMsg
 * @Author: 中都
 * @Date: 2020/11/28 21:34
 * @Description: 用户信息处理
 */
@RequestMapping(value = "/user")
@Controller
public class UserMsg {
    @Autowired
    private UserService userService;

    @Autowired
    private RedisTemplate<String,String> redisTemplate;

    private static final Logger logger = LogManager.getLogger(UserMsg.class);

    //获取用户头像
    @RequestMapping(value = "/getHeadPhoto")
    @ResponseBody
    public Map<String,Object> getHeadPhoto(HttpServletResponse response, HttpSession session) {
        User user = (User) session.getAttribute("user");
        Map<String,Object> hashmap = new HashMap<>();
        if(user == null) {
            hashmap.put("success","用户未登录");
            return hashmap;
        }
        String pathRoot = "F:/liveAndStudy";
        String path = user.getHeadPortrait();
        path = pathRoot+path;
        try {
            logger.info(user.getName()+"上传头像"+path);
            File file = new File(path);
            if(!file.exists()) {
                //文件不存在，直接跳出
                hashmap.put("success","文件不存在");
                return hashmap;
            }
            InputStream in = new FileInputStream(file);
            OutputStream out = new BufferedOutputStream(response.getOutputStream());
            byte[] buff = new byte[1024];
            int n;
            while ((n = in.read(buff)) != -1) {
                out.write(buff,0,n);
            }
            in.close();
            out.close();
            hashmap.put("success","ok");
            return hashmap;
        } catch (Exception e) {
            logger.error(user.getName()+"上传头像失败");
            hashmap.put("success","error");
            return hashmap;
        }
    }

    @RequestMapping(value = "/updateIntro")
    @ResponseBody
    //修改用户简介
    public String updateIntro(String intro,HttpSession session) {
        User user = (User) session.getAttribute("user");
        if(user == null) {
            return "用户未登录，无法获取用户信息";
        }
        try {
            logger.info(user.getName()+"修改个人签名");
            Integer i = userService.updateUserMsg(user.getId(),null, null, intro);
            if(i > 0) {
                user.setIntro(intro);
                //更新会话中用户信息
                session.setAttribute("user",user);
                return "ok";
            }else {
                return "用户数据信息错误";
            }
        }catch (Exception e) {
            logger.error(user.getName()+"修改个人签名失败，数据库操作异常");
            return "修改个人签名失败，数据库操作异常";
        }
    }


    @RequestMapping(value = "/getMyMsg")
    @ResponseBody
    //获取用户自己的信息
    public Map<String,Object> getMyMsg(HttpSession session) {
        User user = (User) session.getAttribute("user");
        Map<String,Object> hashmap = new HashMap<>();
        if(user == null) {
            hashmap.put("success", "用户未登录，无法获取用户信息");
            return hashmap;
        }
        hashmap.put("success","ok");
        hashmap.put("user",user);
        return hashmap;
    }


    @RequestMapping(value = "/updateEmail")
    @ResponseBody
    //修改邮箱
    public String updateEmail(String oldEmail,String email,String code,HttpSession session) {
        User user = (User) session.getAttribute("user");
        if(user == null) {
            return "用户未登录，无法获取用户信息";
        }
        //判断验证码
        if(!code.equals(redisTemplate.opsForValue().get(oldEmail))) {
            return "code error";
        }
        try {
            logger.info(user.getName()+"修改邮箱");
            Integer i = userService.updateUserMsg(user.getId(),email, null, null);
            if(i > 0) {
                user.setEmail(email);
                //更新会话中用户信息
                session.setAttribute("user",user);
                return "ok";
            }else {
                return "用户数据信息错误";
            }
        }catch (Exception e) {
            logger.error(user.getName()+"修改邮箱失败，数据库操作异常");
            return "修改邮箱失败，数据库操作异常";
        }
    }
}
