'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatDate, formatCurrency, calculateAge } from '@/utils/format';
import { PATIENT_CLASSES, DOCTOR_SPECIALIZATIONS } from '@/utils/constants';
import {
  UserCircleIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  MapPinIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  gender: boolean;
  role: string;
  createdAt: string;
  patient?: {
    nik: string;
    birthPlace: string;
    birthDate: string;
    pClass: number;
    insuranceLimit: number;
    availableLimit: number;
  };
  doctor?: {
    specialization: number;
    yearsOfExperience: number;
    fee: number;
    schedules: number[];
  };
}

export default function ProfilePage() {
  // const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getUserProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayNumber: number): string => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayNumber] || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
        <p className="text-gray-600">Unable to load your profile information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
            <p className="text-lg text-gray-600 capitalize">{profile.role}</p>
            <p className="text-sm text-gray-500">Member since {formatDate(profile.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <UserCircleIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Full Name</p>
              <p className="text-gray-900">{profile.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <IdentificationIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Username</p>
              <p className="text-gray-900">{profile.username}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <EnvelopeIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-gray-900">{profile.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <UserCircleIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Gender</p>
              <p className="text-gray-900">{profile.gender ? 'Female' : 'Male'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Patient-specific information */}
      {profile.patient && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Patient Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <IdentificationIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">NIK</p>
                <p className="text-gray-900 font-mono">{profile.patient.nik}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPinIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Place of Birth</p>
                <p className="text-gray-900">{profile.patient.birthPlace}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                <p className="text-gray-900">
                  {formatDate(profile.patient.birthDate)} 
                  <span className="text-gray-500 ml-2">
                    (Age: {calculateAge(profile.patient.birthDate)} years)
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Patient Class</p>
                <p className="text-gray-900">
                  {PATIENT_CLASSES[profile.patient.pClass as keyof typeof PATIENT_CLASSES]?.label || `Class ${profile.patient.pClass}`}
                </p>
                <p className="text-xs text-gray-500">
                  {PATIENT_CLASSES[profile.patient.pClass as keyof typeof PATIENT_CLASSES]?.description}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Insurance Limit</p>
                <p className="text-gray-900">{formatCurrency(profile.patient.insuranceLimit)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Available Limit</p>
                <p className="text-gray-900">{formatCurrency(profile.patient.availableLimit)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor-specific information */}
      {profile.doctor && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Doctor Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <AcademicCapIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Specialization</p>
                <p className="text-gray-900">
                  {DOCTOR_SPECIALIZATIONS[profile.doctor.specialization as keyof typeof DOCTOR_SPECIALIZATIONS]}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ClockIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Years of Experience</p>
                <p className="text-gray-900">{profile.doctor.yearsOfExperience} years</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Consultation Fee</p>
                <p className="text-gray-900">{formatCurrency(profile.doctor.fee)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CalendarDaysIcon className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-500">Practice Schedule</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.doctor.schedules.map((dayNum) => (
                    <span
                      key={dayNum}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                    >
                      {getDayName(dayNum)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Settings */}
      {profile.role === 'patient' && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              className="btn-outline flex items-center justify-center space-x-2"
              onClick={() => window.location.href = '/dashboard/appointments'}
            >
              <CalendarDaysIcon className="w-5 h-5" />
              <span>My Appointments</span>
            </button>
            
            <button 
              className="btn-outline flex items-center justify-center space-x-2"
              onClick={() => window.location.href = '/dashboard/bills'}
            >
              <CurrencyDollarIcon className="w-5 h-5" />
              <span>My Bills</span>
            </button>
            
            <button 
              className="btn-outline flex items-center justify-center space-x-2"
              onClick={() => window.location.href = '/dashboard/policies'}
            >
              <ShieldCheckIcon className="w-5 h-5" />
              <span>My Policies</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}