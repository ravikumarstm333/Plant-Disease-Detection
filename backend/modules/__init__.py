from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

from .routes.auth import auth_bp
from .routes.marketplace import marketplace_bp
from .routes.orders import orders_bp
from .routes.prices import prices_bp
from .routes.admin import admin_bp
from .routes.manager import manager_bp
from .routes.geolocation import geolocation_bp
from .routes.disease_history import history_bp
from otp_routes import otp_bp


jwt = JWTManager()


def create_app():
    load_dotenv()
    app = Flask(__name__)
    CORS(app)

    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-key")
    app.config["MAP_PROVIDER"] = "leaflet_osm"
    app.config["MAP_TILE_URL"] = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    jwt.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(marketplace_bp, url_prefix="/market")
    app.register_blueprint(orders_bp, url_prefix="/orders")
    app.register_blueprint(prices_bp, url_prefix="/prices")
    app.register_blueprint(admin_bp, url_prefix="/admin")
    app.register_blueprint(manager_bp, url_prefix="/manager")
    app.register_blueprint(geolocation_bp, url_prefix="/geolocation")
    app.register_blueprint(history_bp, url_prefix="/history")
    app.register_blueprint(otp_bp, url_prefix="/auth")

    return app
