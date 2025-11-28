package fpt.aptech.springbootapp.entities.Core;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.*;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "tbDepartment")
@JsonIgnoreProperties({"users", "lines", "hibernateLazyInitializer"})
public class TbDepartment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "department_id", nullable = false)
    private Integer id;

    @Size(max = 100)
    @NotNull
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private TbUser manager;

    @Lob
    @Column(name = "description")
    private String description;

    //TbDepartment ──1:N──> TbUser
    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TbUser> users = new ArrayList<>();

    //TbDepartment ──1:N──> TbLine
    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TbLine> lines = new ArrayList<>();

}