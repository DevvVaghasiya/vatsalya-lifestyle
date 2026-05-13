package com.texdeal.backend.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String name;
    private String phoneNumber;
    private String password;
}
