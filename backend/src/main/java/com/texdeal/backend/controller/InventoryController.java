package com.texdeal.backend.controller;

import com.texdeal.backend.entity.Inventory;
import com.texdeal.backend.entity.StockDispatchEntry;
import com.texdeal.backend.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    @Autowired
    private InventoryRepository inventoryRepository;

    private static final double EPS = 1e-9;

    private void recalcStatus(Inventory inv) {
        if (inv.getCategory() != null && inv.getCategory().equalsIgnoreCase("FABRIC_ENTRY")) {
            inv.setStatus("available");
            return;
        }
        double stock = inv.getStockQuantity() != null ? inv.getStockQuantity() : 0.0;
        double sold = inv.getSoldQuantity() != null ? inv.getSoldQuantity() : 0.0;
        double available = stock - sold;

        if (available <= EPS) {
            inv.setStatus("sold");
        } else {
            inv.setStatus("available");
        }
    }

    @GetMapping
    public List<Inventory> getAllInventory(@RequestParam(required = false) String accessCode) {
        if (accessCode != null && !accessCode.isBlank()) {
            // We need findByAccessCode in repository or filter manually
            // Let's add findByAccessCode to InventoryRepository as well for consistency
            return inventoryRepository.findAll().stream()
                .filter(i -> accessCode.equals(i.getAccessCode()))
                .toList();
        }
        return inventoryRepository.findAll();
    }

    @GetMapping("/category/{category}")
    public List<Inventory> getByCategory(@PathVariable String category, @RequestParam(required = false) String accessCode) {
        if (accessCode != null && !accessCode.isBlank()) {
            return inventoryRepository.findByCategoryAndAccessCode(category.toUpperCase(), accessCode);
        }
        return inventoryRepository.findByCategory(category.toUpperCase());
    }

    @GetMapping("/category/{category}/status/{status}")
    public List<Inventory> getByCategoryAndStatus(@PathVariable String category, @PathVariable String status) {
        return inventoryRepository.findByCategoryAndStatus(category.toUpperCase(), status.toLowerCase());
    }

    @PostMapping
    public Inventory addInventory(@RequestBody Inventory inventory) {
        if (inventory.getCategory() == null) inventory.setCategory("STOCK");
        inventory.setCategory(inventory.getCategory().toUpperCase());
        if (inventory.getSoldQuantity() == null) inventory.setSoldQuantity(0.0);
        recalcStatus(inventory);
        return inventoryRepository.save(inventory);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Inventory> updateInventory(@PathVariable Long id, @RequestBody Inventory updated) {
        return inventoryRepository.findById(id).map(existing -> {
            if (updated.getFabricName() != null) existing.setFabricName(updated.getFabricName());
            if (updated.getFabricType() != null) existing.setFabricType(updated.getFabricType());
            if (updated.getComposition() != null) existing.setComposition(updated.getComposition());
            if (updated.getCountConst() != null) existing.setCountConst(updated.getCountConst());
            if (updated.getReferenceNo() != null) existing.setReferenceNo(updated.getReferenceNo());
            if (updated.getGsm() != null) existing.setGsm(updated.getGsm());
            if (updated.getWidth() != null) existing.setWidth(updated.getWidth());
            if (updated.getDesignPattern() != null) existing.setDesignPattern(updated.getDesignPattern());
            if (updated.getLotNumber() != null) existing.setLotNumber(updated.getLotNumber());
            if (updated.getRollNumber() != null) existing.setRollNumber(updated.getRollNumber());
            if (updated.getStockQuantity() != null) existing.setStockQuantity(updated.getStockQuantity());
            if (updated.getSoldQuantity() != null) existing.setSoldQuantity(updated.getSoldQuantity());
            if (updated.getRatePerMeter() != null) existing.setRatePerMeter(updated.getRatePerMeter());
            if (updated.getCostPrice() != null) existing.setCostPrice(updated.getCostPrice());
            if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
            if (updated.getColorCode() != null) existing.setColorCode(updated.getColorCode());
            if (updated.getRemark() != null) existing.setRemark(updated.getRemark());
            if (updated.getDispatchEntries() != null) {
                existing.getDispatchEntries().clear();
                existing.getDispatchEntries().addAll(updated.getDispatchEntries());
            }
            recalcStatus(existing);
            return ResponseEntity.ok(inventoryRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Add a dispatch entry and auto-update soldQuantity
    @PostMapping("/{id}/dispatch")
    public ResponseEntity<?> addDispatchEntry(@PathVariable Long id, @RequestBody StockDispatchEntry entry) {
        return inventoryRepository.findById(id).map(inv -> {
            double currentAvailable = (inv.getStockQuantity() != null ? inv.getStockQuantity() : 0)
                    - (inv.getSoldQuantity() != null ? inv.getSoldQuantity() : 0);

            if (entry.getQuantity() > currentAvailable) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Dispatch quantity (" + entry.getQuantity() + ") exceeds available stock (" + currentAvailable + ")")
                );
            }

            inv.getDispatchEntries().add(entry);
            double newSold = (inv.getSoldQuantity() != null ? inv.getSoldQuantity() : 0) + entry.getQuantity();
            inv.setSoldQuantity(newSold);
            recalcStatus(inv);

            return ResponseEntity.ok(inventoryRepository.save(inv));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInventory(@PathVariable Long id) {
        return inventoryRepository.findById(id).map(inv -> {
            inventoryRepository.delete(inv);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inventory> getInventoryById(@PathVariable Long id) {
        return inventoryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
