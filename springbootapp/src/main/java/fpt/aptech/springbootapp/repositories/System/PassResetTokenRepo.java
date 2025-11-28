package fpt.aptech.springbootapp.repositories.System;

import fpt.aptech.springbootapp.entities.Core.TbUser;
import fpt.aptech.springbootapp.entities.System.TbPasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Repository
public interface PassResetTokenRepo extends JpaRepository<TbPasswordResetToken, Integer> {
    Optional<TbPasswordResetToken> findByToken(String token);
    Optional<TbPasswordResetToken> findByUser(TbUser user);
    Optional<TbPasswordResetToken> findByUserIdAndVerificationType(Integer userId, String verificationType);
    Optional<TbPasswordResetToken> findByContactValue(String contactValue);

@Transactional
    @Modifying
    @Query("DELETE FROM TbPasswordResetToken t WHERE t.user = :user")
    void deleteOldTokenByUser(TbUser user);

}
