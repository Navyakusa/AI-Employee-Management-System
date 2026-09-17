package com.ems.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordDto {

    private String currentPassword;

    private String newPassword;

    private String confirmPassword;
}