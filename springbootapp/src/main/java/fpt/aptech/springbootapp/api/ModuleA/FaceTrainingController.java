package fpt.aptech.springbootapp.api.ModuleA;

import fpt.aptech.springbootapp.entities.Core.TbFaceTraining;
import fpt.aptech.springbootapp.services.ModuleA_Time_Attendance.FaceTrainingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/face-training")
@Slf4j
public class FaceTrainingController {
    private final FaceTrainingService faceTrainingService;

    @Autowired
    public FaceTrainingController(FaceTrainingService faceTrainingService) {
        this.faceTrainingService = faceTrainingService;
    }

    //api train face
    @PostMapping("/train")
//    @PreAuthorize("hasAnyRole('HR', 'Admin')")
    public ResponseEntity<Map<String, Object>> trainFace(
            @RequestParam Integer userId,
            @RequestParam String imageBase64,
            @RequestParam Integer trainedByUserId) {
        try {
            TbFaceTraining result = faceTrainingService.trainFace(userId, imageBase64, trainedByUserId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Face training successful");
            response.put("data", result);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Face training failed: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    //2. update
    @PostMapping("/update")
//    @PreAuthorize("hasAnyRole('HR', 'Admin')")
    public ResponseEntity<Map<String, Object>> updateFaceTraining(
            @RequestParam Integer userId,
            @RequestParam String imageBase64,
            @RequestParam Integer trainedByUserId) {
        try {
            log.info("Updating face training for userId: {}", userId);

            TbFaceTraining result = faceTrainingService.updateFaceTraining(userId, imageBase64, trainedByUserId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Face training updated successfully");
            response.put("data", result);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error updating face training", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Face training update failed: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    //3 lay face training
    @GetMapping("/{userId}")
//    @PreAuthorize("hasAnyRole('HR', 'Admin')")
    public ResponseEntity<Map<String, Object>> getFaceTraining(@PathVariable Integer userId) {
        try {
            Optional<TbFaceTraining> faceTraining = faceTrainingService.getFaceTrainingByUserId(userId);

            if (faceTraining.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("data", faceTraining.get());
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Face training not found for userId: " + userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    //kiem tra employee dda train chua
    @GetMapping("/check/{userId}")
    public ResponseEntity<Map<String, Object>> checkUserFaceTrained(@PathVariable Integer userId) {
        try {
            boolean isTrained = faceTrainingService.isUserFaceTrained(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("userId", userId);
            response.put("isTrained", isTrained);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/all/trained")
//    @PreAuthorize("hasAnyRole('HR', 'Admin')")
    public ResponseEntity<Map<String, Object>> getAllTrainedFaces() {
        try {
            log.info("Fetching all trained faces");

            List<TbFaceTraining> result = faceTrainingService.getAllTrainedFaces();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", result.size());
            response.put("data", result);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching trained faces", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    //lay chua train
    @GetMapping("/all/untrained")
//    @PreAuthorize("hasAnyRole('HR', 'Admin')")
    public ResponseEntity<Map<String, Object>> getAllUntrainedUsers() {
        try {
            List<TbFaceTraining> result = faceTrainingService.getAllUntrainedUsers();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", result.size());
            response.put("data", result);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching untrained users", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    //delete
    @DeleteMapping("/{userId}")
//    @PreAuthorize("hasAnyRole('HR', 'Admin')")
    public ResponseEntity<Map<String, Object>> deleteFaceTraining(@PathVariable Integer userId) {
        try {
            faceTrainingService.deleteFaceTraining(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Face training deleted successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error deleting face training", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    //lay train models
    @GetMapping("/model/{modelVersion}")
//    @PreAuthorize("hasAnyRole('HR', 'Admin')")
    public ResponseEntity<Map<String, Object>> getFaceTrainingByModelVersion(@PathVariable String modelVersion) {
        try {
            List<TbFaceTraining> result = faceTrainingService.getFaceTrainingByModelVersion(modelVersion);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("modelVersion", modelVersion);
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


}
