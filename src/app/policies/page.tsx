'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Plus, 
  Search, 
  Eye, 
  Building,
  User,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Policy {
  id: string;
  patient: {
    user: { name: string };
    nik: string;
  };
  company: {
    name: string;
  };
  status: number;
  expiry_date: string;
  total_coverage: number;
  total_covered: number;
  created_at: string;
}

const statusMap = {
  0: { label: 'Created', color: 'bg-blue-100 text-blue-800', icon: Clock },
  1: { label: 'Partially Claimed', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  2: { label: 'Fully Claimed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  3: { label: 'Expired', color: 'bg-red-100 text-red-800', icon: XCircle },
  4: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

export default function PoliciesPage() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [minCoverage, setMinCoverage] = useState('');
  const [maxCoverage, setMaxCoverage] = useState('');

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'patient') {
      fetchPolicies();
    }
  }, [user, statusFilter, minCoverage, maxCoverage]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (statusFilter) params.status = statusFilter;
      if (minCoverage) params.min_coverage = minCoverage;
      if (maxCoverage) params.max_coverage = maxCoverage;

      const response = await apiClient.getPolicies(params);
      setPolicies(response.results || response);
    } catch (error) {
      toast.error('Failed to fetch policies');
      console.error('Error fetching policies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!['admin', 'patient'].includes(user?.role || '')) {
    return (
      <div className="text-center py-8">
        <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">Access denied. Admin or Patient access required.</p>
      </div>
    );
  }

  const filteredPolicies = policies.filter(policy => 
    policy.patient.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const canCreate = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Insurance Policies</h1>
          <p className="text-gray-600">
            {user?.role === 'admin' && 'Manage insurance policies for all patients'}
            {user?.role === 'patient' && 'View your insurance coverage and policies'}
          </p>
        </div>
        
        {canCreate && (
          <Link href="/dashboard/policies/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Policy
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search policies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="0">Created</SelectItem>
                  <SelectItem value="1">Partially Claimed</SelectItem>
                  <SelectItem value="2">Fully Claimed</SelectItem>
                  <SelectItem value="3">Expired</SelectItem>
                  <SelectItem value="4">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Coverage Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Min Coverage</label>
              <Input
                type="number"
                placeholder="Minimum amount"
                value={minCoverage}
                onChange={(e) => setMinCoverage(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Max Coverage</label>
              <Input
                type="number"
                placeholder="Maximum amount"
                value={maxCoverage}
                onChange={(e) => setMaxCoverage(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policies Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Policies ({filteredPolicies.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredPolicies.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No policies found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-gray-900">Policy ID</th>
                    {user?.role === 'admin' && (
                      <th className="text-left p-3 font-medium text-gray-900">Patient</th>
                    )}
                    <th className="text-left p-3 font-medium text-gray-900">Company</th>
                    <th className="text-left p-3 font-medium text-gray-900">Total Coverage</th>
                    <th className="text-left p-3 font-medium text-gray-900">Status</th>
                    <th className="text-left p-3 font-medium text-gray-900">Expiry Date</th>
                    <th className="text-left p-3 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPolicies.map((policy) => {
                    const status = statusMap[policy.status as keyof typeof statusMap];
                    const StatusIcon = status.icon;
                    const isExpired = new Date(policy.expiry_date) < new Date();
                    
                    return (
                      <tr key={policy.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-sm">{policy.id}</td>
                        {user?.role === 'admin' && (
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-blue-600" />
                              <div>
                                <p className="font-medium">{policy.patient.user.name}</p>
                                <p className="text-sm text-gray-500">NIK: {policy.patient.nik}</p>
                              </div>
                            </div>
                          </td>
                        )}
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-600" />
                            <span>{policy.company.name}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{formatCurrency(policy.total_coverage)}</p>
                            {policy.total_covered > 0 && (
                              <p className="text-sm text-gray-500">
                                Used: {formatCurrency(policy.total_covered)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <StatusIcon className="h-4 w-4" />
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isExpired && policy.status < 3 ? 'bg-red-100 text-red-800' : status.color
                            }`}>
                              {isExpired && policy.status < 3 ? 'Expired' : status.label}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className={`text-sm ${isExpired ? 'text-red-600' : ''}`}>
                              {formatDate(policy.expiry_date)}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Link href={`/dashboard/policies/${policy.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
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