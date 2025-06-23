'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  price: number;
  stock: number;
}

interface PrescriptionMedicine {
  medicineId: string;
  quantity: number;
}

export default function CreatePrescriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [prescriptionMedicines, setPrescriptionMedicines] = useState<PrescriptionMedicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const appointmentId = searchParams.get('appointment');

  // Redirect if not doctor
  if (user?.role !== 'doctor') {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">Only doctors can create prescriptions.</p>
        <button onClick={() => router.back()} className="btn-primary mt-4">
          Go Back
        </button>
      </div>
    );
  }

  if (!appointmentId) {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Appointment Required</h1>
        <p className="text-gray-600">Prescriptions must be linked to an appointment.</p>
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

  const addMedicineRow = () => {
    setPrescriptionMedicines([...prescriptionMedicines, { medicineId: '', quantity: 1 }]);
  };

  const removeMedicineRow = (index: number) => {
    setPrescriptionMedicines(prescriptionMedicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: keyof PrescriptionMedicine, value: any) => {
    const updated = [...prescriptionMedicines];
    updated[index] = { ...updated[index], [field]: value };
    setPrescriptionMedicines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (prescriptionMedicines.length === 0) {
      toast.error('Please add at least one medicine');
      return;
    }

    // Validate medicines
    for (let i = 0; i < prescriptionMedicines.length; i++) {
      const item = prescriptionMedicines[i];
      if (!item.medicineId || item.quantity < 1) {
        toast.error(`Invalid data in row ${i + 1}`);
        return;
      }
    }

    // Check for duplicates and combine quantities
    const combined: { [key: string]: number } = {};
    prescriptionMedicines.forEach(item => {
      combined[item.medicineId] = (combined[item.medicineId] || 0) + item.quantity;
    });

    try {
      setSubmitting(true);
      const medicineData = Object.entries(combined).map(([medicineId, quantity]) => ({
        medicine_id: medicineId,
        quantity,
      }));

      await apiClient.createPrescription({
        appointment_id: appointmentId,
        medicines: medicineData,
      });
      
      toast.success('Prescription created successfully');
      router.push(`/dashboard/appointments/${appointmentId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create prescription');
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
            <h1 className="text-2xl font-bold text-gray-900">Create Prescription</h1>
            <p className="text-gray-600">Appointment ID: {appointmentId}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Prescribed Medicines</h2>
          <button
            type="button"
            onClick={addMedicineRow}
            className="btn-primary btn-sm"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Medicine
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {prescriptionMedicines.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BeakerIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No medicines added yet</p>
              <button
                type="button"
                onClick={addMedicineRow}
                className="btn-primary mt-4"
              >
                Add First Medicine
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptionMedicines.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div>
                    <label className="form-label">Medicine</label>
                    <select
                      className="form-select"
                      value={item.medicineId}
                      onChange={(e) => updateMedicine(index, 'medicineId', e.target.value)}
                      required
                    >
                      <option value="">Select medicine</option>
                      {medicines.map((medicine) => (
                        <option key={medicine.id} value={medicine.id}>
                          {medicine.name} (Stock: {medicine.stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Enter quantity"
                      value={item.quantity || ''}
                      onChange={(e) => updateMedicine(index, 'quantity', Number(e.target.value))}
                      min="1"
                      required
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeMedicineRow(index)}
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

          {prescriptionMedicines.length > 0 && (
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
                {submitting ? 'Creating...' : 'Create Prescription'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}