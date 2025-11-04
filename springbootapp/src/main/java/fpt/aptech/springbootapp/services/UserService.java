package fpt.aptech.springbootapp.services;
import java.util.List;
import java.util.Optional;

import fpt.aptech.springbootapp.dtos.request.Auth.UserDto;
import fpt.aptech.springbootapp.dtos.response.UserResponseDto;
import fpt.aptech.springbootapp.entities.Core.TbUser;

public interface UserService {
    TbUser register(TbUser user);
    TbUser createOrUpdateUser(TbUser user);
    String login(UserDto userDto);
    Optional<TbUser> findByEmail(String email);
    UserResponseDto getUserByEmail(String email);
    List<TbUser> findAllUsers();

}
