package com.texdeal.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "inquiries")
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

    // Explicit Getters and Setters to avoid Lombok issues
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }
    public String getStyleNo() { return styleNo; }
    public void setStyleNo(String styleNo) { this.styleNo = styleNo; }
    public String getQuality() { return quality; }
    public void setQuality(String quality) { this.quality = quality; }
    public String getGsm() { return gsm; }
    public void setGsm(String gsm) { this.gsm = gsm; }
    public String getCountConst() { return countConst; }
    public void setCountConst(String countConst) { this.countConst = countConst; }
    public String getDesign() { return design; }
    public void setDesign(String design) { this.design = design; }
    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }
    public String getSampleBooking() { return sampleBooking; }
    public void setSampleBooking(String sampleBooking) { this.sampleBooking = sampleBooking; }
    public String getDyingPrintingMill() { return dyingPrintingMill; }
    public void setDyingPrintingMill(String dyingPrintingMill) { this.dyingPrintingMill = dyingPrintingMill; }
    public String getValueAdditionMill() { return valueAdditionMill; }
    public void setValueAdditionMill(String valueAdditionMill) { this.valueAdditionMill = valueAdditionMill; }
    public String getRedimate() { return redimate; }
    public void setRedimate(String redimate) { this.redimate = redimate; }
    public String getSubmissionDate() { return submissionDate; }
    public void setSubmissionDate(String submissionDate) { this.submissionDate = submissionDate; }
    public String getArticleNo() { return articleNo; }
    public void setArticleNo(String articleNo) { this.articleNo = articleNo; }
    public String getFabricName() { return fabricName; }
    public void setFabricName(String fabricName) { this.fabricName = fabricName; }
    public String getGsn() { return gsn; }
    public void setGsn(String gsn) { this.gsn = gsn; }
    public String getWidth() { return width; }
    public void setWidth(String width) { this.width = width; }
    public String getSubmissionCountConst() { return submissionCountConst; }
    public void setSubmissionCountConst(String submissionCountConst) { this.submissionCountConst = submissionCountConst; }
    public String getComposition() { return composition; }
    public void setComposition(String composition) { this.composition = composition; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public AppUser getCreatedBy() { return createdBy; }
    public void setCreatedBy(AppUser createdBy) { this.createdBy = createdBy; }
    public AppUser getLastEditedBy() { return lastEditedBy; }
    public void setLastEditedBy(AppUser lastEditedBy) { this.lastEditedBy = lastEditedBy; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
