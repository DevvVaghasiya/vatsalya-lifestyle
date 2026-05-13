package com.texdeal.backend.repository;

import com.texdeal.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByClient_Id(Long clientId);
    List<Payment> findByOrderId(Long orderId);
}
