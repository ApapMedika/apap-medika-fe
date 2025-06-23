'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/utils/format';
import {
  BeakerIcon,
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
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
  createdBy?: string;
  updatedBy?: string;
}

export default function MedicineDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [medicine, setMedicine] = useState<MedicineDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleDelete = async () => {
    if (!medicine) return;

    try {
      await apiClient.deleteMedicine(medicine.id);
      toast.success(`Successfully deleted medicine ${medicine.name}`);
      router.push('/dashboard/medicines');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete medicine');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="btn-outline btn-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </button>
          <div className="flex items-center space-x-3">
            <BeakerIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Medicine Details</h1>
              <p className="text-gray-600">ID: {medicine.id}</p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          {canAddStock && (
            <Link
              href={`/dashboard/medicines/${medicine.id}/add-stock`}
              className="btn-outline btn-sm"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Stock
            </Link>
          )}
          
          {canEdit && (
            <Link
              href={`/dashboard/medicines/${medicine.id}/edit`}
              className="btn-outline btn-sm"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit Data
            </Link>
          )}
          
          {canDelete && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn-danger btn-sm"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medicine Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Medicine Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Medicine Name</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{medicine.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Price</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {formatCurrency(medicine.price)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Current Stock</label>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`text-2xl font-bold ${
                  medicine.stock < 10 ? 'text-red-600' : 
                  medicine.stock < 50 ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {medicine.stock}
                </span>
                {medicine.stock < 10 && (
                  <span className="badge badge-danger">Low Stock</span>
                )}
              </div>
            </div>

            {medicine.description && (
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-900 mt-1">{medicine.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stock Status */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Stock Status
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg" style={{
              backgroundColor: medicine.stock < 10 ? '#fef2f2' : 
                              medicine.stock < 50 ? '#fffbeb' : '#f0fdf4'
            }}>
              <h3 className={`font-semibold ${
                medicine.stock < 10 ? 'text-red-900' : 
                medicine.stock < 50 ? 'text-yellow-900' : 
                'text-green-900'
              }`}>
                {medicine.stock < 10 ? 'Critical Stock Level' : 
                 medicine.stock < 50 ? 'Low Stock Level' : 
                 'Good Stock Level'}
              </h3>
              <p className={`text-sm mt-1 ${
                medicine.stock < 10 ? 'text-red-700' : 
                medicine.stock < 50 ? 'text-yellow-700' : 
                'text-green-700'
              }`}>
                {medicine.stock < 10 ? 'Immediate restocking required' : 
                 medicine.stock < 50 ? 'Consider restocking soon' : 
                 'Stock level is adequate'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-600">Total Value</p>
                <p className="text-xl font-bold text-blue-900">
                  {formatCurrency(medicine.price * medicine.stock)}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-600">Per Unit</p>
                <p className="text-xl font-bold text-purple-900">
                  {formatCurrency(medicine.price)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="font-medium text-gray-600">Created At</label>
            <p className="text-gray-900">{formatDateTime(medicine.createdAt)}</p>
          </div>
          <div>
            <label className="font-medium text-gray-600">Created By</label>
            <p className="text-gray-900">{medicine.createdBy || '-'}</p>
          </div>
          <div>
            <label className="font-medium text-gray-600">Last Updated</label>
            <p className="text-gray-900">{formatDateTime(medicine.updatedAt)}</p>
          </div>
          <div>
            <label className="font-medium text-gray-600">Updated By</label>
            <p className="text-gray-900">{medicine.updatedBy || '-'}</p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-container">
          <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}></div>
          <div className="flex items-center justify-center min-h-full p-4">
            <div className="modal-content">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Delete Medicine
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <strong>{medicine.name}</strong>? 
                  This action cannot be undone.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}