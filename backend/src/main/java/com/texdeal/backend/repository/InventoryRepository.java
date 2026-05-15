package com.texdeal.backend.repository;

import com.texdeal.backend.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    List<Inventory> findByCategory(String category);
    List<Inventory> findByCategoryAndStatus(String category, String status);
    List<Inventory> findByCategoryAndAccessCode(String category, String accessCode);
}
