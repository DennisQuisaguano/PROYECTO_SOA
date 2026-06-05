package com.empresa.sistema.service.impl;

import com.empresa.sistema.dto.auth.AuthResponse;
import com.empresa.sistema.dto.auth.LoginRequest;
import com.empresa.sistema.entity.Usuario;
import com.empresa.sistema.exception.ResourceNotFoundException;
import com.empresa.sistema.repository.UsuarioRepository;
import com.empresa.sistema.security.JwtUtil;
import com.empresa.sistema.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtUtil jwtUtil;

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        // 1. Validar credenciales
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        // 2. Obtener usuario (el select que vimos en tus logs)
        Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // 3. Obtener IDs de relaciones (aquí solía fallar por ser LAZY)
        String sucursalId = (usuario.getSucursal() != null) ? usuario.getSucursal().getId() : null;
        String rolNombre = (usuario.getRol() != null) ? usuario.getRol().getNombre() : "USER";

        // 4. Generar Token incluyendo el ID
        String token = jwtUtil.generateToken(usuario.getUsername(), rolNombre, sucursalId);

        return AuthResponse.builder()
                .token(token)
                .userId(usuario.getId())
                .username(usuario.getUsername())
                .rol(rolNombre)
                .sucursalId(sucursalId)
                .nombreCompleto(usuario.getNombreCompleto())
                .build();
    }
}