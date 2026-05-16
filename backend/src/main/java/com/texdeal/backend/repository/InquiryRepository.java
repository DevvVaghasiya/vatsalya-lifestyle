package com.texdeal.backend.repository;

import com.texdeal.backend.entity.Inquiry;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    
    @EntityGraph(attributePaths = {"client", "createdBy", "lastEditedBy"})
    List<Inquiry> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"client", "createdBy", "lastEditedBy"})
    Optional<Inquiry> findById(Long id);
}

