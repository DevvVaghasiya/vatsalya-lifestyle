package com.texdeal.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "inventories", indexes = {
    @Index(name = "idx_inventories_category", columnList = "category"),
    @Index(name = "idx_inventories_status", columnList = "status"),
    @Index(name = "idx_inventories_reference_no", columnList = "referenceNo")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // "STOCK", "SAMPLE", "FABRIC_ENTRY"
    private String category;

    private String referenceNo;

    @Column(nullable = false)
    private String fabricName;

    private String fabricType;
    private String composition;
    private String countConst;
    private Integer gsm;
    private String width;
    private String designPattern;
    private String lotNumber;
    private String rollNumber;

    private Double stockQuantity;
    private Double soldQuantity;
    private Double ratePerMeter;
    private Double costPrice;

    // "available", "sold"
    private String status;

    private String colorCode;
    private String imageUrl;
    private String remark;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "inventory_id")
    private List<StockDispatchEntry> dispatchEntries = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private AppUser createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_edited_by_id")
    private AppUser lastEditedBy;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
