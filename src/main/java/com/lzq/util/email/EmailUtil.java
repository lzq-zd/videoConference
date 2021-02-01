package com.lzq.util.email;

import org.apache.commons.mail.EmailException;
import org.apache.commons.mail.SimpleEmail;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Random;
import java.util.concurrent.TimeUnit;

/**
 * @ClassName: EmailUtil
 * @Author: 中都
 * @Date: 2020/11/6 05:41
 * @Description: 发送验证码给邮箱，这个是邮箱收到的验证码，用于修改密码时使用
 */
@RequestMapping(value = "/email")
@Controller
public class EmailUtil {
    @Autowired
    private RedisTemplate<String,String> redisTemplate;

    private Random random = new Random();

    private static final Logger logger = LogManager.getLogger(EmailUtil.class);

    @RequestMapping(value = "code",produces = {"text/plain;charset=UTF-8"})
    @ResponseBody
    //发送验证码
    public String emailSendCode(String email){
        String msg = "ok";
        try {
            disposeVerificationCode(email);
        } catch (EmailException e) {
            logger.error(email+"验证码发送异常");
            msg = "验证码发送异常";
        }
        return msg;
    }


    /**
     * 发送和记录验证码主方法
     * @param uemail
     */
    public void disposeVerificationCode(String uemail) throws EmailException {
        SimpleEmail email = new SimpleEmail();
        email.setHostName("smtp.163.com");//邮件服务器
        int x = random.nextInt(899999)+100000;

        String code = String.valueOf(x);  //验证码

        logger.info("发送验证码 "+x+" 给用户 "+uemail);
        email.setAuthentication("lzq_zd@163.com", "lzq436280");//邮件登录用户名及授权码
        email.setSSLOnConnect(true);
        email.setSubject("用户忘记密码");//主题名称
        email.setCharset("UTF-8");//设置字符集编码

        email.setFrom("lzq_zd@163.com", "生活学习网");//发送方邮箱、发送方名称
        String str = "你的验证码为 " + x + ",请在10分钟内使用！";
        email.setMsg(String.valueOf(str));//发送内容
        email.addTo(String.valueOf(uemail));//接收方邮箱
        email.send();//发送方法
        redisTemplate.opsForValue().set(uemail,code,10,TimeUnit.MINUTES); //将用户名和验证码放在Redis里面
    }

    /*public static void main(String[] args) {
        EmailUtil util = new EmailUtil();
        System.out.println(util.disposeVerificationCode("2899349953@qq.com"));
        util.redisTemplate.opsForValue().set("2899349953@qq.com","12536",10,TimeUnit.MINUTES); //将用户名和验证码放在Redis里面
    }*/
}
