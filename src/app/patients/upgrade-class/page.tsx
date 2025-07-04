'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate } from '@/utils/format';
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  UserIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import toast from 'react-hot-toast';
import { Patient } from '@/types';

const patientClasses = [
  { value: 1, label: 'Class 1', description: 'Premium Coverage', limit: 100000000 },
  { value: 2, label: 'Class 2', description: 'Standard Coverage', limit: 50000000 },
  { value: 3, label: 'Class 3', description: 'Basic Coverage', limit: 25000000 },
];

export default function UpgradePatientClassPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [newClass, setNewClass] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  const searchPatients = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter NIK or patient name to search');
      return;
    }

    setSearching(true);
    try {
      const response = await apiClient.searchPatient({ 
        nik: searchQuery,
        name: searchQuery 
      });
      setSearchResults(Array.isArray(response) ? response : [response]);
      
      if (Array.isArray(response) && response.length === 0) {
        toast.error('No patients found with the given search criteria');
      }
    } catch (error: any) {
      console.error('Search failed:', error);
      setSearchResults([]);
      if (error.response?.status === 404) {
        toast.error('No patients found with the given search criteria');
      } else {
        toast.error('Failed to search patients');
      }
    } finally {
      setSearching(false);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setNewClass(null);
    setSearchResults([]);
    setSearchQuery('');
  };

  const getAvailableUpgrades = (currentClass: number) => {
    return patientClasses.filter(pc => pc.value < currentClass);
  };

  const handleUpgradeConfirm = () => {
    if (!selectedPatient || !newClass) return;
    setShowConfirmDialog(true);
  };

  const executeUpgrade = async () => {
    if (!selectedPatient || !newClass) return;

    setUpgrading(true);
    try {
      await apiClient.upgradePatientClass({
        patient_id: selectedPatient.id,
        new_class: newClass
      });

      // Update patient data
      setSelectedPatient({
        ...selectedPatient,
        pClass: newClass,
        insuranceLimit: patientClasses.find(pc => pc.value === newClass)?.limit || 0
      });

      setShowConfirmDialog(false);
      setShowSuccessMessage(true);
      setNewClass(null);
      
      toast.success('Patient class upgraded successfully!');
    } catch (error: any) {
      console.error('Upgrade failed:', error);
      toast.error(error.response?.data?.message || 'Failed to upgrade patient class');
    } finally {
      setUpgrading(false);
    }
  };

  const resetForm = () => {
    setSelectedPatient(null);
    setNewClass(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowSuccessMessage(false);
  };

  const currentClassInfo = selectedPatient ? 
    patientClasses.find(pc => pc.value === selectedPatient.pClass) : null;
  const newClassInfo = newClass ? 
    patientClasses.find(pc => pc.value === newClass) : null;

  if (user && user.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>
            Access denied. This page is only available to administrators.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Upgrade Patient Class</h1>
              <p className="text-gray-600">Search for patients and upgrade their insurance class to a higher level</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Patient class has been successfully upgraded! The patient now has access to enhanced insurance coverage.
            </AlertDescription>
          </Alert>
        )}

        {/* Search Section */}
        <div className="card mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <MagnifyingGlassIcon className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900">Search Patient</h2>
          </div>
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">NIK or Patient Name</Label>
              <Input
                id="search"
                type="text"
                placeholder="Enter NIK (16 digits) or patient name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchPatients()}
                className="text-gray-900"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={searchPatients} 
                disabled={searching}
                className="btn-primary"
              >
                {searching ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Searching...
                  </div>
                ) : (
                  <>
                    <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Results</h3>
            <div className="space-y-3">
              {searchResults.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleSelectPatient(patient)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{patient.name}</p>
                      <p className="text-sm text-gray-500">NIK: {patient.nik}</p>
                      <p className="text-sm text-gray-500">
                        Current Class: {patientClasses.find(pc => pc.value === patient.pClass)?.label}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Select
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Patient & Upgrade Form */}
        {selectedPatient && (
          <div className="space-y-6">
            {/* Current Patient Info */}
            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <UserIcon className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Selected Patient</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Full Name</p>
                      <p className="text-base text-gray-900">{selectedPatient.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <IdentificationIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">NIK</p>
                      <p className="text-base text-gray-900 font-mono">{selectedPatient.nik}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Birth Date</p>
                      <p className="text-base text-gray-900">{formatDate(selectedPatient.birthDate)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Current Class</p>
                        <p className="text-lg font-bold text-gray-900">{currentClassInfo?.label}</p>
                        <p className="text-xs text-gray-600">{currentClassInfo?.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Current Insurance Limit</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(selectedPatient.insuranceLimit)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upgrade Form */}
            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <ArrowUpIcon className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Upgrade Class</h3>
              </div>
              
              {getAvailableUpgrades(selectedPatient.pClass).length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="newClass">Select New Class</Label>
                    <select
                      id="newClass"
                      className="form-input text-gray-900 mt-1"
                      value={newClass || ''}
                      onChange={(e) => setNewClass(parseInt(e.target.value))}
                    >
                      <option value="">Choose a higher class...</option>
                      {getAvailableUpgrades(selectedPatient.pClass).map((pc) => (
                        <option key={pc.value} value={pc.value}>
                          {pc.label} - {pc.description} ({formatCurrency(pc.limit)})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {newClass && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Upgrade Summary</h4>
                      <div className="text-sm text-yellow-700 space-y-1">
                        <p>Patient: <strong>{selectedPatient.name}</strong></p>
                        <p>Current Class: <strong>{currentClassInfo?.label}</strong> ({formatCurrency(currentClassInfo?.limit || 0)})</p>
                        <p>New Class: <strong>{newClassInfo?.label}</strong> ({formatCurrency(newClassInfo?.limit || 0)})</p>
                        <p>Insurance Limit Increase: <strong>{formatCurrency((newClassInfo?.limit || 0) - (currentClassInfo?.limit || 0))}</strong></p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-4">
                    <Button
                      onClick={handleUpgradeConfirm}
                      disabled={!newClass}
                      className="btn-primary"
                    >
                      <ArrowUpIcon className="w-4 h-4 mr-2" />
                      Upgrade Patient Class
                    </Button>
                    
                    <Button
                      onClick={resetForm}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Alert>
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertDescription>
                    This patient is already at the highest available class (Class 1) and cannot be upgraded further.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
              <span>Confirm Class Upgrade</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to upgrade this patient's class? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && newClass && (
            <div className="my-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2 text-sm">
                <p><strong>Patient:</strong> {selectedPatient.name}</p>
                <p><strong>NIK:</strong> {selectedPatient.nik}</p>
                <p><strong>Current Class:</strong> {currentClassInfo?.label} ({formatCurrency(currentClassInfo?.limit || 0)})</p>
                <p><strong>New Class:</strong> {newClassInfo?.label} ({formatCurrency(newClassInfo?.limit || 0)})</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={upgrading}
            >
              Cancel
            </Button>
            <Button
              onClick={executeUpgrade}
              disabled={upgrading}
              className="btn-primary"
            >
              {upgrading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Upgrading...
                </div>
              ) : (
                'Confirm Upgrade'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}