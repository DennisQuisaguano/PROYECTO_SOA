-- ============================================================
-- SCRIPT DE DATOS DE PRUEBA — Productos e Inventario
-- Sistema de Ventas, Stock e Inventario
-- 
-- INSTRUCCIONES:
--   Ejecutar DESPUÉS de que data.sql haya corrido exitosamente.
--   Compatible con MySQL 8+ y MariaDB 10+
-- ============================================================

USE sistema_ventas;

-- ─────────────────────────────────────────────────────────────
-- 1. CATEGORÍAS (8 categorías)
-- ─────────────────────────────────────────────────────────────
INSERT IGNORE INTO categorias (id, nombre, descripcion) VALUES
  ('CAT001', 'Electrónica',       'Dispositivos electrónicos, smartphones y laptops'),
  ('CAT002', 'Alimentos',         'Productos alimenticios no perecibles'),
  ('CAT003', 'Bebidas',           'Refrescos, jugos, agua y bebidas energéticas'),
  ('CAT004', 'Limpieza',          'Productos de aseo del hogar y limpieza industrial'),
  ('CAT005', 'Higiene Personal',  'Cuidado personal, shampoo, jabón y dental'),
  ('CAT006', 'Papelería',         'Útiles escolares y de oficina'),
  ('CAT007', 'Ferretería',        'Herramientas, tornillos y materiales de construcción'),
  ('CAT008', 'Lácteos y Frescos', 'Leche, queso, yogurt y derivados lácteos');

-- ─────────────────────────────────────────────────────────────
-- 2. PRODUCTOS (50 productos)
-- ─────────────────────────────────────────────────────────────
INSERT IGNORE INTO productos (id, nombre, descripcion, costo_unitario, precio_venta, activo, categoria_id) VALUES

-- ── ELECTRÓNICA (CAT001) ──────────────────────────────────────
('PRD001', 'Laptop Gamer X',           'Core i9 13900H, 32GB RAM, RTX 4070, 1TB SSD',    1200.00, 1899.99, 1, 'CAT001'),
('PRD002', 'Monitor UltraWide 34"',    'Panel IPS 34 pulgadas, 144Hz, FreeSync',           300.00,  449.99, 1, 'CAT001'),
('PRD003', 'Smartphone Galaxy A55',    '6.6" AMOLED, 128GB, 5G, Cámara 50MP',              280.00,  399.99, 1, 'CAT001'),
('PRD004', 'Auriculares Bluetooth',    'Cancelación de ruido activa, 40h batería',           45.00,   79.99, 1, 'CAT001'),
('PRD005', 'Teclado Mecánico RGB',     'Switches Blue, retroiluminación RGB, TKL',           35.00,   64.99, 1, 'CAT001'),
('PRD006', 'Mouse Inalámbrico',        '3200 DPI, receptor USB, 18 meses batería',           12.00,   24.99, 1, 'CAT001'),
('PRD007', 'Tablet 10" Android',       'Octa-core, 4GB RAM, 64GB, WiFi+4G',                120.00,  189.99, 1, 'CAT001'),

-- ── ALIMENTOS (CAT002) ────────────────────────────────────────
('PRD008', 'Arroz Blanco 5kg',         'Arroz grano largo, extra fino, calidad A',            3.80,    6.50, 1, 'CAT002'),
('PRD009', 'Fideo Spaghetti 400g',     'Pasta de sémola de trigo, Marca Del Monte',           0.90,    1.75, 1, 'CAT002'),
('PRD010', 'Aceite Vegetal 1L',        'Aceite vegetal refinado, sin colesterol',              2.00,    3.50, 1, 'CAT002'),
('PRD011', 'Azúcar Blanca 2kg',        'Azúcar refinada de caña 100%',                        1.60,    2.90, 1, 'CAT002'),
('PRD012', 'Sal Refinada 1kg',         'Sal de mesa yodada, fina',                            0.45,    0.90, 1, 'CAT002'),
('PRD013', 'Atún en Lata 180g',        'Atún en agua, light, sin preservantes',               1.20,    2.25, 1, 'CAT002'),
('PRD014', 'Avena Tradicional 500g',   'Avena en hojuelas, fibra natural',                    0.95,    1.80, 1, 'CAT002'),
('PRD015', 'Mantequilla 250g',         'Mantequilla sin sal, entera',                         2.10,    3.75, 1, 'CAT002'),
('PRD016', 'Harina de Trigo 1kg',      'Harina todo uso, extra suave',                        0.80,    1.50, 1, 'CAT002'),

-- ── BEBIDAS (CAT003) ──────────────────────────────────────────
('PRD017', 'Agua Purificada 500ml',    'Agua mineral natural sin gas',                        0.20,    0.50, 1, 'CAT003'),
('PRD018', 'Coca-Cola 3L',             'Refresco de cola, botella retornable',                 1.30,    2.25, 1, 'CAT003'),
('PRD019', 'Jugo Natura Naranja 1L',   'Jugo 100% natural sin azúcar añadida',                1.10,    2.00, 1, 'CAT003'),
('PRD020', 'Energizante Monster 473ml','Bebida energizante original, lata',                   1.40,    2.50, 1, 'CAT003'),
('PRD021', 'Leche de Soya 1L',         'Bebida vegetal de soya sin lactosa',                  1.50,    2.75, 1, 'CAT003'),
('PRD022', 'Café Soluble 170g',        'Café instantáneo clásico, frasco de vidrio',          3.50,    6.25, 1, 'CAT003'),

-- ── LIMPIEZA (CAT004) ─────────────────────────────────────────
('PRD023', 'Detergente Ariel 2kg',     'Detergente en polvo para ropa blanca y color',        4.20,    7.50, 1, 'CAT004'),
('PRD024', 'Cloro Desinfectante 1L',   'Hipoclorito de sodio al 5.25%',                       0.80,    1.60, 1, 'CAT004'),
('PRD025', 'Limpiavidrios 500ml',      'Limpiador multiusos con aroma a limón',               1.10,    2.00, 1, 'CAT004'),
('PRD026', 'Jabón Lava Vajilla 500ml', 'Desengrasante de manzana, ultra concentrado',         1.30,    2.40, 1, 'CAT004'),
('PRD027', 'Escoba Plástica',          'Escoba con mango de aluminio 1.2m',                   3.50,    6.99, 1, 'CAT004'),
('PRD028', 'Trapeador de Tela',        'Mopa tipo tira, 400g de algodón, mango desmontable',  4.00,    7.50, 1, 'CAT004'),
('PRD029', 'Desinfectante Pino 1L',    'Desinfectante de pino para pisos',                    1.00,    1.95, 1, 'CAT004'),

-- ── HIGIENE PERSONAL (CAT005) ─────────────────────────────────
('PRD030', 'Shampoo Sedal 400ml',      'Shampoo hidratante para cabello seco',                2.20,    4.25, 1, 'CAT005'),
('PRD031', 'Acondicionador Pantene 400ml','Acondicionador reparador con keratina',            2.40,    4.75, 1, 'CAT005'),
('PRD032', 'Pasta Dental Colgate 90g', 'Pasta blanqueadora con flúor triple acción',          1.10,    2.10, 1, 'CAT005'),
('PRD033', 'Cepillo Dental Oral-B',    'Cepillo suave de 3 cabezales',                        1.80,    3.50, 1, 'CAT005'),
('PRD034', 'Desodorante Rexona 150ml', 'Aerosol antitranspirante 48h protección',             2.50,    4.99, 1, 'CAT005'),
('PRD035', 'Jabón de Tocador Dove',    'Pastilla de jabón hidratante 135g, pack x3',          2.00,    3.75, 1, 'CAT005'),
('PRD036', 'Loción Corporal Nivea 400ml','Crema hidratante piel normal a seca',              3.80,    7.25, 1, 'CAT005'),

-- ── PAPELERÍA (CAT006) ────────────────────────────────────────
('PRD037', 'Resma de Papel A4 500h',   'Papel bond 75g/m², blancura 92%',                     3.80,    6.50, 1, 'CAT006'),
('PRD038', 'Bolígrafos BIC x12',       'Pack de 12 bolígrafos punta media azul',               1.50,    2.99, 1, 'CAT006'),
('PRD039', 'Cuaderno Universitario 100h','Cuaderno cuadrícula, tapa dura, anillado',           1.20,    2.25, 1, 'CAT006'),
('PRD040', 'Marcadores Permanentes x4','Set de 4 marcadores negro, azul, rojo, verde',         1.80,    3.50, 1, 'CAT006'),
('PRD041', 'Regla Metálica 30cm',      'Regla de aluminio con base antideslizante',            1.10,    2.10, 1, 'CAT006'),
('PRD042', 'Corrector Líquido 20ml',   'Corrector de secado rápido, base agua',                0.75,    1.50, 1, 'CAT006'),

-- ── FERRETERÍA (CAT007) ───────────────────────────────────────
('PRD043', 'Cinta Aislante Negra',     'Cinta aislante eléctrica 19mm x 10m, 600V',           0.80,    1.75, 1, 'CAT007'),
('PRD044', 'Tornillos Autoperforantes 100u','Tornillo 8x1" punta broca, galvanizado',          2.50,    4.99, 1, 'CAT007'),
('PRD045', 'Taladro Eléctrico 600W',   'Taladro percutor 600W con maletín y brocas',          45.00,   89.99, 1, 'CAT007'),
('PRD046', 'Flexómetro 5m',            'Cinta métrica de acero inoxidable 5 metros',           3.20,    6.50, 1, 'CAT007'),
('PRD047', 'Alicate Universal 8"',     'Alicate multiusos con mango dieléctico',               5.00,    9.99, 1, 'CAT007'),
('PRD048', 'Foco LED 9W',              'Bombillo LED luz blanca E27, 800 lúmens',              1.80,    3.75, 1, 'CAT007'),

-- ── LÁCTEOS Y FRESCOS (CAT008) ───────────────────────────────
('PRD049', 'Leche Entera 1L',          'Leche pasteurizada entera, 3.5% grasa',               0.90,    1.65, 1, 'CAT008'),
('PRD050', 'Queso Fresco 500g',        'Queso fresco prensado, sin sal',                       2.80,    5.25, 1, 'CAT008'),
('PRD051', 'Yogurt Natural 500ml',     'Yogurt griego sin azúcar, probióticos activos',        2.10,    3.99, 1, 'CAT008'),
('PRD052', 'Crema de Leche 250ml',     'Crema para batir, 35% grasa',                         1.60,    2.99, 1, 'CAT008'),
('PRD053', 'Huevos Frescos x12',       'Huevos de gallina criolla, Categoría A',               2.50,    4.25, 1, 'CAT008');


-- ─────────────────────────────────────────────────────────────
-- 3. INVENTARIOS
--    Cada producto tiene stock en las 3 sucursales,
--    pero con cantidades distintas para simular traslados.
--    SUC001 = Quito Norte | SUC002 = Ambato Centro | SUC003 = Cuenca Sur
-- ─────────────────────────────────────────────────────────────
INSERT IGNORE INTO inventarios (id, sucursal_id, producto_id, stock) VALUES

-- ── ELECTRÓNICA ──────────────────────────────────────────────
-- PRD001 Laptop Gamer X
('INV001', 'SUC001', 'PRD001', 10),
('INV002', 'SUC002', 'PRD001',  3),
('INV003', 'SUC003', 'PRD001',  5),
-- PRD002 Monitor UltraWide
('INV004', 'SUC001', 'PRD002', 15),
('INV005', 'SUC002', 'PRD002',  0),
('INV006', 'SUC003', 'PRD002',  8),
-- PRD003 Smartphone Galaxy
('INV007', 'SUC001', 'PRD003', 25),
('INV008', 'SUC002', 'PRD003', 12),
('INV009', 'SUC003', 'PRD003',  4),
-- PRD004 Auriculares Bluetooth
('INV010', 'SUC001', 'PRD004', 30),
('INV011', 'SUC002', 'PRD004', 20),
('INV012', 'SUC003', 'PRD004', 10),
-- PRD005 Teclado Mecánico
('INV013', 'SUC001', 'PRD005', 18),
('INV014', 'SUC002', 'PRD005',  5),
('INV015', 'SUC003', 'PRD005', 12),
-- PRD006 Mouse Inalámbrico
('INV016', 'SUC001', 'PRD006', 40),
('INV017', 'SUC002', 'PRD006', 22),
('INV018', 'SUC003', 'PRD006', 15),
-- PRD007 Tablet
('INV019', 'SUC001', 'PRD007',  8),
('INV020', 'SUC002', 'PRD007',  6),
('INV021', 'SUC003', 'PRD007',  2),

-- ── ALIMENTOS ────────────────────────────────────────────────
-- PRD008 Arroz 5kg
('INV022', 'SUC001', 'PRD008', 80),
('INV023', 'SUC002', 'PRD008', 50),
('INV024', 'SUC003', 'PRD008', 60),
-- PRD009 Fideo
('INV025', 'SUC001', 'PRD009',120),
('INV026', 'SUC002', 'PRD009', 90),
('INV027', 'SUC003', 'PRD009', 70),
-- PRD010 Aceite 1L
('INV028', 'SUC001', 'PRD010', 60),
('INV029', 'SUC002', 'PRD010', 45),
('INV030', 'SUC003', 'PRD010', 55),
-- PRD011 Azúcar
('INV031', 'SUC001', 'PRD011', 70),
('INV032', 'SUC002', 'PRD011', 40),
('INV033', 'SUC003', 'PRD011', 30),
-- PRD012 Sal
('INV034', 'SUC001', 'PRD012',100),
('INV035', 'SUC002', 'PRD012', 80),
('INV036', 'SUC003', 'PRD012', 90),
-- PRD013 Atún
('INV037', 'SUC001', 'PRD013', 50),
('INV038', 'SUC002', 'PRD013', 30),
('INV039', 'SUC003', 'PRD013', 20),
-- PRD014 Avena
('INV040', 'SUC001', 'PRD014', 45),
('INV041', 'SUC002', 'PRD014', 35),
('INV042', 'SUC003', 'PRD014', 25),
-- PRD015 Mantequilla
('INV043', 'SUC001', 'PRD015', 30),
('INV044', 'SUC002', 'PRD015', 20),
('INV045', 'SUC003', 'PRD015', 15),
-- PRD016 Harina
('INV046', 'SUC001', 'PRD016', 55),
('INV047', 'SUC002', 'PRD016', 40),
('INV048', 'SUC003', 'PRD016', 35),

-- ── BEBIDAS ──────────────────────────────────────────────────
-- PRD017 Agua 500ml
('INV049', 'SUC001', 'PRD017',200),
('INV050', 'SUC002', 'PRD017',150),
('INV051', 'SUC003', 'PRD017',180),
-- PRD018 Coca-Cola 3L
('INV052', 'SUC001', 'PRD018', 60),
('INV053', 'SUC002', 'PRD018', 40),
('INV054', 'SUC003', 'PRD018', 30),
-- PRD019 Jugo Natura
('INV055', 'SUC001', 'PRD019', 50),
('INV056', 'SUC002', 'PRD019', 35),
('INV057', 'SUC003', 'PRD019', 25),
-- PRD020 Monster
('INV058', 'SUC001', 'PRD020', 40),
('INV059', 'SUC002', 'PRD020', 28),
('INV060', 'SUC003', 'PRD020',  5),
-- PRD021 Leche Soya
('INV061', 'SUC001', 'PRD021', 30),
('INV062', 'SUC002', 'PRD021', 20),
('INV063', 'SUC003', 'PRD021', 18),
-- PRD022 Café Soluble
('INV064', 'SUC001', 'PRD022', 35),
('INV065', 'SUC002', 'PRD022', 22),
('INV066', 'SUC003', 'PRD022', 18),

-- ── LIMPIEZA ─────────────────────────────────────────────────
-- PRD023 Detergente Ariel
('INV067', 'SUC001', 'PRD023', 55),
('INV068', 'SUC002', 'PRD023', 40),
('INV069', 'SUC003', 'PRD023', 30),
-- PRD024 Cloro
('INV070', 'SUC001', 'PRD024', 70),
('INV071', 'SUC002', 'PRD024', 50),
('INV072', 'SUC003', 'PRD024', 45),
-- PRD025 Limpiavidrios
('INV073', 'SUC001', 'PRD025', 30),
('INV074', 'SUC002', 'PRD025', 20),
('INV075', 'SUC003', 'PRD025', 15),
-- PRD026 Jabón Vajilla
('INV076', 'SUC001', 'PRD026', 60),
('INV077', 'SUC002', 'PRD026', 45),
('INV078', 'SUC003', 'PRD026', 35),
-- PRD027 Escoba
('INV079', 'SUC001', 'PRD027', 20),
('INV080', 'SUC002', 'PRD027', 12),
('INV081', 'SUC003', 'PRD027',  8),
-- PRD028 Trapeador
('INV082', 'SUC001', 'PRD028', 15),
('INV083', 'SUC002', 'PRD028', 10),
('INV084', 'SUC003', 'PRD028',  6),
-- PRD029 Desinfectante Pino
('INV085', 'SUC001', 'PRD029', 40),
('INV086', 'SUC002', 'PRD029', 30),
('INV087', 'SUC003', 'PRD029', 22),

-- ── HIGIENE PERSONAL ─────────────────────────────────────────
-- PRD030 Shampoo
('INV088', 'SUC001', 'PRD030', 45),
('INV089', 'SUC002', 'PRD030', 30),
('INV090', 'SUC003', 'PRD030', 25),
-- PRD031 Acondicionador
('INV091', 'SUC001', 'PRD031', 35),
('INV092', 'SUC002', 'PRD031', 25),
('INV093', 'SUC003', 'PRD031', 18),
-- PRD032 Pasta Dental
('INV094', 'SUC001', 'PRD032', 70),
('INV095', 'SUC002', 'PRD032', 55),
('INV096', 'SUC003', 'PRD032', 40),
-- PRD033 Cepillo Dental
('INV097', 'SUC001', 'PRD033', 60),
('INV098', 'SUC002', 'PRD033', 45),
('INV099', 'SUC003', 'PRD033', 30),
-- PRD034 Desodorante
('INV100', 'SUC001', 'PRD034', 50),
('INV101', 'SUC002', 'PRD034', 35),
('INV102', 'SUC003', 'PRD034', 20),
-- PRD035 Jabón Dove
('INV103', 'SUC001', 'PRD035', 55),
('INV104', 'SUC002', 'PRD035', 40),
('INV105', 'SUC003', 'PRD035', 30),
-- PRD036 Loción Nivea
('INV106', 'SUC001', 'PRD036', 28),
('INV107', 'SUC002', 'PRD036', 18),
('INV108', 'SUC003', 'PRD036', 12),

-- ── PAPELERÍA ────────────────────────────────────────────────
-- PRD037 Resma A4
('INV109', 'SUC001', 'PRD037', 35),
('INV110', 'SUC002', 'PRD037', 20),
('INV111', 'SUC003', 'PRD037', 15),
-- PRD038 Bolígrafos
('INV112', 'SUC001', 'PRD038', 80),
('INV113', 'SUC002', 'PRD038', 60),
('INV114', 'SUC003', 'PRD038', 40),
-- PRD039 Cuaderno
('INV115', 'SUC001', 'PRD039', 70),
('INV116', 'SUC002', 'PRD039', 50),
('INV117', 'SUC003', 'PRD039', 35),
-- PRD040 Marcadores
('INV118', 'SUC001', 'PRD040', 45),
('INV119', 'SUC002', 'PRD040', 30),
('INV120', 'SUC003', 'PRD040', 20),
-- PRD041 Regla
('INV121', 'SUC001', 'PRD041', 50),
('INV122', 'SUC002', 'PRD041', 35),
('INV123', 'SUC003', 'PRD041', 25),
-- PRD042 Corrector
('INV124', 'SUC001', 'PRD042', 60),
('INV125', 'SUC002', 'PRD042', 45),
('INV126', 'SUC003', 'PRD042', 30),

-- ── FERRETERÍA ───────────────────────────────────────────────
-- PRD043 Cinta Aislante
('INV127', 'SUC001', 'PRD043', 80),
('INV128', 'SUC002', 'PRD043', 60),
('INV129', 'SUC003', 'PRD043', 50),
-- PRD044 Tornillos
('INV130', 'SUC001', 'PRD044', 40),
('INV131', 'SUC002', 'PRD044', 30),
('INV132', 'SUC003', 'PRD044', 20),
-- PRD045 Taladro
('INV133', 'SUC001', 'PRD045',  8),
('INV134', 'SUC002', 'PRD045',  5),
('INV135', 'SUC003', 'PRD045',  3),
-- PRD046 Flexómetro
('INV136', 'SUC001', 'PRD046', 25),
('INV137', 'SUC002', 'PRD046', 18),
('INV138', 'SUC003', 'PRD046', 12),
-- PRD047 Alicate
('INV139', 'SUC001', 'PRD047', 20),
('INV140', 'SUC002', 'PRD047', 14),
('INV141', 'SUC003', 'PRD047',  8),
-- PRD048 Foco LED
('INV142', 'SUC001', 'PRD048', 60),
('INV143', 'SUC002', 'PRD048', 45),
('INV144', 'SUC003', 'PRD048', 30),

-- ── LÁCTEOS Y FRESCOS ────────────────────────────────────────
-- PRD049 Leche Entera
('INV145', 'SUC001', 'PRD049',100),
('INV146', 'SUC002', 'PRD049', 80),
('INV147', 'SUC003', 'PRD049', 60),
-- PRD050 Queso Fresco
('INV148', 'SUC001', 'PRD050', 35),
('INV149', 'SUC002', 'PRD050', 25),
('INV150', 'SUC003', 'PRD050',  8),
-- PRD051 Yogurt Natural
('INV151', 'SUC001', 'PRD051', 40),
('INV152', 'SUC002', 'PRD051', 28),
('INV153', 'SUC003', 'PRD051', 15),
-- PRD052 Crema de Leche
('INV154', 'SUC001', 'PRD052', 30),
('INV155', 'SUC002', 'PRD052', 22),
('INV156', 'SUC003', 'PRD052', 10),
-- PRD053 Huevos x12
('INV157', 'SUC001', 'PRD053', 50),
('INV158', 'SUC002', 'PRD053', 35),
('INV159', 'SUC003', 'PRD053', 20);

-- ─────────────────────────────────────────────────────────────
-- VERIFICACIÓN RÁPIDA
-- ─────────────────────────────────────────────────────────────
-- SELECT COUNT(*) AS total_productos  FROM productos;      -- 53
-- SELECT COUNT(*) AS total_inventarios FROM inventarios;   -- 159
-- SELECT s.nombre, COUNT(i.id) AS lineas, SUM(i.stock) AS stock_total
--   FROM inventarios i JOIN sucursales s ON s.id = i.sucursal_id
--  GROUP BY s.nombre;
