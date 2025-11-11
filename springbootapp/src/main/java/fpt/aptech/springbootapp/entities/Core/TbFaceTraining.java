package fpt.aptech.springbootapp.entities.Core;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "tb_face_training")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TbFaceTraining {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "face_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    private TbUser user;

    @Column(name = "face_embedding", length =1024*1024*10)//10MB
    private byte[] faceEmbedding;

    @Size(max = 500)
    @Column(name = "face_image_path", length = 500)
    private String faceImagePath;

    @Column(name = "training_date")
    private Instant trainingDate;

    @ColumnDefault("0")
    @Column(name = "is_trained")
    private Boolean isTrained;

    @Size(max = 50)
    @Column(name = "model_version", length = 50)
    private String modelVersion;

    @Column(name = "confidence", precision = 5, scale = 4)
    private BigDecimal confidence;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trained_by_user_id")
    private TbUser trainedByUser;

    @Nationalized
    @Lob
    @Column(name = "notes")
    private String notes;

    @ColumnDefault("getdate()")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("getdate()")
    @Column(name = "updated_at")
    private Instant updatedAt;

}