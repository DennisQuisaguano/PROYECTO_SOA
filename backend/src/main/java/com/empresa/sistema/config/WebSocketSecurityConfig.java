package com.empresa.sistema.config;

import com.empresa.sistema.security.JwtUtil;
import com.empresa.sistema.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class WebSocketSecurityConfig {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Bean
    public JwtChannelInterceptor jwtChannelInterceptor() {
        return new JwtChannelInterceptor(jwtUtil, userDetailsService);
    }

    public static class JwtChannelInterceptor implements ChannelInterceptor {
        
        private final JwtUtil jwtUtil;
        private final UserDetailsServiceImpl userDetailsService;

        public JwtChannelInterceptor(JwtUtil jwtUtil, UserDetailsServiceImpl userDetailsService) {
            this.jwtUtil = jwtUtil;
            this.userDetailsService = userDetailsService;
        }

        @Override
        public Message<?> preSend(Message<?> message, MessageChannel channel) {
            StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
            
            if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                List<String> authorization = accessor.getNativeHeader("Authorization");
                if (authorization == null || authorization.isEmpty()) {
                    log.error("WebSocket connection failed: Missing Authorization header");
                    throw new MessageDeliveryException("Token inválido");
                }

                String bearerToken = authorization.get(0);
                if (!bearerToken.startsWith("Bearer ")) {
                    log.error("WebSocket connection failed: Authorization header must start with Bearer");
                    throw new MessageDeliveryException("Token inválido");
                }

                String jwt = bearerToken.substring(7);
                try {
                    String username = jwtUtil.extractUsername(jwt);
                    if (username != null) {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        if (jwtUtil.validateToken(jwt, userDetails)) {
                            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities()
                            );
                            accessor.setUser(authentication);
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                        } else {
                            throw new MessageDeliveryException("Token inválido");
                        }
                    } else {
                        throw new MessageDeliveryException("Token inválido");
                    }
                } catch (Exception e) {
                    log.error("WebSocket connection failed: " + e.getMessage());
                    throw new MessageDeliveryException("Token inválido");
                }
            }
            return message;
        }
    }
}
