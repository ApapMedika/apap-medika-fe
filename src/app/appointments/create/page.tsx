'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/utils/format';
import {
  CalendarDaysIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Patient {
  id: string;
  user: {
    name: string;
    email: string;
  };
  nik: string;
  birthDate: string;
  gender: boolean;
}

interface Doctor {
  id: string;
  user: {
    name: string;
  };
  specialization: string;
  fee: number;
}

interface Schedule {
  date: string;
  dayName: string;
  available: boolean;
}

export default function CreateAppointmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
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
      fetchDoctorSchedules();
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

  const fetchDoctorSchedules = async () => {
    try {
      setLoadingSchedules(true);
      const data = await apiClient.getDoctorSchedule(formData.doctorId);
      setSchedules(data.schedules || []);
    } catch (error) {
      console.error('Failed to fetch doctor schedules:', error);
      toast.error('Failed to load doctor schedules');
      setSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.doctorId || !formData.appointmentDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const result = await apiClient.createAppointment({
        patient_id: formData.patientId,
        doctor_id: formData.doctorId,
        appointment_date: formData.appointmentDate,
      });
      
      toast.success(`Appointment created successfully! ID: ${result.id}`);
      router.push('/appointments');
    } catch (error: any) {
      console.error('Failed to create appointment:', error);
      if (error.response?.status === 400) {
        toast.error(error.response.data?.message || 'Invalid appointment data');
      } else {
        toast.error('Failed to create appointment');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedPatient = patients.find(p => p.id === formData.patientId);
  const selectedDoctor = doctors.find(d => d.id === formData.doctorId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex items-center space-x-3">
          <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Appointment</h1>
            <p className="text-gray-600">Schedule a new appointment for a patient</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Selection */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Patient</h2>
          <div className="space-y-4">
            <div>
              <label className="form-label">Patient *</label>
              <select
                className="form-select"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                required
              >
                <option value="">Select a patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.nik} - {patient.user.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedPatient && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{selectedPatient.user.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">NIK:</span>
                    <span className="ml-2 font-medium font-mono">{selectedPatient.nik}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2">{selectedPatient.user.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Gender:</span>
                    <span className="ml-2">{selectedPatient.gender ? 'Female' : 'Male'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Doctor Selection */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Doctor</h2>
          <div className="space-y-4">
            <div>
              <label className="form-label">Doctor *</label>
              <select
                className="form-select"
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value, appointmentDate: '' })}
                required
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.user.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>

            {selectedDoctor && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Doctor Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{selectedDoctor.user.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Specialization:</span>
                    <span className="ml-2">{selectedDoctor.specialization}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Consultation Fee:</span>
                    <span className="ml-2 font-medium">Rp {selectedDoctor.fee.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Schedule Selection */}
        {formData.doctorId && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Schedule</h2>
            
            {loadingSchedules ? (
              <div className="flex items-center justify-center py-8">
                <div className="spinner w-6 h-6"></div>
                <span className="ml-2 text-gray-600">Loading available schedules...</span>
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No available schedules for this doctor
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="form-label">Available Dates *</label>
                  <select
                    className="form-select"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    required
                  >
                    <option value="">Select an appointment date</option>
                    {schedules
                      .filter(schedule => schedule.available)
                      .map((schedule) => (
                        <option key={schedule.date} value={schedule.date}>
                          {schedule.dayName}, {formatDate(schedule.date)}
                        </option>
                      ))}
                  </select>
                </div>

                {schedules.filter(s => !s.available).length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">Unavailable Dates:</h4>
                    <div className="text-sm text-yellow-700">
                      {schedules
                        .filter(s => !s.available)
                        .map(schedule => `${schedule.dayName}, ${formatDate(schedule.date)}`)
                        .join('; ')}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.patientId || !formData.doctorId || !formData.appointmentDate}
            className="btn-primary flex items-center space-x-2"
          >
            {loading ? (
              <div className="spinner w-4 h-4"></div>
            ) : (
              <CalendarDaysIcon className="w-5 h-5" />
            )}
            <span>Create Appointment</span>
          </button>
        </div>
      </form>
    </div>
  );
}