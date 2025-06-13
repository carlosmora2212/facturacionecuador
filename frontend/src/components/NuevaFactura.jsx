import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  emisorService, 
  clienteService, 
  productoServicioService, 
  facturaService 
} from '../lib/api';

const NuevaFactura = () => {
  const navigate = useNavigate();
  const [emisores, setEmisores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [formData, setFormData] = useState({
    emisor_id: '',
    cliente_id: '',
    forma_pago: '',
    fecha_emision: new Date().toISOString().split('T')[0],
    detalles: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [emisoresRes, clientesRes, productosRes] = await Promise.all([
        emisorService.getAll(),
        clienteService.getAll(),
        productoServicioService.getAll()
      ]);
      
      setEmisores(emisoresRes.data);
      setClientes(clientesRes.data);
      setProductos(productosRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const agregarDetalle = () => {
    setFormData(prev => ({
      ...prev,
      detalles: [
        ...prev.detalles,
        {
          producto_servicio_id: '',
          cantidad: 1,
          precio_unitario: 0,
          descuento: 0
        }
      ]
    }));
  };

  const eliminarDetalle = (index) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index)
    }));
  };

  const actualizarDetalle = (index, campo, valor) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.map((detalle, i) => {
        if (i === index) {
          const nuevoDetalle = { ...detalle, [campo]: valor };
          
          // Si se cambia el producto, actualizar el precio unitario
          if (campo === 'producto_servicio_id') {
            const producto = productos.find(p => p.id === parseInt(valor));
            if (producto) {
              nuevoDetalle.precio_unitario = producto.precio_unitario;
            }
          }
          
          return nuevoDetalle;
        }
        return detalle;
      })
    }));
  };

  const calcularSubtotal = () => {
    return formData.detalles.reduce((sum, detalle) => {
      const cantidad = parseFloat(detalle.cantidad) || 0;
      const precio = parseFloat(detalle.precio_unitario) || 0;
      const descuento = parseFloat(detalle.descuento) || 0;
      return sum + (cantidad * (precio - descuento));
    }, 0);
  };

  const calcularIVA = () => {
    return calcularSubtotal() * 0.12;
  };

  const calcularTotal = () => {
    return calcularSubtotal() + calcularIVA();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.emisor_id || !formData.cliente_id || !formData.forma_pago) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }
    
    if (formData.detalles.length === 0) {
      alert('Debe agregar al menos un producto o servicio');
      return;
    }

    try {
      const facturaData = {
        ...formData,
        detalles: formData.detalles.map(detalle => ({
          ...detalle,
          cantidad: parseInt(detalle.cantidad),
          precio_unitario: parseFloat(detalle.precio_unitario),
          descuento: parseFloat(detalle.descuento) || 0
        }))
      };

      await facturaService.create(facturaData);
      alert('Factura creada exitosamente');
      navigate('/facturas');
    } catch (error) {
      console.error('Error al crear factura:', error);
      alert('Error al crear la factura. Verifique los datos.');
    }
  };

  const formasPago = [
    'Efectivo',
    'Transferencia Bancaria',
    'Tarjeta de Crédito',
    'Tarjeta de Débito',
    'Cheque',
    'Crédito'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Nueva Factura</h2>
        <p className="text-gray-600 mt-2">
          Crear una nueva factura con los datos del emisor, cliente y productos/servicios
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos básicos */}
        <Card>
          <CardHeader>
            <CardTitle>Datos de la Factura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="emisor">Emisor *</Label>
                <Select 
                  value={formData.emisor_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, emisor_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar emisor" />
                  </SelectTrigger>
                  <SelectContent>
                    {emisores.map((emisor) => (
                      <SelectItem key={emisor.id} value={emisor.id.toString()}>
                        {emisor.razon_social}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="cliente">Cliente *</Label>
                <Select 
                  value={formData.cliente_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, cliente_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id.toString()}>
                        {cliente.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="forma_pago">Forma de Pago *</Label>
                <Select 
                  value={formData.forma_pago} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, forma_pago: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar forma de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    {formasPago.map((forma) => (
                      <SelectItem key={forma} value={forma}>
                        {forma}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha_emision">Fecha de Emisión</Label>
                <Input
                  id="fecha_emision"
                  type="date"
                  value={formData.fecha_emision}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha_emision: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalles de la factura */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Productos y Servicios</CardTitle>
              <Button type="button" onClick={agregarDetalle} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Agregar Producto/Servicio
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {formData.detalles.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No hay productos/servicios agregados</p>
                <Button type="button" onClick={agregarDetalle}>
                  Agregar primer producto/servicio
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.detalles.map((detalle, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                      <div className="md:col-span-2">
                        <Label>Producto/Servicio</Label>
                        <Select 
                          value={detalle.producto_servicio_id.toString()} 
                          onValueChange={(value) => actualizarDetalle(index, 'producto_servicio_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {productos.map((producto) => (
                              <SelectItem key={producto.id} value={producto.id.toString()}>
                                {producto.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Cantidad</Label>
                        <Input
                          type="number"
                          min="1"
                          value={detalle.cantidad}
                          onChange={(e) => actualizarDetalle(index, 'cantidad', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label>Precio Unit.</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={detalle.precio_unitario}
                          onChange={(e) => actualizarDetalle(index, 'precio_unitario', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label>Descuento</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={detalle.descuento}
                          onChange={(e) => actualizarDetalle(index, 'descuento', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => eliminarDetalle(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-right">
                      <span className="text-sm text-gray-600">
                        Subtotal: ${((detalle.cantidad || 0) * ((detalle.precio_unitario || 0) - (detalle.descuento || 0))).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Totales */}
        {formData.detalles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calcularSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (12%):</span>
                  <span>${calcularIVA().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${calcularTotal().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botones de acción */}
        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            Crear Factura
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/facturas')}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NuevaFactura;

