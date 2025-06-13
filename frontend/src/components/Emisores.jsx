import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { emisorService } from '../lib/api';

const Emisores = () => {
  const [emisores, setEmisores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmisor, setEditingEmisor] = useState(null);
  const [formData, setFormData] = useState({
    razon_social: '',
    ruc: '',
    direccion: '',
    telefono: '',
    correo: '',
    logo_path: ''
  });

  useEffect(() => {
    fetchEmisores();
  }, []);

  const fetchEmisores = async () => {
    try {
      const response = await emisorService.getAll();
      setEmisores(response.data);
    } catch (error) {
      console.error('Error al cargar emisores:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmisor) {
        await emisorService.update(editingEmisor.id, formData);
      } else {
        await emisorService.create(formData);
      }
      
      setShowForm(false);
      setEditingEmisor(null);
      setFormData({
        razon_social: '',
        ruc: '',
        direccion: '',
        telefono: '',
        correo: '',
        logo_path: ''
      });
      fetchEmisores();
    } catch (error) {
      console.error('Error al guardar emisor:', error);
      alert('Error al guardar el emisor. Verifique los datos.');
    }
  };

  const handleEdit = (emisor) => {
    setEditingEmisor(emisor);
    setFormData(emisor);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este emisor?')) {
      try {
        await emisorService.delete(id);
        fetchEmisores();
      } catch (error) {
        console.error('Error al eliminar emisor:', error);
        alert('Error al eliminar el emisor.');
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Emisores</h2>
          <p className="text-gray-600 mt-2">
            Gestión de datos de la empresa emisora
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Emisor
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingEmisor ? 'Editar Emisor' : 'Nuevo Emisor'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="razon_social">Razón Social *</Label>
                  <Input
                    id="razon_social"
                    name="razon_social"
                    value={formData.razon_social}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ruc">RUC *</Label>
                  <Input
                    id="ruc"
                    name="ruc"
                    value={formData.ruc}
                    onChange={handleInputChange}
                    required
                    maxLength={13}
                  />
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="correo">Correo Electrónico</Label>
                  <Input
                    id="correo"
                    name="correo"
                    type="email"
                    value={formData.correo}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="direccion">Dirección</Label>
                <Textarea
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="logo_path">Ruta del Logo</Label>
                <Input
                  id="logo_path"
                  name="logo_path"
                  value={formData.logo_path}
                  onChange={handleInputChange}
                  placeholder="Ruta opcional del archivo de logo"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingEmisor ? 'Actualizar' : 'Crear'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEmisor(null);
                    setFormData({
                      razon_social: '',
                      ruc: '',
                      direccion: '',
                      telefono: '',
                      correo: '',
                      logo_path: ''
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {emisores.map((emisor) => (
          <Card key={emisor.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {emisor.razon_social}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>RUC:</strong> {emisor.ruc}</p>
                {emisor.direccion && (
                  <p><strong>Dirección:</strong> {emisor.direccion}</p>
                )}
                {emisor.telefono && (
                  <p><strong>Teléfono:</strong> {emisor.telefono}</p>
                )}
                {emisor.correo && (
                  <p><strong>Correo:</strong> {emisor.correo}</p>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(emisor)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(emisor.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {emisores.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No hay emisores registrados</p>
            <Button onClick={() => setShowForm(true)}>
              Crear primer emisor
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Emisores;

