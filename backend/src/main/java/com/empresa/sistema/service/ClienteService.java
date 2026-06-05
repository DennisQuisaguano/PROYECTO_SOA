package com.empresa.sistema.service;

import com.empresa.sistema.dto.cliente.ClienteRequestDTO;
import com.empresa.sistema.dto.cliente.ClienteResponseDTO;

import java.util.List;

public interface ClienteService {
    List<ClienteResponseDTO> findAll();
    ClienteResponseDTO findById(String id);
    ClienteResponseDTO findByCedula(String cedula);
    ClienteResponseDTO create(ClienteRequestDTO dto);
    ClienteResponseDTO update(String id, ClienteRequestDTO dto);
}