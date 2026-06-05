package com.empresa.sistema.util;

import com.empresa.sistema.entity.Usuario;
import com.empresa.sistema.exception.ResourceNotFoundException;
import com.empresa.sistema.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Helper centralizado para obtener información del usuario autenticado
 * desde el SecurityContext, evitando duplicación en los services.
 */
@Component
@RequiredArgsConstructor
public class SecurityHelper {

    private final UsuarioRepository usuarioRepository;

    /**
     * Retorna el username del usuario actualmente autenticado.
     */
    public String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    /**
     * Retorna la entidad Usuario del usuario actualmente autenticado.
     * Lanza ResourceNotFoundException si no se encuentra.
     */
    public Usuario getCurrentUsuario() {
        String username = getCurrentUsername();
        return usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario autenticado no encontrado: " + username));
    }

    /**
     * Busca un usuario por su ID. Retorna un Optional vacío si no existe.
     */
    public java.util.Optional<Usuario> findById(String userId) {
        return usuarioRepository.findById(userId);
    }
}
