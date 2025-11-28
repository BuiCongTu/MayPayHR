package fpt.aptech.springbootapp.dtos.request.Auth;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordReq {
    @NotBlank(message = "Email or Phone is required")
    private String emailOrPhone;

    @NotBlank(message = "Verification method is required (EMAIL or PHONE)")
    private String verificationMethod;

}
