'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/utils/format';
import {
  BuildingOfficeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Reservation {
  id: string;
  patient: {
    id: string;
    name: string;
    nik: string;
  };
  room: {
    id: string;
    name: string;
  };
  nurse: {
    id: string;
    name: string;
  };
  dateIn: string;
  dateOut: string;
  status: 'ongoing' | 'upcoming' | 'done';
  totalFee: number;
  createdAt: string;
}

export default function ReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      // Role-based filtering
      if (user?.role === 'nurse') {
        params.nurse = user.id;
      } else if (user?.role === 'patient') {
        params.patient = user.id;
      }
      
      if (statusFilter) params.status = statusFilter;
      
      const data = await apiClient.getReservations(params);
      setReservations(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <span className="badge badge-warning">Upcoming</span>;
      case 'ongoing':
        return <span className="badge badge-primary">Ongoing</span>;
      case 'done':
        return <span className="badge badge-success">Done</span>;
      default:
        return <span className="badge badge-gray">Unknown</span>;
    }
  };

  const filteredReservations = reservations.filter(reservation =>
    reservation.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreateReservation = user?.role === 'nurse';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.role === 'patient' ? 'My Reservations' : 
               user?.role === 'nurse' ? 'My Managed Reservations' : 
               'All Reservations'}
            </h1>
            <p className="text-gray-600">
              {user?.role === 'patient' ? 'View your room reservations' :
               user?.role === 'nurse' ? 'Manage patient reservations' :
               'Hospital room reservations'}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/dashboard/reservations/chart"
            className="btn-outline btn-sm"
          >
            <ChartBarIcon className="w-4 h-4 mr-2" />
            Chart
          </Link>
          {canCreateReservation && (
            <Link
              href="/dashboard/reservations/create"
              className="btn-primary btn-sm"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Reservation
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reservations..."
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
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      {/* Reservations Table */}
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
                  <th className="table-header-cell">Nurse</th>
                  <th className="table-header-cell">Patient</th>
                  <th className="table-header-cell">Date In</th>
                  <th className="table-header-cell">Date Out</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredReservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td className="table-cell font-mono text-sm">
                      {reservation.id}
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-900">
                          {reservation.nurse.name}
                        </p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-900">
                          {reservation.patient.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          NIK: {reservation.patient.nik}
                        </p>
                      </div>
                    </td>
                    <td className="table-cell">
                      {formatDate(reservation.dateIn)}
                    </td>
                    <td className="table-cell">
                      {formatDate(reservation.dateOut)}
                    </td>
                    <td className="table-cell">
                      {getStatusBadge(reservation.status)}
                    </td>
                    <td className="table-cell">
                      <Link
                        href={`/dashboard/reservations/${reservation.id}`}
                        className="btn-primary btn-sm"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredReservations.length === 0 && (
                  <tr>
                    <td colSpan={7} className="table-cell text-center py-12">
                      <div className="text-gray-500">
                        <BuildingOfficeIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No reservations found</p>
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