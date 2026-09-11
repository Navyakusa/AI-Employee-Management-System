package com.ems.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class LoginDto {
    private Long userId;
    private String userName;
    @NotBlank(message = "Email must be required")
    @Email(message = "Invalid email")
    private String email;
    @NotBlank(message = "Password must be required")
    private String password;
    @NotBlank(message = "role must be required")
    private String role;
}
