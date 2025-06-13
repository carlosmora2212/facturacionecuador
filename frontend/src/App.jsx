import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Emisores from './components/Emisores';
import Clientes from './components/Clientes';
import ProductosServicios from './components/ProductosServicios';
import Facturas from './components/Facturas';
import NuevaFactura from './components/NuevaFactura';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/emisores" element={<Emisores />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/productos-servicios" element={<ProductosServicios />} />
          <Route path="/facturas" element={<Facturas />} />
          <Route path="/nueva-factura" element={<NuevaFactura />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

