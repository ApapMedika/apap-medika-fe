'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import {
  CalendarDaysIcon,
  UserIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Patient {
  id: string;
  name: string;
  nik: string;
  email: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

export default function CreateAppointmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableSchedules, setAvailableSchedules] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">Only administrators can create appointments.</p>
        <button onClick={() => router.back()} className="btn-primary mt-4">
          Go Back
        </button>
      </div>
    );
  }

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (formData.doctorId) {
      fetchDoctorSchedule();
    }
  }, [formData.doctorId]);

  const fetchPatients = async () => {
    try {
      const data = await apiClient.getPatients();
      setPatients(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      toast.error('Failed to load patients');
    }
  };

  const fetchDoctors = async () => {
    try {
      const data = await apiClient.getDoctors();
      setDoctors(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      toast.error('Failed to load doctors');
    }
  };

  const fetchDoctorSchedule = async () => {
    try {
      setLoadingSchedules(true);
      const schedules = await apiClient.getDoctorSchedule(formData.doctorId);
      setAvailableSchedules(schedules);
    } catch (error) {
      console.error('Failed to fetch doctor schedules:', error);
      toast.error('Failed to load doctor schedules');
      setAvailableSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.doctorId || !formData.appointmentDate) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.createAppointment({
        patient_id: formData.patientId,
        doctor_id: formData.doctorId,
        appointment_date: formData.appointmentDate,
      });
      
      toast.success(`Successfully created appointment ${response.id}`);
      router.push('/dashboard/appointments');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create appointment');
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
          <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Appointment</h1>
            <p className="text-gray-600">Schedule a new patient appointment</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <div>
            <label className="form-label">Patient *</label>
            <select
              className="form-select"
              value={formData.patientId}
              onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
              required
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.nik} - {patient.name}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Selection */}
          <div>
            <label className="form-label">Doctor *</label>
            <select
              className="form-select"
              value={formData.doctorId}
              onChange={(e) => setFormData(prev => ({ ...prev, doctorId: e.target.value }))}
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>

          {/* Schedule Selection */}
          <div>
            <label className="form-label">Schedule *</label>
            {loadingSchedules ? (
              <div className="flex items-center justify-center py-8">
                <div className="spinner w-6 h-6"></div>
              </div>
            ) : (
              <select
                className="form-select"
                value={formData.appointmentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                disabled={!formData.doctorId}
                required
              >
                <option value="">
                  {formData.doctorId ? 'Select Schedule' : 'Select a doctor first'}
                </option>
                {availableSchedules.map((schedule, index) => (
                  <option key={index} value={schedule}>
                    {schedule}
                  </option>
                ))}
              </select>
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
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creating...' : 'Create Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}