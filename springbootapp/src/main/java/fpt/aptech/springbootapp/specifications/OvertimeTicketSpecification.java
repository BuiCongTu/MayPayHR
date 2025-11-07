package fpt.aptech.springbootapp.specifications;

import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicket;
import fpt.aptech.springbootapp.filter.OvertimeTicketFilter;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class OvertimeTicketSpecification {

    public static Specification<TbOvertimeTicket> build(OvertimeTicketFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if(filter.getManagerId() != null){
                predicates.add(cb.equal(root.get("manager").get("id"), filter.getManagerId()));
            }

            if(filter.getRequestId() != null){
                predicates.add(cb.equal(root.get("overtimeRequest").get("id"), filter.getRequestId()));
            }

            if(filter.getStatus() != null){
                predicates.add(cb.equal(root.get("status"), filter.getStatus()));
            }

            if(filter.getConfirmedById() != null){
                predicates.add(cb.equal(root.get("confirmedBy").get("id"), filter.getConfirmedById()));
            }

            if(filter.getApprovedById() != null){
                predicates.add(cb.equal(root.get("approvedBy").get("id"), filter.getApprovedById()));
            }

            if(filter.getCreatedAfter() != null){
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filter.getCreatedAfter()));
            }

            if(filter.getCreatedBefore() != null){
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), filter.getCreatedBefore()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
