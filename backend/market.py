from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from bson import ObjectId

market_bp = Blueprint('market', __name__)

# Vegetable Listings Management
@market_bp.route('/listings', methods=['POST'])
@jwt_required()
def create_listing():
    try:
        user_id = get_jwt_identity()
        user = db.find_user_by_id(user_id)

        if not user or user['role'] != 'farmer':
            return jsonify({'error': 'Only farmers can create listings'}), 403

        data = request.get_json()

        # Validate required fields
        required_fields = ['vegetableName', 'price', 'quantity']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400

        vegetable_name = data['vegetableName'].strip()
        price = float(data['price'])
        quantity = float(data['quantity'])

        if price <= 0 or quantity <= 0:
            return jsonify({'error': 'Price and quantity must be positive numbers'}), 400

        listing_data = {
            'farmerId': user_id,
            'vegetableName': vegetable_name,
            'price': price,
            'quantity': quantity,
            'location': user['location'],
            'contact': user['phone'],
            'farmerName': user['name'],
            'status': 'active'  # Auto-approve listing for immediate listing
        }

        result = db.create_vegetable_listing(listing_data)

        return jsonify({
            'message': 'Listing created successfully!',
            'listing_id': str(result.inserted_id),
            'status': 'active'
        }), 201

    except ValueError:
        return jsonify({'error': 'Invalid price or quantity format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@market_bp.route('/listings/my', methods=['GET'])
@jwt_required()
def get_my_listings():
    try:
        user_id = get_jwt_identity()
        user = db.find_user_by_id(user_id)

        if not user or user['role'] != 'farmer':
            return jsonify({'error': 'Only farmers can view their listings'}), 403

        listings = db.get_vegetable_listings_by_farmer(user_id)

        # Convert ObjectId to string for JSON serialization
        for listing in listings:
            listing['_id'] = str(listing['_id'])

        return jsonify({'listings': listings}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@market_bp.route('/listings', methods=['GET'])
def get_listings():
    try:
        location = request.args.get('location', '')

        if location:
            listings = db.get_listings_by_location(location)
        else:
            # Return all active listings
            listings = db.get_active_listings()

        # Convert ObjectId to string for JSON serialization
        for listing in listings:
            listing['_id'] = str(listing['_id'])
            if 'farmerId' in listing:
                listing['farmerId'] = str(listing['farmerId'])

        return jsonify({'listings': listings}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@market_bp.route('/listings/<listing_id>', methods=['DELETE'])
@jwt_required()
def delete_listing(listing_id):
    """Delete a vegetable listing - only the owner (farmer) can delete their own listing"""
    try:
        user_id = get_jwt_identity()
        user = db.find_user_by_id(user_id)

        if not user or user['role'] != 'farmer':
            return jsonify({'error': 'Only farmers can delete listings'}), 403

        # Get the listing to verify ownership
        listing = db.get_listing_by_id(listing_id)
        
        if not listing:
            return jsonify({'error': 'Listing not found'}), 404

        # Check if user is the owner of the listing
        listing_farmer_id = str(listing.get('farmerId'))
        if listing_farmer_id != str(user_id):
            return jsonify({'error': 'You can only delete your own listings'}), 403

        # Delete the listing
        result = db.delete_vegetable_listing(listing_id)

        if result.deleted_count == 0:
            return jsonify({'error': 'Failed to delete listing'}), 500

        return jsonify({
            'message': 'Listing deleted successfully!',
            'deleted_id': listing_id
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Market Manager Operations
@market_bp.route('/listings/<listing_id>/approve', methods=['PUT'])
@jwt_required()
def approve_listing(listing_id):
    try:
        user_id = get_jwt_identity()
        user = db.find_user_by_id(user_id)

        if not user or user['role'] != 'market_manager':
            return jsonify({'error': 'Only market managers can approve listings'}), 403

        result = db.update_listing_status(listing_id, 'approved', user_id)

        if result.modified_count == 0:
            return jsonify({'error': 'Listing not found'}), 404

        return jsonify({'message': 'Listing approved successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@market_bp.route('/listings/<listing_id>/reject', methods=['PUT'])
@jwt_required()
def reject_listing(listing_id):
    try:
        user_id = get_jwt_identity()
        user = db.find_user_by_id(user_id)

        if not user or user['role'] != 'market_manager':
            return jsonify({'error': 'Only market managers can reject listings'}), 403

        result = db.update_listing_status(listing_id, 'rejected', user_id)

        if result.modified_count == 0:
            return jsonify({'error': 'Listing not found'}), 404

        return jsonify({'message': 'Listing rejected successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Market Prices Management
@market_bp.route('/prices', methods=['POST'])
@jwt_required()
def set_market_price():
    try:
        user_id = get_jwt_identity()
        user = db.find_user_by_id(user_id)

        if not user or user['role'] != 'market_manager':
            return jsonify({'error': 'Only market managers can set prices'}), 403

        data = request.get_json()

        if 'vegetableName' not in data or 'price' not in data:
            return jsonify({'error': 'vegetableName and price are required'}), 400

        vegetable_name = data['vegetableName'].strip()
        price = float(data['price'])

        if price <= 0:
            return jsonify({'error': 'Price must be a positive number'}), 400

        price_data = {
            'vegetableName': vegetable_name,
            'price': price,
            'updatedBy': user_id,
            'updatedByName': user['name']
        }

        db.set_market_price(price_data)

        return jsonify({'message': 'Market price updated successfully'}), 200

    except ValueError:
        return jsonify({'error': 'Invalid price format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@market_bp.route('/prices', methods=['GET'])
def get_market_prices():
    try:
        prices = db.get_market_prices()

        # Convert ObjectId to string for JSON serialization
        for price in prices:
            price['_id'] = str(price['_id'])

        return jsonify({'prices': prices}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@market_bp.route('/prices/<vegetable_name>', methods=['GET'])
def get_market_price(vegetable_name):
    try:
        price = db.get_market_price_by_vegetable(vegetable_name)

        if not price:
            return jsonify({'error': 'Price not found for this vegetable'}), 404

        price['_id'] = str(price['_id'])

        return jsonify({'price': price}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500