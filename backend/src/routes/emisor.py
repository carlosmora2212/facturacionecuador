from flask import Blueprint, request, jsonify
from src.models.facturacion import db, Emisor

emisor_bp = Blueprint('emisor', __name__)

@emisor_bp.route('/emisores', methods=['GET'])
def get_emisores():
    """Obtener todos los emisores"""
    emisores = Emisor.query.all()
    return jsonify([emisor.to_dict() for emisor in emisores])

@emisor_bp.route('/emisores', methods=['POST'])
def create_emisor():
    """Crear un nuevo emisor"""
    data = request.get_json()
    
    if not data or not data.get('razon_social') or not data.get('ruc'):
        return jsonify({'error': 'Razón social y RUC son requeridos'}), 400
    
    # Verificar si el RUC ya existe
    if Emisor.query.filter_by(ruc=data['ruc']).first():
        return jsonify({'error': 'El RUC ya está registrado'}), 400
    
    emisor = Emisor(
        razon_social=data['razon_social'],
        ruc=data['ruc'],
        direccion=data.get('direccion'),
        telefono=data.get('telefono'),
        correo=data.get('correo'),
        logo_path=data.get('logo_path')
    )
    
    try:
        db.session.add(emisor)
        db.session.commit()
        return jsonify(emisor.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al crear el emisor'}), 500

@emisor_bp.route('/emisores/<int:emisor_id>', methods=['GET'])
def get_emisor(emisor_id):
    """Obtener un emisor por ID"""
    emisor = Emisor.query.get_or_404(emisor_id)
    return jsonify(emisor.to_dict())

@emisor_bp.route('/emisores/<int:emisor_id>', methods=['PUT'])
def update_emisor(emisor_id):
    """Actualizar un emisor existente"""
    emisor = Emisor.query.get_or_404(emisor_id)
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No se proporcionaron datos'}), 400
    
    # Verificar si el RUC ya existe en otro emisor
    if 'ruc' in data and data['ruc'] != emisor.ruc:
        if Emisor.query.filter_by(ruc=data['ruc']).first():
            return jsonify({'error': 'El RUC ya está registrado'}), 400
    
    # Actualizar campos
    if 'razon_social' in data:
        emisor.razon_social = data['razon_social']
    if 'ruc' in data:
        emisor.ruc = data['ruc']
    if 'direccion' in data:
        emisor.direccion = data['direccion']
    if 'telefono' in data:
        emisor.telefono = data['telefono']
    if 'correo' in data:
        emisor.correo = data['correo']
    if 'logo_path' in data:
        emisor.logo_path = data['logo_path']
    
    try:
        db.session.commit()
        return jsonify(emisor.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al actualizar el emisor'}), 500

@emisor_bp.route('/emisores/<int:emisor_id>', methods=['DELETE'])
def delete_emisor(emisor_id):
    """Eliminar un emisor"""
    emisor = Emisor.query.get_or_404(emisor_id)
    
    # Verificar si el emisor tiene facturas asociadas
    if emisor.facturas:
        return jsonify({'error': 'No se puede eliminar el emisor porque tiene facturas asociadas'}), 400
    
    try:
        db.session.delete(emisor)
        db.session.commit()
        return jsonify({'message': 'Emisor eliminado correctamente'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al eliminar el emisor'}), 500

