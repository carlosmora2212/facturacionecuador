import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, Eye, Trash2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { facturaService } from '../lib/api';

const Facturas = () => {
  const [facturas, setFacturas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');

  useEffect(() => {
    fetchFacturas();
  }, []);

  const fetchFacturas = async () => {
    try {
      const response = await facturaService.getAll();
      setFacturas(response.data);
    } catch (error) {
      console.error('Error al cargar facturas:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta factura?')) {
      try {
        await facturaService.delete(id);
        fetchFacturas();
      } catch (error) {
        console.error('Error al eliminar factura:', error);
        alert('Error al eliminar la factura.');
      }
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      const response = await facturaService.getPdf(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('Error al generar el PDF de la factura.');
    }
  };

  const filteredFacturas = facturas.filter(factura => {
    const matchesSearch = 
      factura.numero_secuencial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.emisor?.razon_social?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !filtroFecha || 
      new Date(factura.fecha_emision).toISOString().split('T')[0] === filtroFecha;
    
    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Facturas</h2>
          <p className="text-gray-600 mt-2">
            Gestión y consulta de facturas generadas
          </p>
        </div>
        <Link to="/nueva-factura">
          <Button className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Nueva Factura
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Buscar factura</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Número, cliente o emisor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="fecha">Filtrar por fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFiltroFecha('');
                }}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de facturas */}
      {filteredFacturas.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredFacturas.map((factura) => (
            <Card key={factura.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Número</p>
                        <p className="font-semibold">{factura.numero_secuencial}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Cliente</p>
                        <p className="font-medium">{factura.cliente?.nombre || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Fecha</p>
                        <p className="font-medium">
                          {new Date(factura.fecha_emision).toLocaleDateString('es-EC')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-bold text-green-600">${factura.total.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Emisor</p>
                        <p className="text-sm">{factura.emisor?.razon_social || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Forma de Pago</p>
                        <p className="text-sm">{factura.forma_pago}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 md:w-auto w-full">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadPDF(factura.id)}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(factura.id)}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>
                </div>
                
                {/* Detalles de la factura */}
                {factura.detalles && factura.detalles.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">Productos/Servicios:</p>
                    <div className="space-y-1">
                      {factura.detalles.map((detalle, index) => (
                        <div key={index} className="text-sm flex justify-between">
                          <span>
                            {detalle.producto_servicio?.nombre || 'Producto N/A'} 
                            (x{detalle.cantidad})
                          </span>
                          <span>${detalle.precio_total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${factura.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>IVA (12%):</span>
                        <span>${factura.iva.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {searchTerm || filtroFecha 
                ? 'No se encontraron facturas que coincidan con los filtros' 
                : 'No hay facturas registradas'
              }
            </p>
            {!searchTerm && !filtroFecha && (
              <Link to="/nueva-factura">
                <Button>
                  Crear primera factura
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resumen */}
      {filteredFacturas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{filteredFacturas.length}</p>
                <p className="text-sm text-gray-600">Facturas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  ${filteredFacturas.reduce((sum, f) => sum + f.total, 0).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Total Facturado</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  ${filteredFacturas.length > 0 
                    ? (filteredFacturas.reduce((sum, f) => sum + f.total, 0) / filteredFacturas.length).toFixed(2)
                    : '0.00'
                  }
                </p>
                <p className="text-sm text-gray-600">Promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Facturas;

