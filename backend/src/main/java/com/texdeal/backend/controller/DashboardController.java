package com.texdeal.backend.controller;

import com.texdeal.backend.repository.OrderRepository;
import com.texdeal.backend.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        var allOrders = orderRepository.findAll();
        
        long totalDeals = allOrders.size();
        
        double pendingDues = allOrders.stream()
            .mapToDouble(d -> (d.getGrandTotal() != null ? d.getGrandTotal() : 0) - (d.getAdvancePaid() != null ? d.getAdvancePaid() : 0))
            .sum();

        double monthlySales = allOrders.stream()
            .filter(d -> d.getCreatedAt() != null && d.getCreatedAt().getMonth() == java.time.LocalDateTime.now().getMonth())
            .mapToDouble(d -> d.getGrandTotal() != null ? d.getGrandTotal() : 0)
            .sum();

        long lowStock = inventoryRepository.findAll().stream()
            .filter(i -> i.getStockQuantity() != null && i.getStockQuantity() < 50)
            .count();
        
        stats.put("totalDeals", totalDeals);
        stats.put("pendingDues", pendingDues);
        stats.put("sales", monthlySales);
        stats.put("lowStock", lowStock);
        
        return stats;
    }
}
