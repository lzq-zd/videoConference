package com.lzq.dao.user;

import com.lzq.bean.user.User;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

public interface UserDao {
    //通过 用户名 邮箱 密码查询
    public User getUserPassNameOrEmailAndPassword(@Param("id")Integer id, @Param("name")String name, @Param("email")String email, @Param("password")String password);

    //注册用户信息
    public Integer userRegister(@Param("user")User user);

    //修改用户密码
    @Update("update user set password=#{password} where email=#{email}")
    public Integer updateUserPassword(@Param("email")String email, @Param("password")String password);

    //修改用户个人信息
    public Integer updateUserMsg(@Param("id")Integer id,@Param("email")String email,@Param("headPortrait")String headPortrait,@Param("intro")String intro);

}
