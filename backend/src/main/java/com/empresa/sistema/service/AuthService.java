package com.empresa.sistema.service;

import com.empresa.sistema.dto.auth.AuthResponse;
import com.empresa.sistema.dto.auth.LoginRequest;

public interface AuthService {
    AuthResponse login(LoginRequest request);
}