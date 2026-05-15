package com.texdeal.backend.controller;

import com.texdeal.backend.entity.AppUser;
import com.texdeal.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUserProfile(@PathVariable Long id, @RequestBody AppUser updatedUser) {
        Optional<AppUser> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            AppUser existingUser = userOpt.get();
            existingUser.setName(updatedUser.getName());
            existingUser.setPhoneNumber(updatedUser.getPhoneNumber());
            existingUser.setBusinessName(updatedUser.getBusinessName());
            if (updatedUser.getEmail() != null) {
                existingUser.setEmail(updatedUser.getEmail());
            }
            if (updatedUser.getProfilePictureUrl() != null) {
                existingUser.setProfilePictureUrl(updatedUser.getProfilePictureUrl());
            }
            
            userRepository.save(existingUser);
            return ResponseEntity.ok(existingUser);
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/profile-picture")
    public ResponseEntity<?> updateProfilePicture(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<AppUser> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            AppUser user = userOpt.get();
            String url = body.get("profilePictureUrl");
            if (url == null || url.isBlank()) {
                return ResponseEntity.badRequest().body("profilePictureUrl is required");
            }
            user.setProfilePictureUrl(url);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("profilePictureUrl", url));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody Map<String, String> passwordData) {
        Optional<AppUser> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        AppUser user = userOpt.get();
        String currentPassword = passwordData.get("currentPassword");
        String newPassword = passwordData.get("newPassword");

        if (!currentPassword.equals(user.getPassword())) {
            return ResponseEntity.badRequest().body("Current password is incorrect");
        }

        user.setPassword(newPassword);   // stored as plain text
        userRepository.save(user);
        return ResponseEntity.ok("Password updated successfully");
    }
}

