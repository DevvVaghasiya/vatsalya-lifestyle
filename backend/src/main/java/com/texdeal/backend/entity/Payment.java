package com.texdeal.backend.entity;

import com.texdeal.backend.entity.Order;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    private Double amount;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status; // PAID, PARTIAL, DUE

    @CreationTimestamp
    private LocalDateTime paymentDate;
    
    public enum PaymentStatus {
        PAID, PARTIAL, DUE
    }
}
