package fpt.aptech.springbootapp.entities.System;

import fpt.aptech.springbootapp.entities.Core.TbUser;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "tbNotification")
public class TbNotification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    private TbUser recipient;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "type", nullable = false, length = 20)
    private NotificationType type;

    @NotNull
    @Lob
    @Column(name = "message", nullable = false)
    private String message;

    @ColumnDefault("getdate()")
    @Column(name = "sent_date")
    private Instant sentDate;

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'sent'")
    @Column(name = "status", length = 10)
    private NotificationStatus status = NotificationStatus.sent;

    public enum NotificationType {
        error, approval, rejection, other
    }

    public enum NotificationStatus {
        sent, read
    }

}