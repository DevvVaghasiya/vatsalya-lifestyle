package com.texdeal.backend.controller;

import com.texdeal.backend.entity.Order;
import com.texdeal.backend.entity.Inquiry;
import com.texdeal.backend.repository.OrderRepository;
import com.texdeal.backend.repository.InventoryRepository;
import com.texdeal.backend.repository.InquiryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private InquiryRepository inquiryRepository;

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        List<Order> allOrders = orderRepository.findAll();
        List<Inquiry> allInquiries = inquiryRepository.findAll();
        LocalDate today = LocalDate.now();
        
        long completedOrders = allOrders.stream()
            .filter(o -> o.getStatus() == Order.OrderStatus.COMPLETED)
            .count();

        long delayedOrders = allOrders.stream()
            .filter(o -> {
                Order.OrderStatus s = o.getStatus();
                if (s == Order.OrderStatus.COMPLETED || 
                    s == Order.OrderStatus.CANCELED || 
                    s == Order.OrderStatus.CANCELLED) {
                    return false;
                }
                String cDate = o.getCompletionDate();
                if (cDate == null || cDate.isEmpty()) {
                    return false;
                }
                try {
                    LocalDate completionDate = LocalDate.parse(cDate);
                    return completionDate.isBefore(today);
                } catch (DateTimeParseException e) {
                    return false;
                }
            })
            .count();

        long ongoingInquiries = allInquiries.stream()
            .filter(i -> "Ongoing".equalsIgnoreCase(i.getStatus()))
            .count();

        long completedInquiries = allInquiries.stream()
            .filter(i -> "Completed".equalsIgnoreCase(i.getStatus()))
            .count();

        stats.put("completedOrders", completedOrders);
        stats.put("delayedOrders", delayedOrders);
        stats.put("ongoingInquiries", ongoingInquiries);
        stats.put("completedInquiries", completedInquiries);

        // Keep inventory count for low stock if needed
        long lowStock = inventoryRepository.findAll().stream()
            .filter(i -> i.getStockQuantity() != null && i.getStockQuantity() < 50)
            .count();
        stats.put("lowStock", lowStock);
        
        return stats;
    }
}
