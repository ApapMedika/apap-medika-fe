// app/dashboard/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Shield, 
  Stethoscope, 
  Edit,
  Save,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.getProfile();
      setProfile(response);
      setFormData(response);
    } catch (error) {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Update profile API call would go here
      // await apiClient.updateProfile(formData);
      setProfile(formData);
      setEditing(false);
      toast.success('Profile updated successfully');
      refreshUser();
    } catch (error) {
      toast.error('Failed to update profile');
    }
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

  if (!profile) {
    return (
      <div className="text-center">
        <p className="text-gray-500">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your personal information</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full font-medium">
            {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Guest'}
          </div>
          
          {!editing ? (
            <Button onClick={() => setEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => {
                setEditing(false);
                setFormData(profile);
              }}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              {editing ? (
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              ) : (
                <p className="font-medium">{profile.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Username</Label>
              {editing ? (
                <Input
                  value={formData.username || ''}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              ) : (
                <p className="font-medium">{profile.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <p className="font-medium">{profile.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <p className="font-medium">{profile.gender ? 'Female' : 'Male'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Specific Information */}
      {user?.role === 'patient' && profile.patient && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>NIK</Label>
                <p className="font-medium">{profile.patient.nik}</p>
              </div>
              
              <div>
                <Label>Birth Date</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="font-medium">
                    {new Date(profile.patient.birth_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <Label>Birth Place</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <p className="font-medium">{profile.patient.birth_place}</p>
                </div>
              </div>

              <div>
                <Label>Patient Class</Label>
                <p className="font-medium">Class {profile.patient.p_class}</p>
              </div>

              <div>
                <Label>Insurance Limit</Label>
                <p className="font-medium text-lg text-green-600">
                  {formatCurrency(profile.patient.insurance_limit)}
                </p>
              </div>

              <div>
                <Label>Available Limit</Label>
                <p className="font-medium text-lg text-blue-600">
                  {formatCurrency(profile.patient.available_limit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {user?.role === 'doctor' && profile.doctor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Doctor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Specialization</Label>
                <p className="font-medium">Specialization {profile.doctor.specialization}</p>
              </div>

              <div>
                <Label>Years of Experience</Label>
                <p className="font-medium">{profile.doctor.years_of_experience} years</p>
              </div>

              <div>
                <Label>Consultation Fee</Label>
                <p className="font-medium text-lg text-green-600">
                  {formatCurrency(profile.doctor.fee)}
                </p>
              </div>

              <div>
                <Label>Practice Schedule</Label>
                <div className="flex flex-wrap gap-1">
                  {profile.doctor.schedules?.map((day: number) => (
                    <span key={day} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-gray-500">Last updated 30 days ago</p>
              </div>
              <Button variant="outline">Change Password</Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
              <Button variant="outline">Enable 2FA</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Class Upgrade (Admin only) */}
      {user?.role === 'admin' && (
        <PatientClassUpgrade />
      )}
    </div>
  );
}

// Patient Class Upgrade Component
function PatientClassUpgrade() {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [newClass, setNewClass] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await apiClient.getPatients();
      setPatients(response.results || response);
    } catch (error) {
      toast.error('Failed to fetch patients');
    }
  };

  const upgradeClass = async () => {
    if (!selectedPatient || newClass >= selectedPatient.p_class) {
      toast.error('Please select a higher class');
      return;
    }

    setLoading(true);
    try {
      await apiClient.upgradePatientClass(selectedPatient.id, newClass);
      toast.success('Patient class upgraded successfully');
      fetchPatients();
      setSelectedPatient(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upgrade class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Class Upgrade</CardTitle>
        <CardDescription>
          Upgrade patient insurance class for higher coverage limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Patient</Label>
          <select
            className="w-full p-2 border rounded-md"
            value={selectedPatient?.id || ''}
            onChange={(e) => {
              const patient = patients.find(p => p.id === e.target.value);
              setSelectedPatient(patient || null);
            }}
          >
            <option value="">Choose a patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.user.name} - Class {patient.p_class}
              </option>
            ))}
          </select>
        </div>

        {selectedPatient && (
          <>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-medium">{selectedPatient.user.name}</p>
              <p className="text-sm text-gray-600">
                Current Class: {selectedPatient.p_class} | 
                Limit: {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                }).format(selectedPatient.insurance_limit)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>New Class</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={newClass}
                onChange={(e) => setNewClass(parseInt(e.target.value))}
              >
                {[1, 2, 3].filter(cls => cls < selectedPatient.p_class).map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls} - {cls === 1 ? 'Rp 100,000,000' : cls === 2 ? 'Rp 50,000,000' : 'Rp 25,000,000'}
                  </option>
                ))}
              </select>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button disabled={newClass >= selectedPatient.p_class}>
                  Upgrade Class
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Class Upgrade</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to upgrade {selectedPatient.user.name} from Class {selectedPatient.p_class} to Class {newClass}?
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={upgradeClass} disabled={loading}>
                    {loading ? 'Upgrading...' : 'Confirm Upgrade'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
}