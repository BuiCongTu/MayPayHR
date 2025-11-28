package fpt.aptech.springbootapp.entities.System;
import fpt.aptech.springbootapp.entities.Core.TbUser;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tbPasswordResetToken")
public class TbPasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "token_id", nullable = false)
    private Integer id;

    @Column(name = "token", nullable = false, unique = true, length = 500)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private TbUser user;

    @Column(name = "verification_type", nullable = false, length = 20)
    private String verificationType;

    @Column(name = "contact_value", nullable = false, length = 255)
    private String contactValue;

    @Column(name = "otp", length = 10)
    private String otp;

    @Column(name = "expiry_date", nullable = false)
    private Instant expiryDate;

    @Column(name = "used", nullable = false)
    private Boolean used = false;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public boolean isExpired() {
        return Instant.now().isAfter(this.expiryDate);
    }
    public boolean isValid() {
        return !this.isExpired() && !this.used;
    }

}
