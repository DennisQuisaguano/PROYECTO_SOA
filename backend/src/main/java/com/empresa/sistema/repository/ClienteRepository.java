package com.empresa.sistema.repository;

import com.empresa.sistema.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, String> {
    
    @Query("SELECT c FROM Cliente c WHERE c.activo = true")
    List<Cliente> findAllActive();

    @Query("SELECT c FROM Cliente c WHERE c.cedula = :cedula AND c.activo = true")
    Optional<Cliente> findByCedula(String cedula);

    @Query("SELECT c FROM Cliente c WHERE c.id = :id AND c.activo = true")
    Optional<Cliente> findActiveById(String id);
}