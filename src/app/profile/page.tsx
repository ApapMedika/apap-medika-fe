'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate, calculateAge } from '@/utils/format';
import {
  UserCircleIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  UserIcon,
  EnvelopeIcon,
  ClockIcon,
  StarIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { DOCTOR_SPECIALIZATIONS, PATIENT_CLASSES, DAYS_OF_WEEK } from '@/utils/constants';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUserProfile();
      setProfileData(response);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load profile data</p>
      </div>
    );
  }

  const renderPatientProfile = () => {
    if (!profileData.patient) return null;

    const patient = profileData.patient;
    const age = calculateAge(patient.birth_date);
    const patientClass = PATIENT_CLASSES[patient.p_class as keyof typeof PATIENT_CLASSES];

    return (
      <div className="space-y-6">
        {/* Personal Information */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <IdentificationIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <UserIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="text-base text-gray-900">{profileData.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <IdentificationIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">NIK</p>
                <p className="text-base text-gray-900 font-mono">{patient.nik}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base text-gray-900">{profileData.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <UserCircleIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Gender</p>
                <p className="text-base text-gray-900">{profileData.gender ? 'Female' : 'Male'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPinIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Birth Place</p>
                <p className="text-base text-gray-900">{patient.birth_place}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Birth Date (Age)</p>
                <p className="text-base text-gray-900">{formatDate(patient.birth_date)} ({age} years old)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Insurance Information */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <ShieldCheckIcon className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Insurance Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Insurance Class</p>
                  <p className="text-lg font-bold text-gray-900">{patientClass?.label}</p>
                  <p className="text-xs text-gray-600">{patientClass?.description}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Insurance Limit</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(patient.insurance_limit)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CurrencyDollarIcon className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Available Limit</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(patient.available_limit)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDoctorProfile = () => {
    if (!profileData.doctor) return null;

    const doctor = profileData.doctor;
    const specialization = DOCTOR_SPECIALIZATIONS[doctor.specialization as keyof typeof DOCTOR_SPECIALIZATIONS];
    const scheduleDisplay = doctor.schedules.map((day: number) => 
      DAYS_OF_WEEK.find(d => d.value === day)?.label
    ).join(', ');

    return (
      <div className="space-y-6">
        {/* Personal Information */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <UserCircleIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <UserIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="text-base text-gray-900">Dr. {profileData.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <IdentificationIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Doctor ID</p>
                <p className="text-base text-gray-900 font-mono">{doctor.id}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base text-gray-900">{profileData.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <UserCircleIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Gender</p>
                <p className="text-base text-gray-900">{profileData.gender ? 'Female' : 'Male'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <AcademicCapIcon className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Professional Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AcademicCapIcon className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Specialization</p>
                  <p className="text-lg font-bold text-gray-900">{specialization}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <StarIcon className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Experience</p>
                  <p className="text-lg font-bold text-gray-900">{doctor.years_of_experience} years</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CurrencyDollarIcon className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Consultation Fee</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(doctor.fee)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CalendarDaysIcon className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Practice Schedule</p>
                  <p className="text-base font-bold text-gray-900">{scheduleDisplay}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStaffProfile = () => {
    return (
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <UserCircleIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <UserIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Full Name</p>
              <p className="text-base text-gray-900">{profileData.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <EnvelopeIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-base text-gray-900">{profileData.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <UserCircleIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Gender</p>
              <p className="text-base text-gray-900">{profileData.gender ? 'Female' : 'Male'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <IdentificationIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Role</p>
              <p className="text-base text-gray-900 capitalize">{profileData.role.toLowerCase()}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <ClockIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Member Since</p>
              <p className="text-base text-gray-900">{formatDate(profileData.created_at)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">
              {profileData.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {profileData.role === 'DOCTOR' ? 'Dr. ' : ''}{profileData.name}
            </h1>
            <p className="text-gray-600 capitalize">
              {profileData.role.toLowerCase()} Profile
            </p>
          </div>
        </div>
      </div>

      {/* Role-specific Profile Content */}
      {profileData.role === 'PATIENT' && renderPatientProfile()}
      {profileData.role === 'DOCTOR' && renderDoctorProfile()}
      {['ADMIN', 'NURSE', 'PHARMACIST'].includes(profileData.role) && renderStaffProfile()}
    </div>
  );
}