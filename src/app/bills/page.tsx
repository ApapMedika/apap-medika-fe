'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate, debounce } from '@/utils/format';
import { BILL_STATUS_LABELS } from '@/utils/constants';
import {
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Bill {
  id: string;
  patient: {
    id: string;
    name: string;
    nik: string;
  };
  appointment?: {
    id: string;
    totalFee: number;
  };
  prescription?: {
    id: string;
    totalPrice: number;
  };
  reservation?: {
    id: string;
    totalFee: number;
  };
  subtotal: number;
  policy?: {
    id: string;
    company: {
      name: string;
    };
  };
  coveragesUsed?: Array<{
    id: number;
    name: string;
    coverageAmount: number;
  }>;
  totalAmountDue: number;
  status: 'TREATMENT_IN_PROGRESS' | 'UNPAID' | 'PAID';
  createdAt: string;
  updatedAt: string;
}

export default function BillsPage() {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Redirect if not patient
  if (user?.role !== 'patient') {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">Only patients can view bills.</p>
      </div>
    );
  }

  useEffect(() => {
    fetchBills();
  }, [statusFilter, sortField, sortOrder, currentPage]);
  
  useEffect(() => {
    // Debounced search
    const debouncedFetch = debounce(fetchBills, 500);
    
    if (searchTerm !== '') {
      debouncedFetch();
    } else {
      fetchBills();
    }
  }, [searchTerm]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        search: searchTerm,
        ordering: sortOrder === 'desc' ? `-${sortField}` : sortField,
        patient: user?.id,
      };

      if (statusFilter) params.status = statusFilter;

      const data = await apiClient.getBills(params);
      setBills(Array.isArray(data) ? data : data.results || []);
      
      if (data.count) {
        setTotalPages(Math.ceil(data.count / 10));
      }
    } catch (error) {
      console.error('Failed to fetch bills:', error);
      toast.error('Failed to load bills');
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

  const getStatusBadge = (status: string) => {
    const statusLabel = BILL_STATUS_LABELS[status as keyof typeof BILL_STATUS_LABELS];
    const statusClasses = {
      'TREATMENT_IN_PROGRESS': 'badge-warning',
      'UNPAID': 'badge-danger',
      'PAID': 'badge-success',
    };
    
    return (
      <span className={`badge ${statusClasses[status as keyof typeof statusClasses] || 'badge-gray'}`}>
        {statusLabel}
      </span>
    );
  };

  const getServicesSummary = (bill: Bill) => {
    const services = [];
    if (bill.appointment) services.push('Appointment');
    if (bill.prescription) services.push('Prescription');
    if (bill.reservation) services.push('Reservation');
    return services.join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CurrencyDollarIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Bills</h1>
            <p className="text-gray-600">View and manage your medical bills</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Unpaid Bills</p>
              <p className="text-2xl font-bold text-gray-900">
                {bills.filter(b => b.status === 'UNPAID').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCardIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Paid Bills</p>
              <p className="text-2xl font-bold text-gray-900">
                {bills.filter(b => b.status === 'PAID').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Outstanding</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  bills
                    .filter(b => b.status === 'UNPAID')
                    .reduce((sum, b) => sum + b.totalAmountDue, 0)
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

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
                placeholder="Search bills..."
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
              <option value="TREATMENT_IN_PROGRESS">Treatment in Progress</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PAID">Paid</option>
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

      {/* Bills Table */}
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
                    <span>Bill ID</span>
                    {sortField === 'id' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                
                <th className="table-header">Services</th>
                
                <th 
                  className="table-header cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('subtotal')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Subtotal</span>
                    {sortField === 'subtotal' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>

                <th className="table-header">Insurance</th>
                
                <th 
                  className="table-header cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalAmountDue')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Amount Due</span>
                    {sortField === 'totalAmountDue' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                
                <th className="table-header">Status</th>
                
                <th 
                  className="table-header cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    {sortField === 'createdAt' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="table-cell text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="spinner w-6 h-6"></div>
                    </div>
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table-cell text-center py-8 text-gray-500">
                    {searchTerm || statusFilter ? 'No bills found matching your criteria' : 'No bills available'}
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <span className="font-mono text-sm">{bill.id.slice(0, 8)}...</span>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{getServicesSummary(bill)}</p>
                        <div className="text-gray-500 space-y-1">
                          {bill.appointment && (
                            <div>Appointment: {formatCurrency(bill.appointment.totalFee)}</div>
                          )}
                          {bill.prescription && (
                            <div>Prescription: {formatCurrency(bill.prescription.totalPrice)}</div>
                          )}
                          {bill.reservation && (
                            <div>Reservation: {formatCurrency(bill.reservation.totalFee)}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="font-medium">{formatCurrency(bill.subtotal)}</span>
                    </td>
                    <td className="table-cell">
                      {bill.policy ? (
                        <div className="text-sm">
                          <p className="font-medium text-green-600">{bill.policy.company.name}</p>
                          {bill.coveragesUsed && bill.coveragesUsed.length > 0 && (
                            <p className="text-gray-500">
                              -{formatCurrency(
                                bill.coveragesUsed.reduce((sum, c) => sum + c.coverageAmount, 0)
                              )}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">No insurance</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <span className="font-medium text-lg">{formatCurrency(bill.totalAmountDue)}</span>
                    </td>
                    <td className="table-cell">
                      {getStatusBadge(bill.status)}
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-500">{formatDate(bill.createdAt)}</span>
                    </td>
                    <td className="table-cell">
                      <Link
                        href={`/dashboard/bills/${bill.id}`}
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