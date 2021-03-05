package com.lzq.service.main.janus;

import com.lzq.bean.meeting.Meeting;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * @ClassName: MeetingService
 * @Author: 中都
 * @Date: 2021/2/25 09:36
 * @Description: TODO
 */
public interface MeetingService {
    public List<Meeting> getUnFlagMetings();
    //选中房间后，需要修改房间信息
    public Integer updateMeeting(Meeting meeting);
    public Meeting getMeeting(Integer id);
}
