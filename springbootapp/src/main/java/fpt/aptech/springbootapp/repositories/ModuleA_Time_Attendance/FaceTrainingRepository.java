package fpt.aptech.springbootapp.repositories.ModuleA_Time_Attendance;

import fpt.aptech.springbootapp.entities.Core.TbFaceTraining;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FaceTrainingRepository extends JpaRepository<TbFaceTraining, Integer> {
    List<TbFaceTraining> findAll();
    Optional<TbFaceTraining> findByUserId(Integer userId);

    //employee da train chua
    boolean existsByUserId(Integer userId);

    List<TbFaceTraining> findByModelVersion(String modelVersion);
    List<TbFaceTraining> findByIsTrainedFalse();
    List<TbFaceTraining> findByIsTrainedTrue();

}
