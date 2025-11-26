package fpt.aptech.springbootapp.api.ModuleB;

import fpt.aptech.springbootapp.dtos.ModuleB.ProposalDTO;
import fpt.aptech.springbootapp.entities.ModuleB.TbProposal.ProposalType;
import fpt.aptech.springbootapp.filter.ProposalFilter;
import fpt.aptech.springbootapp.services.interfaces.ProposalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/proposal")
public class ProposalController {

    private final ProposalService proposalService;

    @Autowired
    public ProposalController(ProposalService proposalService) {
        this.proposalService = proposalService;
    }

    @GetMapping("/salary-increase")
    public Page<ProposalDTO> getAllSalaryIncreaseProposal(ProposalFilter filter, Pageable pageable) {
        filter.setType(ProposalType.SalaryIncrease);
        return proposalService.getFilteredProposal(filter, pageable);
    }

    @GetMapping("/position-change")
    public Page<ProposalDTO> getAllPositionChangeProposal(ProposalFilter filter, Pageable pageable) {
        filter.setType(ProposalType.PositionChange);
        return proposalService.getFilteredProposal(filter, pageable);
    }

    @GetMapping("/skill-level")
    public Page<ProposalDTO> getAllSkillLevelProposal(ProposalFilter filter, Pageable pageable) {
        filter.setType(ProposalType.SkillLevelChange);
        return proposalService.getFilteredProposal(filter, pageable);
    }
}
