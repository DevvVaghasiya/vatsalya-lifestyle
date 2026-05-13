package com.texdeal.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    @Column(nullable = false)
    private String password;
    
    private String businessName;
    
    @Column(unique = true, nullable = false)
    private String phoneNumber;

    private String role; // e.g., OWNER, ADMIN

    private String profilePictureUrl;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
