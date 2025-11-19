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
    //sua doi thong tin nguoi dung
    TbUser updateUser(Integer id, TbUser user);
    Optional<TbUser> findByPhone(String phone);
    UserResponseDto getUserByPhone(String phone);
    List<TbUser> findAllUsers();

    // Password management
    void changePassword(String phone, ChangePassReq request);
    void forgotPassword(String phone);
    void resetPassword(String token, String newPassword);
}

