package com.lzq.controller.main;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * @ClassName: MainPageDispose
 * @Author: 中都
 * @Date: 2021/2/1 18:20
 * @Description: TODO
 */
@RequestMapping(value = "/mainPage")
@Controller
public class MainPageDispose {
    //主页
    @RequestMapping(value = "/index")
    public String login() {
        return "main/main";
    }

}
