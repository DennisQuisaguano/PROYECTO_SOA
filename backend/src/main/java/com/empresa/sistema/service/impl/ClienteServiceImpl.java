package com.empresa.sistema.service.impl;

import com.empresa.sistema.dto.cliente.ClienteRequestDTO;
import com.empresa.sistema.dto.cliente.ClienteResponseDTO;
import com.empresa.sistema.entity.Cliente;
import com.empresa.sistema.exception.ResourceNotFoundException;
import com.empresa.sistema.exception.ValidacionException;
import com.empresa.sistema.mapper.ClienteMapper;
import com.empresa.sistema.repository.ClienteRepository;
import com.empresa.sistema.service.ClienteService;
import com.empresa.sistema.util.ValidadorCedula;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClienteServiceImpl implements ClienteService {

    private final ClienteRepository clienteRepository;
    private final ClienteMapper clienteMapper;
    private final ValidadorCedula validadorCedula;

    @Override
    @Transactional(readOnly = true)
    public List<ClienteResponseDTO> findAll() {
        return clienteRepository.findAll().stream()
                .map(clienteMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteResponseDTO findById(String id) {
        return clienteRepository.findById(id)
                .map(clienteMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteResponseDTO findByCedula(String cedula) {
        return clienteRepository.findByCedula(cedula)
                .map(clienteMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con cédula: " + cedula));
    }

    @Override
    @Transactional
    public ClienteResponseDTO create(ClienteRequestDTO dto) {
        validadorCedula.validar(dto.getCedula());
        if (clienteRepository.findByCedula(dto.getCedula()).isPresent()) {
            throw new ValidacionException("Ya existe un cliente con la cédula ingresada");
        }
        Cliente cliente = clienteMapper.toEntity(dto);
        return clienteMapper.toDto(clienteRepository.save(cliente));
    }

    @Override
    @Transactional
    public ClienteResponseDTO update(String id, ClienteRequestDTO dto) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + id));
        
        if (!cliente.getCedula().equals(dto.getCedula())) {
            validadorCedula.validar(dto.getCedula());
            if (clienteRepository.findByCedula(dto.getCedula()).isPresent()) {
                throw new ValidacionException("Ya existe un cliente con la cédula ingresada");
            }
        }

        clienteMapper.updateEntityFromDto(dto, cliente);
        return clienteMapper.toDto(clienteRepository.save(cliente));
    }
}