package fpt.aptech.springbootapp.repos;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import fpt.aptech.springbootapp.entities.Core.TbRole;

public interface RoleRepository extends JpaRepository<TbRole, Integer> {
    Optional<TbRole> findByName(String name);
}