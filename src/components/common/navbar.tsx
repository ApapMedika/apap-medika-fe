'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  BeakerIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  roles: string[];
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HeartIcon,
    roles: ['ADMIN', 'DOCTOR', 'NURSE', 'PHARMACIST', 'PATIENT'],
  },
  {
    name: 'Users',
    href: '/users',
    icon: UserGroupIcon,
    roles: ['ADMIN'],
  },
  {
    name: 'Appointments',
    href: '/appointments',
    icon: CalendarDaysIcon,
    roles: ['ADMIN', 'DOCTOR', 'NURSE', 'PATIENT'],
  },
  {
    name: 'Medicines',
    href: '/medicines',
    icon: BeakerIcon,
    roles: ['ADMIN', 'PHARMACIST', 'PATIENT'],
  },
  {
    name: 'Prescriptions',
    href: '/prescriptions',
    icon: DocumentTextIcon,
    roles: ['PHARMACIST', 'PATIENT'],
  },
  {
    name: 'Policies',
    href: '/policies',
    icon: ShieldCheckIcon,
    roles: ['ADMIN', 'PATIENT'],
  },
  {
    name: 'Reservations',
    href: '/reservations',
    icon: BuildingOfficeIcon,
    roles: ['ADMIN', 'NURSE', 'PATIENT'],
  },
  {
    name: 'Bills',
    href: '/bills',
    icon: CurrencyDollarIcon,
    roles: ['PATIENT'],
  },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Filter navigation items based on user role
  const filteredNavItems = navigationItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'DOCTOR':
        return 'Doctor';
      case 'NURSE':
        return 'Nurse';
      case 'PHARMACIST':
        return 'Pharmacist';
      case 'PATIENT':
        return 'Patient';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'DOCTOR':
        return 'bg-blue-100 text-blue-800';
      case 'NURSE':
        return 'bg-green-100 text-green-800';
      case 'PHARMACIST':
        return 'bg-purple-100 text-purple-800';
      case 'PATIENT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return null; // Don't render navbar for unauthenticated users
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <HeartIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">
                APAP Medika
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'nav-link-active'
                      : 'nav-link'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Profile Dropdown */}
          <div className="flex items-center space-x-4">
            {/* Role Badge */}
            <div className={`hidden sm:block badge ${getRoleBadgeColor(user.role)}`}>
              {getRoleDisplayName(user.role)}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <UserCircleIcon className="w-8 h-8 text-gray-600" />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <ChevronDownIcon className="w-4 h-4 text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="dropdown-menu">
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="dropdown-item"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <UserCircleIcon className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item w-full text-left"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 text-base font-medium transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Profile Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="px-4 mb-4">
                <div className="flex items-center space-x-3">
                  <UserCircleIcon className="w-10 h-10 text-gray-600" />
                  <div>
                    <p className="text-base font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className={`inline-block mt-1 badge ${getRoleBadgeColor(user.role)}`}>
                      {getRoleDisplayName(user.role)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Link
                  href="/profile"
                  className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserCircleIcon className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors duration-200 w-full text-left"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
}