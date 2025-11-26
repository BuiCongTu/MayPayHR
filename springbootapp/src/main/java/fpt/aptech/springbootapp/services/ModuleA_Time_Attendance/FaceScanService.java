package fpt.aptech.springbootapp.services.ModuleA_Time_Attendance;

import fpt.aptech.springbootapp.entities.Core.TbFaceScanLog;

import java.time.Instant;
import java.util.List;

public interface FaceScanService {
    TbFaceScanLog scanFaceAndAttendance(String imageBase64, TbFaceScanLog.ScanType scanType);
    // lay lich quet
    List<TbFaceScanLog> getScanHistoryByUserId(Integer userId);
//lay quet loi
    List<TbFaceScanLog> getFailedScans();
// lay lan cap nhat face/ scan thanh cong
List<TbFaceScanLog> getFaceUpdateHistory(Integer faceId);
    List<TbFaceScanLog> getSuccessfulScansInDay(Integer userId, Instant scanDate);
    boolean hasCheckedInToday(Integer userId, Instant scanDate);
    TbFaceScanLog getLatestCheckInToday(Integer userId, Instant scanDate);
    TbFaceScanLog getLatestCheckOutToday(Integer userId, Instant scanDate);

}
