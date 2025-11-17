package fpt.aptech.springbootapp.entities.ModuleB;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "tb_overtime_ticket_employees")
public class TbOvertimeTicketEmployee {
    @EmbeddedId
    private TbOvertimeTicketEmployeeId id;

    //TODO [Reverse Engineering] generate columns from DB
}