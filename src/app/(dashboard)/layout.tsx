'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
  HeartIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  BeakerIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  roles: string[];
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: UserIcon,
    roles: ['admin', 'doctor', 'nurse', 'pharmacist', 'patient'],
  },
  {
    name: 'Users',
    href: '/dashboard/users',
    icon: UserGroupIcon,
    roles: ['admin'],
  },
  {
    name: 'Appointments',
    href: '/dashboard/appointments',
    icon: CalendarDaysIcon,
    roles: ['admin', 'doctor', 'nurse', 'patient'],
  },
  {
    name: 'Medicines',
    href: '/dashboard/medicines',
    icon: BeakerIcon,
    roles: ['admin', 'pharmacist', 'doctor', 'nurse'],
  },
  {
    name: 'Prescriptions',
    href: '/dashboard/prescriptions',
    icon: BeakerIcon,
    roles: ['pharmacist', 'patient'],
  },
  {
    name: 'Reservations',
    href: '/dashboard/reservations',
    icon: BuildingOfficeIcon,
    roles: ['admin', 'nurse', 'patient'],
  },
  {
    name: 'Policies',
    href: '/dashboard/policies',
    icon: ShieldCheckIcon,
    roles: ['admin', 'patient'],
  },
  {
    name: 'Bills',
    href: '/dashboard/bills',
    icon: CurrencyDollarIcon,
    roles: ['patient'],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="spinner w-8 h-8"></div>
    </div>;
  }

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user.role)
  );

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="modal-backdrop"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <HeartIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">ApapMedika</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'nav-link-active'
                    : 'nav-link'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navbar */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <Bars3Icon className="w-6 h-6" />
                </button>
              </div>

              <div className="flex items-center space-x-4">
                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                      {user.name}
                    </span>
                    <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="dropdown-menu w-56">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-gray-500">{user.email}</p>
                        </div>
                        {user.role === 'patient' && (
                          <Link
                            href="/dashboard/profile"
                            className="dropdown-item"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <UserIcon className="w-4 h-4 mr-2" />
                            View Profile
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="dropdown-item w-full text-left"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}