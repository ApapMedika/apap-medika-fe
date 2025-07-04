'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate } from '@/utils/format';
import {
  CalendarDaysIcon,
  UserIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Patient {
  id: string;
  name: string;
  nik: string;
  email: string;
  birth_date: string;
  birth_place: string;
  p_class: number;
}

interface Doctor {
  id: string;
  name: string;
  specialization: number;
  specialization_display: string;
  years_of_experience: number;
  fee: number;
  schedules: number[];
}

interface DoctorSchedule {
  id: string;
  doctor: string;
  date: string;
  time_slot: string;
  is_available: boolean;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

export default function CreateAppointmentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/appointments');
      return;
    }
    fetchPatients();
    fetchDoctors();
  }, [user, router]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const fetchPatients = async () => {
    try {
      const response = await apiClient.getPatients();
      setPatients(response.results || response);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      toast.error('Failed to load patients');
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await apiClient.getDoctors();
      setDoctors(response.results || response);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      toast.error('Failed to load doctors');
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedDoctor || !selectedDate) return;

    try {
      setLoading(true);
      
      // Check if the selected date is within doctor's schedule
      const dayOfWeek = new Date(selectedDate).getDay();
      const doctorSchedules = selectedDoctor.schedules || [];
      
      if (doctorSchedules.includes(dayOfWeek)) {
        // Get doctor's schedule to check for conflicts
        const response = await apiClient.getDoctorSchedule(selectedDoctor.id);
        
        // For simplicity, we'll show all TIME_SLOTS for now
        // In a real implementation, you'd check for existing appointments on this date
        setAvailableSlots(TIME_SLOTS);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Failed to fetch available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient || !selectedDoctor || !selectedDate || !selectedTime) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    
    try {
      const appointmentData = {
        patient_id: selectedPatient.id,
        doctor_id: selectedDoctor.id,
        appointment_date: `${selectedDate}T${selectedTime}:00`,
      };

      await apiClient.createAppointment(appointmentData);
      toast.success('Appointment created successfully!');
      router.push('/appointments');
    } catch (error: any) {
      console.error('Failed to create appointment:', error);
      toast.error(error.message || 'Failed to create appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today.getTime() + (28 * 24 * 60 * 60 * 1000)); // 4 weeks from now
    return maxDate.toISOString().split('T')[0];
  };

  const getDoctorScheduleDisplay = (schedules: number[]) => {
    if (!schedules || schedules.length === 0) return 'No schedule available';
    
    const days = schedules.map(day => DAYS_OF_WEEK[day]?.label).filter(Boolean);
    return days.join(', ');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/appointments" className="btn-outline">
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Appointments
            </Link>
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                <CalendarDaysIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Appointment</h1>
                <p className="text-gray-600">Schedule a new appointment for a patient</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Patient Selection */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <UserIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Select Patient</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="patient" className="form-label">
                  Patient *
                </label>
                <select
                  id="patient"
                  value={selectedPatient?.id || ''}
                  onChange={(e) => {
                    const patient = patients.find(p => p.id === e.target.value);
                    setSelectedPatient(patient || null);
                  }}
                  className="form-select"
                  required
                >
                  <option value="">Select a patient...</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.nik} - {patient.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPatient && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Patient Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-800">Name:</span>
                      <span className="ml-2 text-blue-700">{selectedPatient.name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">NIK:</span>
                      <span className="ml-2 text-blue-700">{selectedPatient.nik}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Email:</span>
                      <span className="ml-2 text-blue-700">{selectedPatient.email}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Class:</span>
                      <span className="ml-2 text-blue-700">Class {selectedPatient.p_class}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Doctor Selection */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <UserIcon className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Select Doctor</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="doctor" className="form-label">
                  Doctor *
                </label>
                <select
                  id="doctor"
                  value={selectedDoctor?.id || ''}
                  onChange={(e) => {
                    const doctor = doctors.find(d => d.id === e.target.value);
                    setSelectedDoctor(doctor || null);
                    setSelectedTime(''); // Reset time when doctor changes
                  }}
                  className="form-select"
                  required
                >
                  <option value="">Select a doctor...</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.name} - {doctor.specialization_display}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDoctor && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">Doctor Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-800">Name:</span>
                      <span className="ml-2 text-green-700">Dr. {selectedDoctor.name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Specialization:</span>
                      <span className="ml-2 text-green-700">{selectedDoctor.specialization_display}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Experience:</span>
                      <span className="ml-2 text-green-700">{selectedDoctor.years_of_experience} years</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Fee:</span>
                      <span className="ml-2 text-green-700">{formatCurrency(selectedDoctor.fee)}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-green-800">Available Days:</span>
                      <span className="ml-2 text-green-700">{getDoctorScheduleDisplay(selectedDoctor.schedules)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Date & Time Selection */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <ClockIcon className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Select Date & Time</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="date" className="form-label">
                  Appointment Date *
                </label>
                <input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime(''); // Reset time when date changes
                  }}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="form-input"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Available for the next 4 weeks
                </p>
              </div>

              {selectedDate && selectedDoctor && (
                <div>
                  <label className="form-label">
                    Available Time Slots *
                  </label>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner className="mr-2" />
                      <span className="text-gray-600">Loading available slots...</span>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`p-3 text-sm font-medium rounded-lg border transition-all duration-200 ${
                            selectedTime === slot
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ClockIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No available time slots for this date</p>
                      <p className="text-sm">Please select a different date</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          {selectedPatient && selectedDoctor && selectedDate && selectedTime && (
            <div className="card">
              <div className="flex items-center space-x-3 mb-6">
                <CheckCircleIcon className="w-6 h-6 text-yellow-600" />
                <h2 className="text-xl font-semibold text-gray-900">Appointment Summary</h2>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-yellow-900 mb-3">Patient Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-yellow-700">Name:</span>
                        <span className="font-medium text-yellow-900">{selectedPatient.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-700">NIK:</span>
                        <span className="font-medium text-yellow-900">{selectedPatient.nik}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-yellow-900 mb-3">Doctor Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-yellow-700">Name:</span>
                        <span className="font-medium text-yellow-900">Dr. {selectedDoctor.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-700">Specialization:</span>
                        <span className="font-medium text-yellow-900">{selectedDoctor.specialization_display}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-yellow-900 mb-3">Appointment Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-yellow-700">Date:</span>
                        <span className="font-medium text-yellow-900">{formatDate(selectedDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-700">Time:</span>
                        <span className="font-medium text-yellow-900">{selectedTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-yellow-900 mb-3">Fee Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-yellow-700">Consultation Fee:</span>
                        <span className="font-medium text-yellow-900">{formatCurrency(selectedDoctor.fee)}</span>
                      </div>
                      <div className="flex justify-between border-t border-yellow-300 pt-2">
                        <span className="text-yellow-700 font-medium">Total:</span>
                        <span className="font-semibold text-yellow-900 text-lg">{formatCurrency(selectedDoctor.fee)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <Link href="/appointments" className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!selectedPatient || !selectedDoctor || !selectedDate || !selectedTime || submitting}
              className="btn-primary"
            >
              {submitting ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Create Appointment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}