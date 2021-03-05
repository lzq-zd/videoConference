package com.lzq.service.main.janus.impl;

import com.lzq.bean.meeting.Meeting;
import com.lzq.dao.main.janus.MeetingDao;
import com.lzq.service.main.janus.MeetingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

/**
 * @ClassName: MeetingServiceImpl
 * @Author: 中都
 * @Date: 2021/2/25 09:36
 * @Description: TODO
 */
@Service
public class MeetingServiceImpl implements MeetingService {
    @Autowired
    private MeetingDao meetingDao;

    @Override
    public List<Meeting> getUnFlagMetings() {
        return meetingDao.getUnFlagMetings();
    }

    @Override
    public Integer updateMeeting(Meeting meeting) {
        Date dNow = new Date( );
        SimpleDateFormat ft = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String dateTime = ft.format(dNow);
        meeting.setDateTime(dateTime);
        return meetingDao.updateMeeting(meeting);
    }

    public Meeting getMeeting(Integer id) {
        return meetingDao.getMeeting(id);
    }
}
