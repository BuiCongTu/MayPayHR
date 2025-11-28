package fpt.aptech.springbootapp.repositories;

import fpt.aptech.springbootapp.entities.Core.TbSkillLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SkillLevelRepo extends JpaRepository<TbSkillLevel, Integer> {
    Optional<TbSkillLevel> findByName(String name);
}
