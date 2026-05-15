package com.texdeal.backend.controller;

import com.texdeal.backend.entity.AppUser;
import com.texdeal.backend.entity.Order;
import com.texdeal.backend.repository.OrderRepository;
import com.texdeal.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    /** All users (for Partners tab) */
    @GetMapping("/users")
    public List<AppUser> getAllUsers() {
        return userRepository.findAll();
    }

    /** Only users with PENDING status (for Approvals tab) */
    @GetMapping("/users/pending")
    public List<AppUser> getPendingUsers() {
        return userRepository.findByStatus("PENDING");
    }

    /** Approve a user */
    @PatchMapping("/users/{id}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        Optional<AppUser> opt = userRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        AppUser user = opt.get();
        user.setStatus("APPROVED");
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("status", "APPROVED", "userId", id));
    }

    /** Reject a user */
    @PatchMapping("/users/{id}/reject")
    public ResponseEntity<?> rejectUser(@PathVariable Long id) {
        Optional<AppUser> opt = userRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        AppUser user = opt.get();
        user.setStatus("REJECTED");
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("status", "REJECTED", "userId", id));
    }

    @GetMapping("/orders")
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
