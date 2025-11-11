package fpt.aptech.springbootapp.dtos.response;


import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;

    @Builder.Default
    private String tokenType = "Bearer";

    private UserResponseDto user;

}
