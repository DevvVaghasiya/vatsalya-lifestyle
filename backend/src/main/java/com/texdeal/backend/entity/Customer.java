package com.texdeal.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String phone;
    
    @Column(unique = true)
    private String email;
    
    private String address;
    private String gstIn;

    // Derived or manually updated fields based on transactions
    private Integer totalDeals = 0;
    private Double totalPurchase = 0.0;
    private Double pendingDue = 0.0;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
