# Frontend Code Changes - Teacher-First Registration Implementation

## Creator Module UI Workflow Applied

This document outlines the specific frontend code changes needed to implement teacher-first registration, following the Creator Module UI workflow standards.

## TypeScript Types and Interfaces

### 1. resources/js/types/teacher.ts

**Current Issues to Address**:
- Missing email, first_name, last_name fields
- user_id needs to be optional
- Need user account status indicators

**Required Changes**:

```typescript
export interface Teacher {
  id: number;
  user_id?: number | null;
  email: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  department?: string | null;
  rank?: string | null;
  employment_type: 'full_time' | 'part_time' | 'casual';
  employment_type_label?: string;
  date_hired?: string | null;
  phone?: string | null;
  address?: string | null;
  is_active: boolean;
  has_user_account: boolean;
  full_name: string;
  created_at: string;
  updated_at: string;
  
  // Relationships
  user?: User | null;
  assignments_count?: number;
  active_assignments_count?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
  roles?: Role[];
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  display_name?: string;
  description?: string;
  is_active?: boolean;
}

export interface CreateTeacherRequest {
  email: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  department?: string;
  rank?: string;
  employment_type: 'full_time' | 'part_time' | 'casual';
  date_hired?: string;
  phone?: string;
  address?: string;
  is_active?: boolean;
}

export interface UpdateTeacherRequest extends Partial<CreateTeacherRequest> {
  user_id?: number | null;
}

export interface CreateUserAccountRequest {
  name: string;
  password: string;
  password_confirmation: string;
  roles?: string[];
}

export interface LinkUserAccountRequest {
  user_id: number;
  roles?: string[];
}

export interface TeacherFilters {
  search?: string;
  without_user?: boolean;
  is_active?: boolean;
  department?: string;
  employment_type?: string;
}
```

## Pages

### 1. resources/js/pages/teachers/create.tsx

**Current Issues to Address**:
- Remove user account selection
- Add email, first_name, last_name fields
- Update validation schema
- Update form submission

**Required Changes**:

```typescript
import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/AppLayout';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateTeacherRequest } from '@/types/teacher';

const createTeacherSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  first_name: z.string().min(1, 'First name is required').max(255, 'First name must be less than 255 characters'),
  last_name: z.string().min(1, 'Last name is required').max(255, 'Last name must be less than 255 characters'),
  employee_id: z.string().min(1, 'Employee ID is required').max(50, 'Employee ID must be less than 50 characters'),
  department: z.string().max(255, 'Department must be less than 255 characters').optional().nullable(),
  rank: z.string().max(100, 'Rank must be less than 100 characters').optional().nullable(),
  employment_type: z.enum(['full_time', 'part_time', 'casual']),
  date_hired: z.string().optional().nullable(),
  phone: z.string().max(20, 'Phone number must be less than 20 characters').optional().nullable(),
  address: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

type CreateTeacherFormData = z.infer<typeof createTeacherSchema>;

interface CreateTeacherProps {
  employmentTypes: Array<{ value: string; label: string }>;
}

export default function CreateTeacher({ employmentTypes }: CreateTeacherProps) {
  const { data, setData, post, processing, errors, reset } = useForm<CreateTeacherFormData>({
    email: '',
    first_name: '',
    last_name: '',
    employee_id: '',
    department: '',
    rank: '',
    employment_type: 'full_time',
    date_hired: '',
    phone: '',
    address: '',
    is_active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('teachers.store'), {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <AppLayout>
      <Head title="Create Teacher" />

      <div className="max-w-2xl mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Teacher</CardTitle>
            <CardDescription>
              Register a new teacher profile. User accounts can be created later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      type="text"
                      value={data.first_name}
                      onChange={(e) => setData('first_name', e.target.value)}
                      placeholder="Enter first name"
                      required
                    />
                    {errors.first_name && (
                      <p className="text-sm text-destructive">{errors.first_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      type="text"
                      value={data.last_name}
                      onChange={(e) => setData('last_name', e.target.value)}
                      placeholder="Enter last name"
                      required
                    />
                    {errors.last_name && (
                      <p className="text-sm text-destructive">{errors.last_name}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="teacher@example.com"
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Employment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Employment Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee_id">Employee ID</Label>
                    <Input
                      id="employee_id"
                      type="text"
                      value={data.employee_id}
                      onChange={(e) => setData('employee_id', e.target.value)}
                      placeholder="Enter employee ID"
                      required
                    />
                    {errors.employee_id && (
                      <p className="text-sm text-destructive">{errors.employee_id}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employment_type">Employment Type</Label>
                    <Select
                      value={data.employment_type}
                      onValueChange={(value) => setData('employment_type', value as 'full_time' | 'part_time' | 'casual')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                      <SelectContent>
                        {employmentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.employment_type && (
                      <p className="text-sm text-destructive">{errors.employment_type}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      type="text"
                      value={data.department || ''}
                      onChange={(e) => setData('department', e.target.value)}
                      placeholder="Enter department"
                    />
                    {errors.department && (
                      <p className="text-sm text-destructive">{errors.department}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rank">Academic Rank</Label>
                    <Input
                      id="rank"
                      type="text"
                      value={data.rank || ''}
                      onChange={(e) => setData('rank', e.target.value)}
                      placeholder="Enter academic rank"
                    />
                    {errors.rank && (
                      <p className="text-sm text-destructive">{errors.rank}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_hired">Date Hired</Label>
                  <Input
                    id="date_hired"
                    type="date"
                    value={data.date_hired || ''}
                    onChange={(e) => setData('date_hired', e.target.value)}
                  />
                  {errors.date_hired && (
                    <p className="text-sm text-destructive">{errors.date_hired}</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={data.phone || ''}
                    onChange={(e) => setData('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={data.address || ''}
                    onChange={(e) => setData('address', e.target.value)}
                    placeholder="Enter residential address"
                    rows={3}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">{errors.address}</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={data.is_active}
                  onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                />
                <Label htmlFor="is_active">Teacher is active</Label>
              </div>

              <Alert>
                <AlertDescription>
                  Note: User account for login access can be created separately after teacher profile is created.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                  Create Teacher
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
```

### 2. resources/js/pages/teachers/index.tsx

**Current Issues to Address**:
- Update table columns for new fields
- Add user account status indicator
- Add filters for teachers without accounts
- Add actions for creating/linking user accounts

**Required Changes**:

```typescript
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, UserPlus, UserX, Filter } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { Teacher, TeacherFilters } from '@/types/teacher';
import { PaginatedData } from '@/types/common';

interface TeachersIndexProps {
  teachers: PaginatedData<Teacher>;
  filters: TeacherFilters;
  employmentTypes: Array<{ value: string; label: string }>;
}

export default function TeachersIndex({ teachers, filters, employmentTypes }: TeachersIndexProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('teachers.index'), { ...filters, search }, { preserveState: true });
  };

  const handleFilterChange = (key: keyof TeacherFilters, value: any) => {
    router.get(route('teachers.index'), { ...filters, [key]: value }, { preserveState: true });
  };

  const createUserAccount = (teacherId: number) => {
    router.get(route('teachers.create-user-account', teacherId));
  };

  const linkUserAccount = (teacherId: number) => {
    router.get(route('teachers.link-user-account', teacherId));
  };

  const unlinkUserAccount = (teacherId: number) => {
    if (confirm('Are you sure you want to unlink the user account from this teacher?')) {
      router.delete(route('teachers.unlink-user-account', teacherId));
    }
  };

  return (
    <AppLayout>
      <Head title="Teachers" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Teachers</h1>
            <p className="text-muted-foreground">
              Manage teacher profiles and user accounts
            </p>
          </div>
          <Link href={route('teachers.create')}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Teacher
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Search & Filters</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search teachers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </form>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="without_user"
                    checked={filters.without_user || false}
                    onCheckedChange={(checked) => handleFilterChange('without_user', checked)}
                  />
                  <label htmlFor="without_user" className="text-sm">
                    Without User Account
                  </label>
                </div>

                <Select
                  value={filters.is_active?.toString() || ''}
                  onValueChange={(value) => handleFilterChange('is_active', value ? value === 'true' : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.employment_type || ''}
                  onValueChange={(value) => handleFilterChange('employment_type', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Employment Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {employmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.department || ''}
                  onValueChange={(value) => handleFilterChange('department', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    {/* Departments would be populated from API */}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teachers Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Teachers ({teachers.total})
              {filters.without_user && (
                <Badge variant="secondary" className="ml-2">
                  Without User Account
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Employment Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>User Account</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.data.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{teacher.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {teacher.rank}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>{teacher.employee_id}</TableCell>
                    <TableCell>{teacher.department || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {teacher.employment_type_label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={teacher.is_active ? 'default' : 'secondary'}>
                        {teacher.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {teacher.has_user_account ? (
                        <div className="flex items-center space-x-1">
                          <Badge variant="default">
                            <UserPlus className="w-3 h-3 mr-1" />
                            Linked
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {teacher.user?.name}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="secondary">
                          <UserX className="w-3 h-3 mr-1" />
                          No Account
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={route('teachers.show', teacher.id)}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        <Link href={route('teachers.edit', teacher.id)}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        {!teacher.has_user_account ? (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => createUserAccount(teacher.id)}
                          >
                            Create Account
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => unlinkUserAccount(teacher.id)}
                          >
                            Unlink
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {teachers.links && teachers.links.length > 3 && (
              <div className="flex justify-center mt-4">
                <div className="flex space-x-1">
                  {teachers.links.map((link, index) => (
                    <Link
                      key={index}
                      href={link.url || '#'}
                      className={`px-3 py-2 rounded-md text-sm ${
                        link.active
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                      dangerouslySetInnerHTML={{ __html: link.label || '' }}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
```

### 3. resources/js/pages/teachers/show.tsx

**Current Issues to Address**:
- Display new fields
- Show user account status
- Add user account creation/linking interface

**Required Changes**:

```typescript
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, UserPlus, UserX, Mail, Phone, MapPin, Calendar, Briefcase } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { Teacher, Role } from '@/types/teacher';

interface TeacherShowProps {
  teacher: Teacher;
  availableRoles: Role[];
  availableUsers: Array<{ id: number; name: string; email: string }>;
}

export default function TeacherShow({ teacher, availableRoles, availableUsers }: TeacherShowProps) {
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [showLinkUserDialog, setShowLinkUserDialog] = useState(false);

  const createUserAccount = (data: any) => {
    router.post(route('teachers.create-user-account', teacher.id), data, {
      onSuccess: () => setShowCreateUserDialog(false),
    });
  };

  const linkUserAccount = (data: any) => {
    router.post(route('teachers.link-user-account', teacher.id), data, {
      onSuccess: () => setShowLinkUserDialog(false),
    });
  };

  const unlinkUserAccount = () => {
    if (confirm('Are you sure you want to unlink the user account from this teacher?')) {
      router.delete(route('teachers.unlink-user-account', teacher.id));
    }
  };

  return (
    <AppLayout>
      <Head title={`${teacher.full_name} - Teacher Details`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href={route('teachers.index')}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{teacher.full_name}</h1>
              <p className="text-muted-foreground">Teacher Profile</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href={route('teachers.edit', teacher.id)}>
              <Button>Edit</Button>
            </Link>
            {!teacher.has_user_account ? (
              <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create User Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create User Account</DialogTitle>
                    <DialogDescription>
                      Create a login account for {teacher.full_name}
                    </DialogDescription>
                  </DialogHeader>
                  <CreateUserAccountForm
                    teacherEmail={teacher.email}
                    availableRoles={availableRoles}
                    onSubmit={createUserAccount}
                  />
                </DialogContent>
              </Dialog>
            ) : (
              <Button variant="destructive" onClick={unlinkUserAccount}>
                <UserX className="w-4 h-4 mr-2" />
                Unlink Account
              </Button>
            )}
          </div>
        </div>

        {/* User Account Status */}
        <Card>
          <CardHeader>
            <CardTitle>User Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            {teacher.has_user_account && teacher.user ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="default">
                    <UserPlus className="w-3 h-3 mr-1" />
                    Account Linked
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    User: {teacher.user.name} ({teacher.user.email})
                  </span>
                </div>
                {teacher.user.roles && teacher.user.roles.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Roles:</span>
                    <div className="flex space-x-1">
                      {teacher.user.roles.map((role) => (
                        <Badge key={role.id} variant="outline">
                          {role.display_name || role.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    <UserX className="w-3 h-3 mr-1" />
                    No User Account
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Teacher profile exists but no login account
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create User Account</DialogTitle>
                        <DialogDescription>
                          Create a login account for {teacher.full_name}
                        </DialogDescription>
                      </DialogHeader>
                      <CreateUserAccountForm
                        teacherEmail={teacher.email}
                        availableRoles={availableRoles}
                        onSubmit={createUserAccount}
                      />
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showLinkUserDialog} onOpenChange={setShowLinkUserDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Link Existing User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Link Existing User</DialogTitle>
                        <DialogDescription>
                          Link an existing user account to {teacher.full_name}
                        </DialogDescription>
                      </DialogHeader>
                      <LinkUserAccountForm
                        availableUsers={availableUsers}
                        availableRoles={availableRoles}
                        onSubmit={linkUserAccount}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teacher Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Email:</span>
                <span>{teacher.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Date Hired:</span>
                <span>{teacher.date_hired ? new Date(teacher.date_hired).toLocaleDateString() : 'Not specified'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Phone:</span>
                <span>{teacher.phone || 'Not specified'}</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                <div>
                  <span className="font-medium">Address:</span>
                  <p className="text-sm text-muted-foreground">
                    {teacher.address || 'Not specified'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Employment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Employee ID:</span>
                <span>{teacher.employee_id}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">Department:</span>
                <span>{teacher.department || 'Not specified'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">Academic Rank:</span>
                <span>{teacher.rank || 'Not specified'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">Employment Type:</span>
                <Badge variant="outline">
                  {teacher.employment_type_label}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">Status:</span>
                <Badge variant={teacher.is_active ? 'default' : 'secondary'}>
                  {teacher.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Assignments Summary</CardTitle>
            <CardDescription>
              Current and historical assignment information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {teacher.active_assignments_count || 0}
                </div>
                <div className="text-sm text-muted-foreground">Active Assignments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {teacher.assignments_count || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Assignments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {/* Calculate unit load from assignments */}
                  0
                </div>
                <div className="text-sm text-muted-foreground">Current Unit Load</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

// Helper Components
function CreateUserAccountForm({ teacherEmail, availableRoles, onSubmit }: any) {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    password_confirmation: '',
    roles: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter user name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Enter password"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password_confirmation">Confirm Password</Label>
        <Input
          id="password_confirmation"
          type="password"
          value={formData.password_confirmation}
          onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
          placeholder="Confirm password"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Roles</Label>
        <div className="space-y-2">
          {availableRoles.map((role: Role) => (
            <div key={role.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`role-${role.id}`}
                checked={formData.roles.includes(role.name)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({ ...formData, roles: [...formData.roles, role.name] });
                  } else {
                    setFormData({ ...formData, roles: formData.roles.filter(r => r !== role.name) });
                  }
                }}
              />
              <label htmlFor={`role-${role.id}`} className="text-sm">
                {role.display_name || role.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Alert>
        <AlertDescription>
          User account will use email: {teacherEmail}
        </AlertDescription>
      </Alert>

      <div className="flex justify-end space-x-2">
        <Button type="submit">Create Account</Button>
      </div>
    </form>
  );
}

function LinkUserAccountForm({ availableUsers, availableRoles, onSubmit }: any) {
  const [formData, setFormData] = useState({
    user_id: '',
    roles: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="user_id">Select User</Label>
        <Select
          value={formData.user_id}
          onValueChange={(value) => setFormData({ ...formData, user_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a user" />
          </SelectTrigger>
          <SelectContent>
            {availableUsers.map((user: any) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.name} ({user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Roles</Label>
        <div className="space-y-2">
          {availableRoles.map((role: Role) => (
            <div key={role.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`role-${role.id}`}
                checked={formData.roles.includes(role.name)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({ ...formData, roles: [...formData.roles, role.name] });
                  } else {
                    setFormData({ ...formData, roles: formData.roles.filter(r => r !== role.name) });
                  }
                }}
              />
              <label htmlFor={`role-${role.id}`} className="text-sm">
                {role.display_name || role.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit">Link User</Button>
      </div>
    </form>
  );
}
```

## Services

### 1. resources/js/services/teacherService.ts

**Required Changes**:

```typescript
import axios from 'axios';
import { Teacher, CreateTeacherRequest, UpdateTeacherRequest, CreateUserAccountRequest, LinkUserAccountRequest } from '@/types/teacher';

const api = axios.create({
  baseURL: '/api',
});

export const teacherService = {
  // Get all teachers with filters
  async getTeachers(params?: any) {
    const response = await api.get('/teachers', { params });
    return response.data;
  },

  // Get teacher by ID
  async getTeacher(id: number) {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  // Create new teacher
  async createTeacher(data: CreateTeacherRequest) {
    const response = await api.post('/teachers', data);
    return response.data;
  },

  // Update teacher
  async updateTeacher(id: number, data: UpdateTeacherRequest) {
    const response = await api.put(`/teachers/${id}`, data);
    return response.data;
  },

  // Delete teacher
  async deleteTeacher(id: number) {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
  },

  // Create user account for teacher
  async createUserAccount(id: number, data: CreateUserAccountRequest) {
    const response = await api.post(`/teachers/${id}/create-user-account`, data);
    return response.data;
  },

  // Link existing user to teacher
  async linkUserAccount(id: number, data: LinkUserAccountRequest) {
    const response = await api.post(`/teachers/${id}/link-user-account`, data);
    return response.data;
  },

  // Unlink user account from teacher
  async unlinkUserAccount(id: number) {
    const response = await api.delete(`/teachers/${id}/unlink-user-account`);
    return response.data;
  },

  // Get available users for linking
  async getAvailableUsers() {
    const response = await api.get('/users/available-for-teacher-linking');
    return response.data;
  },
};
```

## UI Components

### 1. resources/js/components/teachers/TeacherAccountStatus.tsx

**New Component**:

```typescript
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus, UserX } from 'lucide-react';
import { Teacher } from '@/types/teacher';

interface TeacherAccountStatusProps {
  teacher: Teacher;
  onCreateAccount?: () => void;
  onLinkAccount?: () => void;
  onUnlinkAccount?: () => void;
}

export default function TeacherAccountStatus({
  teacher,
  onCreateAccount,
  onLinkAccount,
  onUnlinkAccount,
}: TeacherAccountStatusProps) {
  if (teacher.has_user_account && teacher.user) {
    return (
      <div className="space-y-2">
        <Badge variant="default">
          <UserPlus className="w-3 h-3 mr-1" />
          Linked
        </Badge>
        <div className="text-sm text-muted-foreground">
          {teacher.user.name}
        </div>
        {onUnlinkAccount && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onUnlinkAccount}
          >
            <UserX className="w-3 h-3 mr-1" />
            Unlink
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Badge variant="secondary">
        <UserX className="w-3 h-3 mr-1" />
        No Account
      </Badge>
      <div className="flex space-x-2">
        {onCreateAccount && (
          <Button
            variant="default"
            size="sm"
            onClick={onCreateAccount}
          >
            <UserPlus className="w-3 h-3 mr-1" />
            Create
          </Button>
        )}
        {onLinkAccount && (
          <Button
            variant="outline"
            size="sm"
            onClick={onLinkAccount}
          >
            Link
          </Button>
        )}
      </div>
    </div>
  );
}
```

## UI/UX Standards Applied

1. **Consistent Design Language**: Using shadcn/ui components throughout
2. **Responsive Layout**: Mobile-first design with proper breakpoints
3. **Accessibility**: Proper labels, semantic HTML, keyboard navigation
4. **User Feedback**: Loading states, error messages, success notifications
5. **Progressive Disclosure**: Using dialogs and collapsible sections
6. **Visual Hierarchy**: Clear typography, spacing, and color usage
7. **Interactive Elements**: Hover states, focus states, transitions
8. **Data Visualization**: Badges, status indicators, progress displays
9. **Form Validation**: Real-time validation with clear error messages
10. **Component Reusability**: Modular components for consistent UI patterns

## Key Features Implemented

1. **Teacher Registration Without User Account**: Updated form to collect email, first_name, last_name
2. **User Account Management**: Create, link, and unlink user accounts from teacher profiles
3. **Visual Status Indicators**: Clear badges showing account linkage status
4. **Advanced Filtering**: Filter teachers by user account status and other criteria
5. **Responsive Tables**: Mobile-friendly teacher listing with all relevant information
6. **Modal Dialogs**: User-friendly dialogs for account creation and linking
7. **Form Validation**: Comprehensive validation with user-friendly error messages
8. **Search Functionality**: Real-time search across teacher fields
9. **Role Management**: Assign roles when creating/linking user accounts
10. **Consistent Navigation**: Breadcrumbs and back navigation for better UX
