from datetime import datetime
import math
import os

from bson import ObjectId
from dotenv import load_dotenv
from pymongo import MongoClient, ReturnDocument


load_dotenv()


def _serialize(doc):
    if not doc:
        return doc
    out = {}
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            out[k] = str(v)
        elif isinstance(v, list):
            out[k] = [str(i) if isinstance(i, ObjectId) else i for i in v]
        else:
            out[k] = v
    return out


class Database:
    def __init__(self):
        mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
        is_atlas = "mongodb+srv" in mongodb_uri or "mongodb.net" in mongodb_uri

        if is_atlas:
            self.client = MongoClient(
                mongodb_uri,
                tls=True,
                tlsAllowInvalidCertificates=True,
                serverSelectionTimeoutMS=5000,
            )
        else:
            self.client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
        self.client.admin.command("ping")

        self.db = self.client["smart_farming_platform"]
        self.users = self.db["users"]
        self.listings = self.db["listings"]
        self.orders = self.db["orders"]
        self.market_prices = self.db["market_prices"]
        self.disease_history = self.db["disease_history"]
        self.otps = self.db["otps"]
        self.vegetable_listings = self.listings

        self.listings.create_index([("location", "2dsphere")])
        self.listings.create_index([("status", 1)])
        self.users.create_index("email", unique=True)
        self.orders.create_index([("buyerId", 1), ("created_at", -1)])
        self.orders.create_index([("farmerId", 1), ("created_at", -1)])
        self.otps.create_index("email", unique=True)
        self.otps.create_index("expiresAt", expireAfterSeconds=0)
        # Migrate from global-per-vegetable pricing to market-specific pricing.
        try:
            self.market_prices.drop_index("vegetableName_1")
        except Exception:
            pass
        self.market_prices.create_index([("vegetableName", 1), ("marketKey", 1)], unique=True)

    def create_user(self, user_data):
        user_data["created_at"] = datetime.utcnow()
        return self.users.insert_one(user_data)

    def find_user_by_email(self, email):
        return self.users.find_one({"email": email})

    def find_user_by_id(self, user_id):
        return self.users.find_one({"_id": ObjectId(user_id)})

    def update_user(self, user_id, update_data):
        update_data["updated_at"] = datetime.utcnow()
        return self.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})

    def save_disease_history(self, history_data):
        history_data["date"] = datetime.utcnow()
        return self.disease_history.insert_one(history_data)

    def get_user_disease_history(self, user_id):
        return [_serialize(x) for x in self.disease_history.find({"userId": user_id}).sort("date", -1)]

    def get_all_disease_history(self):
        return [_serialize(x) for x in self.disease_history.find().sort("date", -1)]

    # Backward compatibility
    def create_vegetable_listing(self, listing_data):
        return self.create_listing(listing_data)

    def create_listing(self, listing_data):
        listing_data["created_at"] = datetime.utcnow()
        listing_data.setdefault("status", "active")
        return self.listings.insert_one(listing_data)

    def get_listings_by_farmer(self, farmer_id):
        return [_serialize(x) for x in self.listings.find({"farmerId": farmer_id}).sort("created_at", -1)]

    def get_vegetable_listings_by_farmer(self, farmer_id):
        return self.get_listings_by_farmer(farmer_id)

    def get_active_listings(self):
        q = {"status": {"$in": ["active", "approved"]}, "quantityKg": {"$gt": 0}}
        return [_serialize(x) for x in self.listings.find(q).sort("created_at", -1)]

    def get_nearby_listings(self, lat, lon, max_distance_meters=10000):
        query = {
            "status": {"$in": ["active", "approved"]},
            "quantityKg": {"$gt": 0},
            "location": {
                "$near": {
                    "$geometry": {"type": "Point", "coordinates": [lon, lat]},
                    "$maxDistance": max_distance_meters,
                }
            },
        }
        docs = list(self.listings.find(query))
        for doc in docs:
            coords = (doc.get("location") or {}).get("coordinates", [])
            if len(coords) == 2:
                distance_km = self._haversine_km(lat, lon, coords[1], coords[0])
                doc["distanceKm"] = round(distance_km, 2)
        docs.sort(key=lambda x: x.get("distanceKm", 10**9))
        return [_serialize(x) for x in docs]

    def _haversine_km(self, lat1, lon1, lat2, lon2):
        r = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return r * c

    def get_listing_by_id(self, listing_id):
        doc = self.listings.find_one({"_id": ObjectId(listing_id)})
        return _serialize(doc) if doc else None

    def update_listing(self, listing_id, patch):
        patch["updated_at"] = datetime.utcnow()
        return self.listings.update_one({"_id": ObjectId(listing_id)}, {"$set": patch})

    def update_listing_status(self, listing_id, status, approved_by=None):
        patch = {"status": status, "updated_at": datetime.utcnow()}
        if approved_by:
            patch["approved_by"] = approved_by
            patch["approved_at"] = datetime.utcnow()
        return self.listings.update_one({"_id": ObjectId(listing_id)}, {"$set": patch})

    def delete_listing(self, listing_id):
        return self.listings.delete_one({"_id": ObjectId(listing_id)})

    def delete_vegetable_listing(self, listing_id):
        return self.delete_listing(listing_id)

    def upsert_market_price(self, price_data):
        price_data["updated_at"] = datetime.utcnow()
        market_key = price_data.get("marketKey", "global")
        return self.market_prices.update_one(
            {"vegetableName": price_data["vegetableName"], "marketKey": market_key},
            {"$set": price_data},
            upsert=True,
        )

    def set_market_price(self, price_data):
        return self.upsert_market_price(price_data)

    def get_market_prices(self):
        return [_serialize(x) for x in self.market_prices.find().sort("updated_at", -1)]

    def get_market_price_by_vegetable(self, vegetable_name, market_key=None):
        q = {"vegetableName": vegetable_name}
        if market_key:
            q["marketKey"] = market_key
        doc = self.market_prices.find_one(q)
        return _serialize(doc) if doc else None

    def purchase_listing_quantity(self, listing_id, buyer_id, quantity_kg, buyer_location=None):
        listing = self.listings.find_one({"_id": ObjectId(listing_id)})
        if not listing:
            return {"ok": False, "error": "Listing not found"}
        if listing.get("quantityKg", 0) < quantity_kg:
            return {"ok": False, "error": "Insufficient quantity"}

        updated = self.listings.find_one_and_update(
            {"_id": ObjectId(listing_id), "quantityKg": {"$gte": quantity_kg}},
            {
                "$inc": {"quantityKg": -quantity_kg},
                "$set": {"updated_at": datetime.utcnow()},
            },
            return_document=ReturnDocument.AFTER,
        )
        if not updated:
            return {"ok": False, "error": "Quantity update failed"}

        if updated["quantityKg"] <= 0:
            self.listings.update_one({"_id": ObjectId(listing_id)}, {"$set": {"status": "sold_out"}})

        order = {
            "listingId": listing_id,
            "buyerId": buyer_id,
            "farmerId": listing["farmerId"],
            "vegetableName": listing["vegetableName"],
            "quantityKg": quantity_kg,
            "pricePerKg": listing["pricePerKg"],
            "totalPrice": round(quantity_kg * listing["pricePerKg"], 2),
            "buyerLocation": buyer_location or {},
            "orderStatus": "placed",
            "created_at": datetime.utcnow(),
        }
        order_res = self.orders.insert_one(order)
        return {"ok": True, "order_id": str(order_res.inserted_id), "remaining": updated["quantityKg"]}

    def create_order(self, order_data):
        order_data["created_at"] = datetime.utcnow()
        return self.orders.insert_one(order_data)

    def get_orders_by_buyer(self, buyer_id):
        return [_serialize(x) for x in self.orders.find({"buyerId": buyer_id}).sort("created_at", -1)]

    def get_orders_by_farmer(self, farmer_id):
        return [_serialize(x) for x in self.orders.find({"farmerId": farmer_id}).sort("created_at", -1)]

    def get_all_orders(self):
        return [_serialize(x) for x in self.orders.find().sort("created_at", -1)]

    def get_platform_activity_summary(self):
        return {
            "users": self.users.count_documents({}),
            "farmers": self.users.count_documents({"role": "farmer"}),
            "buyers": self.users.count_documents({"role": "buyer"}),
            "managers": self.users.count_documents({"role": "manager"}),
            "activeListings": self.listings.count_documents({"status": {"$in": ["active", "approved"]}, "quantityKg": {"$gt": 0}}),
            "orders": self.orders.count_documents({}),
        }


db = Database()
