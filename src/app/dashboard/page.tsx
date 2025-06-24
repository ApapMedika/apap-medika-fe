'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate } from '@/utils/format';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  BeakerIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface DashboardStats {
  appointments?: {
    total: number;
    today: number;
    pending: number;
  };
  patients?: {
    total: number;
  };
  medicines?: {
    total: number;
    lowStock: number;
    outOfStock: number;
  };
  prescriptions?: {
    total: number;
    pending: number;
  };
  reservations?: {
    total: number;
    ongoing: number;
    upcoming: number;
  };
  policies?: {
    total: number;
    active: number;
    expired: number;
  };
  bills?: {
    total: number;
    unpaid: number;
    totalAmount: number;
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [recentItems, setRecentItems] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardStats: DashboardStats = {};

      // Fetch different data based on user role
      switch (user?.role) {
        case 'ADMIN':
          await fetchAdminData(dashboardStats);
          break;
        case 'DOCTOR':
          await fetchDoctorData(dashboardStats);
          break;
        case 'NURSE':
          await fetchNurseData(dashboardStats);
          break;
        case 'PHARMACIST':
          await fetchPharmacistData(dashboardStats);
          break;
        case 'PATIENT':
          await fetchPatientData(dashboardStats);
          break;
      }

      setStats(dashboardStats);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async (dashboardStats: DashboardStats) => {
    try {
      // Fetch appointments
      const appointmentsData = await apiClient.getAppointments({ page_size: 1 });
      const todayAppointments = await apiClient.getTodayAppointments();
      
      dashboardStats.appointments = {
        total: appointmentsData.count || 0,
        today: todayAppointments.count || 0,
        pending: appointmentsData.results?.filter((a: any) => a.status === 0).length || 0,
      };

      // Fetch patients
      const patientsData = await apiClient.getPatients({ page_size: 1 });
      dashboardStats.patients = {
        total: patientsData.count || 0,
      };

      // Fetch medicines
      const medicinesData = await apiClient.getMedicines({ page_size: 1 });
      dashboardStats.medicines = {
        total: medicinesData.count || 0,
        lowStock: 0, // Will be calculated from actual data
        outOfStock: 0,
      };

      // Fetch policies
      const policiesData = await apiClient.getPolicies({ page_size: 1 });
      dashboardStats.policies = {
        total: policiesData.count || 0,
        active: 0,
        expired: 0,
      };

    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const fetchDoctorData = async (dashboardStats: DashboardStats) => {
    try {
      // Fetch doctor's appointments
      const appointmentsData = await apiClient.getAppointmentsByDoctor(user?.id || '', { page_size: 5 });
      
      dashboardStats.appointments = {
        total: appointmentsData.count || 0,
        today: appointmentsData.results?.filter((a: any) => {
          const appointmentDate = new Date(a.appointmentDate);
          const today = new Date();
          return appointmentDate.toDateString() === today.toDateString();
        }).length || 0,
        pending: appointmentsData.results?.filter((a: any) => a.status === 0).length || 0,
      };

      setRecentItems(appointmentsData.results || []);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
    }
  };

  const fetchNurseData = async (dashboardStats: DashboardStats) => {
    try {
      // Fetch appointments
      const appointmentsData = await apiClient.getAppointments({ page_size: 1 });
      dashboardStats.appointments = {
        total: appointmentsData.count || 0,
        today: 0,
        pending: 0,
      };

      // Fetch reservations
      const reservationsData = await apiClient.getReservations({ page_size: 5 });
      dashboardStats.reservations = {
        total: reservationsData.count || 0,
        ongoing: 0,
        upcoming: 0,
      };

      setRecentItems(reservationsData.results || []);
    } catch (error) {
      console.error('Error fetching nurse data:', error);
    }
  };

  const fetchPharmacistData = async (dashboardStats: DashboardStats) => {
    try {
      // Fetch medicines
      const medicinesData = await apiClient.getMedicines({ page_size: 1 });
      dashboardStats.medicines = {
        total: medicinesData.count || 0,
        lowStock: 0,
        outOfStock: 0,
      };

      // Fetch prescriptions
      const prescriptionsData = await apiClient.getPrescriptions({ page_size: 5 });
      dashboardStats.prescriptions = {
        total: prescriptionsData.count || 0,
        pending: prescriptionsData.results?.filter((p: any) => [0, 1].includes(p.status)).length || 0,
      };

      setRecentItems(prescriptionsData.results || []);
    } catch (error) {
      console.error('Error fetching pharmacist data:', error);
    }
  };

  const fetchPatientData = async (dashboardStats: DashboardStats) => {
    try {
      // Fetch patient's appointments
      const appointmentsData = await apiClient.getAppointmentsByPatient(user?.id || '', { page_size: 5 });
      dashboardStats.appointments = {
        total: appointmentsData.count || 0,
        today: 0,
        pending: appointmentsData.results?.filter((a: any) => a.status === 0).length || 0,
      };

      // Fetch patient's bills
      const billsData = await apiClient.getBills({ patient: user?.id, page_size: 1 });
      dashboardStats.bills = {
        total: billsData.count || 0,
        unpaid: billsData.results?.filter((b: any) => b.status === 'UNPAID').length || 0,
        totalAmount: billsData.results?.reduce((sum: number, b: any) => 
          b.status === 'UNPAID' ? sum + b.totalAmountDue : sum, 0) || 0,
      };

      // Fetch patient's policies
      const policiesData = await apiClient.getPolicies({ patient: user?.id, page_size: 1 });
      dashboardStats.policies = {
        total: policiesData.count || 0,
        active: policiesData.results?.filter((p: any) => [0, 1, 2].includes(p.status)).length || 0,
        expired: policiesData.results?.filter((p: any) => p.status === 3).length || 0,
      };

      setRecentItems(appointmentsData.results || []);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };

  const getQuickActions = () => {
    switch (user?.role) {
      case 'ADMIN':
        return [
          {
            title: 'Create Appointment',
            description: 'Schedule new patient appointment',
            href: '/appointments/create',
            icon: CalendarDaysIcon,
            color: 'bg-gradient-to-br from-blue-500 to-blue-600'
          },
          {
            title: 'Create Policy',
            description: 'Create new insurance policy',
            href: '/policies/create',
            icon: ShieldCheckIcon,
            color: 'bg-gradient-to-br from-green-500 to-green-600'
          },
          {
            title: 'Upgrade Patient Class',
            description: 'Upgrade patient insurance class',
            href: '/patients/upgrade-class',
            icon: UserGroupIcon,
            color: 'bg-gradient-to-br from-purple-500 to-purple-600'
          },
          {
            title: 'View Statistics',
            description: 'View system statistics',
            href: '/appointments/statistics',
            icon: ChartBarIcon,
            color: 'bg-gradient-to-br from-orange-500 to-orange-600'
          }
        ];

      case 'DOCTOR':
        return [
          {
            title: 'My Appointments',
            description: 'View and manage appointments',
            href: '/appointments',
            icon: CalendarDaysIcon,
            color: 'bg-gradient-to-br from-blue-500 to-blue-600'
          },
          {
            title: 'Update Diagnosis',
            description: 'Add diagnosis and treatments',
            href: '/appointments',
            icon: ClipboardDocumentListIcon,
            color: 'bg-gradient-to-br from-green-500 to-green-600'
          }
        ];

      case 'NURSE':
        return [
          {
            title: 'Create Reservation',
            description: 'Book hospital room',
            href: '/reservations/create',
            icon: BuildingOfficeIcon,
            color: 'bg-gradient-to-br from-purple-500 to-purple-600'
          },
          {
            title: 'View Appointments',
            description: 'Manage appointments',
            href: '/appointments',
            icon: CalendarDaysIcon,
            color: 'bg-gradient-to-br from-blue-500 to-blue-600'
          }
        ];

      case 'PHARMACIST':
        return [
          {
            title: 'Add Medicine',
            description: 'Add new medicine to inventory',
            href: '/medicines/create',
            icon: BeakerIcon,
            color: 'bg-gradient-to-br from-blue-500 to-blue-600'
          },
          {
            title: 'Restock Medicines',
            description: 'Update medicine stock levels',
            href: '/medicines/restock',
            icon: BeakerIcon,
            color: 'bg-gradient-to-br from-green-500 to-green-600'
          },
          {
            title: 'Process Prescriptions',
            description: 'Handle pending prescriptions',
            href: '/prescriptions',
            icon: ClipboardDocumentListIcon,
            color: 'bg-gradient-to-br from-orange-500 to-orange-600'
          }
        ];

      case 'PATIENT':
        return [
          {
            title: 'My Appointments',
            description: 'View your appointments',
            href: '/appointments',
            icon: CalendarDaysIcon,
            color: 'bg-gradient-to-br from-blue-500 to-blue-600'
          },
          {
            title: 'My Bills',
            description: 'View and pay bills',
            href: '/bills',
            icon: CurrencyDollarIcon,
            color: 'bg-gradient-to-br from-green-500 to-green-600'
          },
          {
            title: 'My Policies',
            description: 'Manage insurance policies',
            href: '/policies',
            icon: ShieldCheckIcon,
            color: 'bg-gradient-to-br from-purple-500 to-purple-600'
          }
        ];

      default:
        return [];
    }
  };

  const getStatsCards = () => {
    switch (user?.role) {
      case 'ADMIN':
        return [
          {
            title: 'Total Appointments',
            value: stats.appointments?.total || 0,
            subtitle: `${stats.appointments?.today || 0} today`,
            icon: CalendarDaysIcon,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
          },
          {
            title: 'Total Patients',
            value: stats.patients?.total || 0,
            subtitle: 'Registered patients',
            icon: UserGroupIcon,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
          },
          {
            title: 'Total Medicines',
            value: stats.medicines?.total || 0,
            subtitle: `${stats.medicines?.lowStock || 0} low stock`,
            icon: BeakerIcon,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
          },
          {
            title: 'Total Policies',
            value: stats.policies?.total || 0,
            subtitle: `${stats.policies?.active || 0} active`,
            icon: ShieldCheckIcon,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100'
          }
        ];

      case 'DOCTOR':
        return [
          {
            title: 'My Appointments',
            value: stats.appointments?.total || 0,
            subtitle: `${stats.appointments?.today || 0} today`,
            icon: CalendarDaysIcon,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
          },
          {
            title: 'Pending Appointments',
            value: stats.appointments?.pending || 0,
            subtitle: 'Need attention',
            icon: ClockIcon,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100'
          }
        ];

      case 'NURSE':
        return [
          {
            title: 'Appointments',
            value: stats.appointments?.total || 0,
            subtitle: 'Total appointments',
            icon: CalendarDaysIcon,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
          },
          {
            title: 'Reservations',
            value: stats.reservations?.total || 0,
            subtitle: `${stats.reservations?.ongoing || 0} ongoing`,
            icon: BuildingOfficeIcon,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
          }
        ];

      case 'PHARMACIST':
        return [
          {
            title: 'Total Medicines',
            value: stats.medicines?.total || 0,
            subtitle: `${stats.medicines?.outOfStock || 0} out of stock`,
            icon: BeakerIcon,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
          },
          {
            title: 'Prescriptions',
            value: stats.prescriptions?.total || 0,
            subtitle: `${stats.prescriptions?.pending || 0} pending`,
            icon: ClipboardDocumentListIcon,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
          }
        ];

      case 'PATIENT':
        return [
          {
            title: 'My Appointments',
            value: stats.appointments?.total || 0,
            subtitle: `${stats.appointments?.pending || 0} pending`,
            icon: CalendarDaysIcon,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
          },
          {
            title: 'Unpaid Bills',
            value: stats.bills?.unpaid || 0,
            subtitle: formatCurrency(stats.bills?.totalAmount || 0),
            icon: CurrencyDollarIcon,
            color: 'text-red-600',
            bgColor: 'bg-red-100'
          },
          {
            title: 'My Policies',
            value: stats.policies?.total || 0,
            subtitle: `${stats.policies?.active || 0} active`,
            icon: ShieldCheckIcon,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
          }
        ];

      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  const quickActions = getQuickActions();
  const statsCards = getStatsCards();

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
              Hi, {user?.name}!
            </h1>
            <p className="text-gray-600 capitalize">
              {user?.role} Dashboard • {new Date().toLocaleDateString('en-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {statsCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <div key={index} className="card">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="group relative overflow-hidden rounded-lg p-6 text-white transition-transform hover:scale-105"
                style={{ background: action.color }}
              >
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <action.icon className="w-8 h-8 mb-3" />
                <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentItems.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <Link 
              href={user?.role === 'DOCTOR' ? '/appointments' : 
                   user?.role === 'NURSE' ? '/reservations' :
                   user?.role === 'PHARMACIST' ? '/prescriptions' :
                   '/appointments'}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              View all →
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentItems.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {user?.role === 'DOCTOR' && (
                    <>
                      <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Appointment with {item.patient?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(item.appointmentDate, true)}
                        </p>
                      </div>
                    </>
                  )}
                  
                  {user?.role === 'NURSE' && (
                    <>
                      <BuildingOfficeIcon className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Reservation for {item.patient?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Room {item.room?.name} • {formatDate(item.dateIn)} to {formatDate(item.dateOut)}
                        </p>
                      </div>
                    </>
                  )}
                  
                  {user?.role === 'PHARMACIST' && (
                    <>
                      <ClipboardDocumentListIcon className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Prescription for {item.patient?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(item.totalPrice)} • {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </>
                  )}
                  
                  {user?.role === 'PATIENT' && (
                    <>
                      <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Appointment with Dr. {item.doctor?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(item.appointmentDate, true)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {item.status === 0 && (
                    <span className="badge badge-warning">Pending</span>
                  )}
                  {item.status === 1 && (
                    <span className="badge badge-success">Completed</span>
                  )}
                  {item.status === 2 && (
                    <span className="badge badge-danger">Cancelled</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient-specific information */}
      {user?.role === 'PATIENT' && user.patient && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">My Insurance Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Insurance Class</p>
                  <p className="text-lg font-bold text-gray-900">Class {user.patient.p_class}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Insurance Limit</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(user.patient.insurance_limit)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CurrencyDollarIcon className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Available Limit</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(user.patient.available_limit)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}