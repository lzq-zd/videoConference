package com.lzq.controller.main.logicDispose;

import com.lzq.bean.user.User;
import com.lzq.service.user.UserService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

/**
 * @ClassName: mainPageLoginDispose
 * @Author: 中都
 * @Date: 2020/11/8 19:11
 * @Description: 主页关于用户登录的处理
 */
@RequestMapping(value = "/mainPageLogin")
@Controller
public class MainPageLoginDispose {
    @Autowired
    private UserService userService;

    private static final Logger logger = LogManager.getLogger(MainPageLoginDispose.class);

    //cookie 登录判断
    @RequestMapping(value = "/getUserLoginCookie")
    @ResponseBody
    public Map<String,Object> getUserLoginCookie(HttpSession session, HttpServletRequest request) {
        HashMap<String,Object> hashMap = new HashMap<>();
        Cookie []cookies = request.getCookies();
        String userName = "";
        String userPassword = "";
        for(Cookie cookie:cookies) {
            String cookieName = cookie.getName();
            String cookieValue = cookie.getValue();
            if("lzq-zd-username".equals(cookieName)) {
                userName = cookieValue;
            }else if("lzq-zd-password".equals(cookieName)) {
                userPassword = cookieValue;
            }
        }
        User user = userService.getUserPassNameOrEmailAndPassword(null,userName,null,userPassword);
        if(user == null) {
            logger.info("cookie获取失败");
            //cookie不存在，那么看看刚刚用户是否登录
            user = (User)(session.getAttribute("user"));
        }else {
            logger.info("cookie获取成功");
            session.setAttribute("user",user);
        }
        String msg = "还未登录？点击登录/注册";
        boolean flag = false;
        if (user != null) {
            flag = true;
            msg = "hi\t"+user.getName();
        }
        hashMap.put("msg",msg);
        hashMap.put("flag",flag);
        return hashMap;
    }
}
