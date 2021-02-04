package lzq.user;

import com.lzq.bean.user.User;
import com.lzq.service.user.UserService;
import lzq.BaseTest;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * @ClassName: UserCRUDTest
 * @Author: 中都
 * @Date: 2021/2/1 11:40
 * @Description: TODO
 */
//测试用户的增删改查功能
public class UserCRUDTest extends BaseTest {
    @Autowired
    private UserService userService;

    @Test
    //添加新用户
    public void createUser() {
        User user = new User();
        user.setName("test");
        user.setEmail("lzq@qq.com");
        user.setPassword("123456");
        userService.userRegister(user);
    }
    //✓

    //@DataBaseTest
    //修改用户信息 --- 修改用户密码
    public void updatePasswordUser() {
        userService.updateUserPassword("lzq@qq.com","436280");
    }
    //✓

    //@DataBaseTest
    //修改用户信息 --- 修改用户信息，邮箱修改、头像修改、简介修改
    public void updateUserMsg() {
        //userService.updateUserMsg(15,"lzq-zd@qq.com","/c/lzq","无奇不有");
        userService.updateUserMsg(15,"lzq@qq.com",null,null);
    }
    //✓

    //@DataBaseTest
    //查询用户信息
    public void readUser() {
        User user = userService.getUserPassNameOrEmailAndPassword(null, "test", null, null);
        if(user != null) {
            System.out.println(user.getName() + " " + user.getHeadPortrait());
        }else {
            System.out.println("不存在");
        }
    }
    //✓

}
