'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate, debounce, isDatePast, isDateToday } from '@/utils/format';
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Reservation {
  id: string;
  patient: {
    id: string;
    name: string;
    nik: string;
    email: string;
    gender: boolean;
  };
  room: {
    id: string;
    name: string;
    description: string;
  };
  assignedNurse: {
    id: string;
    name: string;
  };
  dateIn: string;
  dateOut: string;
  totalFee: number;
  appointment?: {
    id: string;
  };
  facilities: Array<{
    id: string;
    name: string;
    fee: number;
  }>;
  createdAt: string;
}

export default function ReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('dateIn');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReservations();
  }, [statusFilter, sortField, sortOrder, currentPage]);
  
  useEffect(() => {
    // Debounced search
    const debouncedFetch = debounce(fetchReservations, 500);

    if (searchTerm !== '') {
      debouncedFetch();
    } else {
      fetchReservations();
    }
  }, [searchTerm]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        search: searchTerm,
        ordering: sortOrder === 'desc' ? `-${sortField}` : sortField,
      };

      if (statusFilter) params.status = statusFilter;

      const data = await apiClient.getReservations(params);
      setReservations(Array.isArray(data) ? data : data.results || []);
      
      if (data.count) {
        setTotalPages(Math.ceil(data.count / 10));
      }
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
      toast.error('Failed to load reservations');
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

  const getReservationStatus = (dateIn: string, dateOut: string) => {
    const today = new Date();
    const checkIn = new Date(dateIn);
    const checkOut = new Date(dateOut);
    
    today.setHours(0, 0, 0, 0);
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);

    if (checkOut < today) {
      return { status: 'done', label: 'Done', class: 'badge-success' };
    } else if (checkIn <= today && checkOut >= today) {
      return { status: 'ongoing', label: 'Ongoing', class: 'badge-warning' };
    } else {
      return { status: 'upcoming', label: 'Upcoming', class: 'badge-info' };
    }
  };

  const getStatusBadge = (dateIn: string, dateOut: string) => {
    const reservationStatus = getReservationStatus(dateIn, dateOut);
    return (
      <span className={`badge ${reservationStatus.class}`}>
        {reservationStatus.label}
      </span>
    );
  };

  const canCreateReservation = user?.role === 'nurse';
  const canViewStatistics = ['admin', 'nurse'].includes(user?.role || '');

  // Filter reservations based on status filter
  const filteredReservations = reservations.filter(reservation => {
    if (!statusFilter) return true;
    const status = getReservationStatus(reservation.dateIn, reservation.dateOut).status;
    return status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.role === 'patient' ? 'My Reservations' : 'Reservations'}
            </h1>
            <p className="text-gray-600">
              {user?.role === 'patient' 
                ? 'View your hospital room reservations'
                : 'Manage hospital room reservations'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {canViewStatistics && (
            <Link href="/reservations/statistics" className="btn-outline flex items-center space-x-2">
              <ChartBarIcon className="w-5 h-5" />
              <span>Statistics</span>
            </Link>
          )}
          
          {canCreateReservation && (
            <Link href="/reservations/create" className="btn-primary flex items-center space-x-2">
              <PlusIcon className="w-5 h-5" />
              <span>Create Reservation</span>
            </Link>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {user?.role !== 'patient' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reservations.filter(r => getReservationStatus(r.dateIn, r.dateOut).status === 'upcoming').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Ongoing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reservations.filter(r => getReservationStatus(r.dateIn, r.dateOut).status === 'ongoing').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reservations.filter(r => getReservationStatus(r.dateIn, r.dateOut).status === 'done').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(reservations.reduce((sum, r) => sum + r.totalFee, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="form-label">Search</label>
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="form-input pl-10"
                placeholder="Search by patient name, room, or reservation ID..."
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
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="flex items-end space-x-3">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setCurrentPage(1);
              }}
              className="btn-outline"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Reservations Table */}
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
                
                {user?.role !== 'patient' && (
                  <th 
                    className="table-header cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('assignedNurse__user__name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Nurse</span>
                      {sortField === 'assignedNurse__user__name' && (
                        <span className="text-blue-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                )}
                
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
                  onClick={() => handleSort('room__name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Room</span>
                    {sortField === 'room__name' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                
                <th 
                  className="table-header cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('dateIn')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date In</span>
                    {sortField === 'dateIn' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                
                <th 
                  className="table-header cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('dateOut')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date Out</span>
                    {sortField === 'dateOut' && (
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
                  <td colSpan={user?.role === 'patient' ? 7 : 8} className="table-cell text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="spinner w-6 h-6"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'patient' ? 7 : 8} className="table-cell text-center py-8 text-gray-500">
                    {searchTerm || statusFilter ? 'No reservations found matching your criteria' : 'No reservations available'}
                  </td>
                </tr>
              ) : (
                filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-sm">{reservation.id}</td>
                    
                    {user?.role !== 'patient' && (
                      <td className="table-cell">
                        <span className="font-medium text-gray-900">{reservation.assignedNurse.name}</span>
                      </td>
                    )}
                    
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-900">{reservation.patient.name}</p>
                        <p className="text-sm text-gray-500">{reservation.patient.nik}</p>
                      </div>
                    </td>
                    
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-900">{reservation.room.name}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{reservation.room.description}</p>
                      </div>
                    </td>
                    
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-900">{formatDate(reservation.dateIn)}</p>
                        {isDateToday(reservation.dateIn) && (
                          <span className="text-xs text-blue-600 font-medium">Today</span>
                        )}
                      </div>
                    </td>
                    
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-900">{formatDate(reservation.dateOut)}</p>
                        {isDateToday(reservation.dateOut) && (
                          <span className="text-xs text-blue-600 font-medium">Today</span>
                        )}
                      </div>
                    </td>
                    
                    <td className="table-cell">
                      {getStatusBadge(reservation.dateIn, reservation.dateOut)}
                    </td>
                    
                    <td className="table-cell">
                      <Link
                        href={`/reservations/${reservation.id}`}
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