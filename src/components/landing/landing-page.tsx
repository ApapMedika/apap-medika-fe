'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  HeartIcon, 
  CalendarDaysIcon, 
  ShieldCheckIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
  CheckIcon,
  Bars3Icon,
  XMarkIcon,
  BeakerIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: CalendarDaysIcon,
      title: 'Appointment Management',
      description: 'Streamline patient appointments with intelligent scheduling and automated reminders',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: BeakerIcon,
      title: 'Pharmacy Services',
      description: 'Manage prescriptions and drug inventory with real-time stock tracking',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Insurance Integration',
      description: 'Seamlessly handle insurance claims and policy management',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: BuildingOfficeIcon,
      title: 'Hospitalization',
      description: 'Efficient room reservations and comprehensive inpatient management',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Billing System',
      description: 'Automated billing with insurance integration and payment tracking',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      icon: UserGroupIcon,
      title: 'Multi-Role Access',
      description: 'Secure role-based access for doctors, nurses, and administrative staff',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Patients Served', icon: UserGroupIcon },
    { value: '500+', label: 'Healthcare Professionals', icon: HeartIcon },
    { value: '98%', label: 'Satisfaction Rate', icon: ChartBarIcon },
    { value: '24/7', label: 'System Availability', icon: ClockIcon }
  ];

  const benefits = [
    {
      title: 'Increased Efficiency',
      description: 'Reduce administrative tasks by up to 70% with automated workflows',
      icon: SparklesIcon
    },
    {
      title: 'Better Patient Care',
      description: 'Focus on what matters most - providing excellent healthcare',
      icon: HeartIcon
    },
    {
      title: 'Real-time Analytics',
      description: 'Make data-driven decisions with comprehensive dashboards',
      icon: ChartBarIcon
    },
    {
      title: 'Secure & Compliant',
      description: 'HIPAA compliant with enterprise-grade security',
      icon: ShieldCheckIcon
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <HeartIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">
                ApapMedika
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Features
              </a>
              <a href="#benefits" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Benefits
              </a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                About
              </a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Contact
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login" className="btn-outline btn-sm">
                Login
              </Link>
              <Link href="/signup" className="btn-primary btn-sm">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6 text-gray-700" />
              ) : (
                <Bars3Icon className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white rounded-xl shadow-xl p-6 mt-2 slide-in-right">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="nav-link">Features</a>
                <a href="#benefits" className="nav-link">Benefits</a>
                <a href="#about" className="nav-link">About</a>
                <a href="#contact" className="nav-link">Contact</a>
                <div className="pt-4 border-t flex flex-col space-y-3">
                  <Link href="/login" className="btn-outline text-center">
                    Login
                  </Link>
                  <Link href="/signup" className="btn-primary text-center">
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 fade-in">        
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Transform Your Healthcare Management with{' '}
                <span className="gradient-text">ApapMedika</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Revolutionize your hospital operations with our comprehensive management system. 
                From patient appointments to billing, we provide an all-in-one solution for modern healthcare.
              </p>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  <span>Easy to Use</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  <span>Secure & HIPAA Compliant</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  <span>24/7 Support</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/signup" className="btn-primary btn-lg group">
                  Start Free Trial
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="btn-outline btn-lg">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Watch Demo
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10 float-animation">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop"
                  alt="Modern Hospital"
                  className="rounded-3xl shadow-2xl w-full"
                />
                <div className="absolute -bottom-6 -left-6 card pulse-animation">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">98% Efficiency</p>
                      <p className="text-sm text-gray-600">Improved Operations</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 card-compact">
                  <div className="flex items-center space-x-2">
                    <ChartBarIcon className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">70%</p>
                      <p className="text-xs text-gray-600">Time Saved</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-10 right-10 w-72 h-72 bg-blue-200 rounded-full filter blur-3xl opacity-20"></div>
              <div className="absolute bottom-10 left-10 w-72 h-72 bg-purple-200 rounded-full filter blur-3xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Healthcare Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your hospital efficiently in one powerful platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card group hover:scale-105 transition-all duration-300"
              >
                <div className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <div className={`w-full h-full bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-5xl font-bold text-white mb-2">
                  {stat.value}
                </h3>
                <p className="text-blue-100 text-lg">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="section-padding">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose ApapMedika?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the benefits of a modern hospital management system
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 group-hover:shadow-glow transition-all duration-300">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <HeartIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">ApapMedika</span>
              </div>
              <p className="text-gray-400">
                Leading the future of healthcare management with innovative solutions for modern hospitals.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Services</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Appointments</a></li>
                <li><a href="#" className="hover:text-white transition">Pharmacy</a></li>
                <li><a href="#" className="hover:text-white transition">Insurance</a></li>
                <li><a href="#" className="hover:text-white transition">Billing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ApapMedika. All rights reserved. | Powered by Advanced Healthcare Solutions</p>
          </div>
        </div>
      </footer>
    </div>
  );
}