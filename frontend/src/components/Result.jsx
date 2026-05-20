import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Share2,
  Printer,
  Leaf,
  Droplet,
  Shield,
  MessageCircle
} from 'lucide-react';

import Button from './ui/Button';
import Card from './ui/Card';
import Badge from './ui/Badge';
import ChatbotPopup from './ChatbotPopup';

import './Result.css';

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openChat, setOpenChat] = useState(false);

  const data = location.state || null;

  /* ================= NO DATA ================= */
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Card>
          <div className="text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold">No Results Found</h2>
            <p>Please upload an image first.</p>

            <Button onClick={() => navigate('/upload')}>
              <ArrowLeft size={20} />
              Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  /* ================= DATA ================= */
  const disease = data.disease || 'Unknown';
  const confidence = data.confidence || 0;
  const treatment = data.treatment || 'No treatment available';
  const fertilizer = data.fertilizer || 'No fertilizer suggestion';

  const fertilizer_links = Array.isArray(data.fertilizer_links)
    ? data.fertilizer_links
    : [];

  const isHealthy = disease.toLowerCase().includes('healthy');
  const isSevere = confidence > 80;
  const isWarning = confidence > 50 && confidence <= 80;

  const showAdvice = !isHealthy && disease !== 'Unknown';

  /* ================= ICON ================= */
  const getSeverityIcon = () => {
    if (isHealthy) return <CheckCircle className="text-green-600" size={48} />;
    if (isSevere) return <AlertCircle className="text-red-600" size={48} />;
    if (isWarning) return <AlertTriangle className="text-yellow-600" size={48} />;
    return <CheckCircle className="text-green-600" size={48} />;
  };

  const getBadge = () => {
    if (isHealthy) return 'success';
    if (isSevere) return 'danger';
    return 'warning';
  };

  /* ================= ANIMATION (FIXED) ================= */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 pt-20">
      <div className="max-w-5xl mx-auto">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-green-700 font-semibold"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >

          {/* MAIN CARD */}
          <motion.div variants={itemVariants}>
            <Card className="p-8 text-center">

              <div className="flex justify-center mb-4">
                {getSeverityIcon()}
              </div>

              <h1 className="text-3xl font-bold text-green-700 mb-2">
                {disease}
              </h1>

              <p className="text-gray-600 mb-2">
                {isHealthy
                  ? 'Your plant is healthy 🌿'
                  : 'Disease detected'}
              </p>

              <p className="font-bold text-lg text-green-600">
                Confidence: {confidence}%
              </p>

              <div className="mt-4">
                <Badge variant={getBadge()}>
                  {isHealthy ? 'Healthy' : isSevere ? 'Severe' : 'Mild'}
                </Badge>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-wrap justify-center gap-3 mt-6">

                <button
                  onClick={() => setOpenChat(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <MessageCircle size={18} />
                  Chat
                </button>

                <button className="border px-4 py-2 rounded-lg flex items-center gap-2">
                  <Share2 size={18} />
                  Share
                </button>

                <button
                  onClick={() => window.print()}
                  className="border px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Printer size={18} />
                  Print
                </button>

              </div>

            </Card>
          </motion.div>

          {/* ================= HEALTHY STATE ================= */}
          {isHealthy && (
            <motion.div variants={itemVariants}>
              <Card className="text-center p-6 bg-green-50">
                <CheckCircle className="mx-auto text-green-600 mb-2" size={40} />
                <h3 className="text-lg font-bold text-green-700">
                  No Treatment Needed 🌿
                </h3>
                <p className="text-gray-600">
                  Your plant is healthy. Keep watering and sunlight regular.
                </p>
              </Card>
            </motion.div>
          )}

          {/* ================= DISEASE ADVICE ================= */}
          {showAdvice && (
            <div className="grid md:grid-cols-2 gap-6">

              <motion.div variants={itemVariants}>
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <Droplet className="text-blue-600" />
                    <h3 className="font-bold">Treatment</h3>
                  </div>
                  <p>{treatment}</p>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <Leaf className="text-green-600" />
                    <h3 className="font-bold">Fertilizer</h3>
                  </div>
                  <p>{fertilizer}</p>
                </Card>
              </motion.div>

            </div>
          )}

          {/* ================= PRODUCTS ================= */}
          {fertilizer_links.length > 0 && showAdvice && (
            <motion.div variants={itemVariants}>
              <Card>
                <div className="flex items-center gap-2 mb-5">
                  <Shield className="text-purple-600" />
                  <h3 className="font-bold text-lg">
                    Recommended Products
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">

                  {fertilizer_links.map((item, index) => (
                    <a
                      key={index}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group"
                    >
                      <div className="bg-gray-100 h-40 flex items-center justify-center rounded-lg group-hover:bg-green-50 transition">
                        <img
                          src={item.image}
                          alt="fertilizer"
                          className="max-h-full object-contain"
                        />
                      </div>

                      <button className="w-full mt-2 bg-green-600 text-white py-2 rounded-lg">
                        Buy Now
                      </button>
                    </a>
                  ))}

                </div>
              </Card>
            </motion.div>
          )}

          {/* CTA */}
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/upload')}>
              Scan Again
            </Button>

            <Button variant="secondary" onClick={() => navigate('/history')}>
              History
            </Button>
          </div>

        </motion.div>
      </div>

      {/* CHATBOT */}
      <ChatbotPopup
        isOpen={openChat}
        onClose={() => setOpenChat(false)}
        disease={disease}
        diseaseData={{
          treatment,
          fertilizer,
          prevention: data.prevention || ""
        }}
      />
    </div>
  );
};

export default Result;
