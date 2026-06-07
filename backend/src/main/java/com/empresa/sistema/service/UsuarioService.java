package com.empresa.sistema.service;

import com.empresa.sistema.dto.usuario.UsuarioRequestDTO;
import com.empresa.sistema.dto.usuario.UsuarioResponseDTO;
import com.empresa.sistema.entity.Rol;

import java.util.List;

public interface UsuarioService {
    List<UsuarioResponseDTO> findAll();
    UsuarioResponseDTO findById(String id);
    UsuarioResponseDTO create(UsuarioRequestDTO dto);
    UsuarioResponseDTO update(String id, UsuarioRequestDTO dto);
    void delete(String id);
    List<Rol> findAllRoles();
}