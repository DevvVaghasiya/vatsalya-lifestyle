package com.texdeal.backend.repository;

import com.texdeal.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByClient_Id(Long clientId);
    List<Order> findByUser_Id(Long userId);
}
