package com.lzq.controller.user;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * @ClassName: UserPageDispose
 * @Author: 中都
 * @Date: 2021/2/1 12:50
 * @Description: TODO
 */
@RequestMapping(value = "/user")
@Controller
public class UserPageDispose {
    //登录
    @RequestMapping(value = "/login")
    public String login() {
        return "user/login";
    }

    //注册
    @RequestMapping(value = "/register")
    public String register() {
        return "user/register";
    }

    //忘记密码
    @RequestMapping(value = "/forgetPassword")
    public String forgetPassword() {
        return "user/forgetPassword";
    }

    //修改用户信息
    @RequestMapping(value = "/updateUserMsg")
    public String updateUserMes() {
        return "user/perfect";
    }
}
