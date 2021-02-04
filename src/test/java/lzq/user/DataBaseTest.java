package lzq.user;

import org.junit.Test;

import java.sql.*;

/**
 * @ClassName: DataBaseTest
 * @Author: 中都
 * @Date: 2021/2/4 15:32
 * @Description: 阿里云数据库连接测试
 */
public class DataBaseTest {
    @Test
    public void test() {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            String url = "jdbc:mysql://rm-bp194as93dzh6qnc32o.mysql.rds.aliyuncs.com:3306/video_conference";
            Connection connection = DriverManager.getConnection(url, "lzq_root", "Lzq436280");
            System.out.println("连接成功......");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
    //✓

}
