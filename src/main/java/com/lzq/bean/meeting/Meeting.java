package com.lzq.bean.meeting;

import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * @ClassName: Meeting
 * @Author: 中都
 * @Date: 2021/2/17 13:59
 * @Description: 会议信息
 */
public class Meeting {
    private Integer id;   //房间号
    private String presider;  //会议主持者，发起人
    private String remark;    //会议内容备注
    private String dateTime;  //发起时间
    private Integer flag;   //标记房间是否已被使用

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getFlag() {
        return flag;
    }

    public void setFlag(Integer flag) {
        this.flag = flag;
    }

    public String getPresider() {
        return presider;
    }

    public void setPresider(String presider) {
        this.presider = presider;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public String getDateTime() {
        return dateTime;
    }

    public void setDateTime(String dateTime) {
        this.dateTime = dateTime;
    }

}
