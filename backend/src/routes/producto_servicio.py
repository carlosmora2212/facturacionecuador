from flask import Blueprint, request, jsonify
from src.models.facturacion import db, ProductoServicio

producto_servicio_bp = Blueprint('producto_servicio', __name__)

@producto_servicio_bp.route('/productos-servicios', methods=['GET'])
def get_productos_servicios():
    """Obtener todos los productos/servicios"""
    productos_servicios = ProductoServicio.query.all()
    return jsonify([ps.to_dict() for ps in productos_servicios])

@producto_servicio_bp.route('/productos-servicios', methods=['POST'])
def create_producto_servicio():
    """Crear un nuevo producto/servicio"""
    data = request.get_json()
    
    if not data or not data.get('nombre') or not data.get('precio_unitario'):
        return jsonify({'error': 'Nombre y precio unitario son requeridos'}), 400
    
    try:
        precio_unitario = float(data['precio_unitario'])
        if precio_unitario < 0:
            return jsonify({'error': 'El precio unitario debe ser mayor o igual a 0'}), 400
    except (ValueError, TypeError):
        return jsonify({'error': 'El precio unitario debe ser un número válido'}), 400
    
    producto_servicio = ProductoServicio(
        nombre=data['nombre'],
        precio_unitario=precio_unitario,
        descripcion=data.get('descripcion')
    )
    
    try:
        db.session.add(producto_servicio)
        db.session.commit()
        return jsonify(producto_servicio.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al crear el producto/servicio'}), 500

@producto_servicio_bp.route('/productos-servicios/<int:producto_servicio_id>', methods=['GET'])
def get_producto_servicio(producto_servicio_id):
    """Obtener un producto/servicio por ID"""
    producto_servicio = ProductoServicio.query.get_or_404(producto_servicio_id)
    return jsonify(producto_servicio.to_dict())

@producto_servicio_bp.route('/productos-servicios/<int:producto_servicio_id>', methods=['PUT'])
def update_producto_servicio(producto_servicio_id):
    """Actualizar un producto/servicio existente"""
    producto_servicio = ProductoServicio.query.get_or_404(producto_servicio_id)
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No se proporcionaron datos'}), 400
    
    # Validar precio unitario si se proporciona
    if 'precio_unitario' in data:
        try:
            precio_unitario = float(data['precio_unitario'])
            if precio_unitario < 0:
                return jsonify({'error': 'El precio unitario debe ser mayor o igual a 0'}), 400
            producto_servicio.precio_unitario = precio_unitario
        except (ValueError, TypeError):
            return jsonify({'error': 'El precio unitario debe ser un número válido'}), 400
    
    # Actualizar campos
    if 'nombre' in data:
        producto_servicio.nombre = data['nombre']
    if 'descripcion' in data:
        producto_servicio.descripcion = data['descripcion']
    
    try:
        db.session.commit()
        return jsonify(producto_servicio.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al actualizar el producto/servicio'}), 500

@producto_servicio_bp.route('/productos-servicios/<int:producto_servicio_id>', methods=['DELETE'])
def delete_producto_servicio(producto_servicio_id):
    """Eliminar un producto/servicio"""
    producto_servicio = ProductoServicio.query.get_or_404(producto_servicio_id)
    
    # Verificar si el producto/servicio tiene detalles de factura asociados
    if producto_servicio.detalles_factura:
        return jsonify({'error': 'No se puede eliminar el producto/servicio porque está siendo usado en facturas'}), 400
    
    try:
        db.session.delete(producto_servicio)
        db.session.commit()
        return jsonify({'message': 'Producto/servicio eliminado correctamente'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al eliminar el producto/servicio'}), 500

