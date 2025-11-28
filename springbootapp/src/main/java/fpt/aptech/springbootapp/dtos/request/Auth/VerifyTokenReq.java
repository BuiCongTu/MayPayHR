package fpt.aptech.springbootapp.dtos.request.Auth;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class VerifyTokenReq {
    @NotBlank(message = "Token is required")
    private String token;

    private String otp;

}
