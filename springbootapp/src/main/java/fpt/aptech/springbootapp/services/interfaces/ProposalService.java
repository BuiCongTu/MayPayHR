package fpt.aptech.springbootapp.services.interfaces;

import fpt.aptech.springbootapp.dtos.ModuleB.ProposalDTO;
import fpt.aptech.springbootapp.filter.ProposalFilter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProposalService {
    Page<ProposalDTO> getFilteredProposal(ProposalFilter filter, Pageable pageable);
}
