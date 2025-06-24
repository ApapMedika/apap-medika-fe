'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatDate, debounce } from '@/utils/format';
import { APPOINTMENT_STATUS_LABELS } from '@/utils/constants';
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Appointment {
  id: string;
  patient: {
    id: string;
    name: string;
    nik: string;
  };
  doctor: {
    id: string;
    name: string;
    specialization: string;
  };
  appointmentDate: string;
  status: number;
  diagnosis?: string;
  treatments?: string[];
  createdAt: string;
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState('appointmentDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, dateFrom, dateTo, sortField, sortOrder, currentPage]);

  // Debounced search
  useEffect(() => {
    const debouncedFetch = debounce(fetchAppointments, 500);
    
    if (searchTerm !== '') {
      debouncedFetch();
    } else {
      fetchAppointments();
    }
  }, [searchTerm]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        search: searchTerm,
        ordering: sortOrder === 'desc' ? `-${sortField}` : sortField,
      };

      if (statusFilter) params.status = statusFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      let data;
      if (user?.role === 'doctor') {
        // For doctors, get only their appointments
        data = await apiClient.getAppointmentsByDoctor(user.id, params);
      } else if (user?.role === 'patient') {
        // For patients, get only their appointments
        data = await apiClient.getAppointmentsByPatient(user.id, params);
      } else {
        // For admin and nurse, get all appointments
        data = await apiClient.getAppointments(params);
      }

      setAppointments(Array.isArray(data) ? data : data.results || []);
      
      if (data.count) {
        setTotalPages(Math.ceil(data.count / 10));
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadge = (status: number) => {
    const statusLabel = APPOINTMENT_STATUS_LABELS[status as keyof typeof APPOINTMENT_STATUS_LABELS];
    const statusClasses = {
      0: 'badge-warning', // Created
      1: 'badge-success', // Done
      2: 'badge-danger',  // Cancelled
    };
    
    return (
      <span className={`badge ${statusClasses[status as keyof typeof statusClasses] || 'badge-gray'}`}>
        {statusLabel}
      </span>
    );
  };

  const canCreateAppointment = user?.role === 'admin';
  const canViewStatistics = ['admin', 'doctor', 'nurse'].includes(user?.role || '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.role === 'doctor' ? 'My Appointments' : 
               user?.role === 'patient' ? 'My Appointments' : 'Appointments'}
            </h1>
            <p className="text-gray-600">
              {user?.role === 'doctor' ? 'Manage your appointment schedule' :
               user?.role === 'patient' ? 'View your appointments' : 'Manage all appointments'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {canViewStatistics && (
            <Link href="/appointments/statistics" className="btn-outline flex items-center space-x-2">
              <ChartBarIcon className="w-5 h-5" />
              <span>Statistics</span>
            </Link>
          )}
          
          {canCreateAppointment && (
            <Link href="/appointments/create" className="btn-primary flex items-center space-x-2">
              <PlusIcon className="w-5 h-5" />
              <span>Create Appointment</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="form-label">Search</label>
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="form-input pl-10"
                placeholder="Search by patient or doctor name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="0">Created</option>
              <option value="1">Done</option>
              <option value="2">Cancelled</option>
            </select>
          </div>

          {/* Date Range - From */}
          <div>
            <label className="form-label">Date From</label>
            <input
              type="date"
              className="form-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          {/* Date Range - To */}
          <div>
            <label className="form-label">Date To</label>
            <input
              type="date"
              className="form-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div className="md:col-span-3 flex items-end space-x-3">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setDateFrom('');
                setDateTo('');
                setCurrentPage(1);
              }}
              className="btn-outline"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="table-header cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center space-x-1">
                    <span>ID</span>
                    {sortField === 'id' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                
                <th 
                  className="table-header cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('patient__user__name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Patient</span>
                    {sortField === 'patient__user__name' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                
                <th 
                  className="table-header cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('doctor__user__name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Doctor</span>
                    {sortField === 'doctor__user__name' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                
                <th 
                  className="table-header cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('appointmentDate')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Appointment Date</span>
                    {sortField === 'appointmentDate' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="table-cell text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="spinner w-6 h-6"></div>
                    </div>
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-cell text-center py-8 text-gray-500">
                    No appointments found
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-sm">{appointment.id}</td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-900">{appointment.patient.name}</p>
                        <p className="text-sm text-gray-500">{appointment.patient.nik}</p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-900">{appointment.doctor.name}</p>
                        <p className="text-sm text-gray-500">{appointment.doctor.specialization}</p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatDate(appointment.appointmentDate)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.appointmentDate).toLocaleTimeString('en-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="table-cell">
                      {getStatusBadge(appointment.status)}
                    </td>
                    <td className="table-cell">
                      <Link
                        href={`/appointments/${appointment.id}`}
                        className="btn-sm btn-outline flex items-center space-x-1"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn-outline btn-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn-outline btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}