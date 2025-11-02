package fpt.aptech.springbootapp.entities.Core;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.*;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tbSkillLevel")
public class TbSkillLevel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "skill_level_id", nullable = false)
    private Integer id;

    @Size(max = 100)
    @NotNull
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Lob
    @Column(name = "description")
    private String description;

    // TbSkillLevel ──1:N──> TbUser
    @OneToMany(mappedBy = "skillLevel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TbUser> users = new ArrayList<>();
}