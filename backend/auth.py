from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from database import db
import bcrypt
import re

auth_bp = Blueprint('auth', __name__)

def hash_password(password):
    """Hash password using bcrypt"""
    if isinstance(password, str):
        password = password.encode('utf-8')
    hashed = bcrypt.hashpw(password, bcrypt.gensalt())
    print(f"🔐 Password hashed: {hashed}")
    return hashed

def check_password(password, hashed):
    """Verify password against hash"""
    try:
        if isinstance(password, str):
            password = password.encode('utf-8')
        if isinstance(hashed, str):
            hashed = hashed.encode('utf-8')
        result = bcrypt.checkpw(password, hashed)
        print(f"✓ Password check result: {result}")
        return result
    except Exception as e:
        print(f"❌ Error checking password: {e}")
        return False

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['name', 'email', 'password', 'role', 'location', 'phone']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400

        name = data['name'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        role = data['role']
        location = data['location'].strip()
        phone = data['phone'].strip()

        # Validate role
        if role not in ['farmer', 'market_manager']:
            return jsonify({'error': 'Invalid role. Must be farmer or market_manager'}), 400

        # Validate email format
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400

        # Check if user already exists
        if db.find_user_by_email(email):
            return jsonify({'error': 'User with this email already exists'}), 409

        # Validate password strength
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400

        # Hash password
        hashed_password = hash_password(password)

        # Create user
        user_data = {
            'name': name,
            'email': email,
            'password': hashed_password,
            'role': role,
            'location': location,
            'phone': phone
        }

        result = db.create_user(user_data)
        print(f"✅ User registered: {email} with ID: {result.inserted_id}")

        return jsonify({
            'message': 'User registered successfully',
            'user_id': str(result.inserted_id)
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        if not data or 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email and password are required'}), 400

        email = data['email'].strip().lower()
        password = data['password']

        print(f"🔐 Login attempt - Email: {email}, Password length: {len(password)}")

        # Find user
        user = db.find_user_by_email(email)
        if not user:
            print(f"❌ User not found for email: {email}")
            print(f"📊 Available users: {[u.get('email') for u in db.users]}")
            return jsonify({'error': 'Invalid email or password'}), 401

        print(f"✅ User found: {user.get('email')}")

        # Check password
        stored_password = user.get('password')
        print(f"🔍 Checking password... Stored type: {type(stored_password)}, Input type: {type(password)}")
        
        if isinstance(stored_password, str):
            print("⚠️ Stored password is string, converting to bytes...")
            stored_password = stored_password.encode('utf-8')
        
        if not check_password(password, stored_password):
            print(f"❌ Password mismatch")
            return jsonify({'error': 'Invalid email or password'}), 401

        print(f"✅ Password verified")

        # Create access token
        access_token = create_access_token(identity=str(user['_id']))

        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': str(user['_id']),
                'name': user['name'],
                'email': user['email'],
                'role': user['role'],
                'location': user['location'],
                'phone': user['phone']
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = db.find_user_by_id(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Remove password from response
        user_data = {
            'id': str(user['_id']),
            'name': user['name'],
            'email': user['email'],
            'role': user['role'],
            'location': user['location'],
            'phone': user['phone'],
            'created_at': user.get('created_at')
        }

        return jsonify({'user': user_data}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        # Fields that can be updated
        allowed_fields = ['name', 'location', 'phone']
        update_data = {}

        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field].strip()

        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400

        result = db.update_user(user_id, update_data)

        if result.modified_count == 0:
            return jsonify({'error': 'User not found or no changes made'}), 404

        return jsonify({'message': 'Profile updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500