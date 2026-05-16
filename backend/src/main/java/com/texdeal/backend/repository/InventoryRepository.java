package com.texdeal.backend.repository;

import com.texdeal.backend.entity.Inventory;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    
    @EntityGraph(attributePaths = {"createdBy", "lastEditedBy"})
    List<Inventory> findAll();

    @EntityGraph(attributePaths = {"createdBy", "lastEditedBy"})
    List<Inventory> findByCategory(String category);

    @EntityGraph(attributePaths = {"createdBy", "lastEditedBy"})
    List<Inventory> findByCategoryAndStatus(String category, String status);

    @EntityGraph(attributePaths = {"createdBy", "lastEditedBy", "dispatchEntries"})
    Optional<Inventory> findById(Long id);
}

