package com.empresa.sistema.repository;

import com.empresa.sistema.entity.GlobalConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GlobalConfigRepository extends JpaRepository<GlobalConfig, String> {
}