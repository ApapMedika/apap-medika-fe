'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate, debounce } from '@/utils/format';
import { PRESCRIPTION_STATUS_LABELS } from '@/utils/constants';
import {
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Prescription {
  id: string;
  patient: {
    id: string;
    name: string;
    nik: string;
  };
  appointment?: {
    id: string;
  };
  status: number;
  totalPrice: number;
  processedBy?: {
    id: string;
    name: string;
  };
  createdAt: string;
  createdBy: string;
}

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPrescriptions();
  }, [statusFilter, sortField, sortOrder, currentPage]);
  
  useEffect(() => {
    // Debounced search
    const debouncedFetch = debounce(fetchPrescriptions, 500);

    if (searchTerm !== '') {
      debouncedFetch();
    } else {
      fetchPrescriptions();
    }
  }, [searchTerm]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        search: searchTerm,
        ordering: sortOrder === 'desc' ? `-${sortField}` : sortField,
      };

      if (statusFilter) params.status = statusFilter;

      let data;
      if (user?.role === 'patient') {
        // For patients, get only their prescriptions
        data = await apiClient.get('/pharmacy/patient/prescriptions/', params);
      } else if (user?.role === 'doctor') {
        // For doctors, get prescriptions they created
        data = await apiClient.get('/pharmacy/doctor/prescriptions/', params);
      } else {
        // For pharmacists and admin, get all prescriptions
        data = await apiClient.getPrescriptions(params);
      }

      setPrescriptions(Array.isArray(data) ? data : data.results || []);
      
      if (data.count) {
        setTotalPages(Math.ceil(data.count / 10));
      }
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
      toast.error('Failed to load prescriptions');
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
    const statusLabel = PRESCRIPTION_STATUS_LABELS[status as keyof typeof PRESCRIPTION_STATUS_LABELS];
    const statusClasses = {
      0: 'badge-warning',  // Created
      1: 'badge-warning',  // Waiting for Stock
      2: 'badge-success',  // Done
      3: 'badge-danger',   // Cancelled
    };
    
    return (
      <span className={`badge ${statusClasses[status as keyof typeof statusClasses] || 'badge-gray'}`}>
        {statusLabel}
      </span>
    );
  };

  const canViewStatistics = user?.role === 'pharmacist';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ClipboardDocumentListIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.role === 'patient' ? 'My Prescriptions' : 
               user?.role === 'doctor' ? 'My Prescriptions' : 'Prescriptions'}
            </h1>
            <p className="text-gray-600">
              {user?.role === 'patient' ? 'View your medical prescriptions' :
               user?.role === 'doctor' ? 'Manage prescriptions you created' : 
               'Manage all prescription requests'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {canViewStatistics && (
            <Link href="/prescriptions/statistics" className="btn-outline flex items-center space-x-2">
              <ChartBarIcon className="w-5 h-5" />
              <span>Statistics</span>
            </Link>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {user?.role === 'pharmacist' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ClipboardDocumentListIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prescriptions.filter(p => [0, 1].includes(p.status)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <ClipboardDocumentListIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Waiting for Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prescriptions.filter(p => p.status === 1).length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ClipboardDocumentListIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prescriptions.filter(p => p.status === 2).length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(prescriptions.reduce((sum, p) => sum + p.totalPrice, 0))}
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
                placeholder="Search by patient name or prescription ID..."
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
              <option value="1">Waiting for Stock</option>
              <option value="2">Done</option>
              <option value="3">Cancelled</option>
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

      {/* Prescriptions Table */}
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
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date Created</span>
                    {sortField === 'createdAt' && (
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
                  onClick={() => handleSort('totalPrice')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Total Price</span>
                    {sortField === 'totalPrice' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                
                <th className="table-header">Status</th>
                
                {user?.role === 'pharmacist' && (
                  <th className="table-header">Processed By</th>
                )}
                
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={user?.role === 'pharmacist' ? 7 : 6} className="table-cell text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="spinner w-6 h-6"></div>
                    </div>
                  </td>
                </tr>
              ) : prescriptions.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'pharmacist' ? 7 : 6} className="table-cell text-center py-8 text-gray-500">
                    {searchTerm || statusFilter ? 'No prescriptions found matching your criteria' : 'No prescriptions available'}
                  </td>
                </tr>
              ) : (
                prescriptions.map((prescription) => (
                  <tr key={prescription.id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-sm">{prescription.id}</td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatDate(prescription.createdAt)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(prescription.createdAt).toLocaleTimeString('en-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-900">{prescription.patient.name}</p>
                        <p className="text-sm text-gray-500">{prescription.patient.nik}</p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="font-medium">{formatCurrency(prescription.totalPrice)}</span>
                    </td>
                    <td className="table-cell">
                      {getStatusBadge(prescription.status)}
                    </td>
                    {user?.role === 'pharmacist' && (
                      <td className="table-cell">
                        {prescription.processedBy ? (
                          <span className="text-sm text-gray-900">{prescription.processedBy.name}</span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    )}
                    <td className="table-cell">
                      <Link
                        href={`/prescriptions/${prescription.id}`}
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