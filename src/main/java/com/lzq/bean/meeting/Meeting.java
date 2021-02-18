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
    private String url;
    private String presider;  //会议主持者，发起人
    private String remark;    //会议内容备注
    private String dateTime;  //发起时间

    public Meeting(String presider, String remark) {
        this.presider = presider;
        this.remark = remark;
        this.url = "https://www.lzq-zd.top";
        Date dNow = new Date( );
        SimpleDateFormat ft = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        this.dateTime = ft.format(dNow);
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
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
