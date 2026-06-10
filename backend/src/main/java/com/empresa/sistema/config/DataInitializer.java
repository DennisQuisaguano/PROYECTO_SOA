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

        // 1. Asegurar que los roles básicos existen
        checkAndCreateRol("ROL001", "ADMIN");
        checkAndCreateRol("ROL002", "CAJERO");
        checkAndCreateRol("ROL003", "BODEGUERO");

        // 2. Crear admin por defecto solo si no existe ningún usuario
        if (usuarioRepository.count() == 0) {
            log.warn("¡No hay usuarios en la base de datos! Creando admin por defecto...");
            Rol adminRol = rolRepository.findByNombre("ADMIN").orElseThrow();
            usuarioRepository.save(Usuario.builder()
                    .id("USR001")
                    .username("admin")
                    .password(passwordEncoder.encode("admin123")) // Cambiar tras el primer inicio
                    .nombre("Administrador")
                    .apellido("Sistema")
                    .rol(adminRol)
                    .activo(true)
                    .build());
            log.info(">>> USUARIO CREADO: Usuario 'admin' con clave 'admin123'.");
        }

        log.info(">>> SISTEMA LISTO.");
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
}
