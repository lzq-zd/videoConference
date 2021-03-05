package lzq;

import org.junit.Test;

import java.io.*;

/**
 * @ClassName: FileTest
 * @Author: 中都
 * @Date: 2021/2/24 16:47
 * @Description: TODO
 */
public class FileTest {
    @Test
    public void textFile(){
        StringBuilder stringBuilder = new StringBuilder();
        //String roomId = RandomNumber.generateShortUuid();
        String s1 = "room-"+8517+":"+" {\n";
        stringBuilder.append(s1);
        String s2 = "  description = "+"学习\n";
        String s3 = "  publishers = "+"6\n";
        String s4 = "  bitrate = "+"128000\n";
        String s5 = "  fir_freq = "+"10\n";
        String s6 = "  record = "+"false\n}\n";
        stringBuilder.append(s2);
        stringBuilder.append(s3);
        stringBuilder.append(s4);
        stringBuilder.append(s5);
        stringBuilder.append(s6);
        String s = stringBuilder.toString();
        System.out.println(s);
        File file = new File("/opt/janus/etc/janus/janus.plugin.videoroom.jcfg");
        //File file = new File("C:\\Users\\admin\\Desktop\\text.txt");
        FileWriter fw = null;
        BufferedWriter bufferedWriter = null;
        try {
            fw = new FileWriter(file,true);//true代表追加写入内容至文件末尾
            bufferedWriter = new BufferedWriter(fw);
            bufferedWriter.write(s);
            bufferedWriter.flush();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }finally {
            if(fw != null && bufferedWriter != null) {
                try {
                    bufferedWriter.close();
                    fw.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
