package com.empresa.sistema.config;

import com.empresa.sistema.entity.Rol;
import com.empresa.sistema.entity.Usuario;
import com.empresa.sistema.repository.RolRepository;
import com.empresa.sistema.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Verificando integridad de usuarios y contraseñas...");

        // 1. Asegurar que los roles básicos existen
        checkAndCreateRol("ROL001", "ADMIN");
        checkAndCreateRol("ROL002", "CAJERO");
        checkAndCreateRol("ROL003", "BODEGUERO");

        // 2. Obtener todos los usuarios y verificar sus contraseñas
        List<Usuario> usuarios = usuarioRepository.findAll();
        
        if (usuarios.isEmpty()) {
            log.warn("¡No hay usuarios en la base de datos! Creando admin por defecto...");
            Rol adminRol = rolRepository.findByNombre("ADMIN").orElseThrow();
            usuarioRepository.save(Usuario.builder()
                    .id("USR001")
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .nombreCompleto("Administrador")
                    .rol(adminRol)
                    .activo(true)
                    .build());
        } else {
            log.info("Resetenado contraseñas de usuarios de prueba...");
            for (Usuario u : usuarios) {
                // Forzamos el reset sin condiciones para admin123
                u.setPassword(passwordEncoder.encode("admin123"));
                log.info(">>> PASSWORD RESET: Usuario '{}' ahora usa 'admin123'", u.getUsername());
            }
            usuarioRepository.saveAll(usuarios);
        }

        log.info(">>> SISTEMA LISTO: Todos los usuarios pueden entrar con la contraseña 'admin123'");
    }

    private void checkAndCreateRol(String id, String nombre) {
        if (rolRepository.findByNombre(nombre).isEmpty()) {
            rolRepository.save(new Rol(id, nombre));
        }
    }
}