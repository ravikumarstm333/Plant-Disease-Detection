import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Leaf,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight,
} from 'lucide-react';
import './Footer.css'

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    quickLinks: [
      { name: 'Home', path: '/' },
      { name: 'Detect Disease', path: '/upload' },
      { name: 'Market', path: '/market' },
      { name: 'Dashboard', path: '/dashboard' },
    ],
    resources: [
      { name: 'Plant Care Guide', path: '#' },
      { name: 'Farming Tips', path: '#' },
      { name: 'Help Center', path: '#' },
      { name: 'Privacy Policy', path: '#' },
    ],
    contact: [
      { icon: Mail, label: 'Email', value: 'support@dekhbhal.com', href: 'mailto:support@dekhbhal.com' },
      { icon: Phone, label: 'Phone', value: '+91 7061042974', href: 'tel:+917061042974' },
      { icon: MapPin, label: 'Location', value: 'Delhi, India', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, label: 'Facebook', href: '#' },
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: Instagram, label: 'Instagram', href: '#' },
    { icon: Linkedin, label: 'LinkedIn', href: '#' },
  ];

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
    <footer className="bg-gradient-to-b from-primary-900 to-primary-500 text-gray-100 mt-20 relative overflow-hidden">
      {/* Decorative Element */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-500 opacity-5 rounded-full blur-3xl -z-10" />

      {/* Newsletter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="border-b border-primary-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Stay Updated</h3>
              <p className="text-gray-300">Get farming tips, disease updates, and market prices delivered to your inbox.</p>
            </div>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-primary-800 border border-primary-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-6 py-3 bg-gradient-primary text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                Subscribe
                <ArrowRight size={18} />
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-4 gap-12 mb-12"
        >
          {/* Column 1: Logo & Description */}
          <motion.div variants={itemVariants} className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <Leaf className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-white">DekhBhal</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              AI powered plant disease detection platform helping farmers grow healthy crops with smart technology.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 bg-primary-800 rounded-full flex items-center justify-center text-secondary-400 hover:bg-secondary-500 hover:text-white transition-all"
                    title={social.label}
                  >
                    <Icon size={18} />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Column 2: Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-bold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link, index) => (
                <motion.li key={index} whileHover={{ x: 5 }}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-secondary-400 transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Resources */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-bold text-white mb-6">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link, index) => (
                <motion.li key={index} whileHover={{ x: 5 }}>
                  <a
                    href={link.path}
                    className="text-gray-300 hover:text-secondary-400 transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Contact */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-bold text-white mb-6">Contact Us</h4>
            <div className="space-y-4">
              {footerLinks.contact.map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <motion.a
                    key={index}
                    href={contact.href}
                    whileHover={{ x: 5 }}
                    className="flex items-start gap-3 text-gray-300 hover:text-secondary-400 transition-colors"
                  >
                    <Icon className="text-secondary-400 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-xs text-gray-400">{contact.label}</p>
                      <p className="font-semibold text-sm">{contact.value}</p>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className="border-t border-primary-800 my-8" />

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-gray-400 text-sm text-center md:text-left">
            © {currentYear} DekhBhal. All rights reserved. | Built with 🌱 for farmers
          </p>

          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-secondary-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-secondary-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-secondary-400 transition-colors">
              Cookie Settings
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
