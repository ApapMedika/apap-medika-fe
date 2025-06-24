'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import {
  CalendarDaysIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Treatment {
  id: number;
  name: string;
  price: number;
}

interface AppointmentBasic {
  id: string;
  patient: {
    name: string;
    nik: string;
  };
  doctor: {
    name: string;
  };
  appointmentDate: string;
  status: number;
  diagnosis?: string;
  treatments?: Treatment[];
}

export default function AppointmentNotePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<AppointmentBasic | null>(null);
  const [availableTreatments, setAvailableTreatments] = useState<Treatment[]>([]);
  const [formData, setFormData] = useState({
    diagnosis: '',
    selectedTreatments: [] as number[],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not doctor
  if (user?.role !== 'doctor') {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">Only doctors can update diagnosis and treatments.</p>
        <button onClick={() => router.back()} className="btn-primary mt-4">
          Go Back
        </button>
      </div>
    );
  }

  useEffect(() => {
    if (params.id) {
      fetchAppointment();
      fetchTreatments();
    }
  }, [params.id]);

  const fetchAppointment = async () => {
    try {
      const data = await apiClient.getAppointmentById(params.id as string);
      setAppointment(data);
      
      // Pre-fill form if data exists
      setFormData({
        diagnosis: data.diagnosis || '',
        selectedTreatments: data.treatments?.map((t: Treatment) => t.id) || [],
      });
    } catch (error) {
      console.error('Failed to fetch appointment:', error);
      toast.error('Failed to load appointment details');
      router.push('/appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchTreatments = async () => {
    try {
      // This would be a new API endpoint to get all available treatments
      // For now, we'll use a mock implementation
      const treatments: Treatment[] = [
        { id: 1, name: 'X-ray', price: 150000 },
        { id: 2, name: 'CT Scan', price: 1000000 },
        { id: 3, name: 'MRI', price: 2500000 },
        { id: 4, name: 'Ultrasound', price: 300000 },
        { id: 5, name: 'Blood Clotting Test', price: 50000 },
        { id: 6, name: 'Blood Glucose Test', price: 30000 },
        { id: 7, name: 'Liver Function Test', price: 75000 },
        { id: 8, name: 'Complete Blood Count', price: 50000 },
        { id: 9, name: 'Urinalysis', price: 40000 },
        { id: 10, name: 'COVID-19 testing', price: 150000 },
        // Add more treatments as needed
      ];
      setAvailableTreatments(treatments);
    } catch (error) {
      console.error('Failed to fetch treatments:', error);
      toast.error('Failed to load available treatments');
    }
  };

  const handleTreatmentToggle = (treatmentId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedTreatments: prev.selectedTreatments.includes(treatmentId)
        ? prev.selectedTreatments.filter(id => id !== treatmentId)
        : [...prev.selectedTreatments, treatmentId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.diagnosis.trim()) {
      toast.error('Please enter a diagnosis');
      return;
    }

    if (formData.selectedTreatments.length === 0) {
      toast.error('Please select at least one treatment');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.updateAppointmentNote(
        params.id as string,
        formData.diagnosis,
        formData.selectedTreatments
      );
      
      toast.success(`Successfully recorded diagnosis & treatment for appointment ${params.id}`);
      router.push(`/appointments/${params.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update appointment');
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

  if (!appointment) {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Appointment Not Found</h1>
        <p className="text-gray-600 mb-4">The appointment you're looking for doesn't exist.</p>
        <button onClick={() => router.back()} className="btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  // Check if appointment can be updated
  const currentDate = new Date();
  const appointmentDate = new Date(appointment.appointmentDate);
  const canUpdate = appointment.status === 0 && currentDate >= appointmentDate;

  if (!canUpdate) {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Cannot Update Appointment</h1>
        <p className="text-gray-600 mb-4">
          This appointment cannot be updated. It must be in "Created" status and the appointment date must have passed.
        </p>
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
          <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Update Diagnosis & Treatments
            </h1>
            <p className="text-gray-600">Appointment ID: {appointment.id}</p>
          </div>
        </div>
      </div>

      {/* Patient Info */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Patient Name</label>
            <p className="text-gray-900">{appointment.patient.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">NIK</label>
            <p className="text-gray-900">{appointment.patient.nik}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Doctor</label>
            <p className="text-gray-900">{appointment.doctor.name}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Diagnosis */}
          <div>
            <label className="form-label">Diagnosis *</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="Enter patient diagnosis..."
              value={formData.diagnosis}
              onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
              required
            />
          </div>

          {/* Treatments */}
          <div>
            <label className="form-label">Treatments *</label>
            <p className="text-sm text-gray-600 mb-4">
              Select all applicable treatments for this patient
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto border rounded-lg p-4">
              {availableTreatments.map((treatment) => (
                <label
                  key={treatment.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={formData.selectedTreatments.includes(treatment.id)}
                    onChange={() => handleTreatmentToggle(treatment.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{treatment.name}</p>
                    <p className="text-sm text-gray-600">Rp {treatment.price.toLocaleString('id-ID')}</p>
                  </div>
                </label>
              ))}
            </div>
            
            {formData.selectedTreatments.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">Selected Treatments:</p>
                <div className="space-y-1">
                  {formData.selectedTreatments.map((treatmentId) => {
                    const treatment = availableTreatments.find(t => t.id === treatmentId);
                    return treatment ? (
                      <div key={treatmentId} className="flex justify-between text-sm">
                        <span>{treatment.name}</span>
                        <span>Rp {treatment.price.toLocaleString('id-ID')}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
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
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Saving...' : 'Save Diagnosis & Treatments'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}