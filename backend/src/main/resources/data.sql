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

-- INSERT 10 CATEGORIAS
INSERT INTO categorias (id, nombre, descripcion, activo) VALUES 
('CAT001', 'Electrónica', 'Dispositivos de consumo', 1),
('CAT002', 'Línea Blanca', 'Electrodomésticos hogar', 1),
('CAT003', 'Alimentos', 'Consumo diario', 1),
('CAT004', 'Limpieza', 'Productos de aseo', 1),
('CAT005', 'Ropa', 'Vestimenta general', 1),
('CAT006', 'Ferretería', 'Herramientas y materiales', 1),
('CAT007', 'Juguetería', 'Diversión para niños', 1),
('CAT008', 'Papelería', 'Útiles escolares y oficina', 1),
('CAT009', 'Deportes', 'Equipamiento deportivo', 1),
('CAT010', 'Salud', 'Higiene y cuidado personal', 1);

-- INSERT 100 PRODUCTOS (10 por categoría)
INSERT INTO productos (id, nombre, descripcion, costo_unitario, precio_venta, activo, categoria_id) VALUES 
-- CAT001
('PRD001', 'Smartphone X1', 'Gama alta 128GB', 350.00, 500.00, 1, 'CAT001'),
('PRD002', 'Laptop Pro', '16GB RAM SSD 512', 800.00, 1100.00, 1, 'CAT001'),
('PRD003', 'Tablet 10 pulg', 'Pantalla 4K', 150.00, 250.00, 1, 'CAT001'),
('PRD004', 'Audífonos BT', 'Cancelación de ruido', 45.00, 75.00, 1, 'CAT001'),
('PRD005', 'Reloj Smart', 'Monitor cardiaco', 30.00, 60.00, 1, 'CAT001'),
('PRD006', 'Monitor 27 pulg', '144Hz Gaming', 180.00, 280.00, 1, 'CAT001'),
('PRD007', 'Teclado Mecánico', 'RGB Retroiluminado', 40.00, 70.00, 1, 'CAT001'),
('PRD008', 'Mouse Inalámbrico', 'Ergonómico Pro', 15.00, 30.00, 1, 'CAT001'),
('PRD009', 'Cargador Carga Rápida', '65W USB-C', 10.00, 20.00, 1, 'CAT001'),
('PRD010', 'Batería Portátil', '20000mAh', 20.00, 40.00, 1, 'CAT001'),
-- CAT002
('PRD011', 'Refrigeradora Dual', 'Inverter 400L', 500.00, 750.00, 1, 'CAT002'),
('PRD012', 'Lavadora Frontal', '15KG carga', 400.00, 600.00, 1, 'CAT002'),
('PRD013', 'Microondas 20L', 'Función Grill', 60.00, 100.00, 1, 'CAT002'),
('PRD014', 'Cocina 4 Hornillas', 'A Gas Inox', 180.00, 280.00, 1, 'CAT002'),
('PRD015', 'Licuadora Pro', 'Vaso Vidrio', 35.00, 60.00, 1, 'CAT002'),
('PRD016', 'Batidora de Mano', '5 Velocidades', 15.00, 30.00, 1, 'CAT002'),
('PRD017', 'Arrocera 1.8L', 'Anti-adherente', 25.00, 45.00, 1, 'CAT002'),
('PRD018', 'Tostadora Eléctrica', 'Ranura Ancha', 20.00, 35.00, 1, 'CAT002'),
('PRD019', 'Cafetera Goteo', '12 Tazas', 30.00, 50.00, 1, 'CAT002'),
('PRD020', 'Plancha de Vapor', 'Suela Cerámica', 18.00, 32.00, 1, 'CAT002'),
-- CAT003
('PRD021', 'Arroz Superior 10kg', 'Grano largo', 12.00, 16.00, 1, 'CAT003'),
('PRD022', 'Aceite Vegetal 1L', 'Marca Oro', 1.80, 2.50, 1, 'CAT003'),
('PRD023', 'Atún en Lata', 'Trozo en aceite', 1.10, 1.60, 1, 'CAT003'),
('PRD024', 'Fideos Tallarín', 'Paquete 400g', 0.60, 0.95, 1, 'CAT003'),
('PRD025', 'Azúcar Blanca 1kg', 'Refinada', 0.85, 1.20, 1, 'CAT003'),
('PRD026', 'Café Instantáneo', 'Frasco 200g', 4.50, 6.50, 1, 'CAT003'),
('PRD027', 'Leche Entera 1L', 'UHT Larga vida', 0.80, 1.10, 1, 'CAT003'),
('PRD028', 'Yogurt Griego', 'Vaso personal', 0.60, 1.00, 1, 'CAT003'),
('PRD029', 'Pan Molde Familiar', 'Integral', 1.50, 2.30, 1, 'CAT003'),
('PRD030', 'Sal de Mesa 1kg', 'Yodada', 0.35, 0.55, 1, 'CAT003'),
-- CAT004
('PRD031', 'Detergente Polvo 1kg', 'Multiacción', 1.80, 2.75, 1, 'CAT004'),
('PRD032', 'Lavavajilla Líquido', 'Limón 500ml', 1.20, 1.90, 1, 'CAT004'),
('PRD033', 'Desinfectante Pino', 'Galón 3.7L', 4.50, 7.00, 1, 'CAT004'),
('PRD034', 'Cloro Concentrado', 'Litro', 0.80, 1.30, 1, 'CAT004'),
('PRD035', 'Suavizante Telas', 'Frasco 1L', 2.50, 4.00, 1, 'CAT004'),
('PRD036', 'Esponja de Cocina', 'Pack x3', 0.70, 1.20, 1, 'CAT004'),
('PRD037', 'Limpia Vidrios', 'Spray 500ml', 1.50, 2.50, 1, 'CAT004'),
('PRD038', 'Bolsas de Basura', 'Rollo x20', 2.00, 3.50, 1, 'CAT004'),
('PRD039', 'Jabón en Barra', 'Aroma floral', 0.65, 1.00, 1, 'CAT004'),
('PRD040', 'Desengrasante Pro', 'Fórmula fuerte', 3.00, 5.00, 1, 'CAT004'),
-- CAT005
('PRD041', 'Camiseta Algodón', 'Color sólido S-XL', 5.00, 12.00, 1, 'CAT005'),
('PRD042', 'Pantalón Jean', 'Slim fit azul', 15.00, 35.00, 1, 'CAT005'),
('PRD043', 'Chaqueta Deportiva', 'Impermeable', 20.00, 45.00, 1, 'CAT005'),
('PRD044', 'Zapatos Urbanos', 'Cuero sintético', 25.00, 55.00, 1, 'CAT005'),
('PRD045', 'Gorra Ajustable', 'Varios colores', 4.00, 10.00, 1, 'CAT005'),
('PRD046', 'Medias Pack x3', 'Deporte algodón', 2.50, 6.00, 1, 'CAT005'),
('PRD047', 'Cinturón Cuero', 'Formal negro', 8.00, 18.00, 1, 'CAT005'),
('PRD048', 'Bermuda Cargo', 'Gabardina', 12.00, 28.00, 1, 'CAT005'),
('PRD049', 'Sudadera Hoodie', 'Con capucha', 14.00, 32.00, 1, 'CAT005'),
('PRD050', 'Bufanda Lana', 'Para invierno', 5.00, 12.00, 1, 'CAT005'),
-- CAT006
('PRD051', 'Martillo Carpintero', 'Mango fibra', 6.00, 12.00, 1, 'CAT006'),
('PRD052', 'Destornillador Set', 'Puntas intercambiables', 8.00, 16.00, 1, 'CAT006'),
('PRD053', 'Taladro Percutor', '750W Eléctrico', 45.00, 75.00, 1, 'CAT006'),
('PRD054', 'Cinta Métrica 5m', 'Bloqueo automático', 3.00, 6.50, 1, 'CAT006'),
('PRD055', 'Llave Inglesa', 'Ajustable 10pulg', 7.00, 14.00, 1, 'CAT006'),
('PRD056', 'Pala Punta Huevo', 'Mango madera', 10.00, 20.00, 1, 'CAT006'),
('PRD057', 'Linterna LED', 'Recargable USB', 12.00, 22.00, 1, 'CAT006'),
('PRD058', 'Serrucho Mano', 'Diente fino', 9.00, 18.00, 1, 'CAT006'),
('PRD059', 'Nivel de Burbuja', 'Aluminio 24pulg', 8.00, 15.00, 1, 'CAT006'),
('PRD060', 'Guantes Trabajo', 'Cuero reforzado', 4.00, 9.00, 1, 'CAT006'),
-- CAT007
('PRD061', 'Auto a Control', 'Escala 1:16', 15.00, 30.00, 1, 'CAT007'),
('PRD062', 'Muñeca Articulada', 'Con accesorios', 12.00, 25.00, 1, 'CAT007'),
('PRD063', 'Bloques Construcción', 'Set 500 piezas', 20.00, 40.00, 1, 'CAT007'),
('PRD064', 'Puzzle 1000 pz', 'Paisaje natural', 10.00, 22.00, 1, 'CAT007'),
('PRD065', 'Pelota Fútbol', 'N° 5 Oficial', 8.00, 18.00, 1, 'CAT007'),
('PRD066', 'Juego de Mesa', 'Estrategia clásica', 14.00, 30.00, 1, 'CAT007'),
('PRD067', 'Dinosaurio Rex', 'Sonido y luces', 9.00, 18.00, 1, 'CAT007'),
('PRD068', 'Cocina de Juguete', 'Madera compacta', 30.00, 60.00, 1, 'CAT007'),
('PRD069', 'Avión Lanzador', 'Espuma aerodinámica', 4.00, 10.00, 1, 'CAT007'),
('PRD070', 'Kit de Pintura', 'Óleo y pinceles', 7.00, 15.00, 1, 'CAT007'),
-- CAT008
('PRD071', 'Cuaderno Universitario', '100 hojas cuadros', 1.20, 2.50, 1, 'CAT008'),
('PRD072', 'Esferos Azul Pack x12', 'Tinta gel', 3.00, 6.00, 1, 'CAT008'),
('PRD073', 'Resma Papel Bond A4', '500 hojas', 4.50, 7.50, 1, 'CAT008'),
('PRD074', 'Calculadora Científica', 'Funciones avanzadas', 12.00, 25.00, 1, 'CAT008'),
('PRD075', 'Carpeta Archivadora', 'Lomo ancho', 1.50, 3.00, 1, 'CAT008'),
('PRD076', 'Lápices de Colores', 'Caja x24', 3.50, 7.00, 1, 'CAT008'),
('PRD077', 'Mochila Escolar', 'Reforzada', 15.00, 35.00, 1, 'CAT008'),
('PRD078', 'Regla Metal 30cm', 'Inoxidable', 0.80, 1.50, 1, 'CAT008'),
('PRD079', 'Pegamento Barra', 'Stick 40g', 0.60, 1.20, 1, 'CAT008'),
('PRD080', 'Resaltadores Fluores', 'Pack x5', 2.00, 4.00, 1, 'CAT008'),
-- CAT009
('PRD081', 'Mancuernas 5kg', 'Par encauchadas', 10.00, 22.00, 1, 'CAT009'),
('PRD082', 'Mat de Yoga', 'Anti-deslizante', 8.00, 18.00, 1, 'CAT009'),
('PRD083', 'Cuerda Saltar', 'Contador digital', 4.00, 10.00, 1, 'CAT009'),
('PRD084', 'Botella Agua 1L', 'Tritán sin BPA', 5.00, 12.00, 1, 'CAT009'),
('PRD085', 'Bandas Resistencia', 'Set x3 niveles', 7.00, 15.00, 1, 'CAT009'),
('PRD086', 'Raqueta Tenis', 'Aluminio ligero', 25.00, 50.00, 1, 'CAT009'),
('PRD087', 'Guantes Boxeo', '12 Oz cuero', 18.00, 40.00, 1, 'CAT009'),
('PRD088', 'Casco Bicicleta', 'Ajustable Pro', 12.00, 28.00, 1, 'CAT009'),
('PRD089', 'Rodilleras Protect', 'Par reforzado', 6.00, 14.00, 1, 'CAT009'),
('PRD090', 'Bolsa de Deporte', 'Compartimento zapatos', 14.00, 30.00, 1, 'CAT009'),
-- CAT010
('PRD091', 'Pasta Dental 100ml', 'Triple protección', 1.10, 1.80, 1, 'CAT010'),
('PRD092', 'Shampoo Anticaspa', 'Frasco 400ml', 3.50, 6.00, 1, 'CAT010'),
('PRD093', 'Jabón Líquido', 'Frasco 250ml', 1.80, 3.20, 1, 'CAT010'),
('PRD094', 'Papel Higiénico x4', 'Doble hoja', 1.50, 2.50, 1, 'CAT010'),
('PRD095', 'Cepillo Dental Pro', 'Cerdas suaves', 0.90, 1.50, 1, 'CAT010'),
('PRD096', 'Desodorante Spray', 'Aroma fresco', 2.80, 4.50, 1, 'CAT010'),
('PRD097', 'Crema Corporal', 'Piel seca 400ml', 4.00, 7.50, 1, 'CAT010'),
('PRD098', 'Protector Solar', 'SPF 50+ 100ml', 8.00, 15.00, 1, 'CAT010'),
('PRD099', 'Enjuague Bucal', 'Menta 500ml', 3.00, 5.50, 1, 'CAT010'),
('PRD100', 'Toallitas Húmedas', 'Pack x80', 1.50, 2.80, 1, 'CAT010');

-- INSERT INVENTARIOS INICIALES (Sólo para SUC001)
INSERT INTO inventarios (id, sucursal_id, producto_id, stock) 
SELECT CONCAT('INV', SUBSTRING(id, 4)), 'SUC001', id, 50 FROM productos;

-- INSERT 10 CLIENTES DE PRUEBA
INSERT INTO clientes (id, cedula, nombre_uno, nombre_dos, apellido_paterno, apellido_materno, email, telefono, direccion, activo) VALUES 
('CLI001', '1712345678', 'Juan', 'Perez', 'Garcia', 'Mora', 'juan.perez@email.com', '0987654321', 'Av. 10 de Agosto', 1),
('CLI002', '1723456789', 'Maria', 'Luisa', 'Santos', 'Lopez', 'maria.santos@email.com', '0912345678', 'Sector Carolina', 1),
('CLI003', '1734567890', 'Carlos', 'Andres', 'Viteri', 'Paz', 'carlos.viteri@email.com', '0923456789', 'Ambato Sur', 1),
('CLI004', '1745678901', 'Ana', 'Belen', 'Castro', 'Luna', 'ana.castro@email.com', '0934567890', 'Quito Norte', 1),
('CLI005', '1756789012', 'Luis', 'Alberto', 'Ramos', 'Sol', 'luis.ramos@email.com', '0945678901', 'Cuenca Centro', 1),
('CLI006', '1767890123', 'Diana', 'Carolina', 'Mena', 'Fiel', 'diana.mena@email.com', '0956789012', 'Puyo Principal', 1),
('CLI007', '1778901234', 'Pedro', 'Jose', 'Sosa', 'Real', 'pedro.sosa@email.com', '0967890123', 'Manta Playa', 1),
('CLI008', '1789012345', 'Elena', 'Patricia', 'Guaman', 'Díaz', 'elena.guaman@email.com', '0978901234', 'Loja Parque', 1),
('CLI009', '1790123456', 'Roberto', 'Fabian', 'López', 'Ríos', 'roberto.lopez@email.com', '0989012345', 'Riobamba Centro', 1),
('CLI010', '1801234567', 'Sonia', 'Estela', 'Torres', 'Mora', 'sonia.torres@email.com', '0990123456', 'Quito Valle', 1);
