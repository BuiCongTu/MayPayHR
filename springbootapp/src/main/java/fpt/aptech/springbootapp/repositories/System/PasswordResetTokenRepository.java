package fpt.aptech.springbootapp.repositories.System;

import fpt.aptech.springbootapp.entities.Core.TbUser;
import fpt.aptech.springbootapp.entities.System.TbPasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import javax.swing.text.html.Option;
import java.util.*;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<TbPasswordResetToken, Integer> {
    Optional<TbPasswordResetToken> findByToken(String token);
    Optional<TbPasswordResetToken> findByUser(TbUser user);

    @Transactional
    @Modifying
    @Query("DELETE FROM TbPasswordResetToken t WHERE t.user = :user")
    void deleteByUser(TbUser user);

}
