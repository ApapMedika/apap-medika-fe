'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/utils/format';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  gender: boolean;
  createdAt: string;
  // Patient specific
  nik?: string;
  pClass?: number;
  // Doctor specific
  specialization?: number;
}

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">Only administrators can manage users.</p>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (roleFilter) params.role = roleFilter;
      
      const data = await apiClient.getUsers(params);
      setUsers(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeClass = async (newClass: number) => {
    if (!selectedPatient) return;

    try {
      await apiClient.upgradePatientClass(selectedPatient.id, newClass);
      toast.success(`Patient class upgraded to Class ${newClass}`);
      setUpgradeModalOpen(false);
      setSelectedPatient(null);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to upgrade patient class');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UserGroupIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage system users and patient classes</p>
          </div>
        </div>
        <button
          onClick={fetchUsers}
          className="btn-outline btn-sm"
          disabled={loading}
        >
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
            <option value="pharmacist">Pharmacist</option>
            <option value="patient">Patient</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner w-8 h-8"></div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">User</th>
                  <th className="table-header-cell">Role</th>
                  <th className="table-header-cell">Gender</th>
                  <th className="table-header-cell">Created</th>
                  <th className="table-header-cell">Class</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="table-cell">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.name}</p>
                          <p className="text-sm text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${
                        u.role === 'admin' ? 'badge-primary' :
                        u.role === 'doctor' ? 'badge-success' :
                        u.role === 'nurse' ? 'badge-warning' :
                        u.role === 'pharmacist' ? 'badge-danger' :
                        'badge-gray'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="table-cell">
                      {u.gender ? 'Female' : 'Male'}
                    </td>
                    <td className="table-cell">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="table-cell">
                      {u.role === 'patient' && u.pClass ? (
                        <span className="badge badge-primary">
                          Class {u.pClass}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="table-cell">
                      {u.role === 'patient' && u.pClass && u.pClass < 3 && (
                        <button
                          onClick={() => {
                            setSelectedPatient(u);
                            setUpgradeModalOpen(true);
                          }}
                          className="btn-primary btn-sm"
                        >
                          Upgrade Class
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {upgradeModalOpen && selectedPatient && (
        <div className="modal-container">
          <div className="modal-backdrop" onClick={() => setUpgradeModalOpen(false)}></div>
          <div className="flex items-center justify-center min-h-full p-4">
            <div className="modal-content">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Upgrade Patient Class
                </h3>
                <p className="text-gray-600 mb-6">
                  Upgrade {selectedPatient.name} from Class {selectedPatient.pClass} to:
                </p>
                
                <div className="space-y-3">
                  {selectedPatient.pClass === 3 && (
                    <button
                      onClick={() => handleUpgradeClass(2)}
                      className="w-full btn-primary"
                    >
                      Upgrade to Class 2 (Rp 50,000,000 limit)
                    </button>
                  )}
                  {selectedPatient.pClass && selectedPatient.pClass >= 2 && (
                    <button
                      onClick={() => handleUpgradeClass(1)}
                      className="w-full btn-primary"
                    >
                      Upgrade to Class 1 (Rp 100,000,000 limit)
                    </button>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setUpgradeModalOpen(false)}
                    className="btn-secondary"
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