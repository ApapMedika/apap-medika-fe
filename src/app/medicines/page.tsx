'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatCurrency } from '@/utils/format';
import {
  BeakerIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Medicine {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export default function MedicinesPage() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getMedicines();
      setMedicines(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Failed to fetch medicines:', error);
      toast.error('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreateMedicine = user?.role === 'pharmacist';
  const canRestock = user?.role === 'pharmacist';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BeakerIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medicine Management</h1>
            <p className="text-gray-600">Manage hospital medicine inventory</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchMedicines}
            className="btn-outline btn-sm"
            disabled={loading}
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh
          </button>
          {canRestock && (
            <Link
              href="/dashboard/medicines/restock"
              className="btn-outline btn-sm"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Restock Medicines
            </Link>
          )}
          {canCreateMedicine && (
            <Link
              href="/dashboard/medicines/create"
              className="btn-primary btn-sm"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Medicine
            </Link>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search medicines..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Medicines Table */}
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
                  <th className="table-header-cell">Name</th>
                  <th className="table-header-cell">Stock</th>
                  <th className="table-header-cell">Price</th>
                  <th className="table-header-cell">Action</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredMedicines.map((medicine) => (
                  <tr key={medicine.id}>
                    <td className="table-cell font-mono text-sm">
                      {medicine.id}
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-900">{medicine.name}</p>
                        {medicine.description && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {medicine.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`font-medium ${
                        medicine.stock < 10 ? 'text-red-600' : 
                        medicine.stock < 50 ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        {medicine.stock}
                      </span>
                    </td>
                    <td className="table-cell">
                      {formatCurrency(medicine.price)}
                    </td>
                    <td className="table-cell">
                      <Link
                        href={`/dashboard/medicines/${medicine.id}`}
                        className="btn-primary btn-sm"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredMedicines.length === 0 && (
                  <tr>
                    <td colSpan={5} className="table-cell text-center py-12">
                      <div className="text-gray-500">
                        <BeakerIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No medicines found</p>
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