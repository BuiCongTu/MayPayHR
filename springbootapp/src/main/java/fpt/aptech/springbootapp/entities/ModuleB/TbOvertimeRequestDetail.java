package fpt.aptech.springbootapp.entities.ModuleB;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import fpt.aptech.springbootapp.entities.Core.TbLine;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tbOvertimeRequestDetail")
public class TbOvertimeRequestDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "detail_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    @JsonIgnoreProperties("lineDetails")
    private TbOvertimeRequest overtimeRequest;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "line_id", nullable = false)
    private TbLine line;

    @NotNull
    @Min(1)
    @Column(name = "num_employees", nullable = false)
    private Integer numEmployees;
}