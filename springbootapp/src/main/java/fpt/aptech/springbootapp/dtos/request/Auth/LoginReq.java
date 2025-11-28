package fpt.aptech.springbootapp.dtos.request.Auth;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginReq {

    @NotBlank(message = "Login ID is required")
    private String loginId; // có thể là email hoặc phone

    @NotBlank(message = "Password is required")
    private String password; // nhan raw password tu client

}
