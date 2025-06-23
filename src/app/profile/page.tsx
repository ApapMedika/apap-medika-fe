'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate } from '@/utils/format';
import { PATIENT_CLASSES } from '@/utils/constants';
import {
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface PatientProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  nik: string;
  gender: boolean;
  birthPlace: string;
  birthDate: string;
  pClass: number;
  insuranceLimit: number;
  availableLimit: number;
  createdAt: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user?.role !== 'patient') {
          toast.error('Only patients can view profile');
          return;
        }

        setLoading(true);
        const data = await apiClient.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (user?.role !== 'patient') {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">Only patients can view their profile.</p>
      </div>
    );
  }

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

  const patientClass = PATIENT_CLASSES[profile.pClass as keyof typeof PATIENT_CLASSES];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">
              {profile.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
            <p className="text-lg text-gray-600">Patient Profile</p>
            <p className="text-sm text-gray-500">Member since {formatDate(profile.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <UserIcon className="w-5 h-5 mr-2" />
            Personal Information
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <IdentificationIcon className="w-5 h-5 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-600">NIK</label>
                <p className="text-gray-900">{profile.nik}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <UserIcon className="w-5 h-5 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-600">Username</label>
                <p className="text-gray-900">{profile.username}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <UserIcon className="w-5 h-5 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <UserIcon className="w-5 h-5 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-600">Gender</label>
                <p className="text-gray-900">{profile.gender ? 'Female' : 'Male'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPinIcon className="w-5 h-5 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-600">Birth Place</label>
                <p className="text-gray-900">{profile.birthPlace}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-600">Birth Date</label>
                <p className="text-gray-900">{formatDate(profile.birthDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Insurance Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <ShieldCheckIcon className="w-5 h-5 mr-2" />
            Insurance Information
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-blue-600">Patient Class</label>
                <p className="text-lg font-semibold text-blue-900">
                  {patientClass?.name}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{profile.pClass}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-600">Insurance Limit</label>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(profile.insuranceLimit)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-600">Available Limit</label>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(profile.availableLimit)}
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Limit Usage</h4>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${((profile.insuranceLimit - profile.availableLimit) / profile.insuranceLimit) * 100}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>Used: {formatCurrency(profile.insuranceLimit - profile.availableLimit)}</span>
                <span>Available: {formatCurrency(profile.availableLimit)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="/dashboard/appointments"
            className="btn-outline text-center"
          >
            View My Appointments
          </a>
          <a
            href="/dashboard/policies"
            className="btn-outline text-center"
          >
            View My Policies
          </a>
          <a
            href="/dashboard/bills"
            className="btn-outline text-center"
          >
            View My Bills
          </a>
        </div>
      </div>
    </div>
  );
}