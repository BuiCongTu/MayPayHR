package fpt.aptech.springbootapp.dtos.request.Auth;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginReq {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password; // nhan raw password tu client

}
