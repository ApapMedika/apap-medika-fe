'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Stethoscope, 
  FileText, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Plus,
  Building2
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Appointment {
  id: string;
  patient: {
    id: string;
    user: { name: string };
    nik: string;
    birth_date: string;
  };
  doctor: {
    id: string;
    user: { name: string };
    specialization: number;
  };
  date: string;
  status: number;
  diagnosis?: string;
  treatments?: { id: number; name: string; price: number }[];
  total_fee: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  prescription?: {
    id: string;
    status: number;
  };
  reservation?: {
    id: string;
  };
}

const statusMap = {
  0: { label: 'Created', color: 'bg-blue-100 text-blue-800' },
  1: { label: 'Done', color: 'bg-green-100 text-green-800' },
  2: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchAppointment();
    }
  }, [params.id]);

  const fetchAppointment = async () => {
    try {
      const response = await apiClient.getAppointmentById(params.id as string);
      setAppointment(response);
    } catch (error) {
      toast.error('Failed to fetch appointment details');
      router.push('/dashboard/appointments');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: number) => {
    if (!appointment) return;

    setActionLoading(true);
    try {
      await apiClient.updateAppointmentStatus(appointment.id, status);
      toast.success('Appointment status updated successfully');
      fetchAppointment();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteAppointment = async () => {
    if (!appointment) return;

    setActionLoading(true);
    try {
      await apiClient.deleteAppointment(appointment.id);
      toast.success('Appointment deleted successfully');
      router.push('/dashboard/appointments');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center">
        <p className="text-gray-500">Appointment not found</p>
        <Link href="/dashboard/appointments">
          <Button className="mt-4">Back to Appointments</Button>
        </Link>
      </div>
    );
  }

  const canEdit = user?.role === 'admin';
  const canUpdateDiagnosis = user?.role === 'doctor';
  const canCreatePrescription = user?.role === 'doctor' && appointment.status === 0;
  const canCreateReservation = user?.role === 'nurse' && appointment.status === 0;
  const isAppointmentToday = new Date(appointment.date).toDateString() === new Date().toDateString();
  const canMarkDone = canEdit && appointment.diagnosis && appointment.treatments?.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/appointments">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointment Details</h1>
            <p className="text-gray-600">ID: {appointment.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            statusMap[appointment.status as keyof typeof statusMap]?.color
          }`}>
            {statusMap[appointment.status as keyof typeof statusMap]?.label}
          </span>
        </div>
      </div>

      {/* Main Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{appointment.patient.user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">NIK</p>
              <p className="font-medium">{appointment.patient.nik}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Birth Date</p>
              <p className="font-medium">{new Date(appointment.patient.birth_date).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Doctor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">Dr. {appointment.doctor.user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Specialization</p>
              <p className="font-medium">Specialization {appointment.doctor.specialization}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Appointment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Date & Time</p>
              <p className="font-medium">{formatDate(appointment.date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Fee</p>
              <p className="font-medium text-lg">{formatCurrency(appointment.total_fee)}</p>
            </div>
          </div>

          {appointment.diagnosis && (
            <div>
              <p className="text-sm text-gray-500">Diagnosis</p>
              <p className="font-medium">{appointment.diagnosis}</p>
            </div>
          )}

          {appointment.treatments && appointment.treatments.length > 0 && (
            <div>
              <p className="text-sm text-gray-500">Treatments</p>
              <div className="space-y-2">
                {appointment.treatments.map((treatment) => (
                  <div key={treatment.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>{treatment.name}</span>
                    <span className="font-medium">{formatCurrency(treatment.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Related Records */}
      {(appointment.prescription || appointment.reservation) && (
        <Card>
          <CardHeader>
            <CardTitle>Related Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {appointment.prescription && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Prescription</p>
                  <p className="text-sm text-gray-600">ID: {appointment.prescription.id}</p>
                </div>
                <Link href={`/dashboard/prescriptions/${appointment.prescription.id}`}>
                  <Button variant="outline" size="sm">View Details</Button>
                </Link>
              </div>
            )}
            
            {appointment.reservation && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Room Reservation</p>
                  <p className="text-sm text-gray-600">ID: {appointment.reservation.id}</p>
                </div>
                <Link href={`/dashboard/reservations/${appointment.reservation.id}`}>
                  <Button variant="outline" size="sm">View Details</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {/* Admin Actions */}
            {canEdit && appointment.status === 0 && (
              <>
                <Link href={`/dashboard/appointments/${appointment.id}/edit`}>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Update Appointment
                  </Button>
                </Link>

                {canMarkDone && (
                  <Button onClick={() => updateStatus(1)} disabled={actionLoading}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Done
                  </Button>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Appointment</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel this appointment? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">No, Keep It</Button>
                      <Button variant="destructive" onClick={() => updateStatus(2)}>
                        Yes, Cancel
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Appointment</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this appointment? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Cancel</Button>
                      <Button variant="destructive" onClick={deleteAppointment}>
                        Delete
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {/* Doctor Actions */}
            {canUpdateDiagnosis && appointment.status === 0 && isAppointmentToday && (
              <Link href={`/dashboard/appointments/${appointment.id}/diagnose`}>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Update Diagnosis & Treatment
                </Button>
              </Link>
            )}

            {canCreatePrescription && !appointment.prescription && (
              <Link href={`/dashboard/prescriptions/create?appointment=${appointment.id}`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Prescription
                </Button>
              </Link>
            )}

            {/* Nurse Actions */}
            {canCreateReservation && !appointment.reservation && (
              <Link href={`/dashboard/reservations/create?appointment=${appointment.id}`}>
                <Button>
                  <Building2 className="h-4 w-4 mr-2" />
                  Make Reservation
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Created At</p>
              <p>{new Date(appointment.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Created By</p>
              <p>{appointment.created_by}</p>
            </div>
            <div>
              <p className="text-gray-500">Updated At</p>
              <p>{new Date(appointment.updated_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Updated By</p>
              <p>{appointment.updated_by}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}