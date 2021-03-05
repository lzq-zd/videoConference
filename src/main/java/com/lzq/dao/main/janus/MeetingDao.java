package com.lzq.dao.main.janus;

import com.lzq.bean.meeting.Meeting;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface MeetingDao {
    //查找未被占用的房间
    public List<Meeting> getUnFlagMetings();
    //选中房间后，需要修改房间信息
    public Integer updateMeeting(@Param("meeting")Meeting meeting);
    //根据发起者用户名和房间号查询房间\
    @Select("select * from meeting where id=#{id}")
    public Meeting getMeeting(@Param("id")Integer id);
}
