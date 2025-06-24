'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/utils/format';
import { APPOINTMENT_STATUS, APPOINTMENT_STATUS_LABELS, TREATMENTS } from '@/utils/constants';
import {
  CalendarDaysIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface AppointmentDetail {
  id: string;
  patient: {
    id: string;
    name: string;
    nik: string;
    email: string;
    gender: boolean;
  };
  doctor: {
    id: string;
    name: string;
    specialization: string;
    fee: number;
  };
  appointmentDate: string;
  status: number;
  diagnosis?: string;
  treatments?: number[];
  totalFee: number;
  prescription?: {
    id: string;
    status: number;
  };
  reservation?: {
    id: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export default function AppointmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [diagnosisForm, setDiagnosisForm] = useState({
    diagnosis: '',
    treatments: [] as number[],
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchAppointment();
    }
  }, [params.id]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAppointmentById(params.id as string);
      setAppointment(data);
      
      // Initialize diagnosis form with existing data
      setDiagnosisForm({
        diagnosis: data.diagnosis || '',
        treatments: data.treatments || [],
      });
    } catch (error) {
      console.error('Failed to fetch appointment:', error);
      toast.error('Failed to load appointment details');
      router.push('/appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (action: 'done' | 'cancel') => {
    if (!appointment) return;

    try {
      setActionLoading(true);
      await apiClient.updateAppointmentStatus(appointment.id, action);
      toast.success(`Appointment ${action === 'done' ? 'marked as done' : 'cancelled'} successfully`);
      fetchAppointment(); // Refresh data
      setShowCancelModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} appointment`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateDiagnosis = async () => {
    if (!appointment) return;

    if (!diagnosisForm.diagnosis.trim()) {
      toast.error('Please enter a diagnosis');
      return;
    }

    if (diagnosisForm.treatments.length === 0) {
      toast.error('Please select at least one treatment');
      return;
    }

    try {
      setActionLoading(true);
      await apiClient.updateAppointmentDiagnosis(appointment.id, {
        diagnosis: diagnosisForm.diagnosis,
        treatments: diagnosisForm.treatments,
      });
      toast.success('Diagnosis and treatments updated successfully');
      fetchAppointment();
      setShowDiagnosisModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update diagnosis');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!appointment) return;

    try {
      setActionLoading(true);
      await apiClient.deleteAppointment(appointment.id);
      toast.success('Appointment deleted successfully');
      router.push('/appointments');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    const statusLabel = APPOINTMENT_STATUS_LABELS[status as keyof typeof APPOINTMENT_STATUS_LABELS];
    const statusClasses = {
      0: 'badge-warning', // Created
      1: 'badge-success', // Done
      2: 'badge-danger',  // Cancelled
    };
    
    return (
      <span className={`badge ${statusClasses[status as keyof typeof statusClasses] || 'badge-gray'}`}>
        {statusLabel}
      </span>
    );
  };

  const canMarkAsDone = appointment?.status === APPOINTMENT_STATUS.CREATED && 
                       appointment.diagnosis && 
                       appointment.treatments && 
                       appointment.treatments.length > 0;

  const canCancel = appointment?.status === APPOINTMENT_STATUS.CREATED &&
                   new Date(appointment.appointmentDate) > new Date(Date.now() + 24 * 60 * 60 * 1000);

  const canUpdateDiagnosis = user?.role === 'doctor' && 
                            appointment?.status === APPOINTMENT_STATUS.CREATED &&
                            new Date(appointment.appointmentDate) <= new Date();

  const canCreatePrescription = user?.role === 'doctor' && 
                               appointment?.status === APPOINTMENT_STATUS.CREATED && 
                               !appointment.prescription;

  const canCreateReservation = user?.role === 'nurse' && 
                              appointment?.status === APPOINTMENT_STATUS.CREATED && 
                              !appointment.reservation;

  const canDelete = user?.role === 'admin';
  const canChangeStatus = user?.role === 'admin';

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
        <Link href="/appointments" className="btn-primary">
          Back to Appointments
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
              <p className="text-gray-600">ID: {appointment.id}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {getStatusBadge(appointment.status)}
        </div>
      </div>

      {/* Basic Information */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Name:</span>
                <p className="font-medium">{appointment.patient.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">NIK:</span>
                <p className="font-mono">{appointment.patient.nik}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Email:</span>
                <p>{appointment.patient.email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Gender:</span>
                <p>{appointment.patient.gender ? 'Female' : 'Male'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Doctor Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Name:</span>
                <p className="font-medium">{appointment.doctor.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Specialization:</span>
                <p>{appointment.doctor.specialization}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Consultation Fee:</span>
                <p className="font-medium">Rp {appointment.doctor.fee.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="text-sm text-gray-500">Appointment Date:</span>
              <p className="font-medium">{formatDate(appointment.appointmentDate, true)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Total Fee:</span>
              <p className="font-medium">Rp {appointment.totalFee.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Status:</span>
              <div className="mt-1">{getStatusBadge(appointment.status)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnosis and Treatments */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Diagnosis & Treatments</h2>
          {canUpdateDiagnosis && (
            <button
              onClick={() => setShowDiagnosisModal(true)}
              className="btn-outline flex items-center space-x-2"
            >
              <PencilIcon className="w-5 h-5" />
              <span>Update</span>
            </button>
          )}
        </div>

        {appointment.diagnosis || (appointment.treatments && appointment.treatments.length > 0) ? (
          <div className="space-y-4">
            {appointment.diagnosis && (
              <div>
                <span className="text-sm font-medium text-gray-500">Diagnosis:</span>
                <p className="mt-1 text-gray-900">{appointment.diagnosis}</p>
              </div>
            )}
            
            {appointment.treatments && appointment.treatments.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-500">Treatments:</span>
                <ul className="mt-2 space-y-1">
                  {appointment.treatments.map((treatmentId) => {
                    const treatment = TREATMENTS.find(t => t.id === treatmentId);
                    return (
                      <li key={treatmentId} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                        <span>{treatment?.name || `Treatment ${treatmentId}`}</span>
                        <span className="font-medium">Rp {treatment?.price.toLocaleString()}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ClipboardDocumentListIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No diagnosis or treatments recorded yet</p>
            {canUpdateDiagnosis && (
              <button
                onClick={() => setShowDiagnosisModal(true)}
                className="btn-primary mt-3"
              >
                Add Diagnosis & Treatments
              </button>
            )}
          </div>
        )}
      </div>

      {/* Related Records */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Related Records</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Prescription */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <ClipboardDocumentListIcon className="w-6 h-6 text-green-600" />
              <h3 className="font-medium text-gray-900">Prescription</h3>
            </div>
            {appointment.prescription ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">ID: {appointment.prescription.id}</p>
                <Link
                  href={`/prescriptions/${appointment.prescription.id}`}
                  className="text-blue-600 hover:text-blue-500 text-sm"
                >
                  View Details →
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-3">No prescription created</p>
                {canCreatePrescription && (
                  <Link
                    href={`/prescriptions/create?appointment=${appointment.id}`}
                    className="btn-sm btn-outline"
                  >
                    Create Prescription
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Reservation */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <BuildingOfficeIcon className="w-6 h-6 text-purple-600" />
              <h3 className="font-medium text-gray-900">Reservation</h3>
            </div>
            {appointment.reservation ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">ID: {appointment.reservation.id}</p>
                <Link
                  href={`/reservations/${appointment.reservation.id}`}
                  className="text-blue-600 hover:text-blue-500 text-sm"
                >
                  View Details →
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-3">No reservation created</p>
                {canCreateReservation && (
                  <Link
                    href={`/reservations/create?appointment=${appointment.id}`}
                    className="btn-sm btn-outline"
                  >
                    Make Reservation
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Metadata</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <span className="text-gray-500">Created At:</span>
            <p className="font-medium">{formatDate(appointment.createdAt, true)}</p>
          </div>
          <div>
            <span className="text-gray-500">Created By:</span>
            <p className="font-medium">{appointment.createdBy}</p>
          </div>
          <div>
            <span className="text-gray-500">Updated At:</span>
            <p className="font-medium">{formatDate(appointment.updatedAt, true)}</p>
          </div>
          <div>
            <span className="text-gray-500">Updated By:</span>
            <p className="font-medium">{appointment.updatedBy}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Actions</h2>
          <div className="flex items-center space-x-3">
            {canChangeStatus && canMarkAsDone && (
              <button
                onClick={() => handleUpdateStatus('done')}
                disabled={actionLoading}
                className="btn-success flex items-center space-x-2"
              >
                <CheckIcon className="w-5 h-5" />
                <span>Mark as Done</span>
              </button>
            )}
            
            {canChangeStatus && canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="btn-danger flex items-center space-x-2"
              >
                <XMarkIcon className="w-5 h-5" />
                <span>Cancel</span>
              </button>
            )}
            
            {canDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn-danger flex items-center space-x-2"
              >
                <TrashIcon className="w-5 h-5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Diagnosis Modal */}
      {showDiagnosisModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Diagnosis & Treatments</h3>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Diagnosis *</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Enter diagnosis..."
                  value={diagnosisForm.diagnosis}
                  onChange={(e) => setDiagnosisForm({ ...diagnosisForm, diagnosis: e.target.value })}
                />
              </div>
              
              <div>
                <label className="form-label">Treatments *</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {TREATMENTS.map((treatment) => (
                    <label key={treatment.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={diagnosisForm.treatments.includes(treatment.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDiagnosisForm({
                              ...diagnosisForm,
                              treatments: [...diagnosisForm.treatments, treatment.id]
                            });
                          } else {
                            setDiagnosisForm({
                              ...diagnosisForm,
                              treatments: diagnosisForm.treatments.filter(id => id !== treatment.id)
                            });
                          }
                        }}
                        className="form-checkbox"
                      />
                      <span className="flex-1">{treatment.name}</span>
                      <span className="text-sm text-gray-500">Rp {treatment.price.toLocaleString()}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDiagnosisModal(false)}
                className="btn-outline"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDiagnosis}
                disabled={actionLoading}
                className="btn-primary flex items-center space-x-2"
              >
                {actionLoading ? (
                  <div className="spinner w-4 h-4"></div>
                ) : (
                  <CheckIcon className="w-5 h-5" />
                )}
                <span>Update</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Cancel Appointment</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="btn-outline"
                disabled={actionLoading}
              >
                Keep Appointment
              </button>
              <button
                onClick={() => handleUpdateStatus('cancel')}
                disabled={actionLoading}
                className="btn-danger flex items-center space-x-2"
              >
                {actionLoading ? (
                  <div className="spinner w-4 h-4"></div>
                ) : (
                  <XMarkIcon className="w-5 h-5" />
                )}
                <span>Cancel Appointment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Appointment</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this appointment? This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-outline"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="btn-danger flex items-center space-x-2"
              >
                {actionLoading ? (
                  <div className="spinner w-4 h-4"></div>
                ) : (
                  <TrashIcon className="w-5 h-5" />
                )}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}