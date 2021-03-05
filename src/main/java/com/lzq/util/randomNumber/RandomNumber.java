package com.lzq.util.randomNumber;

import java.util.Random;
import java.util.UUID;

/**
 * @ClassName: RandomNumber
 * @Author: 中都
 * @Date: 2021/2/17 13:43
 * @Description: 生成随机数
 */
public class RandomNumber {
    private static Random random = new Random();

    //生成随机字符串，视频会议房间号
    public static String generateShortUuid() {
        int roomId = random.nextInt(8999)+1000;
        return String.valueOf(roomId);
    }

    public static void main(String[] args) {
        System.out.println(generateShortUuid());
    }
}
