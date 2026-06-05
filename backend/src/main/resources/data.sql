-- INSERT ROLES
INSERT INTO roles (id, nombre) VALUES ('ROL001', 'ADMIN'), ('ROL002', 'CAJERO'), ('ROL003', 'BODEGUERO');

-- INSERT CIUDADES
INSERT INTO ciudades (id, nombre, provincia) VALUES ('CIU001', 'Quito', 'Pichincha'), ('CIU002', 'Ambato', 'Tungurahua'), ('CIU003', 'Cuenca', 'Azuay');

-- INSERT SUCURSALES
INSERT INTO sucursales (id, nombre, direccion, ciudad_id) VALUES 
('SUC001', 'Sucursal Quito Norte', 'Av. Amazonas N123', 'CIU001'),
('SUC002', 'Sucursal Ambato Centro', 'Calle Bolivar', 'CIU002'),
('SUC003', 'Sucursal Cuenca Sur', 'Av. Solano', 'CIU003');

-- INSERT CONFIG FACTURACION
INSERT INTO configuracion_factura (id, sucursal_id, ultimo_numero) VALUES ('CNF001', 'SUC001', 0), ('CNF002', 'SUC002', 0), ('CNF003', 'SUC003', 0);

-- INSERT USUARIOS (Contraseña admin123 en BCrypt)
-- Hash: $2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.7u41W3u
INSERT INTO usuarios (id, username, password, nombre_completo, activo, rol_id, sucursal_id) VALUES 
('USR001', 'admin', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.7u41W3u', 'Admin Principal', 1, 'ROL001', 'SUC001'),
('USR002', 'cajero1', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.7u41W3u', 'Cajero General', 1, 'ROL002', 'SUC001'),
('USR003', 'bodega1', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.7u41W3u', 'Bodeguero General', 1, 'ROL003', 'SUC002');

-- INSERT CATEGORIAS Y PRODUCTOS DE PRUEBA
INSERT INTO categorias (id, nombre, descripcion) VALUES ('CAT001', 'Electrónica', 'Smartphones y Laptops'), ('CAT002', 'Alimentos', 'No perecibles');

INSERT INTO productos (id, nombre, descripcion, costo_unitario, precio_venta, activo, categoria_id) VALUES 
('PRD001', 'Laptop Gamer X', 'Core i9, 32GB RAM', 1200.00, 1800.00, 1, 'CAT001'),
('PRD002', 'Monitor UltraWide', '34 pulgadas 144Hz', 300.00, 450.00, 1, 'CAT001'),
('PRD003', 'Aceite Vegetal 1L', 'Marca Superior', 2.00, 3.50, 1, 'CAT002');

-- INSERT INVENTARIOS (Ejemplo: Solo Quito tiene stock del PRD001, PRD002 en Ambato)
INSERT INTO inventarios (id, sucursal_id, producto_id, stock) VALUES 
('INV001', 'SUC001', 'PRD001', 10),
('INV002', 'SUC002', 'PRD002', 15),
('INV003', 'SUC003', 'PRD003', 100);

-- INSERT CLIENTES DE PRUEBA
INSERT INTO clientes (id, cedula, nombre_uno, nombre_dos, apellido_paterno, apellido_materno, email, telefono, direccion) VALUES 
('CLI001', '1712345678', 'Juan', 'Perez', 'Garcia', 'Mora', 'juan.perez@email.com', '0987654321', 'Av. 10 de Agosto'),
('CLI002', '1723456789', 'Maria', 'Luisa', 'Santos', 'Lopez', 'maria.santos@email.com', '0912345678', 'Sector Carolina');