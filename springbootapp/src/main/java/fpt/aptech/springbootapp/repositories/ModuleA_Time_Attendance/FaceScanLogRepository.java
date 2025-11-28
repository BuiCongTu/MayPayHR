package fpt.aptech.springbootapp.repositories.ModuleA_Time_Attendance;

import fpt.aptech.springbootapp.entities.Core.TbFaceScanLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface FaceScanLogRepository extends JpaRepository<TbFaceScanLog, Long> {
    List<TbFaceScanLog> findByUserId(Integer userId);
    List<TbFaceScanLog> findByIsMatchedFalse();
    List<TbFaceScanLog> findByIsMatchedTrue();

    //update face
    @Query("SELECT fsl FROM TbFaceScanLog fsl WHERE fsl.matchedFace.id = :faceId ORDER BY fsl.scanDate DESC")
    List<TbFaceScanLog> findFaceUpdateHistory(@Param("faceId") Integer faceId);

    @Query("SELECT fsl FROM TbFaceScanLog fsl " +
            "WHERE fsl.user.id = :userId " +
            "AND CAST(fsl.scanDate AS DATE) = CAST(:scanDate AS DATE) " +
            "AND fsl.isMatched = true " +
            "ORDER BY fsl.scanDate ASC")
    List<TbFaceScanLog> findSuccessfulScansInDay(
            @Param("userId") Integer userId,
            @Param("scanDate") Instant scanDate
    );

    @Query("SELECT fsl FROM TbFaceScanLog fsl " +
            "WHERE fsl.user.id = :userId " +
            "AND CAST(fsl.scanDate AS DATE) = CAST(:scanDate AS DATE) " +
            "AND fsl.isMatched = true " +
            "AND fsl.scanType = 'CHECK_IN' " +
            "ORDER BY fsl.scanDate DESC " +
            "LIMIT 1")
    TbFaceScanLog findLatestCheckInToday(
            @Param("userId") Integer userId,
            @Param("scanDate") Instant scanDate
    );

    @Query("SELECT fsl FROM TbFaceScanLog fsl " +
            "WHERE fsl.user.id = :userId " +
            "AND CAST(fsl.scanDate AS DATE) = CAST(:scanDate AS DATE) " +
            "AND fsl.isMatched = true " +
            "AND fsl.scanType = 'CHECK_OUT' " +
            "ORDER BY fsl.scanDate DESC " +
            "LIMIT 1")
    TbFaceScanLog findLatestCheckOutToday(
            @Param("userId") Integer userId,
            @Param("scanDate") Instant scanDate
    );

    @Query("SELECT CASE WHEN COUNT(fsl) > 0 THEN true ELSE false END " +
            "FROM TbFaceScanLog fsl " +
            "WHERE fsl.user.id = :userId " +
            "AND CAST(fsl.scanDate AS DATE) = CAST(:scanDate AS DATE) " +
            "AND fsl.isMatched = true " +
            "AND fsl.scanType = 'CHECK_IN'")
    boolean hasCheckedInToday(
            @Param("userId") Integer userId,
            @Param("scanDate") Instant scanDate
    );


}
