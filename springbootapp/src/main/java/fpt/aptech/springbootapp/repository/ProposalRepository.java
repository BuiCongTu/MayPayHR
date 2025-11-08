package fpt.aptech.springbootapp.repository;

import fpt.aptech.springbootapp.dtos.ProposalDTO;
import fpt.aptech.springbootapp.entities.ModuleB.TbProposal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ProposalRepository extends JpaRepository<TbProposal, Integer>,
        JpaSpecificationExecutor<TbProposal>
{
    Page<TbProposal> findByType(TbProposal.ProposalType type, Pageable pageable);
}
