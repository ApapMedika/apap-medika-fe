'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import {
  BeakerIcon,
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Medicine {
  id: string;
  name: string;
  stock: number;
}

interface RestockItem {
  medicineId: string;
  quantity: number;
}

export default function RestockMedicinesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [restockItems, setRestockItems] = useState<RestockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not pharmacist
  if (user?.role !== 'pharmacist') {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">Only pharmacists can restock medicines.</p>
        <button onClick={() => router.back()} className="btn-primary mt-4">
          Go Back
        </button>
      </div>
    );
  }

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const data = await apiClient.getMedicines();
      setMedicines(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Failed to fetch medicines:', error);
      toast.error('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  const addRestockRow = () => {
    setRestockItems([...restockItems, { medicineId: '', quantity: 0 }]);
  };

  const removeRestockRow = (index: number) => {
    setRestockItems(restockItems.filter((_, i) => i !== index));
  };

  const updateRestockItem = (index: number, field: keyof RestockItem, value: any) => {
    const updated = [...restockItems];
    updated[index] = { ...updated[index], [field]: value };
    setRestockItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (restockItems.length === 0) {
      toast.error('No medicine restocked!');
      return;
    }

    // Validate items
    for (let i = 0; i < restockItems.length; i++) {
      const item = restockItems[i];
      if (!item.medicineId || item.quantity < 1) {
        toast.error(`Invalid data in row ${i + 1}`);
        return;
      }
    }

    // Check for duplicates and combine quantities
    const combined: { [key: string]: number } = {};
    restockItems.forEach(item => {
      combined[item.medicineId] = (combined[item.medicineId] || 0) + item.quantity;
    });

    try {
      setSubmitting(true);
      const restockData = Object.entries(combined).map(([medicineId, quantity]) => ({
        medicine_id: medicineId,
        quantity,
      }));

      await apiClient.restockMedicines({ items: restockData });
      toast.success('Successfully restocked medicines');
      router.push('/medicines');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to restock medicines');
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
            <h1 className="text-2xl font-bold text-gray-900">Restock Medicines</h1>
            <p className="text-gray-600">Update stock for multiple medicines at once</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Restock Items</h2>
          <button
            type="button"
            onClick={addRestockRow}
            className="btn-primary btn-sm"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Row
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {restockItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BeakerIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No restock items added yet</p>
              <button
                type="button"
                onClick={addRestockRow}
                className="btn-primary mt-4"
              >
                Add First Item
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {restockItems.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div>
                    <label className="form-label">Medicine</label>
                    <select
                      className="form-select"
                      value={item.medicineId}
                      onChange={(e) => updateRestockItem(index, 'medicineId', e.target.value)}
                      required
                    >
                      <option value="">Select medicine</option>
                      {medicines.map((medicine) => (
                        <option key={medicine.id} value={medicine.id}>
                          {medicine.name} (Current: {medicine.stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Quantity to Add</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Enter quantity"
                      value={item.quantity || ''}
                      onChange={(e) => updateRestockItem(index, 'quantity', Number(e.target.value))}
                      min="1"
                      required
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeRestockRow(index)}
                      className="btn-danger btn-sm w-full"
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {restockItems.length > 0 && (
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary"
              >
                Cancel All
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? 'Restocking...' : 'Restock Medicines'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}