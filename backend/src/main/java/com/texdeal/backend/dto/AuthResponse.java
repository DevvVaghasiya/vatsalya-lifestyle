package com.texdeal.backend.dto;

import com.texdeal.backend.entity.AppUser;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private AppUser user;
}
