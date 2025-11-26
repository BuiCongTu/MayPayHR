package fpt.aptech.springbootapp.services.ModuleA_Time_Attendance;

import fpt.aptech.springbootapp.entities.Core.TbFaceTraining;

import java.util.List;
import java.util.Optional;

public interface FaceTrainingService {
    TbFaceTraining trainFace(Integer userId, String imageBase64, Integer trainedByUserId);
    Optional<TbFaceTraining> getFaceTrainingByUserId(Integer userId);
    boolean isUserFaceTrained(Integer userId);
    List<TbFaceTraining> getAllTrainedFaces();

    List<TbFaceTraining> getAllUntrainedUsers();
    TbFaceTraining updateFaceTraining(Integer userId, String imageBase64, Integer trainedByUserId);
    void deleteFaceTraining(Integer userId);
    List<TbFaceTraining> getFaceTrainingByModelVersion(String modelVersion);

}
