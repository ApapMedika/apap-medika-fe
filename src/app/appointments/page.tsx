'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/utils/format';
import { APPOINTMENT_STATUS } from '@/utils/constants';
import {
  CalendarDaysIcon,
  PlusIcon,
  MagnifyingGlassIcon,
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
  totalFee: number;
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

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, dateFrom, dateTo]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      // Role-based filtering
      if (user?.role === 'doctor') {
        params.doctor = user.id;
      } else if (user?.role === 'patient') {
        params.patient = user.id;
      }
      
      if (statusFilter) params.status = statusFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      
      const data = await apiClient.getAppointments(params);
      setAppointments(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case APPOINTMENT_STATUS.CREATED:
        return <span className="badge badge-warning">Created</span>;
      case APPOINTMENT_STATUS.DONE:
        return <span className="badge badge-success">Done</span>;
      case APPOINTMENT_STATUS.CANCELLED:
        return <span className="badge badge-danger">Cancelled</span>;
      default:
        return <span className="badge badge-gray">Unknown</span>;
    }
  };

  const filteredAppointments = appointments.filter(appointment =>
    appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreateAppointment = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.role === 'doctor' ? 'My Appointments' : 
               user?.role === 'patient' ? 'My Appointments' : 
               'All Appointments'}
            </h1>
            <p className="text-gray-600">
              {user?.role === 'doctor' ? 'Manage your patient appointments' :
               user?.role === 'patient' ? 'View your scheduled appointments' :
               'Manage hospital appointments'}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/dashboard/appointments/statistics"
            className="btn-outline btn-sm"
          >
            <ChartBarIcon className="w-4 h-4 mr-2" />
            Statistics
          </Link>
          {canCreateAppointment && (
            <Link
              href="/dashboard/appointments/create"
              className="btn-primary btn-sm"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Appointment
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
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

          <input
            type="date"
            className="form-input"
            placeholder="From Date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />

          <input
            type="date"
            className="form-input"
            placeholder="To Date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      {/* Appointments Table */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner w-8 h-8"></div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">ID</th>
                  <th className="table-header-cell">Patient</th>
                  <th className="table-header-cell">Doctor</th>
                  <th className="table-header-cell">Date</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="table-cell font-mono text-sm">
                      {appointment.id}
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-900">
                          {appointment.patient.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          NIK: {appointment.patient.nik}
                        </p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-900">
                          {appointment.doctor.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {appointment.doctor.specialization}
                        </p>
                      </div>
                    </td>
                    <td className="table-cell">
                      {formatDate(appointment.appointmentDate)}
                    </td>
                    <td className="table-cell">
                      {getStatusBadge(appointment.status)}
                    </td>
                    <td className="table-cell">
                      <Link
                        href={`/dashboard/appointments/${appointment.id}`}
                        className="btn-primary btn-sm"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredAppointments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="table-cell text-center py-12">
                      <div className="text-gray-500">
                        <CalendarDaysIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No appointments found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}