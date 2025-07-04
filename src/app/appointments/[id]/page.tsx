'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { formatDate, formatDateTimeString, formatCurrency } from '@/utils/format';
import {
  CalendarDaysIcon,
  UserIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  BeakerIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  XCircleIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Appointment, Treatment, AppointmentStatus } from '@/types';

const appointmentStatusMap = {
  0: { label: 'Created', color: 'badge-warning', icon: ClockIcon },
  1: { label: 'Done', color: 'badge-success', icon: CheckCircleIcon },
  2: { label: 'Cancelled', color: 'badge-danger', icon: XCircleIcon },
};

export default function AppointmentDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Dialog states
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDiagnosisDialog, setShowDiagnosisDialog] = useState(false);
  
  // Form states
  const [newStatus, setNewStatus] = useState<number | null>(null);
  const [diagnosisForm, setDiagnosisForm] = useState({
    diagnosis: '',
    selectedTreatments: [] as number[],
  });

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetail();
      fetchTreatments();
    }
  }, [appointmentId]);

  const fetchAppointmentDetail = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAppointmentById(appointmentId);
      setAppointment(data);
      
      // Initialize diagnosis form if appointment has diagnosis
      if (data.diagnosis) {
        setDiagnosisForm({
          diagnosis: data.diagnosis,
          selectedTreatments: data.treatments?.map((t: Treatment) => t.id) || [],
        });
      }
    } catch (error) {
      console.error('Failed to fetch appointment:', error);
      toast.error('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const fetchTreatments = async () => {
    try {
      const data = await apiClient.getTreatments();
      setTreatments(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Failed to fetch treatments:', error);
    }
  };

  const handleStatusUpdate = async () => {
    if (!appointment || newStatus === null) return;

    // Validation for status changes
    if (newStatus === 1 && (!appointment.diagnosis || !appointment.treatments?.length)) {
      toast.error('Cannot mark as Done: Diagnosis and treatments are required');
      return;
    }

    if (newStatus === 2) {
      const appointmentDate = new Date(appointment.appointmentDate);
      const oneDayBefore = new Date();
      oneDayBefore.setDate(oneDayBefore.getDate() + 1);
      
      if (appointmentDate <= oneDayBefore) {
        toast.error('Cannot cancel: Appointment is within one day or has passed');
        return;
      }
    }

    setUpdating(true);
    try {
      const action = newStatus === 1 ? 'complete' : 'cancel';
      await apiClient.updateAppointmentStatus(appointmentId, action);
      
      setAppointment(prev => prev ? { ...prev, status: newStatus as AppointmentStatus } : null);
      setShowStatusDialog(false);
      setNewStatus(null);
      
      toast.success(`Appointment ${newStatus === 1 ? 'completed' : 'cancelled'} successfully`);
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error(error.response?.data?.message || 'Failed to update appointment status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!appointment) return;

    setUpdating(true);
    try {
      await apiClient.deleteAppointment(appointmentId);
      toast.success('Appointment deleted successfully');
      router.push('/appointments');
    } catch (error: any) {
      console.error('Failed to delete appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to delete appointment');
    } finally {
      setUpdating(false);
    }
  };

  const handleDiagnosisUpdate = async () => {
    if (!appointment || !diagnosisForm.diagnosis || diagnosisForm.selectedTreatments.length === 0) {
      toast.error('Please fill in diagnosis and select at least one treatment');
      return;
    }

    setUpdating(true);
    try {
      const updateData = {
        diagnosis: diagnosisForm.diagnosis,
        treatment_ids: diagnosisForm.selectedTreatments,
      };

      await apiClient.updateAppointmentDiagnosis(appointmentId, updateData);
      
      // Update local state
      const selectedTreatmentObjects = treatments.filter(t => 
        diagnosisForm.selectedTreatments.includes(t.id)
      );
      
      setAppointment(prev => prev ? {
        ...prev,
        diagnosis: diagnosisForm.diagnosis,
        treatments: selectedTreatmentObjects,
      } : null);
      
      setShowDiagnosisDialog(false);
      toast.success('Diagnosis and treatments updated successfully');
    } catch (error: any) {
      console.error('Failed to update diagnosis:', error);
      toast.error(error.response?.data?.message || 'Failed to update diagnosis');
    } finally {
      setUpdating(false);
    }
  };

  const canUpdateStatus = user?.role === 'ADMIN';
  const canDelete = user?.role === 'ADMIN';
  const canUpdateDiagnosis = user?.role === 'DOCTOR' && appointment?.status === 0 && 
    new Date() >= new Date(appointment?.appointmentDate || '');
  const canAddPrescription = user?.role === 'DOCTOR' && appointment?.status === 0;
  const canMakeReservation = user?.role === 'NURSE' && appointment?.status === 0;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>
            Appointment not found or you don't have permission to view it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const statusInfo = appointmentStatusMap[appointment.status as keyof typeof appointmentStatusMap];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Link href="/appointments">
              <Button variant="outline" size="sm">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Appointment Details</h1>
              <p className="text-gray-600">ID: {appointment.id}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge className={`${statusInfo.color} text-sm px-3 py-1`}>
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <InformationCircleIcon className="w-6 h-6 text-blue-600" />
                  <span>Appointment Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <UserIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Patient</p>
                        <p className="text-base text-gray-900">{appointment.patient.name}</p>
                        <p className="text-sm text-gray-500">NIK: {appointment.patient.nik}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <UserIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Doctor</p>
                        <p className="text-base text-gray-900">Dr. {appointment.doctor.name}</p>
                        <p className="text-sm text-gray-500">{appointment.doctor.specializationDisplay}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Appointment Date</p>
                        <p className="text-base text-gray-900">{formatDate(appointment.appointmentDate)}</p>
                        <p className="text-sm text-gray-500">{formatDateTimeString(appointment.appointmentDate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Fee</p>
                        <p className="text-base text-gray-900">{formatCurrency(appointment.totalFee)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diagnosis & Treatments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DocumentTextIcon className="w-6 h-6 text-green-600" />
                    <span>Diagnosis & Treatments</span>
                  </div>
                  {canUpdateDiagnosis && (
                    <Button
                      onClick={() => setShowDiagnosisDialog(true)}
                      variant="outline"
                      size="sm"
                    >
                      <PencilIcon className="w-4 h-4 mr-2" />
                      Update
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appointment.diagnosis ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Diagnosis</p>
                      <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{appointment.diagnosis}</p>
                    </div>
                    
                    {appointment.treatments && appointment.treatments.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Treatments</p>
                        <div className="space-y-2">
                          {appointment.treatments.map((treatment) => (
                            <div key={treatment.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                              <span className="text-gray-900">{treatment.name}</span>
                              <span className="text-gray-600">{formatCurrency(treatment.price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No diagnosis recorded yet</p>
                    {canUpdateDiagnosis && (
                      <Button
                        onClick={() => setShowDiagnosisDialog(true)}
                        className="mt-4"
                        variant="outline"
                      >
                        Add Diagnosis
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Audit Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ClockIcon className="w-6 h-6 text-gray-600" />
                  <span>Audit Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created At</p>
                    <p className="text-gray-900">{formatDateTimeString(appointment.createdAt)}</p>
                    {appointment.createdBy && (
                      <p className="text-sm text-gray-500">By: {appointment.createdBy}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Updated At</p>
                    <p className="text-gray-900">{formatDateTimeString(appointment.updatedAt)}</p>
                    {appointment.updatedBy && (
                      <p className="text-sm text-gray-500">By: {appointment.updatedBy}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            {/* Admin Actions */}
            {canUpdateStatus && (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => {
                      setNewStatus(appointment.status === 0 ? 1 : 0);
                      setShowStatusDialog(true);
                    }}
                    className="w-full"
                    variant="outline"
                    disabled={appointment.status === 2}
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Change Status
                  </Button>
                  
                  {canDelete && (
                    <Button
                      onClick={() => setShowDeleteDialog(true)}
                      className="w-full"
                      variant="destructive"
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Delete Appointment
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Doctor Actions */}
            {user?.role === 'DOCTOR' && (
              <Card>
                <CardHeader>
                  <CardTitle>Doctor Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {canAddPrescription && (
                    <Link href={`/prescriptions/create?appointment=${appointmentId}`}>
                      <Button
                        className="w-full"
                        variant="outline"
                      >
                        <BeakerIcon className="w-4 h-4 mr-2" />
                        Add Prescription
                      </Button>
                    </Link>
                  )}
                  
                  {!canAddPrescription && appointment.status !== 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">
                      Prescription can only be added for Created appointments
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Nurse Actions */}
            {user?.role === 'NURSE' && (
              <Card>
                <CardHeader>
                  <CardTitle>Nurse Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {canMakeReservation && (
                    <Link href={`/reservations/create?appointment=${appointmentId}`}>
                      <Button
                        className="w-full"
                        variant="outline"
                      >
                        <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                        Make Reservation
                      </Button>
                    </Link>
                  )}
                  
                  {!canMakeReservation && appointment.status !== 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">
                      Reservation can only be made for Created appointments
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Related Records */}
            <Card>
              <CardHeader>
                <CardTitle>Related Records</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Show prescription link if exists */}
                <div className="text-sm text-gray-600">
                  <p>Prescription: Not available yet</p>
                  <p>Reservation: Not available yet</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status Update Dialog */}
        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Appointment Status</DialogTitle>
              <DialogDescription>
                Are you sure you want to {newStatus === 1 ? 'mark this appointment as Done' : 'cancel this appointment'}?
              </DialogDescription>
            </DialogHeader>
            
            <div className="my-4">
              <div className="space-y-2 text-sm">
                <p><strong>Patient:</strong> {appointment.patient.name}</p>
                <p><strong>Doctor:</strong> Dr. {appointment.doctor.name}</p>
                <p><strong>Date:</strong> {formatDateTimeString(appointment.appointmentDate)}</p>
                <p><strong>Current Status:</strong> {statusInfo.label}</p>
                <p><strong>New Status:</strong> {newStatus === 1 ? 'Done' : 'Cancelled'}</p>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowStatusDialog(false)}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="btn-primary"
              >
                {updating ? (
                  <div className="flex items-center">
                    <LoadingSpinner />
                    <span className="ml-2">Updating...</span>
                  </div>
                ) : (
                  'Confirm Update'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Appointment</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this appointment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <Alert>
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription>
                Deleting this appointment will permanently remove all associated data.
              </AlertDescription>
            </Alert>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={updating}
              >
                {updating ? (
                  <div className="flex items-center">
                    <LoadingSpinner />
                    <span className="ml-2">Deleting...</span>
                  </div>
                ) : (
                  'Delete Appointment'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diagnosis Update Dialog */}
        <Dialog open={showDiagnosisDialog} onOpenChange={setShowDiagnosisDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Update Diagnosis & Treatments</DialogTitle>
              <DialogDescription>
                Update the diagnosis and select treatments for this appointment.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="diagnosis">Diagnosis *</Label>
                <Textarea
                  id="diagnosis"
                  placeholder="Enter diagnosis..."
                  value={diagnosisForm.diagnosis}
                  onChange={(e) => setDiagnosisForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Treatments *</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                  {treatments.map((treatment) => (
                    <label key={treatment.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={diagnosisForm.selectedTreatments.includes(treatment.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDiagnosisForm(prev => ({
                              ...prev,
                              selectedTreatments: [...prev.selectedTreatments, treatment.id]
                            }));
                          } else {
                            setDiagnosisForm(prev => ({
                              ...prev,
                              selectedTreatments: prev.selectedTreatments.filter(id => id !== treatment.id)
                            }));
                          }
                        }}
                        className="form-checkbox"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{treatment.name}</span>
                        <span className="text-sm text-gray-500 ml-2">{formatCurrency(treatment.price)}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDiagnosisDialog(false)}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDiagnosisUpdate}
                disabled={updating || !diagnosisForm.diagnosis || diagnosisForm.selectedTreatments.length === 0}
                className="btn-primary"
              >
                {updating ? (
                  <div className="flex items-center">
                    <LoadingSpinner />
                    <span className="ml-2">Updating...</span>
                  </div>
                ) : (
                  'Update Diagnosis'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}