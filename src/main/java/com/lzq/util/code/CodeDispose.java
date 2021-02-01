package com.lzq.util.code;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpSession;

/**
 * @ClassName: CodeDispose
 * @Author: 中都
 * @Date: 2020/11/4 00:34
 * @Description: 验证用户输入的验证码是否与服务器发送的相匹配，这个是图片上的那个验证码，用户登录注册时使用
 */
@Controller
public class CodeDispose {
    //验证用户输入的验证码是否正确
    @RequestMapping(value = "/verification",produces = {"text/plain;charset=UTF-8"},method=RequestMethod.GET)
    @ResponseBody
    public String verificationCode(String code,HttpSession session) {
        Object result = session.getAttribute("verifyCodeValue");
        String str = (String)result;
        if(str.toLowerCase().equals(code.toLowerCase())) {
            return "ok";
        }else {
            return "验证码不匹配";
        }
    }
}
