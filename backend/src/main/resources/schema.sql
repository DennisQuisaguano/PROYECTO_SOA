CREATE DATABASE IF NOT EXISTS sistema_ventas;
USE sistema_ventas;

-- DROP TABLES IN REVERSE ORDER
DROP TABLE IF EXISTS solicitudes_stock;
DROP TABLE IF EXISTS movimientos_inventario;
DROP TABLE IF EXISTS detalle_ventas;
DROP TABLE IF EXISTS ventas;
DROP TABLE IF EXISTS configuracion_factura;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS inventarios;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS sucursales;
DROP TABLE IF EXISTS ciudades;
DROP TABLE IF EXISTS roles;

-- 1. roles
CREATE TABLE roles (
    id VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. ciudades
CREATE TABLE ciudades (
    id VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    provincia VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. sucursales
CREATE TABLE sucursales (
    id VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL,
    ciudad_id VARCHAR(10) NOT NULL,
    FOREIGN KEY (ciudad_id) REFERENCES ciudades(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. usuarios
CREATE TABLE usuarios (
    id VARCHAR(10) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    activo TINYINT(1) DEFAULT 1,
    rol_id VARCHAR(10) NOT NULL,
    sucursal_id VARCHAR(10),
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. categorias
CREATE TABLE categorias (
    id VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. productos
CREATE TABLE productos (
    id VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    costo_unitario DECIMAL(10,2) NOT NULL,
    precio_venta DECIMAL(10,2) NOT NULL,
    activo TINYINT(1) DEFAULT 1,
    categoria_id VARCHAR(10) NOT NULL,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. inventarios
CREATE TABLE inventarios (
    id VARCHAR(10) PRIMARY KEY,
    sucursal_id VARCHAR(10) NOT NULL,
    producto_id VARCHAR(10) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY uk_sucursal_producto (sucursal_id, producto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. clientes
CREATE TABLE clientes (
    id VARCHAR(10) PRIMARY KEY,
    cedula VARCHAR(10) NOT NULL UNIQUE,
    nombre_uno VARCHAR(50) NOT NULL,
    nombre_dos VARCHAR(50),
    apellido_paterno VARCHAR(50) NOT NULL,
    apellido_materno VARCHAR(50),
    email VARCHAR(150),
    telefono VARCHAR(20),
    direccion TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. configuracion_factura
CREATE TABLE configuracion_factura (
    id VARCHAR(10) PRIMARY KEY,
    sucursal_id VARCHAR(10) NOT NULL UNIQUE,
    ultimo_numero INT DEFAULT 0,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. ventas
CREATE TABLE ventas (
    id VARCHAR(10) PRIMARY KEY,
    num_fac VARCHAR(20) NOT NULL UNIQUE,
    fecha DATETIME NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    iva DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado ENUM('PENDIENTE', 'COMPLETADA', 'ANULADA') NOT NULL,
    cliente_id VARCHAR(10) NOT NULL,
    sucursal_id VARCHAR(10) NOT NULL,
    cajero_id VARCHAR(10) NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (cajero_id) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. detalle_ventas
CREATE TABLE detalle_ventas (
    id VARCHAR(10) PRIMARY KEY,
    venta_id VARCHAR(10) NOT NULL,
    producto_id VARCHAR(10) NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. solicitudes_stock
CREATE TABLE solicitudes_stock (
    id VARCHAR(10) PRIMARY KEY,
    sucursal_origen_id VARCHAR(10) NOT NULL,
    sucursal_destino_id VARCHAR(10) NOT NULL,
    producto_id VARCHAR(10) NOT NULL,
    cantidad INT NOT NULL,
    estado ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA') NOT NULL,
    fecha_creacion DATETIME NOT NULL,
    motivo TEXT,
    FOREIGN KEY (sucursal_origen_id) REFERENCES sucursales(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (sucursal_destino_id) REFERENCES sucursales(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. movimientos_inventario (Kardex)
CREATE TABLE movimientos_inventario (
    id VARCHAR(36) PRIMARY KEY,
    sucursal_id VARCHAR(10) NOT NULL,
    producto_id VARCHAR(10) NOT NULL,
    cantidad INT NOT NULL,
    tipo VARCHAR(20) NOT NULL COMMENT 'INGRESO, BAJA, VENTA, TRASLADO',
    motivo TEXT,
    username VARCHAR(50) NOT NULL,
    fecha DATETIME NOT NULL,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;