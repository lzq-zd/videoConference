package com.lzq.controller.user.logicDispose;

import com.lzq.bean.user.User;
import com.lzq.service.user.UserService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * @ClassName: Login
 * @Author: 中都
 * @Date: 2020/10/31 19:40
 * @Description: 登录处理相关
 */
@RequestMapping(value = "/login")
@Controller
public class Login {
    @Autowired
    private UserService userService;

    private static final Logger logger = LogManager.getLogger(Login.class);

    //用来在登录、注册的时候动态判定用户名、邮箱的正确性
    @RequestMapping(value = "/judgeUserNameOrEmail",produces = {"text/plain;charset=UTF-8"})
    @ResponseBody
    public String judgeUserName(String nameOrEmail,String type) {
        String msg = "";
        if("email".equals(type)) {
            try {
                User user = userService.getUserPassNameOrEmailAndPassword(null,null, nameOrEmail, null);
                //已经有这个信息
                if(user != null) {
                    msg = "ok";
                } else {
                    msg = "不存在该邮箱！";
                }
            }catch (Exception e) {
                logger.error(nameOrEmail+" Ajax异步登录判定操作，数据获取异常");
                msg = "数据获取异常";
            }
        }else {
            try {
                User user = userService.getUserPassNameOrEmailAndPassword(null,nameOrEmail,null,null);
                if (user != null) {
                    msg = "ok";
                } else {
                    msg = "不存在该用户名！";
                }
            }catch (Exception e) {
                logger.error(nameOrEmail+"Ajax异步登录判定操作，数据获取异常");
                msg = "数据获取异常";
            }
        }
        logger.info(nameOrEmail+"\t Ajax异步登录判定操作\t"+msg);
        return msg;
    }

    //登录判断以及记住密码
    @RequestMapping(value = "/judgeUserNameOrEmailAndPassword",produces = {"text/plain;charset=UTF-8"})
    @ResponseBody
    public String judgeUserName(String nameOrEmail, String type, String password, boolean rememberMe,
                                HttpSession session,HttpServletResponse response) {
        String msg = "账户密码不匹配";
        User user = null;
        if("email".equals(type)) {
            try {
                user = userService.getUserPassNameOrEmailAndPassword(null,null, nameOrEmail, password);
            }catch (Exception e) {
                logger.error("登录操作，数据获取异常");
                msg = "数据获取异常";
            }
        }else {
            try {
                user = userService.getUserPassNameOrEmailAndPassword(null,nameOrEmail, null, password);
            }catch (Exception e) {
                logger.error("登录操作，数据获取异常");
                msg = "数据获取异常";
            }
        }
        //已经有这个信息，并且到这意味着信息匹配
        if (user != null) {
            session.setAttribute("user",user);
            msg = "ok";
            //处理记住我
            if(rememberMe) {
                //创建Cookie对象
                Cookie cookie1 = new Cookie("lzq-zd-username",user.getName());
                Cookie cookie2 = new Cookie("lzq-zd-password",user.getPassword());
                //设置有效时间   14天 60*60*24*14
                cookie1.setMaxAge(60*60*24*7);
                cookie2.setMaxAge(60*60*24*7);
                cookie1.setPath("/");
                cookie2.setPath("/");
                //发送Cookie给浏览器
                response.addCookie(cookie1);
                response.addCookie(cookie2);
                logger.info("登录操作，添加cookie");
            }
        }
        logger.info(nameOrEmail+"\t登录操作\t"+msg);
        return msg;
    }

}
