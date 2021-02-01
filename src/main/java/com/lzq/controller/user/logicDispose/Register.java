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

import javax.servlet.http.HttpSession;

/**
 * @ClassName: UserRegister
 * @Author: 中都
 * @Date: 2020/11/2 02:53
 * @Description: 注册
 */
@RequestMapping(value = "/register")
@Controller
public class Register {
    @Autowired
    private UserService userService;
    @Autowired
    private RedisTemplate<String,String> redisTemplate;

    private static final Logger logger = LogManager.getLogger(Register.class);

    //注册新用户
    @RequestMapping(value = "/userRegister",produces = {"text/plain;charset=UTF-8"})
    @ResponseBody
    public String judgeUserName(String name, String email, String password, String code, HttpSession session) {
        //首先判断验证码
        if(!code.equals(redisTemplate.opsForValue().get(email))) {
            return "code error";
        }
        User user = new User(name,email,password);
        String msg = "ok";
        try {
            Integer num = userService.userRegister(user);
            if(num == null) {
                msg = "error";
            }else {
                //注册成功
                session.setAttribute("user",user);
            }
        }catch (Exception e){
            logger.error(name+"\t"+email+"\t"+"注册操作，数据库操作异常");
            msg = "数据库操作异常";
        }
        logger.info("注册操作"+msg);
        return msg;
    }
}

