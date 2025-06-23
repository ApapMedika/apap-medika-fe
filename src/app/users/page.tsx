'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  UserPlus,
  Shield,
  Stethoscope,
  User,
  Pill
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface EndUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  gender: boolean;
  created_at: string;
  is_active: boolean;
}

const roleIcons = {
  admin: Shield,
  doctor: Stethoscope,
  nurse: User,
  pharmacist: Pill,
  patient: User,
};

const roleColors = {
  admin: 'bg-red-100 text-red-800',
  doctor: 'bg-blue-100 text-blue-800',
  nurse: 'bg-green-100 text-green-800',
  pharmacist: 'bg-purple-100 text-purple-800',
  patient: 'bg-gray-100 text-gray-800',
};

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<EndUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (roleFilter) params.role = roleFilter;
      
      const response = await apiClient.getUsers(params);
      setUsers(response.results || response);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage all users in the system</p>
        </div>
        
        <Link href="/signup">
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add New User
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                  <SelectItem value="pharmacist">Pharmacist</SelectItem>
                  <SelectItem value="patient">Patient</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(
          users.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([role, count]) => {
          const Icon = roleIcons[role as keyof typeof roleIcons] || User;
          return (
            <Card key={role}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 capitalize">{role}s</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-gray-900">Name</th>
                    <th className="text-left p-3 font-medium text-gray-900">Email</th>
                    <th className="text-left p-3 font-medium text-gray-900">Role</th>
                    <th className="text-left p-3 font-medium text-gray-900">Gender</th>
                    <th className="text-left p-3 font-medium text-gray-900">Status</th>
                    <th className="text-left p-3 font-medium text-gray-900">Joined</th>
                    <th className="text-left p-3 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const Icon = roleIcons[user.role as keyof typeof roleIcons] || User;
                    return (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                          </div>
                        </td>
                        <td className="p-3">{user.email}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              roleColors[user.role as keyof typeof roleColors]
                            }`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">{user.gender ? 'Female' : 'Male'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}