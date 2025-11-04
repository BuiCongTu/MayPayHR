package fpt.aptech.springbootapp.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password; // mật khẩu người dùng nhập

}
