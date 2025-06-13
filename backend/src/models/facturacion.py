from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Emisor(db.Model):
    __tablename__ = 'emisor'
    
    id = db.Column(db.Integer, primary_key=True)
    razon_social = db.Column(db.String(200), nullable=False)
    ruc = db.Column(db.String(13), unique=True, nullable=False)
    direccion = db.Column(db.Text)
    telefono = db.Column(db.String(20))
    correo = db.Column(db.String(100))
    logo_path = db.Column(db.String(255))  # Ruta del logo
    
    # Relación con facturas
    facturas = db.relationship('Factura', backref='emisor', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'razon_social': self.razon_social,
            'ruc': self.ruc,
            'direccion': self.direccion,
            'telefono': self.telefono,
            'correo': self.correo,
            'logo_path': self.logo_path
        }

class Cliente(db.Model):
    __tablename__ = 'cliente'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)
    cedula_ruc = db.Column(db.String(13), unique=True, nullable=False)
    direccion = db.Column(db.Text)
    telefono = db.Column(db.String(20))
    correo = db.Column(db.String(100))
    
    # Relación con facturas
    facturas = db.relationship('Factura', backref='cliente', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'cedula_ruc': self.cedula_ruc,
            'direccion': self.direccion,
            'telefono': self.telefono,
            'correo': self.correo
        }

class ProductoServicio(db.Model):
    __tablename__ = 'producto_servicio'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)
    precio_unitario = db.Column(db.Float, nullable=False)
    descripcion = db.Column(db.Text)
    
    # Relación con detalles de factura
    detalles_factura = db.relationship('DetalleFactura', backref='producto_servicio', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'precio_unitario': self.precio_unitario,
            'descripcion': self.descripcion
        }

class Factura(db.Model):
    __tablename__ = 'factura'
    
    id = db.Column(db.Integer, primary_key=True)
    numero_secuencial = db.Column(db.String(20), unique=True, nullable=False)
    fecha_emision = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    forma_pago = db.Column(db.String(50), nullable=False)
    
    # Claves foráneas
    emisor_id = db.Column(db.Integer, db.ForeignKey('emisor.id'), nullable=False)
    cliente_id = db.Column(db.Integer, db.ForeignKey('cliente.id'), nullable=False)
    
    # Campos calculados
    subtotal = db.Column(db.Float, nullable=False, default=0.0)
    iva = db.Column(db.Float, nullable=False, default=0.0)
    total = db.Column(db.Float, nullable=False, default=0.0)
    
    # Relación con detalles de factura
    detalles = db.relationship('DetalleFactura', backref='factura', lazy=True, cascade='all, delete-orphan')
    
    def calcular_totales(self):
        """Calcula subtotal, IVA y total basado en los detalles"""
        self.subtotal = sum(detalle.precio_total for detalle in self.detalles)
        self.iva = self.subtotal * 0.12  # IVA del 12% según normativa del SRI
        self.total = self.subtotal + self.iva
    
    def to_dict(self):
        return {
            'id': self.id,
            'numero_secuencial': self.numero_secuencial,
            'fecha_emision': self.fecha_emision.isoformat() if self.fecha_emision else None,
            'forma_pago': self.forma_pago,
            'emisor_id': self.emisor_id,
            'cliente_id': self.cliente_id,
            'subtotal': self.subtotal,
            'iva': self.iva,
            'total': self.total,
            'detalles': [detalle.to_dict() for detalle in self.detalles]
        }

class DetalleFactura(db.Model):
    __tablename__ = 'detalle_factura'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Claves foráneas
    factura_id = db.Column(db.Integer, db.ForeignKey('factura.id'), nullable=False)
    producto_servicio_id = db.Column(db.Integer, db.ForeignKey('producto_servicio.id'), nullable=False)
    
    # Datos del detalle
    cantidad = db.Column(db.Integer, nullable=False)
    precio_unitario = db.Column(db.Float, nullable=False)  # Precio al momento de la factura
    descuento = db.Column(db.Float, nullable=False, default=0.0)
    precio_total = db.Column(db.Float, nullable=False)
    
    def calcular_precio_total(self):
        """Calcula el precio total del detalle"""
        precio_con_descuento = self.precio_unitario - self.descuento
        self.precio_total = self.cantidad * precio_con_descuento
    
    def to_dict(self):
        return {
            'id': self.id,
            'factura_id': self.factura_id,
            'producto_servicio_id': self.producto_servicio_id,
            'cantidad': self.cantidad,
            'precio_unitario': self.precio_unitario,
            'descuento': self.descuento,
            'precio_total': self.precio_total,
            'producto_servicio': self.producto_servicio.to_dict() if self.producto_servicio else None
        }

