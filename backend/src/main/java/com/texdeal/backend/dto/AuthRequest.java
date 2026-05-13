package com.texdeal.backend.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String phoneNumber;
    private String password;
}
