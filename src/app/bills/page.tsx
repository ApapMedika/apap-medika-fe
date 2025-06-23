'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate } from '@/utils/format';
import {
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
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
}

export default function BillsPage() {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
  }, [statusFilter]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const params: any = {
        patient: user?.id,
      };
      
      if (statusFilter) params.status = statusFilter;
      
      const data = await apiClient.getBills(params);
      setBills(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'TREATMENT_IN_PROGRESS':
        return <span className="badge badge-warning">Treatment in Progress</span>;
      case 'UNPAID':
        return <span className="badge badge-danger">Unpaid</span>;
      case 'PAID':
        return <span className="badge badge-success">Paid</span>;
      default:
        return <span className="badge badge-gray">Unknown</span>;
    }
  };

  const filteredBills = bills.filter(bill =>
    bill.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bill.appointment?.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (bill.prescription?.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (bill.reservation?.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search bills..."
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
            <option value="UNPAID">Unpaid</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
      </div>

      {/* Bills Table */}
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
                  <th className="table-header-cell">Bill ID</th>
                  <th className="table-header-cell">Date</th>
                  <th className="table-header-cell">Services</th>
                  <th className="table-header-cell">Amount Due</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredBills.map((bill) => (
                  <tr key={bill.id}>
                    <td className="table-cell font-mono text-sm">
                      {bill.id}
                    </td>
                    <td className="table-cell">
                      {formatDate(bill.createdAt)}
                    </td>
                    <td className="table-cell">
                      <div className="text-sm">
                        {bill.appointment && (
                          <div>Appointment: {bill.appointment.id}</div>
                        )}
                        {bill.prescription && (
                          <div>Prescription: {bill.prescription.id}</div>
                        )}
                        {bill.reservation && (
                          <div>Reservation: {bill.reservation.id}</div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(bill.totalAmountDue)}
                        </p>
                        {bill.subtotal !== bill.totalAmountDue && (
                          <p className="text-sm text-gray-500 line-through">
                            {formatCurrency(bill.subtotal)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      {getStatusBadge(bill.status)}
                    </td>
                    <td className="table-cell">
                      <Link
                        href={`/dashboard/bills/${bill.id}`}
                        className="btn-primary btn-sm"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredBills.length === 0 && (
                  <tr>
                    <td colSpan={6} className="table-cell text-center py-12">
                      <div className="text-gray-500">
                        <CurrencyDollarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No bills found</p>
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