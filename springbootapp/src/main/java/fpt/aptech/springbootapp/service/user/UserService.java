package fpt.aptech.springbootapp.service.user;

import java.util.List;
import java.util.Optional;

import fpt.aptech.springbootapp.entities.Core.TbUser;

public interface UserService {
 TbUser saveUser(TbUser user);
    Optional<TbUser> findByEmail(String email);
    List<TbUser> findAllUsers();
}
