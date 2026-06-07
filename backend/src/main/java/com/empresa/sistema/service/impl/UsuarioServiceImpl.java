package com.empresa.sistema.service.impl;

import com.empresa.sistema.dto.usuario.UsuarioRequestDTO;
import com.empresa.sistema.dto.usuario.UsuarioResponseDTO;
import com.empresa.sistema.entity.Rol;
import com.empresa.sistema.entity.Sucursal;
import com.empresa.sistema.entity.Usuario;
import com.empresa.sistema.exception.ResourceNotFoundException;
import com.empresa.sistema.exception.ValidacionException;
import com.empresa.sistema.mapper.UsuarioMapper;
import com.empresa.sistema.repository.RolRepository;
import com.empresa.sistema.repository.SucursalRepository;
import com.empresa.sistema.repository.UsuarioRepository;
import com.empresa.sistema.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final SucursalRepository sucursalRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;
    private final com.empresa.sistema.util.SequenceGenerator sequenceGenerator;

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> findAll() {
        return usuarioRepository.findAll().stream()
                .map(usuarioMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponseDTO findById(String id) {
        return usuarioRepository.findById(id)
                .map(usuarioMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    @Override
    @Transactional
    public UsuarioResponseDTO create(UsuarioRequestDTO dto) {
        if (usuarioRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new ValidacionException("El nombre de usuario ya existe");
        }

        if (dto.getPassword() == null || dto.getPassword().isEmpty()) {
            throw new ValidacionException("La contraseña es requerida");
        }

        Rol rol = rolRepository.findById(dto.getRolId())
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));

        Sucursal sucursal = null;
        if (dto.getSucursalId() != null && !dto.getSucursalId().isEmpty()) {
            sucursal = sucursalRepository.findById(dto.getSucursalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sucursal no encontrada"));
        }

        Usuario usuario = usuarioMapper.toEntity(dto);
        usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        usuario.setRol(rol);
        usuario.setSucursal(sucursal);
        usuario.setActivo(true);
        
        // Generar ID correlativo
        usuario.setId(sequenceGenerator.nextId("USR"));

        return usuarioMapper.toDto(usuarioRepository.save(usuario));
    }

    @Override
    @Transactional
    public UsuarioResponseDTO update(String id, UsuarioRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (!usuario.getUsername().equals(dto.getUsername())) {
            if (usuarioRepository.findByUsername(dto.getUsername()).isPresent()) {
                throw new ValidacionException("El nombre de usuario ya existe");
            }
        }

        Rol rol = rolRepository.findById(dto.getRolId())
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));

        Sucursal sucursal = null;
        if (dto.getSucursalId() != null && !dto.getSucursalId().isEmpty()) {
            sucursal = sucursalRepository.findById(dto.getSucursalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sucursal no encontrada"));
        }

        usuarioMapper.updateEntityFromDto(dto, usuario);
        
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        
        usuario.setRol(rol);
        usuario.setSucursal(sucursal);
        
        if (dto.getActivo() != null) {
            usuario.setActivo(dto.getActivo());
        }

        return usuarioMapper.toDto(usuarioRepository.save(usuario));
    }

    @Override
    @Transactional
    public void delete(String id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        usuario.setActivo(false);
        usuarioRepository.save(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Rol> findAllRoles() {
        return rolRepository.findAll();
    }
}