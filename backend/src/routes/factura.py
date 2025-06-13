from flask import Blueprint, request, jsonify, render_template, make_response
from src.models.facturacion import db, Factura, DetalleFactura, Emisor, Cliente, ProductoServicio
from datetime import datetime
import weasyprint
import os

factura_bp = Blueprint('factura', __name__)

def generar_numero_secuencial():
    """Genera el siguiente número secuencial para la factura"""
    ultima_factura = Factura.query.order_by(Factura.id.desc()).first()
    if ultima_factura:
        # Extraer el número de la última factura y incrementar
        try:
            ultimo_numero = int(ultima_factura.numero_secuencial.split('-')[-1])
            nuevo_numero = ultimo_numero + 1
        except (ValueError, IndexError):
            nuevo_numero = 1
    else:
        nuevo_numero = 1
    
    return f"001-001-{nuevo_numero:09d}"

@factura_bp.route('/facturas', methods=['GET'])
def get_facturas():
    """Obtener todas las facturas"""
    facturas = Factura.query.all()
    result = []
    for factura in facturas:
        factura_dict = factura.to_dict()
        # Agregar información del emisor y cliente
        factura_dict['emisor'] = factura.emisor.to_dict()
        factura_dict['cliente'] = factura.cliente.to_dict()
        result.append(factura_dict)
    return jsonify(result)

@factura_bp.route('/facturas', methods=['POST'])
def create_factura():
    """Crear una nueva factura"""
    data = request.get_json()
    
    if not data or not data.get('emisor_id') or not data.get('cliente_id') or not data.get('forma_pago'):
        return jsonify({'error': 'Emisor, cliente y forma de pago son requeridos'}), 400
    
    if not data.get('detalles') or len(data['detalles']) == 0:
        return jsonify({'error': 'La factura debe tener al menos un detalle'}), 400
    
    # Verificar que el emisor y cliente existan
    emisor = Emisor.query.get(data['emisor_id'])
    cliente = Cliente.query.get(data['cliente_id'])
    
    if not emisor:
        return jsonify({'error': 'Emisor no encontrado'}), 404
    if not cliente:
        return jsonify({'error': 'Cliente no encontrado'}), 404
    
    try:
        # Crear la factura
        factura = Factura(
            numero_secuencial=data.get('numero_secuencial') or generar_numero_secuencial(),
            fecha_emision=datetime.fromisoformat(data['fecha_emision']) if data.get('fecha_emision') else datetime.utcnow(),
            forma_pago=data['forma_pago'],
            emisor_id=data['emisor_id'],
            cliente_id=data['cliente_id']
        )
        
        db.session.add(factura)
        db.session.flush()  # Para obtener el ID de la factura
        
        # Crear los detalles de la factura
        for detalle_data in data['detalles']:
            if not detalle_data.get('producto_servicio_id') or not detalle_data.get('cantidad'):
                return jsonify({'error': 'Cada detalle debe tener producto/servicio y cantidad'}), 400
            
            producto_servicio = ProductoServicio.query.get(detalle_data['producto_servicio_id'])
            if not producto_servicio:
                return jsonify({'error': f'Producto/servicio con ID {detalle_data["producto_servicio_id"]} no encontrado'}), 404
            
            cantidad = int(detalle_data['cantidad'])
            precio_unitario = float(detalle_data.get('precio_unitario', producto_servicio.precio_unitario))
            descuento = float(detalle_data.get('descuento', 0.0))
            
            detalle = DetalleFactura(
                factura_id=factura.id,
                producto_servicio_id=detalle_data['producto_servicio_id'],
                cantidad=cantidad,
                precio_unitario=precio_unitario,
                descuento=descuento
            )
            
            detalle.calcular_precio_total()
            db.session.add(detalle)
        
        # Calcular totales de la factura
        db.session.flush()  # Para que los detalles estén disponibles
        factura.calcular_totales()
        
        db.session.commit()
        
        # Retornar la factura completa con sus relaciones
        factura_dict = factura.to_dict()
        factura_dict['emisor'] = factura.emisor.to_dict()
        factura_dict['cliente'] = factura.cliente.to_dict()
        
        return jsonify(factura_dict), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al crear la factura: {str(e)}'}), 500

@factura_bp.route('/facturas/<int:factura_id>', methods=['GET'])
def get_factura(factura_id):
    """Obtener una factura por ID"""
    factura = Factura.query.get_or_404(factura_id)
    factura_dict = factura.to_dict()
    factura_dict['emisor'] = factura.emisor.to_dict()
    factura_dict['cliente'] = factura.cliente.to_dict()
    return jsonify(factura_dict)

@factura_bp.route('/facturas/<int:factura_id>/pdf', methods=['GET'])
def get_factura_pdf(factura_id):
    """Generar y descargar el PDF de una factura"""
    try:
        factura = Factura.query.get_or_404(factura_id)
        emisor = factura.emisor
        cliente = factura.cliente
        
        # Renderizar la plantilla HTML
        html_content = render_template(
            'factura_pdf.html',
            factura=factura,
            emisor=emisor,
            cliente=cliente
        )
        
        # Generar el PDF usando WeasyPrint
        pdf = weasyprint.HTML(string=html_content).write_pdf()
        
        # Crear la respuesta
        response = make_response(pdf)
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = f'attachment; filename=factura_{factura.numero_secuencial}.pdf'
        
        return response
        
    except Exception as e:
        return jsonify({'error': f'Error al generar el PDF: {str(e)}'}), 500

@factura_bp.route('/facturas/<int:factura_id>', methods=['PUT'])
def update_factura(factura_id):
    """Actualizar una factura existente"""
    factura = Factura.query.get_or_404(factura_id)
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No se proporcionaron datos'}), 400
    
    try:
        # Actualizar campos básicos
        if 'forma_pago' in data:
            factura.forma_pago = data['forma_pago']
        if 'fecha_emision' in data:
            factura.fecha_emision = datetime.fromisoformat(data['fecha_emision'])
        
        # Si se proporcionan nuevos detalles, reemplazar los existentes
        if 'detalles' in data:
            # Eliminar detalles existentes
            for detalle in factura.detalles:
                db.session.delete(detalle)
            
            # Crear nuevos detalles
            for detalle_data in data['detalles']:
                if not detalle_data.get('producto_servicio_id') or not detalle_data.get('cantidad'):
                    return jsonify({'error': 'Cada detalle debe tener producto/servicio y cantidad'}), 400
                
                producto_servicio = ProductoServicio.query.get(detalle_data['producto_servicio_id'])
                if not producto_servicio:
                    return jsonify({'error': f'Producto/servicio con ID {detalle_data["producto_servicio_id"]} no encontrado'}), 404
                
                cantidad = int(detalle_data['cantidad'])
                precio_unitario = float(detalle_data.get('precio_unitario', producto_servicio.precio_unitario))
                descuento = float(detalle_data.get('descuento', 0.0))
                
                detalle = DetalleFactura(
                    factura_id=factura.id,
                    producto_servicio_id=detalle_data['producto_servicio_id'],
                    cantidad=cantidad,
                    precio_unitario=precio_unitario,
                    descuento=descuento
                )
                
                detalle.calcular_precio_total()
                db.session.add(detalle)
            
            # Recalcular totales
            db.session.flush()
            factura.calcular_totales()
        
        db.session.commit()
        
        # Retornar la factura actualizada
        factura_dict = factura.to_dict()
        factura_dict['emisor'] = factura.emisor.to_dict()
        factura_dict['cliente'] = factura.cliente.to_dict()
        
        return jsonify(factura_dict)
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al actualizar la factura: {str(e)}'}), 500

@factura_bp.route('/facturas/<int:factura_id>', methods=['DELETE'])
def delete_factura(factura_id):
    """Eliminar una factura"""
    factura = Factura.query.get_or_404(factura_id)
    
    try:
        db.session.delete(factura)
        db.session.commit()
        return jsonify({'message': 'Factura eliminada correctamente'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al eliminar la factura'}), 500

