package com.lzq.service.user;

import com.lzq.bean.user.User;

public interface UserService {
    public User getUserPassNameOrEmailAndPassword(Integer id, String name, String email, String password);

    public Integer userRegister(User user);

    public Integer updateUserPassword(String email,String password);

    public Integer updateUserMsg(Integer id,String email,String headPortrait,String intro);

}
