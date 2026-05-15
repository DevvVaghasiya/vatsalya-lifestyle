package com.texdeal.backend.controller;

import com.texdeal.backend.entity.Inquiry;
import com.texdeal.backend.repository.InquiryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inquiries")
@CrossOrigin(origins = "*")
public class InquiryController {

    @Autowired
    private InquiryRepository inquiryRepository;

    @Autowired
    private com.texdeal.backend.repository.UserRepository userRepository;

    @GetMapping
    public List<Inquiry> getAllInquiries() {
        return inquiryRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inquiry> getInquiryById(@PathVariable Long id) {
        return inquiryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createInquiry(@RequestBody Inquiry inquiry) {
        try {
            // Validate client exists
            if (inquiry.getClient() == null || inquiry.getClient().getId() == null) {
                return ResponseEntity.badRequest().body("Client ID is required");
            }
            
            // Validate User exists to avoid Foreign Key constraint violations
            if (inquiry.getCreatedBy() != null && inquiry.getCreatedBy().getId() != null) {
                if (!userRepository.existsById(inquiry.getCreatedBy().getId())) {
                    inquiry.setCreatedBy(null);
                }
            }
            if (inquiry.getLastEditedBy() != null && inquiry.getLastEditedBy().getId() != null) {
                if (!userRepository.existsById(inquiry.getLastEditedBy().getId())) {
                    inquiry.setLastEditedBy(null);
                }
            }
            
            Inquiry saved = inquiryRepository.save(inquiry);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error saving inquiry: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Inquiry> updateInquiry(@PathVariable Long id, @RequestBody Inquiry details) {
        return inquiryRepository.findById(id)
                .map(inquiry -> {
                    inquiry.setStyleNo(details.getStyleNo());
                    inquiry.setQuality(details.getQuality());
                    inquiry.setGsm(details.getGsm());
                    inquiry.setCountConst(details.getCountConst());
                    inquiry.setDesign(details.getDesign());
                    inquiry.setRemark(details.getRemark());
                    
                    inquiry.setSampleBooking(details.getSampleBooking());
                    inquiry.setDyingPrintingMill(details.getDyingPrintingMill());
                    inquiry.setValueAdditionMill(details.getValueAdditionMill());
                    inquiry.setReadymade(details.getReadymade());
                    
                    inquiry.setSubmissionDate(details.getSubmissionDate());
                    inquiry.setArticleNo(details.getArticleNo());
                    inquiry.setFabricName(details.getFabricName());
                    inquiry.setSubmissionGsm(details.getSubmissionGsm());
                    inquiry.setWidth(details.getWidth());
                    inquiry.setSubmissionCountConst(details.getSubmissionCountConst());
                    inquiry.setComposition(details.getComposition());
                    inquiry.setFeedback(details.getFeedback());
                    
                    if (details.getLastEditedBy() != null) {
                        inquiry.setLastEditedBy(details.getLastEditedBy());
                    }
                    
                    if (details.getStatus() != null) {
                        inquiry.setStatus(details.getStatus());
                    }
                    
                    return ResponseEntity.ok(inquiryRepository.save(inquiry));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Inquiry> updateInquiryStatus(@PathVariable Long id, @RequestParam String status) {
        return inquiryRepository.findById(id)
                .map(inquiry -> {
                    inquiry.setStatus(status);
                    return ResponseEntity.ok(inquiryRepository.save(inquiry));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInquiry(@PathVariable Long id) {
        return inquiryRepository.findById(id)
                .map(inquiry -> {
                    inquiryRepository.delete(inquiry);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
