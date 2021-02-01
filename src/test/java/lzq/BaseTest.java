package lzq;

import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

/**
 * @ClassName: BaseTest
 * @Author: 中都
 * @Date: 2021/2/1 11:39
 * @Description: TODO
 */
@RunWith(SpringJUnit4ClassRunner.class)
// 告诉junit spring配置文件的位置
@ContextConfiguration({ "classpath:database/mybatis.xml", "classpath:spring/spring.xml",
        "classpath:spring/spring-web.xml" })
public class BaseTest {
}
