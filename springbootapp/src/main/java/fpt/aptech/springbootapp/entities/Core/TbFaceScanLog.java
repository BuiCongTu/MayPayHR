package fpt.aptech.springbootapp.entities.Core;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "tb_face_scan_log")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TbFaceScanLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private TbUser user;

    @Size(max = 500)
    @Column(name = "scan_image_path", length = 500)
    private String scanImagePath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matched_face_id")
    private TbFaceTraining matchedFace;

    @Column(name = "matched_confidence", precision = 5, scale = 4)
    private BigDecimal matchedConfidence;

    @ColumnDefault("getdate()")
    @Column(name = "scan_date")
    private Instant scanDate;

    @ColumnDefault("0")
    @Column(name = "is_matched")
    private Boolean isMatched;

    @ColumnDefault("0")
    @Column(name = "is_recognized")
    private Boolean isRecognized;

    @Enumerated(EnumType.STRING)
    @Column(name = "scan_type", length = 20)
    private ScanType scanType;

    @Column(name = "attendance_id")
    private Integer attendanceId;

    @Column(name = "created_at", columnDefinition = "DATETIMEOFFSET(6)")
    private LocalDateTime createdAt;

    public enum ScanType {
        CHECK_IN,
        CHECK_OUT
    }

}