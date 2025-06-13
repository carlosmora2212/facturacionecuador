import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.facturacion import db
from src.routes.user import user_bp
from src.routes.emisor import emisor_bp
from src.routes.cliente import cliente_bp
from src.routes.producto_servicio import producto_servicio_bp
from src.routes.factura import factura_bp

# ESTA ES LA LÍNEA MODIFICADA PARA PRODUCCIÓN
app = Flask(__name__, static_folder='../../frontend/dist', static_url_path='/')

app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Configurar CORS (sigue siendo útil tenerlo)
CORS(app)

# Registrar blueprints de la API
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(emisor_bp, url_prefix='/api')
app.register_blueprint(cliente_bp, url_prefix='/api')
app.register_blueprint(producto_servicio_bp, url_prefix='/api')
app.register_blueprint(factura_bp, url_prefix='/api')

# Configuración de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
with app.app_context():
    db.create_all()


# RUTA "CATCH-ALL" PARA SERVIR LA APP DE REACT
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)