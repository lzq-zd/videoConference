package lzq;

import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

/**
 * @ClassName: RedisTest
 * @Author: 中都
 * @Date: 2021/2/1 12:23
 * @Description: TODO
 */
public class RedisTest extends BaseTest{
    @Autowired
    private JedisPool jedisPool;

    @Test
    //测试redis
    public void redisTest() {
        Jedis jedis = jedisPool.getResource();
        Jedis jedis2 = jedisPool.getResource();
        jedis.set("李正全","2899349953@qq.com");
        jedis.expire("李正全",1);
        System.out.println(jedis.get("李正全"));
        System.out.println(jedis2.get("李正全"));
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println(jedis.get("李正全"));
        System.out.println(jedis2.get("李正全"));
    }
    //✓
}
