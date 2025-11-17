package fpt.aptech.springbootapp.entities.ModuleB;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Embeddable
public class TbOvertimeTicketEmployeeId implements Serializable {
    @Serial
    private static final long serialVersionUID = -266344760038502275L;
    @NotNull
    @Column(name = "overtime_ticket_id", nullable = false)
    private Integer overtimeTicketId;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        TbOvertimeTicketEmployeeId entity = (TbOvertimeTicketEmployeeId) o;
        return Objects.equals(this.overtimeTicketId, entity.overtimeTicketId) &&
                Objects.equals(this.userId, entity.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(overtimeTicketId, userId);
    }

}