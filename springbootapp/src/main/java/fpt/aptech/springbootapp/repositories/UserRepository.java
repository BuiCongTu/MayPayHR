package fpt.aptech.springbootapp.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import fpt.aptech.springbootapp.entities.Core.TbUser;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<TbUser, Integer> {
    Optional<TbUser> findByPhone(String phone);
    // Optional<TbUser> findByResetToken(String phone);

    List<TbUser> findByDepartmentId(Integer departmentId);
    List<TbUser> findByDepartmentIdAndRoleName(Integer departmentId, String roleName);
}
