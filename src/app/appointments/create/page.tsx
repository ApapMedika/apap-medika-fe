'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Calendar, User, Stethoscope } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Patient {
  id: string;
  user: { name: string };
  nik: string;
  birth_date: string;
  p_class: number;
}

interface Doctor {
  id: string;
  user: { name: string };
  specialization: number;
  fee: number;
}

interface Schedule {
  date: string;
  formatted: string;
}

export default function CreateAppointmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [nikSearch, setNikSearch] = useState('');

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      fetchDoctorSchedules();
    }
  }, [selectedDoctor]);

  const fetchPatients = async () => {
    try {
      const response = await apiClient.getPatients();
      setPatients(response.results || response);
    } catch (error) {
      toast.error('Failed to fetch patients');
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await apiClient.getDoctors();
      setDoctors(response.results || response);
    } catch (error) {
      toast.error('Failed to fetch doctors');
    }
  };

  const fetchDoctorSchedules = async () => {
    if (!selectedDoctor) return;
    try {
      const response = await apiClient.getDoctorSchedule(selectedDoctor.id);
      setSchedules(response.available_dates || []);
    } catch (error) {
      toast.error('Failed to fetch doctor schedules');
    }
  };

  const searchPatientByNik = async () => {
    if (!nikSearch) {
      toast.error('Please enter NIK');
      return;
    }

    try {
      const response = await apiClient.getPatientByNik(nikSearch);
      setSelectedPatient(response);
      setStep(2);
    } catch (error) {
      toast.error('Patient not found');
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatient || !selectedDoctor || !selectedSchedule) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const appointmentData = {
        patient_id: selectedPatient.id,
        doctor_id: selectedDoctor.id,
        date: selectedSchedule,
      };

      await apiClient.createAppointment(appointmentData);
      toast.success('Appointment created successfully');
      router.push('/dashboard/appointments');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/appointments">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Appointment</h1>
          <p className="text-gray-600">Schedule a new appointment with a doctor</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {stepNum}
            </div>
            {stepNum < 3 && (
              <div className={`w-16 h-1 mx-2 ${
                step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Patient */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Step 1: Select Patient
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* NIK Search */}
            <div className="space-y-4">
              <Label>Search by NIK</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter patient NIK (16 digits)"
                  value={nikSearch}
                  onChange={(e) => setNikSearch(e.target.value)}
                  maxLength={16}
                />
                <Button onClick={searchPatientByNik}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or select from list</span>
              </div>
            </div>

            {/* Patient List */}
            <div className="space-y-2">
              <Label>Select Patient</Label>
              <Select onValueChange={(value) => {
                const patient = patients.find(p => p.id === value);
                if (patient) {
                  setSelectedPatient(patient);
                  setStep(2);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.nik} - {patient.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Doctor */}
      {step === 2 && selectedPatient && (
        <div className="space-y-6">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle>Selected Patient</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedPatient.user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">NIK</p>
                  <p className="font-medium">{selectedPatient.nik}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Birth Date</p>
                  <p className="font-medium">{new Date(selectedPatient.birth_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Class</p>
                  <p className="font-medium">Class {selectedPatient.p_class}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Doctor Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Step 2: Select Doctor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Choose Doctor</Label>
                <Select onValueChange={(value) => {
                  const doctor = doctors.find(d => d.id === value);
                  setSelectedDoctor(doctor || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.user.name} - {formatCurrency(doctor.fee)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedDoctor && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium">Dr. {selectedDoctor.user.name}</p>
                  <p className="text-sm text-gray-600">Consultation Fee: {formatCurrency(selectedDoctor.fee)}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)} 
                  disabled={!selectedDoctor}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Select Schedule */}
      {step === 3 && selectedDoctor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Step 3: Select Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Available Schedules</Label>
              <Select value={selectedSchedule} onValueChange={setSelectedSchedule}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose appointment date and time" />
                </SelectTrigger>
                <SelectContent>
                  {schedules.map((schedule) => (
                    <SelectItem key={schedule.date} value={schedule.date}>
                      {schedule.formatted}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {schedules.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No available schedules for this doctor
              </p>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!selectedSchedule || loading}
              >
                {loading ? 'Creating...' : 'Create Appointment'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}