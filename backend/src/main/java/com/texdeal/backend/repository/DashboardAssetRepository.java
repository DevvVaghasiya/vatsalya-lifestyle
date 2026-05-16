package com.texdeal.backend.repository;

import com.texdeal.backend.entity.DashboardAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DashboardAssetRepository extends JpaRepository<DashboardAsset, Long> {
    List<DashboardAsset> findByType(String type);
}
