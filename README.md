---
title: Plant Disease Detection
emoji: 🌿
colorFrom: green
colorTo: blue
sdk: gradio
sdk_version: "5.29.0"
python_version: "3.10"
app_file: app.py
pinned: false
---
# Smart Farming Platform

A comprehensive platform for farmers with disease detection, market management, and AI-powered chatbot assistance.

## Features

### 🔍 Plant Disease Detection
- Upload plant images for AI-powered disease detection
- Get detailed treatment recommendations and fertilizer suggestions
- Save detection history for logged-in users

### 🤖 AI Chatbot
- Context-aware responses about plant diseases
- Questions about fertilizers, treatments, and crop care
- Uses detected disease information for personalized advice

### 🔐 User Authentication
- JWT-based authentication system
- Two user roles: Farmer and Market Manager
- Secure registration and login

### 🛒 Vegetable Market System
- Farmers can list vegetables for sale
- Location-based market browsing
- Market managers set official prices
- Purchase request system

### 📊 Dashboard
- Role-based dashboards for farmers and market managers
- Quick access to all platform features
- Statistics and analytics

## Tech Stack

- **Backend**: Python Flask, TensorFlow, MongoDB
- **Frontend**: React.js, Axios, React Router
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: MongoDB
- **AI/ML**: TensorFlow for disease detection

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB (local or cloud instance)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r ../requirements.txt
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```
JWT_SECRET_KEY=your-super-secret-jwt-key
MONGODB_URI=mongodb://localhost:27017/
```

4. Start the backend server:
```bash
python app.py
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

### Database Setup

1. Install MongoDB locally or use MongoDB Atlas
2. Update the `MONGODB_URI` in `.env` file
3. The application will automatically create collections

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

### Disease Detection
- `POST /predict` - Disease prediction (unauthenticated)
- `POST /predict/auth` - Disease prediction (authenticated, saves history)
- `GET /history` - Get user's disease detection history

### Chatbot
- `POST /chat` - Send message to chatbot

### Market
- `POST /market/listings` - Create vegetable listing
- `GET /market/listings` - Get market listings
- `GET /market/listings/my` - Get user's listings
- `PUT /market/listings/{id}/approve` - Approve listing (market manager)
- `PUT /market/listings/{id}/reject` - Reject listing (market manager)
- `POST /market/prices` - Set market price (market manager)
- `GET /market/prices` - Get market prices

## Project Structure

```
smart-farming-platform/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── auth.py             # Authentication routes
│   ├── market.py           # Market management routes
│   ├── database.py         # MongoDB connection and models
│   ├── predict.py          # Disease prediction logic
│   └── disease_info.py     # Disease information database
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   └── services/       # API services
│   └── public/
├── model/                  # ML model files
├── dataset/               # Training dataset
├── requirements.txt       # Python dependencies
└── .env                   # Environment variables
```

## Usage

1. **Registration**: Create an account as a Farmer or Market Manager
2. **Disease Detection**: Upload plant images to detect diseases
3. **Chatbot**: Ask questions about detected diseases or farming advice
4. **Market**: Farmers can sell vegetables, buyers can browse listings
5. **Dashboard**: Access all features from the personalized dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.