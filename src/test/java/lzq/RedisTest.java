package lzq;

import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import redis.clients.jedis.*;

import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * @ClassName: RedisTest
 * @Author: 中都
 * @Date: 2021/2/1 12:23
 * @Description: TODO
 */
public class RedisTest extends BaseTest{
    @Autowired
    private JedisPool jedisPool;

    @Autowired
    private RedisTemplate<String,String> redisTemplate;


    //@Test
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

    @Test
    public void test() {
        redisTemplate.opsForValue().set("lzq-zd23451","lzq-zd",10,TimeUnit.SECONDS);
        //redisTemplate.opsForValue().set("lzq-zd23451","lzq-zd",10,TimeUnit.MINUTES); //将用户名和验证码放在Redis里面
        String roomName = redisTemplate.opsForValue().get("lzq-zd23451");
        if(roomName != null) {
            System.out.println(roomName);
            /*try {
                Thread.sleep(10000);
                roomName = redisTemplate.opsForValue().get("lzq-zd23451");
                if(roomName == null) {
                    System.out.println("没有数据");
                }else {
                    System.out.println(roomName);
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }*/
        }
    }

    /*
    //测试远程redis
    private static ShardedJedisPool pool;

    static {
        JedisPoolConfig config = new JedisPoolConfig();
        config.setMaxTotal(100);
        config.setMaxIdle(50);
        config.setMaxWaitMillis(3000);
        config.setTestOnBorrow(true);
        config.setTestOnReturn(true);
        JedisShardInfo jedisShardInfo1 = new JedisShardInfo("121.5.158.187", 6379);
        jedisShardInfo1.setPassword("lzq436280");
        List<JedisShardInfo> list = new LinkedList<JedisShardInfo>();
        list.add(jedisShardInfo1);
        pool = new ShardedJedisPool(config, list);
    }

    public static void main(String[] args) {
        ShardedJedis jedis = pool.getResource();
        jedis.set("ss","hello");
        jedis.set("myname","world");
        System.out.println(jedis.get("ss"));
        System.out.println(jedis.get("myname"));
    }
    // ✓
    */
}
