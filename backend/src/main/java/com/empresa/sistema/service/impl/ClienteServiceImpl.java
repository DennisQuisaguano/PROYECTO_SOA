package com.empresa.sistema.service.impl;

import com.empresa.sistema.dto.cliente.ClienteRequestDTO;
import com.empresa.sistema.dto.cliente.ClienteResponseDTO;
import com.empresa.sistema.dto.eventos.ClienteEvent;
import com.empresa.sistema.entity.Cliente;
import com.empresa.sistema.exception.ResourceNotFoundException;
import com.empresa.sistema.exception.ValidacionException;
import com.empresa.sistema.mapper.ClienteMapper;
import com.empresa.sistema.repository.ClienteRepository;
import com.empresa.sistema.service.ClienteService;
import com.empresa.sistema.util.ValidadorCedula;
import com.empresa.sistema.util.WebSocketEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClienteServiceImpl implements ClienteService {

    private final ClienteRepository clienteRepository;
    private final ClienteMapper clienteMapper;
    private final ValidadorCedula validadorCedula;
    private final WebSocketEventPublisher eventPublisher;
    private final com.empresa.sistema.util.SequenceGenerator sequenceGenerator;

    @Override
    @Transactional(readOnly = true)
    public List<ClienteResponseDTO> findAll() {
        return clienteRepository.findAllActive().stream()
                .map(clienteMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteResponseDTO findById(String id) {
        return clienteRepository.findActiveById(id)
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
            throw new ValidacionException("Ya existe un cliente activo con la cédula ingresada");
        }
        Cliente cliente = clienteMapper.toEntity(dto);
        cliente.setActivo(true);
        
        // Generar ID correlativo
        cliente.setId(sequenceGenerator.nextId("CLI"));
        
        Cliente saved = clienteRepository.save(cliente);

        // Notificar via WebSocket
        eventPublisher.publicarCambioCliente(ClienteEvent.builder()
                .tipo("CLIENTE_CREADO")
                .clienteId(saved.getId())
                .cedula(saved.getCedula())
                .nombreCompleto(saved.getNombreUno() + " " + saved.getApellidoPaterno())
                .timestamp(LocalDateTime.now())
                .build());

        return clienteMapper.toDto(saved);
    }

    @Override
    @Transactional
    public ClienteResponseDTO update(String id, ClienteRequestDTO dto) {
        Cliente cliente = clienteRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + id));
        
        if (!cliente.getCedula().equals(dto.getCedula())) {
            validadorCedula.validar(dto.getCedula());
            if (clienteRepository.findByCedula(dto.getCedula()).isPresent()) {
                throw new ValidacionException("Ya existe un cliente activo con la cédula ingresada");
            }
        }

        clienteMapper.updateEntityFromDto(dto, cliente);
        Cliente saved = clienteRepository.save(cliente);

        // Notificar via WebSocket
        eventPublisher.publicarCambioCliente(ClienteEvent.builder()
                .tipo("CLIENTE_ACTUALIZADO")
                .clienteId(saved.getId())
                .cedula(saved.getCedula())
                .nombreCompleto(saved.getNombreUno() + " " + saved.getApellidoPaterno())
                .timestamp(LocalDateTime.now())
                .build());

        return clienteMapper.toDto(saved);
    }

    @Override
    @Transactional
    public void delete(String id) {
        Cliente cliente = clienteRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + id));
        cliente.setActivo(false);
        Cliente saved = clienteRepository.save(cliente);

        // Notificar via WebSocket
        eventPublisher.publicarCambioCliente(ClienteEvent.builder()
                .tipo("CLIENTE_ELIMINADO")
                .clienteId(saved.getId())
                .cedula(saved.getCedula())
                .nombreCompleto(saved.getNombreUno() + " " + saved.getApellidoPaterno())
                .timestamp(LocalDateTime.now())
                .build());
    }
}