import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Microscope, Zap, TrendingUp, Users, Award, ArrowRight } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Microscope,
      title: 'AI Disease Detection',
      description: 'Upload leaf photos and get accurate disease diagnosis powered by advanced AI in seconds.',
      color: 'text-green-600',
    },
    {
      icon: TrendingUp,
      title: 'Market Prices',
      description: 'Stay updated with real-time official market prices for vegetables and crops.',
      color: 'text-blue-600',
    },
    {
      icon: Users,
      title: 'Direct Sales',
      description: 'Farmers can list and sell produce directly to local buyers without middlemen.',
      color: 'text-purple-600',
    },
  ];

  const stats = [
    { number: '50K+', label: 'Plants Scanned' },
    { number: '95%', label: 'Accuracy' },
    { number: '10K+', label: 'Farmers' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen pt-0">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 pb-10">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50"
          />

          {/* Floating shapes */}
          <motion.div
            animate={{ float: [0, 20, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-10 right-10 w-64 h-64 bg-gradient-primary opacity-10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ float: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-accent opacity-10 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            {/* Left Content */}
            <motion.div variants={itemVariants} className="space-y-8">
              <div>
                <motion.h1
                  className="text-5xl md:text-6xl font-bold text-gradient mb-6 leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Grow Smarter, Farm Better
                </motion.h1>

                <motion.p
                  className="text-xl text-gray-600 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  AI-powered plant disease detection, marketplace insights, and direct farmer-to-buyer sales. Empower your agriculture with technology.
                </motion.p>
              </div>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                variants={itemVariants}
              >
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/upload')}
                  className="group"
                >
                  Detect Disease
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/market')}
                >
                  Browse Market
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-200"
                variants={itemVariants}
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="text-2xl font-bold text-primary-600">{stat.number}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Visual */}
            <motion.div
              variants={itemVariants}
              className="hidden md:flex justify-center"
            >
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative w-full h-96"
              >
                <div className="absolute inset-0 bg-gradient-primary opacity-10 rounded-2xl blur-xl" />
                <div className="relative h-full flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="w-64 h-64 border-4 border-primary-200 rounded-full flex items-center justify-center"
                  >
                    <Leaf className="text-primary-600" size={120} />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white bg-opacity-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Why Choose SmartFarm?</h2>
            <p className="section-subtitle">Everything you need to succeed in modern agriculture</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="h-full">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-16 h-16 ${feature.color} bg-opacity-10 rounded-xl flex items-center justify-center mb-4`}
                    >
                      <Icon className={feature.color} size={32} />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">How It Works</h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: 1, title: 'Upload Photo', desc: 'Take a photo of your plant' },
              { step: 2, title: 'Analyze', desc: 'AI analyzes the image' },
              { step: 3, title: 'Get Results', desc: 'Disease diagnosis & tips' },
              { step: 4, title: 'Take Action', desc: 'Follow recommended treatment' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="relative">
                  <Card>
                    <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-primary text-white rounded-full flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 mt-4">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </Card>
                  {index < 3 && (
                    <motion.div
                      animate={{ x: [0, 10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="hidden md:flex absolute -right-6 top-1/2 transform -translate-y-1/2"
                    >
                      <ArrowRight className="text-primary-600" size={24} />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-5 -z-10" />

        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="glass-card-lg">
            <Award className="mx-auto mb-6 text-primary-600" size={48} />
            <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-4">
              Join 10,000+ Farmers Today
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Transform your farming with AI-powered disease detection and direct market access.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" onClick={() => navigate('/register')}>
                Get Started Free
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/chat')}>
                Chat with AI Assistant
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default Home;