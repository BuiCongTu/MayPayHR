package fpt.aptech.springbootapp.dtos.ModuleB.Mobile;

import lombok.Data;

@Data
public class OvertimeResponseDTO {
    private Integer ticketId;
    private String status; // "accepted" or "rejected"
}