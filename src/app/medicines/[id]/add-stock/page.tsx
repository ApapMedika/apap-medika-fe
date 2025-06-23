'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import {
  BeakerIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Medicine {
  id: string;
  name: string;
  stock: number;
}

export default function AddStockPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [stockToAdd, setStockToAdd] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not pharmacist
  if (user?.role !== 'pharmacist') {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">Only pharmacists can update stock.</p>
        <button onClick={() => router.back()} className="btn-primary mt-4">
          Go Back
        </button>
      </div>
    );
  }

  useEffect(() => {
    if (params.id) {
      fetchMedicine();
    }
  }, [params.id]);

  const fetchMedicine = async () => {
    try {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const quantity = Number(stockToAdd);
    if (!quantity || quantity < 1) {
      toast.error('Please enter a valid quantity (minimum 1)');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.updateMedicineStock(params.id as string, quantity);
      toast.success(`Successfully added ${quantity} units to stock`);
      router.push(`/dashboard/medicines/${params.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update stock');
    } finally {
      setSubmitting(false);
    }
  };

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
        <button onClick={() => router.back()} className="btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
            <h1 className="text-2xl font-bold text-gray-900">Add Stock</h1>
            <p className="text-gray-600">Add stock to {medicine.name}</p>
          </div>
        </div>
      </div>

      {/* Current Info */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Medicine ID</label>
            <p className="text-gray-900 font-mono">{medicine.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Medicine Name</label>
            <p className="text-gray-900">{medicine.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Current Stock</label>
            <p className="text-lg font-semibold text-gray-900">{medicine.stock}</p>
          </div>
        </div>
      </div>

      {/* Add Stock Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label">Quantity to Add *</label>
            <input
              type="number"
              className="form-input"
              placeholder="Enter quantity to add"
              value={stockToAdd}
              onChange={(e) => setStockToAdd(e.target.value)}
              min="1"
              required
            />
            <p className="text-sm text-gray-600 mt-1">
              Current stock: {medicine.stock} → New stock will be: {medicine.stock + (Number(stockToAdd) || 0)}
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Adding Stock...' : 'Add Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}