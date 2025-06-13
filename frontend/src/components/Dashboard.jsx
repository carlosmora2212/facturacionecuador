import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  Package, 
  FileText,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { facturaService } from '../lib/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalFacturas: 0,
    montoTotal: 0,
    facturasRecientes: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await facturaService.getAll();
        const facturas = response.data;
        
        const totalFacturas = facturas.length;
        const montoTotal = facturas.reduce((sum, factura) => sum + factura.total, 0);
        const facturasRecientes = facturas
          .sort((a, b) => new Date(b.fecha_emision) - new Date(a.fecha_emision))
          .slice(0, 5);

        setStats({
          totalFacturas,
          montoTotal,
          facturasRecientes
        });
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      title: 'Nueva Factura',
      description: 'Crear una nueva factura',
      icon: FileText,
      href: '/nueva-factura',
      color: 'bg-blue-500'
    },
    {
      title: 'Gestionar Clientes',
      description: 'Ver y editar clientes',
      icon: Users,
      href: '/clientes',
      color: 'bg-green-500'
    },
    {
      title: 'Productos/Servicios',
      description: 'Gestionar catálogo',
      icon: Package,
      href: '/productos-servicios',
      color: 'bg-purple-500'
    },
    {
      title: 'Configurar Emisor',
      description: 'Datos de la empresa',
      icon: Building2,
      href: '/emisores',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-2">
          Resumen general del sistema de facturación
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFacturas}</div>
            <p className="text-xs text-muted-foreground">
              Facturas generadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.montoTotal.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor total facturado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalFacturas > 0 ? (stats.montoTotal / stats.totalFacturas).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor promedio por factura
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} to={action.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{action.title}</h4>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Facturas recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Facturas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.facturasRecientes.length > 0 ? (
            <div className="space-y-4">
              {stats.facturasRecientes.map((factura) => (
                <div key={factura.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{factura.numero_secuencial}</p>
                    <p className="text-sm text-gray-600">
                      {factura.cliente?.nombre || 'Cliente no disponible'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(factura.fecha_emision).toLocaleDateString('es-EC')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${factura.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{factura.forma_pago}</p>
                  </div>
                </div>
              ))}
              <div className="pt-4">
                <Link to="/facturas">
                  <Button variant="outline" className="w-full">
                    Ver todas las facturas
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay facturas registradas</p>
              <Link to="/nueva-factura">
                <Button className="mt-4">
                  Crear primera factura
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

