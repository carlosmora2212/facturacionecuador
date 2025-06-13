import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { productoServicioService } from '../lib/api';

const ProductosServicios = () => {
  const [productos, setProductos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    precio_unitario: '',
    descripcion: ''
  });

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await productoServicioService.getAll();
      setProductos(response.data);
    } catch (error) {
      console.error('Error al cargar productos/servicios:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        precio_unitario: parseFloat(formData.precio_unitario)
      };

      if (editingProducto) {
        await productoServicioService.update(editingProducto.id, dataToSend);
      } else {
        await productoServicioService.create(dataToSend);
      }
      
      setShowForm(false);
      setEditingProducto(null);
      setFormData({
        nombre: '',
        precio_unitario: '',
        descripcion: ''
      });
      fetchProductos();
    } catch (error) {
      console.error('Error al guardar producto/servicio:', error);
      alert('Error al guardar el producto/servicio. Verifique los datos.');
    }
  };

  const handleEdit = (producto) => {
    setEditingProducto(producto);
    setFormData({
      ...producto,
      precio_unitario: producto.precio_unitario.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este producto/servicio?')) {
      try {
        await productoServicioService.delete(id);
        fetchProductos();
      } catch (error) {
        console.error('Error al eliminar producto/servicio:', error);
        alert('Error al eliminar el producto/servicio.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredProductos = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Productos y Servicios</h2>
          <p className="text-gray-600 mt-2">
            Gestión del catálogo de productos y servicios
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Producto/Servicio
        </Button>
      </div>

      {/* Buscador */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar producto/servicio</Label>
              <Input
                id="search"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProducto ? 'Editar Producto/Servicio' : 'Nuevo Producto/Servicio'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="precio_unitario">Precio Unitario *</Label>
                  <Input
                    id="precio_unitario"
                    name="precio_unitario"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio_unitario}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Descripción opcional del producto o servicio"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingProducto ? 'Actualizar' : 'Crear'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProducto(null);
                    setFormData({
                      nombre: '',
                      precio_unitario: '',
                      descripcion: ''
                    });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de productos/servicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProductos.map((producto) => (
          <Card key={producto.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {producto.nombre}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-green-600">
                  ${producto.precio_unitario.toFixed(2)}
                </p>
                {producto.descripcion && (
                  <p className="text-sm text-gray-600">{producto.descripcion}</p>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(producto)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(producto.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProductos.length === 0 && searchTerm && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron productos/servicios que coincidan con la búsqueda</p>
          </CardContent>
        </Card>
      )}

      {productos.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No hay productos/servicios registrados</p>
            <Button onClick={() => setShowForm(true)}>
              Crear primer producto/servicio
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductosServicios;

