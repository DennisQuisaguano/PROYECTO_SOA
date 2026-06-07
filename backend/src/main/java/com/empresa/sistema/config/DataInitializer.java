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
    private final com.empresa.sistema.repository.GlobalSequenceRepository sequenceRepository;
    private final com.empresa.sistema.repository.ProductoRepository productoRepository;
    private final com.empresa.sistema.repository.ClienteRepository clienteRepository;
    private final com.empresa.sistema.repository.CategoriaRepository categoriaRepository;
    private final jakarta.persistence.EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Verificando integridad del sistema...");

        // Sincronizar secuencias para mantener el orden PRD001, PRD053, CAT001, etc.
        syncSequence("PRD", productoRepository);
        syncSequence("USR", usuarioRepository);
        syncSequence("CLI", clienteRepository);
        syncSequence("CAT", categoriaRepository);

        // --- DATA MIGRATION: Activar registros existentes que no tengan el campo 'activo' ---
        log.info("Migrando datos existentes para habilitar campo 'activo'...");
        activarRegistrosExistentes();

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

    private void syncSequence(String prefix, org.springframework.data.jpa.repository.JpaRepository<?, String> repository) {
        if (sequenceRepository.existsById(prefix)) return;

        long maxVal = 0;
        List<?> entities = repository.findAll();
        for (Object e : entities) {
            try {
                java.lang.reflect.Method getId = e.getClass().getMethod("getId");
                String id = (String) getId.invoke(e);
                if (id != null && id.startsWith(prefix)) {
                    String numericPart = id.substring(prefix.length());
                    String digits = numericPart.replaceAll("[^0-9]", "");
                    if (!digits.isEmpty()) {
                        long val = Long.parseLong(digits);
                        if (val > maxVal) maxVal = val;
                    }
                }
            } catch (Exception ex) {
                // Silently ignore reflection errors
            }
        }
        
        sequenceRepository.save(com.empresa.sistema.entity.GlobalSequence.builder()
                .prefix(prefix)
                .lastValue(maxVal)
                .build());
        log.info(">>> SEQUENCE SYNC: Prefijo '{}' sincronizado con el valor inicial: {}", prefix, maxVal);
    }

    private void activarRegistrosExistentes() {
        try {
            entityManager.createNativeQuery("UPDATE categorias SET activo = true").executeUpdate();
            log.info(">>> MIGRATION: Todas las categorías han sido marcadas como activas.");
        } catch (Exception e) {
            log.warn(">>> MIGRATION WARNING: No se pudo ejecutar la activación automática: {}", e.getMessage());
        }
    }
}
