'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate } from '@/utils/format';
import { POLICY_STATUS } from '@/utils/constants';
import {
  ShieldCheckIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Policy {
  id: string;
  patient: {
    id: string;
    name: string;
    nik: string;
  };
  company: {
    id: string;
    name: string;
  };
  status: number;
  expiryDate: string;
  totalCoverage: number;
  totalCovered: number;
  createdAt: string;
}

export default function PoliciesPage() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [minCoverage, setMinCoverage] = useState('');
  const [maxCoverage, setMaxCoverage] = useState('');

  useEffect(() => {
    fetchPolicies();
  }, [statusFilter, minCoverage, maxCoverage]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      // Role-based filtering
      if (user?.role === 'patient') {
        params.patient = user.id;
      }
      
      if (statusFilter) params.status = statusFilter;
      if (minCoverage) params.minCoverage = minCoverage;
      if (maxCoverage) params.maxCoverage = maxCoverage;
      
      const data = await apiClient.getPolicies(params);
      setPolicies(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Failed to fetch policies:', error);
      toast.error('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case POLICY_STATUS.CREATED:
        return <span className="badge badge-primary">Created</span>;
      case POLICY_STATUS.PARTIALLY_CLAIMED:
        return <span className="badge badge-warning">Partially Claimed</span>;
      case POLICY_STATUS.FULLY_CLAIMED:
        return <span className="badge badge-success">Fully Claimed</span>;
      case POLICY_STATUS.EXPIRED:
        return <span className="badge badge-danger">Expired</span>;
      case POLICY_STATUS.CANCELLED:
        return <span className="badge badge-gray">Cancelled</span>;
      default:
        return <span className="badge badge-gray">Unknown</span>;
    }
  };

  const filteredPolicies = policies.filter(policy =>
    policy.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreatePolicy = user?.role === 'admin';
  const canViewStatistics = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.role === 'patient' ? 'My Policies' : 'Policy Management'}
            </h1>
            <p className="text-gray-600">
              {user?.role === 'patient' ? 'View your insurance policies' : 'Manage insurance policies'}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          {canViewStatistics && (
            <Link
              href="/dashboard/policies/statistics"
              className="btn-outline btn-sm"
            >
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Show Statistics
            </Link>
          )}
          {canCreatePolicy && (
            <Link
              href="/dashboard/policies/create"
              className="btn-primary btn-sm"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Policy
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
              placeholder="Search policies..."
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
            <option value="1">Partially Claimed</option>
            <option value="2">Fully Claimed</option>
            <option value="3">Expired</option>
            <option value="4">Cancelled</option>
          </select>

          <input
            type="number"
            placeholder="Min Coverage"
            className="form-input"
            value={minCoverage}
            onChange={(e) => setMinCoverage(e.target.value)}
          />

          <input
            type="number"
            placeholder="Max Coverage"
            className="form-input"
            value={maxCoverage}
            onChange={(e) => setMaxCoverage(e.target.value)}
          />
        </div>
      </div>

      {/* Policies Table */}
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
                  <th className="table-header-cell">Policy ID</th>
                  <th className="table-header-cell">Patient</th>
                  <th className="table-header-cell">Company</th>
                  <th className="table-header-cell">Total Coverage</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Action</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredPolicies.map((policy) => (
                  <tr key={policy.id}>
                    <td className="table-cell font-mono text-sm">
                      {policy.id}
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-900">
                          {policy.patient.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          NIK: {policy.patient.nik}
                        </p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <p className="font-medium text-gray-900">
                        {policy.company.name}
                      </p>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(policy.totalCoverage)}
                        </p>
                        {policy.totalCovered > 0 && (
                          <p className="text-sm text-gray-500">
                            Used: {formatCurrency(policy.totalCovered)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      {getStatusBadge(policy.status)}
                    </td>
                    <td className="table-cell">
                      <Link
                        href={`/dashboard/policies/${policy.id}`}
                        className="btn-primary btn-sm"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredPolicies.length === 0 && (
                  <tr>
                    <td colSpan={6} className="table-cell text-center py-12">
                      <div className="text-gray-500">
                        <ShieldCheckIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No policies found</p>
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