'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  BeakerIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/format';

interface DashboardStats {
  appointments?: number;
  todayAppointments?: number;
  patients?: number;
  medicines?: number;
  reservations?: number;
  policies?: number;
  prescriptions?: number;
  pendingPrescriptions?: number;
  bills?: number;
  pendingBills?: number;
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  description 
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  description?: string;
}) => (
  <div className="card group hover:scale-105 transition-all duration-300">
    <div className="flex items-center">
      <div className={`flex-shrink-0 w-12 h-12 ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  </div>
);

const QuickActionCard = ({ 
  title, 
  description, 
  href, 
  icon: Icon, 
  color 
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<any>;
  color: string;
}) => (
  <a
    href={href}
    className="card group hover:scale-105 transition-all duration-300 block"
  >
    <div className="flex items-center space-x-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </a>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        
        // Fetch different stats based on user role
        const promises: Promise<any>[] = [];
        
        if (user?.role === 'admin') {
          promises.push(
            apiClient.getUsers().then(data => ({ users: data.count || data.length })),
            apiClient.getAppointments().then(data => ({ appointments: data.count || data.length })),
            apiClient.getMedicines().then(data => ({ medicines: data.count || data.length })),
            apiClient.getReservations().then(data => ({ reservations: data.count || data.length })),
            apiClient.getPolicies().then(data => ({ policies: data.count || data.length }))
          );
        } else if (user?.role === 'doctor') {
          promises.push(
            apiClient.getAppointments({ doctor: user.id }).then(data => ({ 
              appointments: data.count || data.length 
            })),
            apiClient.getAppointments({ 
              doctor: user.id, 
              date: new Date().toISOString().split('T')[0] 
            }).then(data => ({ 
              todayAppointments: data.count || data.length 
            }))
          );
        } else if (user?.role === 'nurse') {
          promises.push(
            apiClient.getAppointments().then(data => ({ appointments: data.count || data.length })),
            apiClient.getReservations().then(data => ({ reservations: data.count || data.length }))
          );
        } else if (user?.role === 'pharmacist') {
          promises.push(
            apiClient.getMedicines().then(data => ({ medicines: data.count || data.length })),
            apiClient.getPrescriptions().then(data => ({ prescriptions: data.count || data.length })),
            apiClient.getPrescriptions({ status: 0 }).then(data => ({ 
              pendingPrescriptions: data.count || data.length 
            }))
          );
        } else if (user?.role === 'patient') {
          promises.push(
            apiClient.getAppointments({ patient: user.id }).then(data => ({ 
              appointments: data.count || data.length 
            })),
            apiClient.getPolicies({ patient: user.id }).then(data => ({ 
              policies: data.count || data.length 
            })),
            apiClient.getReservations({ patient: user.id }).then(data => ({ 
              reservations: data.count || data.length 
            })),
            apiClient.getBills({ patient: user.id }).then(data => ({ 
              bills: data.count || data.length 
            })),
            apiClient.getBills({ patient: user.id, status: 'UNPAID' }).then(data => ({ 
              pendingBills: data.count || data.length 
            }))
          );
        }

        const results = await Promise.allSettled(promises);
        
        const statsData: DashboardStats = {};
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            Object.assign(statsData, result.value);
          }
        });
        
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  const getStatsForRole = () => {
    switch (user?.role) {
      case 'admin':
        return [
          // {
          //   title: 'Total Users',
          //   value: stats.users || 0,
          //   icon: UserGroupIcon,
          //   color: 'bg-gradient-to-br from-blue-500 to-blue-600',
          //   description: 'Registered users'
          // },
          {
            title: 'Appointments',
            value: stats.appointments || 0,
            icon: CalendarDaysIcon,
            color: 'bg-gradient-to-br from-green-500 to-green-600',
            description: 'Total appointments'
          },
          {
            title: 'Medicines',
            value: stats.medicines || 0,
            icon: BeakerIcon,
            color: 'bg-gradient-to-br from-purple-500 to-purple-600',
            description: 'Available medicines'
          },
          {
            title: 'Reservations',
            value: stats.reservations || 0,
            icon: BuildingOfficeIcon,
            color: 'bg-gradient-to-br from-orange-500 to-orange-600',
            description: 'Room reservations'
          },
          {
            title: 'Policies',
            value: stats.policies || 0,
            icon: ShieldCheckIcon,
            color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
            description: 'Insurance policies'
          }
        ];

      case 'doctor':
        return [
          {
            title: 'My Appointments',
            value: stats.appointments || 0,
            icon: CalendarDaysIcon,
            color: 'bg-gradient-to-br from-blue-500 to-blue-600',
            description: 'Total appointments'
          },
          {
            title: 'Today\'s Appointments',
            value: stats.todayAppointments || 0,
            icon: ClockIcon,
            color: 'bg-gradient-to-br from-green-500 to-green-600',
            description: 'Scheduled for today'
          }
        ];

      case 'nurse':
        return [
          {
            title: 'Appointments',
            value: stats.appointments || 0,
            icon: CalendarDaysIcon,
            color: 'bg-gradient-to-br from-blue-500 to-blue-600',
            description: 'Total appointments'
          },
          {
            title: 'Reservations',
            value: stats.reservations || 0,
            icon: BuildingOfficeIcon,
            color: 'bg-gradient-to-br from-green-500 to-green-600',
            description: 'Room reservations'
          }
        ];

      case 'pharmacist':
        return [
          {
            title: 'Medicines',
            value: stats.medicines || 0,
            icon: BeakerIcon,
            color: 'bg-gradient-to-br from-blue-500 to-blue-600',
            description: 'Available medicines'
          },
          {
            title: 'Prescriptions',
            value: stats.prescriptions || 0,
            icon: BeakerIcon,
            color: 'bg-gradient-to-br from-green-500 to-green-600',
            description: 'Total prescriptions'
          },
          {
            title: 'Pending',
            value: stats.pendingPrescriptions || 0,
            icon: ExclamationTriangleIcon,
            color: 'bg-gradient-to-br from-orange-500 to-orange-600',
            description: 'Awaiting processing'
          }
        ];

      case 'patient':
        return [
          {
            title: 'My Appointments',
            value: stats.appointments || 0,
            icon: CalendarDaysIcon,
            color: 'bg-gradient-to-br from-blue-500 to-blue-600',
            description: 'Total appointments'
          },
          {
            title: 'Policies',
            value: stats.policies || 0,
            icon: ShieldCheckIcon,
            color: 'bg-gradient-to-br from-green-500 to-green-600',
            description: 'Insurance policies'
          },
          {
            title: 'Reservations',
            value: stats.reservations || 0,
            icon: BuildingOfficeIcon,
            color: 'bg-gradient-to-br from-purple-500 to-purple-600',
            description: 'Room reservations'
          },
          {
            title: 'Pending Bills',
            value: stats.pendingBills || 0,
            icon: CurrencyDollarIcon,
            color: 'bg-gradient-to-br from-red-500 to-red-600',
            description: 'Unpaid bills'
          }
        ];

      default:
        return [];
    }
  };

  const getQuickActionsForRole = () => {
    switch (user?.role) {
      case 'admin':
        return [
          {
            title: 'Create Appointment',
            description: 'Schedule a new patient appointment',
            href: '/dashboard/appointments/create',
            icon: CalendarDaysIcon,
            color: 'bg-gradient-to-br from-blue-500 to-blue-600'
          },
          {
            title: 'Manage Users',
            description: 'View and manage system users',
            href: '/dashboard/users',
            icon: UserGroupIcon,
            color: 'bg-gradient-to-br from-green-500 to-green-600'
          },
          {
            title: 'Create Policy',
            description: 'Create new insurance policy',
            href: '/dashboard/policies/create',
            icon: ShieldCheckIcon,
            color: 'bg-gradient-to-br from-purple-500 to-purple-600'
          }
        ];

      case 'doctor':
        return [
          {
            title: 'View Appointments',
            description: 'Manage your appointments',
            href: '/dashboard/appointments',
            icon: CalendarDaysIcon,
            color: 'bg-gradient-to-br from-blue-500 to-blue-600'
          }
        ];

      case 'nurse':
        return [
          {
            title: 'Create Reservation',
            description: 'Reserve a room for patient',
            href: '/dashboard/reservations/create',
            icon: BuildingOfficeIcon,
            color: 'bg-gradient-to-br from-blue-500 to-blue-600'
          },
          {
            title: 'View Appointments',
            description: 'Manage appointments',
            href: '/dashboard/appointments',
            icon: CalendarDaysIcon,
            color: 'bg-gradient-to-br from-green-500 to-green-600'
          }
        ];

      case 'pharmacist':
        return [
          {
            title: 'Add Medicine',
            description: 'Add new medicine to inventory',
            href: '/dashboard/medicines/create',
            icon: BeakerIcon,
            color: 'bg-gradient-to-br from-blue-500 to-blue-600'
          },
          {
            title: 'Restock Medicines',
            description: 'Update medicine stock levels',
            href: '/dashboard/medicines/restock',
            icon: BeakerIcon,
            color: 'bg-gradient-to-br from-green-500 to-green-600'
          },
          {
            title: 'Process Prescriptions',
            description: 'Handle pending prescriptions',
            href: '/dashboard/prescriptions',
            icon: ExclamationTriangleIcon,
            color: 'bg-gradient-to-br from-orange-500 to-orange-600'
          }
        ];

      case 'patient':
        return [
          {
            title: 'My Appointments',
            description: 'View your appointments',
            href: '/dashboard/appointments',
            icon: CalendarDaysIcon,
            color: 'bg-gradient-to-br from-blue-500 to-blue-600'
          },
          {
            title: 'My Bills',
            description: 'View and pay bills',
            href: '/dashboard/bills',
            icon: CurrencyDollarIcon,
            color: 'bg-gradient-to-br from-green-500 to-green-600'
          },
          {
            title: 'My Policies',
            description: 'Manage insurance policies',
            href: '/dashboard/policies',
            icon: ShieldCheckIcon,
            color: 'bg-gradient-to-br from-purple-500 to-purple-600'
          }
        ];

      default:
        return [];
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 capitalize">
              {user?.role} Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {getStatsForRole().map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getQuickActionsForRole().map((action, index) => (
            <QuickActionCard key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Recent Activity or Alerts */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          System Status
        </h3>
        <div className="flex items-center space-x-3">
          <CheckCircleIcon className="w-5 h-5 text-green-500" />
          <span className="text-sm text-gray-600">
            All systems operational
          </span>
        </div>
      </div>
    </div>
  );
}