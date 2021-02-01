package com.lzq.util.file;

import com.lzq.bean.user.User;
import com.lzq.service.user.UserService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.IOException;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * @ClassName: FileDispose
 * @Author: 中都
 * @Date: 2020/11/10 20:43
 * @Description: 文件处理，主要是用户头像的上传处理
 */
@RequestMapping(value = "/file")
@Controller
public class FileDispose {
    private static final Logger logger = LogManager.getLogger(FileDispose.class);

    @Autowired
    private UserService userService;


    @RequestMapping("/headPhoto")
    @ResponseBody
    //上传头像
    public String headPhoto(MultipartFile file, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if(user == null) {
            return "用户未登录，无法获取用户信息";
        }
        String path = "F:\\videoConference/headPhoto/";
        //按照月份进行分类：
        Calendar instance = Calendar.getInstance();
        String month = String.valueOf(instance.get(Calendar.MONTH) + 1);
        path += month;

        File realPath = new File(path+"/");
        if (!realPath.exists()){
            realPath.mkdirs();
        }

        //上传文件地址
        logger.info("上传头像保存地址："+realPath);
        //解决文件名字问题：我们使用uuid;
        String filename = "pg-"+ UUID.randomUUID().toString().replaceAll("-", "")+".png";
        File newfile = new File(realPath, filename);

        //相对路径
        String headPortrait = "/headPhoto/"+month+"/"+ filename;

        //通过CommonsMultipartFile的方法直接写文件（注意这个时候）
        try {
            file.transferTo(newfile);
            Integer i = userService.updateUserMsg(user.getId(), null,headPortrait, null);
            if(i > 0) {
                logger.info(realPath+filename+"上传成功");
                user.setHeadPortrait(headPortrait);
                session.setAttribute("user",user);
                return "ok";
            }else {
                return "用户数据异常，无法更新";
            }
        } catch (IOException e) {
            //给editormd进行回调
            logger.error(realPath+filename+"上传失败");
            return "上传文件失败";
        }
    }
}
