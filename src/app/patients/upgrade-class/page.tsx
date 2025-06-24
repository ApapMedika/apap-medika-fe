'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatCurrency } from '@/utils/format';
import {
  MagnifyingGlassIcon,
  UserIcon,
  ArrowUpIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Patient {
  user: {
    id: string;
    name: string;
    email: string;
    gender: boolean;
  };
  nik: string;
  birth_place: string;
  birth_date: string;
  p_class: number;
  insurance_limit: number;
  available_limit: number;
}

const patientClasses = {
  1: {
    label: 'Class 1 (Premium)',
    limit: 100000000,
    description: 'Highest coverage with premium benefits',
    color: 'text-green-600 bg-green-100'
  },
  2: {
    label: 'Class 2 (Standard)',
    limit: 50000000,
    description: 'Standard coverage for regular needs',
    color: 'text-yellow-600 bg-yellow-100'
  },
  3: {
    label: 'Class 3 (Basic)',
    limit: 25000000,
    description: 'Basic coverage for essential services',
    color: 'text-gray-600 bg-gray-100'
  }
};

export default function UpgradePatientClassPage() {
  const { user } = useAuth();
  const [nik, setNik] = useState('');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  // Check if user is admin
  if (user?.role !== 'ADMIN') {
    return (
      <div className="card text-center">
        <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">Only administrators can upgrade patient classes.</p>
      </div>
    );
  }

  const searchPatient = async () => {
    if (!nik || nik.length !== 16) {
      toast.error('Please enter a valid 16-digit NIK');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post('/profile/patients/search/', { nik });
      
      if (response.found) {
        setPatient(response.patient);
      } else {
        setPatient(null);
        toast.error('Patient not found');
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Failed to search patient');
      setPatient(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeClick = (newClass: number) => {
    setSelectedClass(newClass);
    setShowConfirmation(true);
  };

  const confirmUpgrade = async () => {
    if (!patient || !selectedClass) return;

    try {
      setUpgrading(true);
      await apiClient.put('/profile/patients/upgrade-class/', {
        patient_id: patient.user.id,
        new_class: selectedClass
      });

      // Update patient data
      setPatient(prev => prev ? {
        ...prev,
        p_class: selectedClass,
        insurance_limit: patientClasses[selectedClass as keyof typeof patientClasses].limit
      } : null);

      setShowConfirmation(false);
      setSelectedClass(null);
      toast.success(`Patient class upgraded successfully to Class ${selectedClass}!`);
    } catch (error: any) {
      console.error('Upgrade failed:', error);
      toast.error(error.response?.data?.message || 'Failed to upgrade patient class');
    } finally {
      setUpgrading(false);
    }
  };

  const getAvailableUpgrades = () => {
    if (!patient) return [];
    
    const availableClasses = [];
    for (let i = patient.p_class - 1; i >= 1; i--) {
      availableClasses.push(i);
    }
    return availableClasses;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <ArrowUpIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Upgrade Patient Class</h1>
            <p className="text-gray-600">Upgrade patient insurance class to provide better coverage</p>
          </div>
        </div>
      </div>

      {/* Search Patient */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Search Patient</h2>
        
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="form-label">Patient NIK (16 digits)</label>
            <input
              type="text"
              placeholder="Enter patient NIK"
              className="form-input"
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              maxLength={16}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={searchPatient}
              disabled={loading || !nik}
              className="btn-primary flex items-center space-x-2"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              <span>{loading ? 'Searching...' : 'Search'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patient Information */}
      {patient && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Patient Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <UserIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-gray-900">{patient.user.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <UserIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">NIK</p>
                  <p className="text-gray-900 font-mono">{patient.nik}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <UserIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{patient.user.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Class</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    patientClasses[patient.p_class as keyof typeof patientClasses].color
                  }`}>
                    Class {patient.p_class}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Insurance Limit</p>
                  <p className="text-gray-900 font-semibold">
                    {formatCurrency(patient.insurance_limit)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Available Limit</p>
                  <p className="text-green-600 font-semibold">
                    {formatCurrency(patient.available_limit)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Options */}
      {patient && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Upgrades</h2>
          
          {getAvailableUpgrades().length === 0 ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Already at Highest Class</h3>
              <p className="text-gray-600">This patient is already in the highest insurance class (Class 1).</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {getAvailableUpgrades().map((classLevel) => {
                const classInfo = patientClasses[classLevel as keyof typeof patientClasses];
                return (
                  <div key={classLevel} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-lg">{classLevel}</span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {classInfo.label}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-4">
                        {classInfo.description}
                      </p>
                      
                      <div className="space-y-2 mb-6">
                        <p className="text-sm font-medium text-gray-500">Insurance Limit</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(classInfo.limit)}
                        </p>
                        
                        <div className="text-sm text-green-600">
                          <span className="font-medium">
                            +{formatCurrency(classInfo.limit - patient.insurance_limit)}
                          </span>
                          <span className="text-gray-500"> increase</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleUpgradeClick(classLevel)}
                        className="w-full btn-primary"
                      >
                        <ArrowUpIcon className="w-4 h-4 mr-2" />
                        Upgrade to Class {classLevel}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && patient && selectedClass && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50">
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ArrowUpIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <h3 className="text-base font-semibold leading-6 text-gray-900">
                        Confirm Class Upgrade
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to upgrade <strong>{patient.user.name}</strong>'s 
                          insurance class from Class {patient.p_class} to Class {selectedClass}?
                        </p>
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-900">New Benefits:</p>
                          <ul className="mt-2 text-sm text-blue-800 space-y-1">
                            <li>• Insurance Limit: {formatCurrency(patientClasses[selectedClass as keyof typeof patientClasses].limit)}</li>
                            <li>• Additional Coverage: {formatCurrency(
                              patientClasses[selectedClass as keyof typeof patientClasses].limit - patient.insurance_limit
                            )}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    onClick={confirmUpgrade}
                    disabled={upgrading}
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50"
                  >
                    {upgrading ? 'Upgrading...' : 'Confirm Upgrade'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmation(false);
                      setSelectedClass(null);
                    }}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}