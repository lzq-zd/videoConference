package com.lzq.service.user.impl;

import com.lzq.bean.user.User;
import com.lzq.dao.user.UserDao;
import com.lzq.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * @ClassName: UserServiceImpl
 * @Author: 中都
 * @Date: 2021/2/1 11:21
 * @Description: TODO
 */
@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserDao userDao;

    @Override
    public User getUserPassNameOrEmailAndPassword(Integer id,String name, String email, String password) {
        return userDao.getUserPassNameOrEmailAndPassword(id,name,email,password);
    }

    @Override
    public Integer userRegister(User user) {
        //注册的新用户
        return userDao.userRegister(user);
    }

    @Override
    public Integer updateUserPassword(String email, String password) {
        return userDao.updateUserPassword(email,password);
    }

    @Override
    public Integer updateUserMsg(Integer id,String email, String headPortrait, String intro) {
        return userDao.updateUserMsg(id,email,headPortrait,intro);
    }
}
