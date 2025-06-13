# Sistema de Facturación Ecuador

Una aplicación web completa para la gestión de facturación empresarial en Ecuador, desarrollada con Flask (Python) y React, que cumple con las normativas del SRI.

## 🚀 Características Principales

- ✅ **Gestión completa de emisores** - Configuración de datos de la empresa
- ✅ **Administración de clientes** - Base de datos completa con búsqueda y filtros
- ✅ **Catálogo de productos/servicios** - Gestión de precios y descripciones
- ✅ **Facturación automática** - Cálculo automático de IVA (12%) y totales
- ✅ **Generación de PDF profesional** - Documentos con formato empresarial
- ✅ **Numeración secuencial automática** - Cumple con formato SRI (001-001-000000001)
- ✅ **Interfaz web responsiva** - Compatible con escritorio y móviles
- ✅ **Base de datos local** - SQLite para almacenamiento seguro
- ✅ **Cumplimiento normativo SRI** - Incluye toda la información tributaria requerida

## 🛠️ Tecnologías Utilizadas

### Backend
- **Flask** - Framework web de Python
- **SQLAlchemy** - ORM para base de datos
- **WeasyPrint** - Generación de PDF
- **Flask-CORS** - Comunicación con frontend
- **SQLite** - Base de datos local

### Frontend
- **React** - Biblioteca de interfaz de usuario
- **Vite** - Herramienta de construcción
- **Axios** - Cliente HTTP para API
- **React Router** - Navegación SPA
- **CSS3** - Estilos responsivos

## 📋 Requisitos del Sistema

- **Python 3.8+**
- **Node.js 16.0+**
- **npm o pnpm**
- **4 GB RAM mínimo**
- **2 GB espacio en disco**

## 🔧 Instalación Rápida

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd facturacion-ecuador
```

### 2. Configurar Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configurar Frontend
```bash
cd ../frontend
npm install  # o pnpm install
```

### 4. Ejecutar la Aplicación

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python src/main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Acceder al Sistema
- **Frontend:** http://localhost:5173
- **API Backend:** http://localhost:5001

## 📖 Guía de Uso Rápido

### Configuración Inicial
1. **Configurar Emisor:** Ir a "Emisores" y registrar los datos de tu empresa
2. **Agregar Clientes:** En "Clientes", registrar la información de tus clientes
3. **Crear Catálogo:** En "Productos/Servicios", agregar los items que facturas

### Crear una Factura
1. Ir a "Nueva Factura"
2. Seleccionar emisor y cliente
3. Elegir forma de pago
4. Agregar productos/servicios con cantidades
5. El sistema calcula automáticamente subtotal, IVA y total
6. Crear factura y descargar PDF

### Gestionar Facturas
- Ver todas las facturas en la sección "Facturas"
- Buscar y filtrar por fecha, cliente o monto
- Descargar PDF de facturas existentes
- Ver estadísticas en el Dashboard

## 📁 Estructura del Proyecto

```
facturacion-ecuador/
├── backend/                 # Servidor Flask
│   ├── src/
│   │   ├── main.py         # Punto de entrada
│   │   ├── models/         # Modelos de datos
│   │   ├── routes/         # Endpoints API
│   │   └── templates/      # Plantillas PDF
│   └── venv/               # Entorno virtual
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   └── lib/           # Utilidades
│   └── public/            # Archivos estáticos
└── DOCUMENTACION.md       # Documentación completa
```

## 🔒 Cumplimiento Normativo

El sistema cumple con todas las normativas del SRI Ecuador:

- ✅ Formato de facturación según resoluciones SRI
- ✅ Cálculo correcto de IVA (12%)
- ✅ Numeración secuencial obligatoria
- ✅ Información tributaria completa
- ✅ Campos obligatorios según normativa
- ✅ Preparado para facturación electrónica futura

## 📊 Funcionalidades Detalladas

### Gestión de Emisores
- Registro de razón social y RUC
- Dirección fiscal y datos de contacto
- Carga de logotipo corporativo
- Validación de formato RUC

### Administración de Clientes
- Base de datos completa de clientes
- Búsqueda por nombre, cédula o RUC
- Información de contacto detallada
- Validación de documentos de identidad

### Catálogo de Productos/Servicios
- Gestión de precios unitarios
- Descripciones detalladas
- Búsqueda rápida de productos
- Actualización masiva de precios

### Sistema de Facturación
- Selección intuitiva de emisor y cliente
- Múltiples formas de pago
- Cálculo automático de impuestos
- Aplicación de descuentos por línea
- Generación automática de números secuenciales

### Generación de PDF
- Diseño profesional y limpio
- Logotipo de la empresa
- Información tributaria completa
- Formato compatible con normativas SRI
- Descarga inmediata

## 🔧 Configuración Avanzada

### Variables de Entorno
```bash
# Backend
FLASK_ENV=development
DATABASE_URL=sqlite:///app.db
CORS_ORIGINS=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:5001/api
```

### Personalización de PDF
Editar `backend/src/templates/factura_pdf.html` para modificar:
- Diseño y colores corporativos
- Información adicional
- Formato de campos
- Estilos CSS

## 🚀 Despliegue en Producción

### Backend (Flask)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 src.main:app
```

### Frontend (React)
```bash
npm run build
# Servir archivos estáticos con nginx o similar
```

## 🔍 Solución de Problemas

### Problemas Comunes

**Error de puerto en uso:**
```bash
# Cambiar puerto en src/main.py
app.run(host='0.0.0.0', port=5002, debug=True)
```

**Error de dependencias:**
```bash
# Reinstalar dependencias
pip install --force-reinstall -r requirements.txt
```

**Error de conexión frontend-backend:**
- Verificar que ambos servidores estén ejecutándose
- Comprobar configuración de CORS
- Revisar URL de API en frontend

## 📚 Documentación Completa

Para información detallada sobre:
- Arquitectura técnica
- Manual de usuario completo
- Guías de mantenimiento
- Especificaciones de API
- Cumplimiento normativo detallado

Consultar: [DOCUMENTACION.md](./DOCUMENTACION.md)

## 🤝 Contribuciones

Este proyecto está abierto a contribuciones. Para contribuir:

1. Fork el repositorio
2. Crear una rama para tu feature
3. Realizar cambios y pruebas
4. Enviar pull request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo LICENSE para más detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- Revisar la documentación completa
- Verificar problemas conocidos en Issues
- Contactar al equipo de desarrollo

---

**Desarrollado por:** Manus AI  
**Versión:** 1.0  
**Fecha:** Junio 2025  

¡Gracias por usar el Sistema de Facturación Ecuador! 🇪🇨

