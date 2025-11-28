package fpt.aptech.springbootapp.entities.ModuleA;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.*;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tbLeaveReason")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})

public class TbLeaveReason {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "leave_reason_id", nullable = false)
    private Integer id;

    @Size(max = 255)
    @NotNull
    @Column(name = "reason", nullable = false)
    private String reason;

    @Lob
    @Column(name = "description")
    private String description;

    @OneToMany(mappedBy = "leaveReason", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TbLeaveRequest> leaveRequests = new ArrayList<>();

}