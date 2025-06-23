'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import {
  BeakerIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CreateMedicinePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  // Redirect if not pharmacist
  if (user?.role !== 'pharmacist') {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">Only pharmacists can add medicines.</p>
        <button onClick={() => router.back()} className="btn-primary mt-4">
          Go Back
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.stock) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (Number(formData.price) < 1000) {
      toast.error('Price must be at least Rp 1,000');
      return;
    }

    if (Number(formData.stock) < 0) {
      toast.error('Stock cannot be negative');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.createMedicine({
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        description: formData.description,
      });
      
      toast.success(`Successfully added medicine ${formData.name}`);
      router.push('/dashboard/medicines');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create medicine');
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Add New Medicine</h1>
            <p className="text-gray-600">Add a new medicine to the inventory</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Medicine Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter medicine name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="form-label">Price (Rp) *</label>
              <input
                type="number"
                className="form-input"
                placeholder="Minimum Rp 1,000"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                min="1000"
                step="1000"
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Initial Stock *</label>
            <input
              type="number"
              className="form-input"
              placeholder="Enter initial stock quantity"
              value={formData.stock}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
              min="0"
              required
            />
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="Enter medicine description (optional)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {/* Submit Buttons */}
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
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Adding...' : 'Add Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}