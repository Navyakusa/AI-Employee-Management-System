package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmailTemplateDto {

    private Long id;

    private String templateCode;

    private String subject;

    private String body;

    private Boolean active;
}