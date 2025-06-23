'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate } from '@/utils/format';
import {
  BeakerIcon,
  ArrowLeftIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface MedicineDetail {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export default function MedicineDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [medicine, setMedicine] = useState<MedicineDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockToAdd, setStockToAdd] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchMedicine();
    }
  }, [params.id]);

  const fetchMedicine = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getMedicineById(params.id as string);
      setMedicine(data);
    } catch (error) {
      console.error('Failed to fetch medicine:', error);
      toast.error('Failed to load medicine details');
      router.push('/dashboard/medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async () => {
    if (!medicine || !stockToAdd) return;

    const stockAmount = parseInt(stockToAdd);
    if (isNaN(stockAmount) || stockAmount < 1) {
      toast.error('Please enter a valid stock amount (minimum 1)');
      return;
    }

    try {
      setActionLoading(true);
      await apiClient.updateMedicineStock(medicine.id, {
        stock: stockAmount,
      });
      toast.success(`Successfully added ${stockAmount} units to stock`);
      fetchMedicine(); // Refresh data
      setShowStockModal(false);
      setStockToAdd('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update stock');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!medicine) return;

    try {
      setActionLoading(true);
      await apiClient.deleteMedicine(medicine.id);
      toast.success('Medicine deleted successfully');
      router.push('/dashboard/medicines');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete medicine');
    } finally {
      setActionLoading(false);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { label: 'Out of Stock', class: 'badge-danger' };
    } else if (stock <= 10) {
      return { label: 'Low Stock', class: 'badge-warning' };
    } else {
      return { label: 'In Stock', class: 'badge-success' };
    }
  };

  const canEdit = user?.role === 'pharmacist';
  const canDelete = user?.role === 'pharmacist';
  const canAddStock = user?.role === 'pharmacist';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Medicine Not Found</h1>
        <p className="text-gray-600 mb-4">The medicine you're looking for doesn't exist.</p>
        <Link href="/dashboard/medicines" className="btn-primary">
          Back to Medicines
        </Link>
      </div>
    );
  }

  const stockStatus = getStockStatus(medicine.stock);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center space-x-3">
            <BeakerIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Medicine Details</h1>
              <p className="text-gray-600">ID: {medicine.id}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`badge ${stockStatus.class}`}>
            {stockStatus.label}
          </span>
        </div>
      </div>

      {/* Basic Information */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span className="text-sm font-medium text-gray-500">Medicine Name</span>
            <p className="text-lg font-medium text-gray-900 mt-1">{medicine.name}</p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-500">Price per Unit</span>
            <p className="text-lg font-medium text-gray-900 mt-1">{formatCurrency(medicine.price)}</p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-500">Current Stock</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-lg font-medium ${
                medicine.stock === 0 ? 'text-red-600' : 
                medicine.stock <= 10 ? 'text-yellow-600' : 
                'text-green-600'
              }`}>
                {medicine.stock}
              </span>
              <span className="text-gray-500">units</span>
            </div>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-500">Total Value</span>
            <p className="text-lg font-medium text-gray-900 mt-1">
              {formatCurrency(medicine.price * medicine.stock)}
            </p>
          </div>
        </div>

        {medicine.description && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-500">Description</span>
            <p className="text-gray-900 mt-1">{medicine.description}</p>
          </div>
        )}
      </div>

      {/* Stock Management */}
      {canAddStock && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Stock Management</h2>
            <button
              onClick={() => setShowStockModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Stock</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  medicine.stock === 0 ? 'bg-red-100' : 
                  medicine.stock <= 10 ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                  <BeakerIcon className={`w-6 h-6 ${
                    medicine.stock === 0 ? 'text-red-600' : 
                    medicine.stock <= 10 ? 'text-yellow-600' : 'text-green-600'
                  }`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Stock</p>
                  <p className="text-xl font-bold text-gray-900">{medicine.stock} units</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BeakerIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Stock Value</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(medicine.price * medicine.stock)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BeakerIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-lg font-medium text-gray-900">{stockStatus.label}</p>
                </div>
              </div>
            </div>
          </div>

          {medicine.stock <= 10 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">
                    {medicine.stock === 0 ? 'Stock Depleted' : 'Low Stock Warning'}
                  </p>
                  <p className="text-sm text-yellow-700">
                    {medicine.stock === 0 
                      ? 'This medicine is out of stock. Please restock immediately.'
                      : 'This medicine is running low. Consider restocking soon.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Metadata</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <span className="text-gray-500">Created At:</span>
            <p className="font-medium">{formatDate(medicine.createdAt, true)}</p>
          </div>
          <div>
            <span className="text-gray-500">Created By:</span>
            <p className="font-medium">{medicine.createdBy}</p>
          </div>
          <div>
            <span className="text-gray-500">Last Updated:</span>
            <p className="font-medium">{formatDate(medicine.updatedAt, true)}</p>
          </div>
          <div>
            <span className="text-gray-500">Updated By:</span>
            <p className="font-medium">{medicine.updatedBy}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Actions</h2>
          <div className="flex items-center space-x-3">
            {canEdit && (
              <Link
                href={`/dashboard/medicines/${medicine.id}/edit`}
                className="btn-outline flex items-center space-x-2"
              >
                <PencilIcon className="w-5 h-5" />
                <span>Edit Medicine</span>
              </Link>
            )}
            
            {canDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn-danger flex items-center space-x-2"
              >
                <TrashIcon className="w-5 h-5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Stock</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Current stock: <span className="font-medium">{medicine.stock} units</span>
                </p>
              </div>
              
              <div>
                <label className="form-label">Stock to Add *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Enter stock amount"
                  value={stockToAdd}
                  onChange={(e) => setStockToAdd(e.target.value)}
                  min="1"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum: 1 unit
                </p>
              </div>

              {stockToAdd && parseInt(stockToAdd) > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">
                    New stock will be: 
                    <span className="font-medium text-gray-900 ml-1">
                      {medicine.stock + parseInt(stockToAdd)} units
                    </span>
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowStockModal(false);
                  setStockToAdd('');
                }}
                className="btn-outline"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddStock}
                disabled={actionLoading || !stockToAdd || parseInt(stockToAdd) < 1}
                className="btn-primary flex items-center space-x-2"
              >
                {actionLoading ? (
                  <div className="spinner w-4 h-4"></div>
                ) : (
                  <PlusIcon className="w-5 h-5" />
                )}
                <span>Add Stock</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Medicine</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{medicine.name}</strong>? 
              This action cannot be undone and will remove the medicine from all future prescriptions.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-outline"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="btn-danger flex items-center space-x-2"
              >
                {actionLoading ? (
                  <div className="spinner w-4 h-4"></div>
                ) : (
                  <TrashIcon className="w-5 h-5" />
                )}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}