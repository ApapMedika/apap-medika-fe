'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatDate, formatCurrency } from '@/utils/format';
import { APPOINTMENT_STATUS } from '@/utils/constants';
import {
  CalendarDaysIcon,
  UserIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  BeakerIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface AppointmentDetail {
  id: string;
  patient: {
    id: string;
    name: string;
    nik: string;
    email: string;
  };
  doctor: {
    id: string;
    name: string;
    specialization: string;
  };
  appointmentDate: string;
  status: number;
  diagnosis?: string;
  treatments?: Array<{
    id: number;
    name: string;
    price: number;
  }>;
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
  createdBy?: string;
  updatedBy?: string;
}

export default function AppointmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<number>(0);

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
    } catch (error) {
      console.error('Failed to fetch appointment:', error);
      toast.error('Failed to load appointment details');
      router.push('/dashboard/appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!appointment) return;

    try {
      await apiClient.updateAppointmentStatus(appointment.id, newStatus);
      toast.success('Appointment status updated successfully');
      setShowStatusModal(false);
      fetchAppointment();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!appointment) return;

    try {
      await apiClient.deleteAppointment(appointment.id);
      toast.success('Appointment deleted successfully');
      router.push('/dashboard/appointments');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete appointment');
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case APPOINTMENT_STATUS.CREATED:
        return <span className="badge badge-warning">Created</span>;
      case APPOINTMENT_STATUS.DONE:
        return <span className="badge badge-success">Done</span>;
      case APPOINTMENT_STATUS.CANCELLED:
        return <span className="badge badge-danger">Cancelled</span>;
      default:
        return <span className="badge badge-gray">Unknown</span>;
    }
  };

  const canUpdateStatus = user?.role === 'admin';
  const canDelete = user?.role === 'admin';
  const canUpdateNote = user?.role === 'doctor' && appointment?.status === APPOINTMENT_STATUS.CREATED;
  const canCreatePrescription = user?.role === 'doctor' && appointment?.status === APPOINTMENT_STATUS.CREATED && !appointment?.prescription;
  const canCreateReservation = user?.role === 'nurse' && appointment?.status === APPOINTMENT_STATUS.CREATED && !appointment?.reservation;

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
        <Link href="/dashboard/appointments" className="btn-primary">
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
            className="btn-outline btn-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </button>
          <div className="flex items-center space-x-3">
            <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Appointment Details
              </h1>
              <p className="text-gray-600">ID: {appointment.id}</p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          {canUpdateNote && (
            <Link
              href={`/dashboard/appointments/${appointment.id}/note`}
              className="btn-outline btn-sm"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Add Diagnosis & Treatments
            </Link>
          )}
          
          {canUpdateStatus && (
            <button
              onClick={() => setShowStatusModal(true)}
              className="btn-outline btn-sm"
            >
              <CheckIcon className="w-4 h-4 mr-2" />
              Update Status
            </button>
          )}
          
          {canDelete && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn-danger btn-sm"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Basic Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Patient</label>
              <div className="flex items-center space-x-3 mt-1">
                <UserIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{appointment.patient.name}</p>
                  <p className="text-sm text-gray-500">NIK: {appointment.patient.nik}</p>
                  <p className="text-sm text-gray-500">{appointment.patient.email}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Doctor</label>
              <div className="flex items-center space-x-3 mt-1">
                <UserIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{appointment.doctor.name}</p>
                  <p className="text-sm text-gray-500">{appointment.doctor.specialization}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Date & Time</label>
              <p className="text-gray-900 mt-1">{formatDate(appointment.appointmentDate)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <div className="mt-1">
                {getStatusBadge(appointment.status)}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Total Fee</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {formatCurrency(appointment.totalFee)}
              </p>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Medical Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Diagnosis</label>
              <p className="text-gray-900 mt-1">
                {appointment.diagnosis || 'Not yet diagnosed'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Treatments</label>
              {appointment.treatments && appointment.treatments.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {appointment.treatments.map((treatment) => (
                    <div key={treatment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-900">{treatment.name}</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(treatment.price)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mt-1">No treatments assigned</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prescription */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prescription</h3>
          {appointment.prescription ? (
            <div className="space-y-3">
              <p className="text-gray-600">Prescription has been created</p>
              <Link
                href={`/dashboard/prescriptions/${appointment.prescription.id}`}
                className="btn-primary btn-sm inline-flex items-center"
              >
                <BeakerIcon className="w-4 h-4 mr-2" />
                View Prescription
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-600">No prescription created yet</p>
              {canCreatePrescription && (
                <Link
                  href={`/dashboard/prescriptions/create?appointment=${appointment.id}`}
                  className="btn-primary btn-sm inline-flex items-center"
                >
                  <BeakerIcon className="w-4 h-4 mr-2" />
                  Add Prescription
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Reservation */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservation</h3>
          {appointment.reservation ? (
            <div className="space-y-3">
              <p className="text-gray-600">Room reservation has been made</p>
              <Link
                href={`/dashboard/reservations/${appointment.reservation.id}`}
                className="btn-primary btn-sm inline-flex items-center"
              >
                <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                View Reservation
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-600">No room reservation made</p>
              {canCreateReservation && (
                <Link
                  href={`/dashboard/reservations/create?appointment=${appointment.id}`}
                  className="btn-primary btn-sm inline-flex items-center"
                >
                  <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                  Make Reservation
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="font-medium text-gray-600">Created At</label>
            <p className="text-gray-900">{formatDate(appointment.createdAt)}</p>
          </div>
          <div>
            <label className="font-medium text-gray-600">Created By</label>
            <p className="text-gray-900">{appointment.createdBy || '-'}</p>
          </div>
          <div>
            <label className="font-medium text-gray-600">Updated At</label>
            <p className="text-gray-900">{formatDate(appointment.updatedAt)}</p>
          </div>
          <div>
            <label className="font-medium text-gray-600">Updated By</label>
            <p className="text-gray-900">{appointment.updatedBy || '-'}</p>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="modal-container">
          <div className="modal-backdrop" onClick={() => setShowStatusModal(false)}></div>
          <div className="flex items-center justify-center min-h-full p-4">
            <div className="modal-content">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Update Appointment Status
                </h3>
                
                <div className="space-y-3 mb-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value={APPOINTMENT_STATUS.DONE}
                      checked={newStatus === APPOINTMENT_STATUS.DONE}
                      onChange={(e) => setNewStatus(Number(e.target.value))}
                      className="form-checkbox"
                      disabled={!appointment.diagnosis || !appointment.treatments?.length}
                    />
                    <span className="ml-2">Mark as Done</span>
                    {(!appointment.diagnosis || !appointment.treatments?.length) && (
                      <span className="ml-2 text-xs text-red-500">(Diagnosis & treatments required)</span>
                    )}
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value={APPOINTMENT_STATUS.CANCELLED}
                      checked={newStatus === APPOINTMENT_STATUS.CANCELLED}
                      onChange={(e) => setNewStatus(Number(e.target.value))}
                      className="form-checkbox"
                    />
                    <span className="ml-2">Cancel Appointment</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    className="btn-primary"
                    disabled={newStatus === appointment.status}
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-container">
          <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}></div>
          <div className="flex items-center justify-center min-h-full p-4">
            <div className="modal-content">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Delete Appointment
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this appointment? This action cannot be undone.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="btn-danger"
                  >
                    Delete
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