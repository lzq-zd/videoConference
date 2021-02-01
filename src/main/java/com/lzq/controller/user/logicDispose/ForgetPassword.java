package com.lzq.controller.user.logicDispose;

import com.lzq.service.user.UserService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * @ClassName: ForgetPassword
 * @Author: 中都
 * @Date: 2020/11/4 00:08
 * @Description: 修改密码（忘记密码）
 */
@RequestMapping(value = "/user")
@Controller
public class ForgetPassword {
    @Autowired
    private UserService userService;
    @Autowired
    private RedisTemplate<String,String> redisTemplate;

    private static final Logger logger = LogManager.getLogger(ForgetPassword.class);

    //修改密码
    @RequestMapping(value = "/forgetPasswordDispose",produces = {"text/plain;charset=UTF-8"})
    @ResponseBody
    public String judgeUserName(String email,String password,String code) {
        //首先判断验证码
        if(!code.equals(redisTemplate.opsForValue().get(email))) {
            return "code error";
        }
        String msg = "ok";
        try {
            int num = userService.updateUserPassword(email, password);
            if (num == 0) {
                msg = "数据库操作失败";
            }
        }catch (Exception e) {
            logger.error(email+"\t忘记密码-修改密码操作,数据库操作异常");
            msg = "数据库操作异常";
        }
        logger.info(email+"\t忘记密码-修改密码操作"+msg);
        return msg;
    }
}
