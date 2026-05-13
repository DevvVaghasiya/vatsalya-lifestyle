package com.texdeal.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;

@Entity
@Table(name = "stock_dispatch_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockDispatchEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate entryDate;
    private Double quantity;
    private String remark;

    @CreationTimestamp
    private java.time.LocalDateTime createdAt;
}
