package com.ems.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupDto {

    private String userName;
    private String email;
    private String password;
    private String role;
    private String department;

}