package com.texdeal.backend.repository;

import com.texdeal.backend.entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    @EntityGraph(attributePaths = {"client", "user", "inventory"})
    List<Order> findAll();

    @EntityGraph(attributePaths = {"client", "user", "inventory", "dyeQuantityReceivedEntries", "digitalQuantityReceivedEntries", "dispatchQuantityReceivedEntries"})
    Optional<Order> findById(Long id);

    @EntityGraph(attributePaths = {"client", "user", "inventory"})
    List<Order> findByClient_Id(Long clientId);

    @EntityGraph(attributePaths = {"client", "user", "inventory"})
    List<Order> findByUser_Id(Long userId);
}

