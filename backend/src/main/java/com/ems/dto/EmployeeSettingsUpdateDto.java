
package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSettingsUpdateDto {

    private String employeeName;

    private String email;

    private String designation;

    private Boolean emailNotifications;

    private Boolean systemNotifications;

    private Boolean darkMode;
}