from flask import Blueprint, request, jsonify
from src.models.facturacion import db, Cliente

cliente_bp = Blueprint('cliente', __name__)

@cliente_bp.route('/clientes', methods=['GET'])
def get_clientes():
    """Obtener todos los clientes"""
    clientes = Cliente.query.all()
    return jsonify([cliente.to_dict() for cliente in clientes])

@cliente_bp.route('/clientes', methods=['POST'])
def create_cliente():
    """Crear un nuevo cliente"""
    data = request.get_json()
    
    if not data or not data.get('nombre') or not data.get('cedula_ruc'):
        return jsonify({'error': 'Nombre y cédula/RUC son requeridos'}), 400
    
    # Verificar si la cédula/RUC ya existe
    if Cliente.query.filter_by(cedula_ruc=data['cedula_ruc']).first():
        return jsonify({'error': 'La cédula/RUC ya está registrada'}), 400
    
    cliente = Cliente(
        nombre=data['nombre'],
        cedula_ruc=data['cedula_ruc'],
        direccion=data.get('direccion'),
        telefono=data.get('telefono'),
        correo=data.get('correo')
    )
    
    try:
        db.session.add(cliente)
        db.session.commit()
        return jsonify(cliente.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al crear el cliente'}), 500

@cliente_bp.route('/clientes/<int:cliente_id>', methods=['GET'])
def get_cliente(cliente_id):
    """Obtener un cliente por ID"""
    cliente = Cliente.query.get_or_404(cliente_id)
    return jsonify(cliente.to_dict())

@cliente_bp.route('/clientes/<int:cliente_id>', methods=['PUT'])
def update_cliente(cliente_id):
    """Actualizar un cliente existente"""
    cliente = Cliente.query.get_or_404(cliente_id)
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No se proporcionaron datos'}), 400
    
    # Verificar si la cédula/RUC ya existe en otro cliente
    if 'cedula_ruc' in data and data['cedula_ruc'] != cliente.cedula_ruc:
        if Cliente.query.filter_by(cedula_ruc=data['cedula_ruc']).first():
            return jsonify({'error': 'La cédula/RUC ya está registrada'}), 400
    
    # Actualizar campos
    if 'nombre' in data:
        cliente.nombre = data['nombre']
    if 'cedula_ruc' in data:
        cliente.cedula_ruc = data['cedula_ruc']
    if 'direccion' in data:
        cliente.direccion = data['direccion']
    if 'telefono' in data:
        cliente.telefono = data['telefono']
    if 'correo' in data:
        cliente.correo = data['correo']
    
    try:
        db.session.commit()
        return jsonify(cliente.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al actualizar el cliente'}), 500

@cliente_bp.route('/clientes/<int:cliente_id>', methods=['DELETE'])
def delete_cliente(cliente_id):
    """Eliminar un cliente"""
    cliente = Cliente.query.get_or_404(cliente_id)
    
    # Verificar si el cliente tiene facturas asociadas
    if cliente.facturas:
        return jsonify({'error': 'No se puede eliminar el cliente porque tiene facturas asociadas'}), 400
    
    try:
        db.session.delete(cliente)
        db.session.commit()
        return jsonify({'message': 'Cliente eliminado correctamente'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al eliminar el cliente'}), 500

