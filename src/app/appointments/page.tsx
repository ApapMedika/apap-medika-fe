'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate, formatDateTimeString } from '@/utils/format';
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PlusIcon,
  FunnelIcon,
  UserIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Appointment } from '@/types';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';

const appointmentStatusMap = {
  0: { label: 'Created', color: 'badge-warning' },
  1: { label: 'Done', color: 'badge-success' },
  2: { label: 'Cancelled', color: 'badge-danger' },
};

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | ''>('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [currentPage, searchQuery, statusFilter, dateFromFilter, dateToFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== '' && { status: statusFilter.toString() }),
        ...(dateFromFilter && { date_from: dateFromFilter }),
        ...(dateToFilter && { date_to: dateToFilter }),
      });

      const response = await apiClient.getAppointments(params.toString());
      setAppointments(response.results || response);
      if (response.count) {
        setTotalPages(Math.ceil(response.count / 10));
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setDateFromFilter('');
    setDateToFilter('');
    setCurrentPage(1);
  };

  const canCreateAppointment = user?.role === 'ADMIN';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                <CalendarDaysIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
                <p className="text-gray-600">Manage and view appointment schedules</p>
              </div>
            </div>

            {canCreateAppointment && (
              <Link href="/appointments/create" className="btn-primary">
                <PlusIcon className="w-5 h-5 mr-2" />
                New Appointment
              </Link>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label htmlFor="search" className="form-label">
                Search Appointments
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search by patient name or doctor name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-end">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline"
              >
                <FunnelIcon className="w-5 h-5 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="status" className="form-label">
                    Status
                  </label>
                  <select
                    id="status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value === '' ? '' : Number(e.target.value))}
                    className="form-select"
                  >
                    <option value="">All Statuses</option>
                    <option value="0">Created</option>
                    <option value="1">Done</option>
                    <option value="2">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="dateFrom" className="form-label">
                    Date From
                  </label>
                  <input
                    id="dateFrom"
                    type="date"
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label htmlFor="dateTo" className="form-label">
                    Date To
                  </label>
                  <input
                    id="dateTo"
                    type="date"
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center space-x-4">
                <button onClick={resetFilters} className="btn-secondary">
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <EmptyState
            icon={CalendarDaysIcon}
            title="No appointments found"
            description="There are no appointments matching your search criteria."
            action={canCreateAppointment ? {
              label: "Create New Appointment",
              onClick: () => window.location.href = '/appointments/create'
            } : undefined}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 lg:hidden">
              {/* Mobile Cards */}
              {appointments.map((appointment) => {
                const statusInfo = appointmentStatusMap[appointment.status];
                return (
                  <div key={appointment.id} className="card-compact">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{appointment.patient.name}</h3>
                          <p className="text-sm text-gray-600">NIK: {appointment.patient.nik}</p>
                        </div>
                      </div>
                      <div className={`badge ${statusInfo.color}`}>
                        {statusInfo.label}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Dr. {appointment.doctor.name}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatDateTimeString(appointment.appointmentDate)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(appointment.totalFee)}
                        </span>
                        <Link
                          href={`/appointments/${appointment.id}`}
                          className="btn-outline btn-sm"
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <div className="table-container">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Patient</th>
                      <th className="table-header-cell">Doctor</th>
                      <th className="table-header-cell">Date & Time</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell">Fee</th>
                      <th className="table-header-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {appointments.map((appointment) => {
                      const statusInfo = appointmentStatusMap[appointment.status];
                      return (
                        <tr key={appointment.id} className="hover:bg-gray-50">
                          <td className="table-cell">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{appointment.patient.name}</p>
                                <p className="text-sm text-gray-500">NIK: {appointment.patient.nik}</p>
                              </div>
                            </div>
                          </td>
                          <td className="table-cell">
                            <div>
                              <p className="font-medium text-gray-900">Dr. {appointment.doctor.name}</p>
                              <p className="text-sm text-gray-500">{appointment.doctor.specializationDisplay}</p>
                            </div>
                          </td>
                          <td className="table-cell">
                            <div>
                              <p className="font-medium">{formatDate(appointment.appointmentDate)}</p>
                              <p className="text-sm text-gray-500">
                                {formatDateTimeString(appointment.appointmentDate)}
                              </p>
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className={`badge ${statusInfo.color}`}>
                              {statusInfo.label}
                            </div>
                          </td>
                          <td className="table-cell">
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(appointment.totalFee)}
                            </span>
                          </td>
                          <td className="table-cell">
                            <Link
                              href={`/appointments/${appointment.id}`}
                              className="btn-outline btn-sm"
                            >
                              <EyeIcon className="w-4 h-4 mr-1" />
                              View Details
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  showInfo={true}
                  totalCount={appointments.length}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}