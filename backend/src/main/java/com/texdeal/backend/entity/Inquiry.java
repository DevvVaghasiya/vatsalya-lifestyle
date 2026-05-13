package com.texdeal.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "inquiries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Inquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    private String styleNo;
    private String quality;
    private String gsm;
    private String countConst;
    private String design;
    
    @Column(columnDefinition = "TEXT")
    private String remark;

    // What we are doing?
    private String sampleBooking;
    private String dyingPrintingMill;
    private String valueAdditionMill;
    private String redimate;

    // Submission Section
    private String submissionDate;
    private String articleNo;
    private String fabricName;
    private String gsn;
    private String width;
    private String submissionCountConst;
    private String composition;
    private String feedback;

    @ManyToOne
    @JoinColumn(name = "created_by_id")
    private AppUser createdBy;

    @ManyToOne
    @JoinColumn(name = "last_edited_by_id")
    private AppUser lastEditedBy;

    @Column(nullable = false)
    private String status = "Ongoing"; // Ongoing, Completed, Canceled

    @CreationTimestamp
    private LocalDateTime createdAt;
}
