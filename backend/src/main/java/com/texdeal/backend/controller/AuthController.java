package com.texdeal.backend.controller;

import com.texdeal.backend.config.JwtUtil;
import com.texdeal.backend.dto.AuthRequest;
import com.texdeal.backend.dto.AuthResponse;
import com.texdeal.backend.dto.SignupRequest;
import com.texdeal.backend.entity.AppUser;
import com.texdeal.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        if (userRepository.findByPhoneNumber(request.getPhoneNumber()).isPresent()) {
            return ResponseEntity.badRequest().body("Phone number already in use");
        }

        AppUser user = new AppUser();
        user.setName(request.getName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPassword(request.getPassword());   // stored as plain text
        user.setEmail(request.getPhoneNumber() + "@vatsalya.com");
        user.setRole("USER");
        user.setStatus("PENDING");   // requires admin approval before login
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);

        // Do NOT issue a token — user must wait for admin approval
        return ResponseEntity.ok(Map.of(
            "message", "Registration successful. Your account is pending admin approval."
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        Optional<AppUser> userOpt = userRepository.findByPhoneNumber(request.getPhoneNumber());

        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            return ResponseEntity.status(401).body("Invalid phone number or password");
        }

        AppUser user = userOpt.get();

        // Block login for unapproved accounts
        if ("PENDING".equalsIgnoreCase(user.getStatus())) {
            return ResponseEntity.status(403).body("PENDING_APPROVAL");
        }
        if ("REJECTED".equalsIgnoreCase(user.getStatus())) {
            return ResponseEntity.status(403).body("ACCOUNT_REJECTED");
        }

        String token = jwtUtil.generateToken(user.getPhoneNumber());
        return ResponseEntity.ok(new AuthResponse(token, user));
    }
}
