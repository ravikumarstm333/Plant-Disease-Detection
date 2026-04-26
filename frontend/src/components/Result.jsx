import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, AlertTriangle, ArrowLeft, Share2, Printer, Leaf, Droplet, Shield, MessageCircle } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import Badge from './ui/Badge';
import ChatbotPopup from './ChatbotPopup';
import './Result.css';

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;
  const [openChat, setOpenChat] = useState(false);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Card>
          <div className="text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-800">No Results Found</h2>
            <p className="text-gray-600">Please upload an image first.</p>
            <Button variant="primary" onClick={() => navigate('/upload')}>
              <ArrowLeft size={20} />
              Back to Upload
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const disease = data.disease || 'Unknown';
  const confidence = data.confidence || 85;
  const treatment = data.treatment || 'Apply fungicide and improve ventilation';
  const fertilizer = data.fertilizer || 'Use NPK 16:16:16';
  const fertilizer_links = data.fertilizer_links || [];

  const isSevere = confidence > 80;
  const isWarning = confidence > 50 && confidence <= 80;
  const isHealthy = disease.toLowerCase().includes('healthy');

  const getSeverityColor = () => {
    if (isHealthy) return 'success';
    if (isSevere) return 'danger';
    if (isWarning) return 'warning';
    return 'success';
  };

  const getSeverityIcon = () => {
    if (isHealthy) return <CheckCircle className="text-green-600" size={48} />;
    if (isSevere) return <AlertCircle className="text-red-600" size={48} />;
    if (isWarning) return <AlertTriangle className="text-yellow-600" size={48} />;
    return <CheckCircle className="text-green-600" size={48} />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold mb-8"
        >
          <ArrowLeft size={20} />
          Back to Upload
        </motion.button>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Main Result Card */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card-lg p-8 text-center space-y-6">
              <motion.div
                animate={{ scale: [0.8, 1.1, 1] }}
                transition={{ duration: 0.6 }}
                className="flex justify-center"
              >
                {getSeverityIcon()}
              </motion.div>

              <div>
                <h1 className="text-4xl font-bold text-gradient mb-2">{disease}</h1>
                <p className="text-lg text-gray-600">
                  {isHealthy ? 'Your plant appears to be healthy!' : 'Disease detected on your plant'}
                </p>
              </div>

              {/* Confidence Score */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-600">Confidence Score</p>
                <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence}%` }}
                    transition={{ duration: 1 }}
                    className={`h-full rounded-full ${
                      isHealthy ? 'bg-gradient-primary' : isSevere ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                  />
                </div>
                <p className="text-2xl font-bold text-primary-600">{confidence}%</p>
              </div>

              {/* Status Badge */}
              <div className="flex justify-center gap-2">
                <Badge variant={getSeverityColor()}>
                  {isHealthy ? '✓ Healthy' : isSevere ? '⚠ Severe' : '⚡ Mild'}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setOpenChat(true)}
                  className="flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  <MessageCircle size={20} />
                  Chat with Bot
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-2 px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
                >
                  <Share2 size={20} />
                  Share
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-2 px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
                  onClick={() => window.print()}
                >
                  <Printer size={20} />
                  Print
                </motion.button>
              </div>
            </Card>
          </motion.div>

          {/* Recommendations Section */}
          {!isHealthy && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Treatment */}
              <motion.div variants={itemVariants}>
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <Droplet className="text-blue-600" size={24} />
                    <h3 className="text-lg font-bold text-gray-800">Treatment</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{treatment}</p>
                </Card>
              </motion.div>

              {/* Fertilizer */}
              <motion.div variants={itemVariants}>
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <Leaf className="text-green-600" size={24} />
                    <h3 className="text-lg font-bold text-gray-800">Fertilizer</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{fertilizer}</p>
                </Card>
              </motion.div>
            </div>
          )}

          {/* Fertilizer Products */}
          {fertilizer_links.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="text-purple-600" size={24} />
                  <h3 className="text-lg font-bold text-gray-800">Recommended Products</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {fertilizer_links.map((item, index) => (
                    <motion.a
                      key={index}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-center group"
                    >
                      <div className="bg-gray-100 rounded-lg p-4 mb-3 group-hover:bg-primary-50 transition-colors h-40">
                        <img
                          src={item.image}
                          alt="Fertilizer"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <Button variant="primary" size="sm" className="w-full">
                        Buy Now
                      </Button>
                    </motion.a>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/upload')}
              className="sm:flex-1"
            >
              Scan Another
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/history')}
              className="sm:flex-1"
            >
              View History
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Chatbot Popup */}
      <ChatbotPopup
        isOpen={openChat}
        onClose={() => setOpenChat(false)}
        disease={disease}
      />
    </div>
  );
};

export default Result;