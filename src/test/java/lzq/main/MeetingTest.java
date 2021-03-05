package lzq.main;

import com.lzq.bean.meeting.Meeting;
import com.lzq.service.main.janus.MeetingService;
import lzq.BaseTest;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

/**
 * @ClassName: MeetingTest
 * @Author: 中都
 * @Date: 2021/2/25 09:39
 * @Description: TODO
 */
public class MeetingTest extends BaseTest {
    @Autowired
    private MeetingService meetingService;

    //@Test
    public void getUnFlagMetings() {
        List<Meeting> list = meetingService.getUnFlagMetings();
        for (Meeting m : list) {
            System.out.println(m.getId()+" "+m.getFlag());
        }
    }

    //@Test
    public void updateMeeting() {
        Meeting meeting = new Meeting();
        meeting.setId(1517);
        meeting.setPresider("中都");
        meeting.setRemark("学习");
        meeting.setFlag(1);
        System.out.println(meetingService.updateMeeting(meeting));
    }

    //@Test
    public void getMeeting() {
        Meeting meeting = meetingService.getMeeting(1517);
        System.out.println(meeting.getDateTime());
    }

    @Test
    public void update() {
        Meeting meeting = new Meeting();
        meeting.setId(1517);
        meeting.setFlag(0);
        meetingService.updateMeeting(meeting);
    }
}
