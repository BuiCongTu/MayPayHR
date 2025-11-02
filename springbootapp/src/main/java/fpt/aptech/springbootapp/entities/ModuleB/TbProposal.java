package fpt.aptech.springbootapp.entities.ModuleB;

import fpt.aptech.springbootapp.entities.Core.TbUser;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.*;

import java.time.*;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tbProposal")
public class TbProposal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "proposal_id", nullable = false)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "type", nullable = false, length = 30)
    private ProposalType type;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "proposer_id", nullable = false)
    private TbUser proposer;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "target_user_id", nullable = false)
    private TbUser targetUser;

    @Lob//khai bao dang large text
    @Column(name = "details")
    private String details;

    @Lob
    @Column(name = "reason")
    private String reason;

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'pending'")
    @Column(name = "status", length = 20)
    private ProposalStatus status = ProposalStatus.pending;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private TbUser approvedBy;

    @Lob
    @Column(name = "reject_reason")
    private String rejectReason;

    @ColumnDefault("getdate()")
    @Column(name = "created_at")
    private Instant createdAt;

    public enum ProposalType {
        SalaryIncrease, PositionChange, SkillLevelChange
    }

    public enum ProposalStatus {
        pending, confirmed, approved, rejected
    }

}