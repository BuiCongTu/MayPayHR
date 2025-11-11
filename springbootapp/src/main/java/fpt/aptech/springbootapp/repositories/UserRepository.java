package fpt.aptech.springbootapp.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import fpt.aptech.springbootapp.entities.Core.TbUser;

public interface UserRepository extends JpaRepository<TbUser, Integer> {
    Optional<TbUser> findByEmail(String email);
    // Optional<TbUser> findByResetToken(String phone);

    //

}
