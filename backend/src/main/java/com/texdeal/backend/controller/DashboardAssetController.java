package com.texdeal.backend.controller;

import com.texdeal.backend.entity.DashboardAsset;
import com.texdeal.backend.repository.DashboardAssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/assets")
@CrossOrigin(origins = "*")
public class DashboardAssetController {

    @Autowired
    private DashboardAssetRepository assetRepository;

    @GetMapping
    public List<DashboardAsset> getAllAssets() {
        return assetRepository.findAll();
    }

    @GetMapping("/type/{type}")
    public List<DashboardAsset> getByType(@PathVariable String type) {
        return assetRepository.findByType(type);
    }

    @PostMapping
    public DashboardAsset addAsset(@RequestBody DashboardAsset asset) {
        return assetRepository.save(asset);
    }

    @DeleteMapping("/{id}")
    public void deleteAsset(@PathVariable Long id) {
        assetRepository.deleteById(id);
    }
}
