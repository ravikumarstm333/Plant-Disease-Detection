from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        # MongoDB connection string
        mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')

        # Check if connecting to MongoDB Atlas (cloud) or local
        is_atlas = 'mongodb+srv' in mongodb_uri or 'mongodb.net' in mongodb_uri

        try:
            if is_atlas:
                # Use SSL for Atlas connections
                self.client = MongoClient(
                    mongodb_uri,
                    tls=True,
                    tlsAllowInvalidCertificates=True,
                    serverSelectionTimeoutMS=5000
                )
            else:
                # Local MongoDB connection without SSL
                self.client = MongoClient(
                    mongodb_uri,
                    serverSelectionTimeoutMS=5000
                )

            # Test the connection
            self.client.admin.command('ping')
            print("✅ MongoDB connection successful!")

        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            print("🔄 Using in-memory fallback database for development")
            self.client = None
            self._memory_db = {
                'users': [],
                'disease_history': [],
                'vegetable_listings': [],
                'market_prices': []
            }

        if self.client:
            self.db = self.client['smart_farming_platform']
            # Collections
            self.users = self.db['users']
            self.disease_history = self.db['disease_history']
            self.vegetable_listings = self.db['vegetable_listings']
            self.market_prices = self.db['market_prices']
            self._is_memory = False
        else:
            # Fallback in-memory collections
            self.users = self._memory_db['users']
            self.disease_history = self._memory_db['disease_history']
            self.vegetable_listings = self._memory_db['vegetable_listings']
            self.market_prices = self._memory_db['market_prices']
            self._is_memory = True

    # Helper method to handle both MongoDB and memory operations
    def _handle_operation(self, operation, *args, **kwargs):
        if self._is_memory:
            return getattr(self, f'_memory_{operation}')(*args, **kwargs)
        else:
            return getattr(self, f'_mongo_{operation}')(*args, **kwargs)

    # User operations
    def create_user(self, user_data):
        user_data['created_at'] = datetime.utcnow()
        if self._is_memory:
            user_data['_id'] = str(len(self.users) + 1)  # Simple ID generation
            self.users.append(user_data)
            return type('Result', (), {'inserted_id': user_data['_id']})()
        else:
            return self.users.insert_one(user_data)

    def find_user_by_email(self, email):
        if self._is_memory:
            return next((user for user in self.users if user.get('email') == email), None)
        else:
            return self.users.find_one({'email': email})

    def find_user_by_id(self, user_id):
        if self._is_memory:
            return next((user for user in self.users if user.get('_id') == user_id), None)
        else:
            from bson import ObjectId
            return self.users.find_one({'_id': ObjectId(user_id)})

    def update_user(self, user_id, update_data):
        if self._is_memory:
            for user in self.users:
                if user.get('_id') == user_id:
                    user.update(update_data)
                    return type('Result', (), {'modified_count': 1})()
            return type('Result', (), {'modified_count': 0})()
        else:
            from bson import ObjectId
            return self.users.update_one({'_id': ObjectId(user_id)}, {'$set': update_data})

    # Disease history operations
    def save_disease_history(self, history_data):
        history_data['date'] = datetime.utcnow()
        if self._is_memory:
            history_data['_id'] = str(len(self.disease_history) + 1)
            self.disease_history.append(history_data)
            return type('Result', (), {'inserted_id': history_data['_id']})()
        else:
            return self.disease_history.insert_one(history_data)

    def get_user_disease_history(self, user_id):
        if self._is_memory:
            return [h for h in self.disease_history if h.get('userId') == user_id]
        else:
            return list(self.disease_history.find({'userId': user_id}).sort('date', -1))

    # Vegetable listings operations
    def create_vegetable_listing(self, listing_data):
        listing_data['created_at'] = datetime.utcnow()
        # Only set status to pending if not already specified
        if 'status' not in listing_data:
            listing_data['status'] = 'pending'  # pending, approved, rejected, active
        if self._is_memory:
            listing_data['_id'] = str(len(self.vegetable_listings) + 1)
            self.vegetable_listings.append(listing_data)
            return type('Result', (), {'inserted_id': listing_data['_id']})()
        else:
            return self.vegetable_listings.insert_one(listing_data)

    def get_vegetable_listings_by_farmer(self, farmer_id):
        if self._is_memory:
            return [l for l in self.vegetable_listings if l.get('farmerId') == farmer_id]
        else:
            return list(self.vegetable_listings.find({'farmerId': farmer_id}).sort('created_at', -1))

    def get_approved_listings(self):
        if self._is_memory:
            return [l for l in self.vegetable_listings if l.get('status') == 'approved']
        else:
            return list(self.vegetable_listings.find({'status': 'approved'}))

    def get_active_listings(self):
        """Get all active listings (approved or newly created with active status)"""
        if self._is_memory:
            return [l for l in self.vegetable_listings 
                   if l.get('status') in ['approved', 'active']]
        else:
            return list(self.vegetable_listings.find({'status': {'$in': ['approved', 'active']}}))

    def get_listings_by_location(self, location):
        if self._is_memory:
            return [l for l in self.vegetable_listings
                   if l.get('status') in ['approved', 'active'] and
                   location.lower() in l.get('location', '').lower()]
        else:
            return list(self.vegetable_listings.find({
                'status': {'$in': ['approved', 'active']},
                'location': {'$regex': location, '$options': 'i'}
            }))

    def update_listing_status(self, listing_id, status, approved_by=None):
        if self._is_memory:
            for listing in self.vegetable_listings:
                if listing.get('_id') == listing_id:
                    listing['status'] = status
                    if approved_by:
                        listing['approved_by'] = approved_by
                        listing['approved_at'] = datetime.utcnow()
                    return type('Result', (), {'modified_count': 1})()
            return type('Result', (), {'modified_count': 0})()
        else:
            from bson import ObjectId
            update_data = {'status': status}
            if approved_by:
                update_data['approved_by'] = approved_by
                update_data['approved_at'] = datetime.utcnow()
            return self.vegetable_listings.update_one({'_id': ObjectId(listing_id)}, {'$set': update_data})

    def get_listing_by_id(self, listing_id):
        """Get a single listing by ID"""
        if self._is_memory:
            return next((l for l in self.vegetable_listings if l.get('_id') == listing_id), None)
        else:
            from bson import ObjectId
            return self.vegetable_listings.find_one({'_id': ObjectId(listing_id)})

    def delete_vegetable_listing(self, listing_id):
        """Delete a vegetable listing by ID"""
        if self._is_memory:
            for i, listing in enumerate(self.vegetable_listings):
                if listing.get('_id') == listing_id:
                    self.vegetable_listings.pop(i)
                    return type('Result', (), {'deleted_count': 1})()
            return type('Result', (), {'deleted_count': 0})()
        else:
            from bson import ObjectId
            result = self.vegetable_listings.delete_one({'_id': ObjectId(listing_id)})
            return result

    # Market prices operations
    def set_market_price(self, price_data):
        price_data['updated_at'] = datetime.utcnow()
        if self._is_memory:
            # Check if price already exists for this vegetable
            existing_index = None
            for i, price in enumerate(self.market_prices):
                if price.get('vegetableName') == price_data['vegetableName']:
                    existing_index = i
                    break

            if existing_index is not None:
                self.market_prices[existing_index] = price_data
                return type('Result', (), {'modified_count': 1})()
            else:
                price_data['_id'] = str(len(self.market_prices) + 1)
                self.market_prices.append(price_data)
                return type('Result', (), {'inserted_id': price_data['_id']})()
        else:
            # Check if price already exists for this vegetable
            existing = self.market_prices.find_one({'vegetableName': price_data['vegetableName']})
            if existing:
                return self.market_prices.update_one(
                    {'vegetableName': price_data['vegetableName']},
                    {'$set': price_data}
                )
            else:
                return self.market_prices.insert_one(price_data)

    def get_market_prices(self):
        if self._is_memory:
            return sorted(self.market_prices, key=lambda x: x.get('updated_at', datetime.min), reverse=True)
        else:
            return list(self.market_prices.find().sort('updated_at', -1))

    def get_market_price_by_vegetable(self, vegetable_name):
        if self._is_memory:
            return next((price for price in self.market_prices if price.get('vegetableName') == vegetable_name), None)
        else:
            return self.market_prices.find_one({'vegetableName': vegetable_name})

# Global database instance
db = Database()