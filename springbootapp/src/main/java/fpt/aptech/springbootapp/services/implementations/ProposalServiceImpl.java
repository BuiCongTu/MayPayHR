package fpt.aptech.springbootapp.services.implementations;

import fpt.aptech.springbootapp.dtos.ProposalDTO;
import fpt.aptech.springbootapp.entities.ModuleB.TbProposal;
import fpt.aptech.springbootapp.filter.ProposalFilter;
import fpt.aptech.springbootapp.mappers.ProposalMapper;
import fpt.aptech.springbootapp.repositories.ModuleB.ProposalRepository;
import fpt.aptech.springbootapp.services.interfaces.ProposalService;
import fpt.aptech.springbootapp.specifications.ProposalSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
public class ProposalServiceImpl implements ProposalService {

    private final ProposalRepository proposalRepository;
    @Autowired
    public ProposalServiceImpl(ProposalRepository proposalRepository) {
        this.proposalRepository = proposalRepository;
    }

    @Override
    public Page<ProposalDTO> getFilteredProposal(ProposalFilter filter, Pageable pageable) {
        Specification<TbProposal> spec = ProposalSpecification.build(filter);
        return proposalRepository.findAll(spec, pageable).map(ProposalMapper::toDTO);
    }
}
