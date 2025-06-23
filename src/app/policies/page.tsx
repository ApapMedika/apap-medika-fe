'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate, debounce } from '@/utils/format';
import { POLICY_STATUS_LABELS } from '@/utils/constants';
import {
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  ChartBarIcon,
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
  updatedAt: string;
}

export default function PoliciesPage() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [minCoverage, setMinCoverage] = useState('');
  const [maxCoverage, setMaxCoverage] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPolicies();
  }, [statusFilter, minCoverage, maxCoverage, sortField, sortOrder, currentPage]);
  
  useEffect(() => {
    // Debounced search
    const debouncedFetch = debounce(fetchPolicies, 500);
    
    if (searchTerm !== '') {
      debouncedFetch();
    } else {
      fetchPolicies();
    }
  }, [searchTerm]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        search: searchTerm,
        ordering: sortOrder === 'desc' ? `-${sortField}` : sortField,
      };

      // For patients, only show their policies
      if (user?.role === 'patient') {
        params.patient = user.id;
      }

      if (statusFilter) params.status = statusFilter;
      if (minCoverage) params.min_coverage = parseFloat(minCoverage);
      if (maxCoverage) params.max_coverage = parseFloat(maxCoverage);

      const data = await apiClient.getPolicies(params);
      setPolicies(Array.isArray(data) ? data : data.results || []);
      
      if (data.count) {
        setTotalPages(Math.ceil(data.count / 10));
      }
    } catch (error) {
      console.error('Failed to fetch policies:', error);
      toast.error('Failed to load policies');
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
    const statusLabel = POLICY_STATUS_LABELS[status as keyof typeof POLICY_STATUS_LABELS];
    const statusClasses = {
      0: 'badge-success',  // Created
      1: 'badge-warning',  // Partially Claimed
      2: 'badge-info',     // Fully Claimed
      3: 'badge-danger',   // Expired
      4: 'badge-gray',     // Cancelled
    };
    
    return (
      <span className={`badge ${statusClasses[status as keyof typeof statusClasses] || 'badge-gray'}`}>
        {statusLabel}
      </span>
    );
  };

  const getCoveragePercentage = (totalCovered: number, totalCoverage: number) => {
    if (totalCoverage === 0) return 0;
    return Math.round((totalCovered / totalCoverage) * 100);
  };

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
              {user?.role === 'patient' ? 'My Policies' : 'Insurance Policies'}
            </h1>
            <p className="text-gray-600">
              {user?.role === 'patient' 
                ? 'View your insurance policies and coverage'
                : 'Manage insurance policies for all patients'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {canViewStatistics && (
            <Link href="/dashboard/policies/statistics" className="btn-outline flex items-center space-x-2">
              <ChartBarIcon className="w-5 h-5" />
              <span>Statistics</span>
            </Link>
          )}
          
          {canCreatePolicy && (
            <Link href="/dashboard/policies/create" className="btn-primary flex items-center space-x-2">
              <PlusIcon className="w-5 h-5" />
              <span>Create Policy</span>
            </Link>
          )}
        </div>
      </div>

      {/* Summary Cards - Only for admin */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Policies</p>
                <p className="text-2xl font-bold text-gray-900">
                  {policies.filter(p => [0, 1, 2].includes(p.status)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Partially Claimed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {policies.filter(p => p.status === 1).length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Expired</p>
                <p className="text-2xl font-bold text-gray-900">
                  {policies.filter(p => p.status === 3).length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Coverage</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(policies.reduce((sum, p) => sum + p.totalCoverage, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="form-label">Search</label>
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="form-input pl-10"
                placeholder={`Search by ${user?.role === 'admin' ? 'patient name, company' : 'company'}`}
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
              <option value="1">Partially Claimed</option>
              <option value="2">Fully Claimed</option>
              <option value="3">Expired</option>
              <option value="4">Cancelled</option>
            </select>
          </div>

          {/* Coverage Range */}
          <div>
            <label className="form-label">Min Coverage</label>
            <input
              type="number"
              className="form-input"
              placeholder="0"
              value={minCoverage}
              onChange={(e) => setMinCoverage(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Max Coverage</label>
            <input
              type="number"
              className="form-input"
              placeholder="No limit"
              value={maxCoverage}
              onChange={(e) => setMaxCoverage(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-4">
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setMinCoverage('');
              setMaxCoverage('');
              setCurrentPage(1);
            }}
            className="btn-outline"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Policies Table */}
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
                    <span>Policy ID</span>
                    {sortField === 'id' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                
                {user?.role === 'admin' && (
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
                )}
                
                <th 
                  className="table-header cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('company__name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Company</span>
                    {sortField === 'company__name' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                
                <th 
                  className="table-header cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalCoverage')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Total Coverage</span>
                    {sortField === 'totalCoverage' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>

                <th className="table-header">Usage</th>
                
                <th className="table-header">Status</th>
                
                <th 
                  className="table-header cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('expiryDate')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Expiry Date</span>
                    {sortField === 'expiryDate' && (
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
                  <td colSpan={user?.role === 'admin' ? 8 : 7} className="table-cell text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="spinner w-6 h-6"></div>
                    </div>
                  </td>
                </tr>
              ) : policies.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'admin' ? 8 : 7} className="table-cell text-center py-8 text-gray-500">
                    {searchTerm || statusFilter || minCoverage || maxCoverage 
                      ? 'No policies found matching your criteria' 
                      : 'No policies available'
                    }
                  </td>
                </tr>
              ) : (
                policies.map((policy) => (
                  <tr key={policy.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <span className="font-mono text-sm">{policy.id}</span>
                    </td>
                    
                    {user?.role === 'admin' && (
                      <td className="table-cell">
                        <div>
                          <p className="font-medium text-gray-900">{policy.patient.name}</p>
                          <p className="text-sm text-gray-500">{policy.patient.nik}</p>
                        </div>
                      </td>
                    )}
                    
                    <td className="table-cell">
                      <span className="font-medium">{policy.company.name}</span>
                    </td>
                    
                    <td className="table-cell">
                      <span className="font-medium">{formatCurrency(policy.totalCoverage)}</span>
                    </td>

                    <td className="table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>Used: {formatCurrency(policy.totalCovered)}</span>
                          <span className="text-gray-500">
                            {getCoveragePercentage(policy.totalCovered, policy.totalCoverage)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.min(getCoveragePercentage(policy.totalCovered, policy.totalCoverage), 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="table-cell">
                      {getStatusBadge(policy.status)}
                    </td>
                    
                    <td className="table-cell">
                      <div>
                        <span className="text-sm">{formatDate(policy.expiryDate)}</span>
                        {new Date(policy.expiryDate) < new Date() && (
                          <span className="block text-xs text-red-600">Expired</span>
                        )}
                      </div>
                    </td>
                    
                    <td className="table-cell">
                      <Link
                        href={`/dashboard/policies/${policy.id}`}
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