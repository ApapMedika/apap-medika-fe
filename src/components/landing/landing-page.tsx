'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { redirect } from 'next/navigation';
import {
  HeartIcon,
  CalendarDaysIcon,
  BeakerIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  const { user, loading } = useAuth();

  // Redirect authenticated users to dashboard
  if (!loading && user) {
    redirect('/dashboard');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const features = [
    {
      icon: CalendarDaysIcon,
      title: 'Appointment Management',
      description: 'Easy scheduling and management of doctor appointments with real-time availability.',
    },
    {
      icon: BeakerIcon,
      title: 'Pharmacy Services',
      description: 'Complete medicine inventory management and prescription processing system.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Insurance Integration',
      description: 'Seamless insurance policy management and claim processing for patients.',
    },
    {
      icon: BuildingOfficeIcon,
      title: 'Room Reservations',
      description: 'Hospital room booking system with facility management and scheduling.',
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Billing System',
      description: 'Integrated billing system with insurance coverage calculation and payment processing.',
    },
    {
      icon: UserGroupIcon,
      title: 'Multi-Role Access',
      description: 'Role-based access for doctors, nurses, pharmacists, patients, and administrators.',
    },
  ];

  const benefits = [
    'Streamlined hospital operations',
    'Improved patient experience',
    'Integrated insurance management',
    'Real-time appointment scheduling',
    'Comprehensive pharmacy management',
    'Secure patient data management',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <HeartIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ApapMedika
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">        
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Transform Your Healthcare Management with{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ApapMedika</span>
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
            </div>
            
            <div className="relative">
              <div className="relative z-10 transform hover:scale-105 transition-transform duration-300">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop"
                  alt="Modern Hospital"
                  className="rounded-3xl shadow-2xl w-full"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-lg animate-pulse">
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
                <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-lg">
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

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Healthcare Providers
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of medical professionals using our platform
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Appointments</h3>
              <p className="text-2xl font-bold text-blue-600">10K+</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserGroupIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Patients</h3>
              <p className="text-2xl font-bold text-green-600">5K+</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BeakerIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Medicines</h3>
              <p className="text-2xl font-bold text-purple-600">500+</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheckIcon className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Policies</h3>
              <p className="text-2xl font-bold text-orange-600">800+</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Healthcare Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our integrated system covers every aspect of hospital operations, 
              from patient care to administrative tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-blue-200 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose ApapMedika?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Built specifically for modern healthcare facilities, our system 
                provides everything you need to manage your hospital efficiently.
              </p>
              
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckIcon className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Get Started Today
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold">99%</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">System Uptime</p>
                      <p className="text-gray-600 text-sm">Always available when you need it</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">24/7</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Support Available</p>
                      <p className="text-gray-600 text-sm">Round-the-clock assistance</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold">50+</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Hospitals Served</p>
                      <p className="text-gray-600 text-sm">Across the region</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <HeartIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">ApapMedika</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Modern hospital management system designed to streamline healthcare 
                operations and improve patient care through integrated technology solutions.
              </p>
              <p className="text-gray-500 text-sm">
                © 2024 ApapMedika. All rights reserved.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Appointment Management</li>
                <li>Pharmacy Services</li>
                <li>Insurance Integration</li>
                <li>Room Reservations</li>
                <li>Billing System</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>Help Center</li>
                <li>Contact Support</li>
                <li>System Status</li>
                <li>Training</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}