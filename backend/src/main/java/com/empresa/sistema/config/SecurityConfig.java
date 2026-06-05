package com.empresa.sistema.config;

import com.empresa.sistema.security.JwtAuthFilter;
import com.empresa.sistema.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configure(http))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/api/config/**").authenticated()
                        .requestMatchers("/api/sucursales/**", "/api/ciudades/**").authenticated()
                        .requestMatchers("/api/ventas/**", "/api/clientes/**").hasAnyRole("ADMIN", "CAJERO")
                        .requestMatchers("/api/solicitudes-stock/*/aprobar", "/api/solicitudes-stock/*/rechazar").hasAnyRole("BODEGUERO")
                        .requestMatchers(HttpMethod.POST, "/api/solicitudes-stock").hasAnyRole("ADMIN", "CAJERO", "BODEGUERO")
                        .requestMatchers("/api/solicitudes-stock/**").hasAnyRole("ADMIN", "BODEGUERO")
                        .requestMatchers(HttpMethod.GET, "/api/productos/**", "/api/inventarios/**", "/api/categorias/**").hasAnyRole("ADMIN", "CAJERO", "BODEGUERO")
                        .requestMatchers("/api/inventarios/movimientos/**").hasAnyRole("ADMIN", "BODEGUERO")
                        .requestMatchers(HttpMethod.POST, "/api/inventarios/transferir").hasAnyRole("BODEGUERO")
                        .requestMatchers("/api/productos/**", "/api/inventarios/**").hasAnyRole("ADMIN", "BODEGUERO")
                        .requestMatchers("/api/categorias/**").hasAnyRole("ADMIN", "BODEGUERO")
                        .requestMatchers("/api/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}