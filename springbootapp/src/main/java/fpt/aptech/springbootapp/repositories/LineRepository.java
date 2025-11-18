package fpt.aptech.springbootapp.repositories;

import fpt.aptech.springbootapp.entities.Core.TbLine;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LineRepository extends JpaRepository<TbLine, Integer> {
}
