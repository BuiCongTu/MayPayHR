package fpt.aptech.springbootapp.api.ModuleA;

import fpt.aptech.springbootapp.entities.Core.TbFaceScanLog;
import fpt.aptech.springbootapp.services.ModuleA_Time_Attendance.FaceScanService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/face-scan")
@Slf4j

public class FaceScanController {

    private final FaceScanService faceScanService;

    @Autowired
    public FaceScanController(FaceScanService faceScanService) {
        this.faceScanService = faceScanService;
    }

    //quet va tao cham cong
    @PostMapping("/attendance")
    public ResponseEntity<Map<String, Object>> scanFaceAndAttendance(
            @RequestBody Map<String, String> request) {
        try {
            String imageBase64 = request.get("imageBase64");
            String scanTypeStr = request.get("scanType");

            // Validate
            if (imageBase64 == null || imageBase64.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Image is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            if (scanTypeStr == null || scanTypeStr.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Scan type (CHECK_IN/CHECK_OUT) is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            TbFaceScanLog.ScanType scanType = TbFaceScanLog.ScanType.valueOf(scanTypeStr.toUpperCase());

            TbFaceScanLog result = faceScanService.scanFaceAndAttendance(imageBase64, scanType);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", result.getIsMatched() ? "Face matched successfully" : "Face not matched");
            response.put("scanId", result.getId());
            response.put("isMatched", result.getIsMatched());
            response.put("scanType", result.getScanType());
            response.put("userName", result.getUser() != null ? result.getUser().getFullName() : null);
            response.put("matchedConfidence", result.getMatchedConfidence());
            response.put("attendanceId", result.getAttendanceId());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Invalid scan type. Use CHECK_IN or CHECK_OUT");

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Face scan failed: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    //looi
    @GetMapping("/errors")
    public ResponseEntity<Map<String, Object>> getFailedScans() {
        try {
            List<TbFaceScanLog> result = faceScanService.getFailedScans();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", result.size());
            response.put("data", result);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    @GetMapping("/updates/{faceId}")
    public ResponseEntity<Map<String, Object>> getFaceUpdateHistory(@PathVariable Integer faceId) {
        try {
            log.info("Getting face update history for faceId: {}", faceId);

            List<TbFaceScanLog> result = faceScanService.getFaceUpdateHistory(faceId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("faceId", faceId);
            response.put("count", result.size());
            response.put("data", result);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error getting face update history", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

        @GetMapping("/day/{userId}")
        public ResponseEntity<Map<String, Object>> getScansInDay(
                @PathVariable Integer userId,
                @RequestParam(required = false) Long timestamp) {
            try {
                log.info("Getting scans in day for userId: {}", userId);

                Instant scanDate = timestamp != null ? Instant.ofEpochMilli(timestamp) : Instant.now();
                List<TbFaceScanLog> result = faceScanService.getSuccessfulScansInDay(userId, scanDate);

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("userId", userId);
                response.put("count", result.size());
                response.put("data", result);

                return ResponseEntity.ok(response);

            } catch (Exception e) {
                log.error("Error getting scans in day", e);

                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Error: " + e.getMessage());

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
            }
        }
    // check chua?
    @GetMapping("/checkin-status/{userId}")
    public ResponseEntity<Map<String, Object>> hasCheckedInToday(
            @PathVariable Integer userId,
            @RequestParam(required = false) Long timestamp) {
        try {
            log.info("Checking check-in status for userId: {}", userId);

            Instant scanDate = timestamp != null ? Instant.ofEpochMilli(timestamp) : Instant.now();
            boolean hasCheckIn = faceScanService.hasCheckedInToday(userId, scanDate);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("userId", userId);
            response.put("hasCheckedIn", hasCheckIn);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error checking check-in status", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/latest-checkin/{userId}")
    public ResponseEntity<Map<String, Object>> getLatestCheckInToday(
            @PathVariable Integer userId,
            @RequestParam(required = false) Long timestamp) {
        try {
            log.info("Getting latest check-in for userId: {}", userId);

            Instant scanDate = timestamp != null ? Instant.ofEpochMilli(timestamp) : Instant.now();
            TbFaceScanLog result = faceScanService.getLatestCheckInToday(userId, scanDate);

            if (result != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("data", result);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "No check-in found for today");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

        } catch (Exception e) {
            log.error("Error getting latest check-in", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/latest-checkout/{userId}")
    public ResponseEntity<Map<String, Object>> getLatestCheckOutToday(
            @PathVariable Integer userId,
            @RequestParam(required = false) Long timestamp) {
        try {
            log.info("Getting latest check-out for userId: {}", userId);

            Instant scanDate = timestamp != null ? Instant.ofEpochMilli(timestamp) : Instant.now();
            TbFaceScanLog result = faceScanService.getLatestCheckOutToday(userId, scanDate);

            if (result != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("data", result);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "No check-out found for today");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

        } catch (Exception e) {
            log.error("Error getting latest check-out", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }


}
