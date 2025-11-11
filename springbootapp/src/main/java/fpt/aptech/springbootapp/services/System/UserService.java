package fpt.aptech.springbootapp.services.System;
import java.util.List;
import java.util.Optional;

import fpt.aptech.springbootapp.dtos.request.Auth.ChangePassReq;
import fpt.aptech.springbootapp.dtos.request.Auth.LoginReq;
import fpt.aptech.springbootapp.dtos.request.Auth.RegisterReq;
import fpt.aptech.springbootapp.dtos.response.LoginResponse;
import fpt.aptech.springbootapp.dtos.response.UserResponseDto;
import fpt.aptech.springbootapp.entities.Core.TbUser;

public interface UserService {
    // Auth methods
    LoginResponse login(LoginReq loginReq);
    UserResponseDto register(RegisterReq registerReq);

    // User CRUD
    TbUser createOrUpdateUser(TbUser user);
    Optional<TbUser> findByEmail(String email);
    UserResponseDto getUserByEmail(String email);
    List<TbUser> findAllUsers();

    // Password management
    void changePassword(String email, ChangePassReq request);
    void forgotPassword(String email);
    void resetPassword(String token, String newPassword);
}

