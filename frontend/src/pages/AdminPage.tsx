import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertCircle, CheckCircle, Link as LinkIcon, XCircle,
  Users, BarChart3, UserCheck, Trash2, MoreVertical, UserX, UserCog
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"; // Import Table
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import Dropdown
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Import Alert Dialog
import { Role } from "@/lib/roles"; // Import Role enum
import { useAuth } from "@/context/AuthContext"; // Import useAuth

// --- TYPE DEFINITIONS ---
interface PendingProfile {
  user_id: number;
  application_message: string;
  subjects_applying_for: string;
  credentials_url: string;
  user: {
    id: number;
    name: string;
    email: string;
    created_at: string;
  };
}

interface SiteStats {
  totalUsers: number;
  totalTutors: number;
  totalBookings: number;
  pendingApps: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  created_at: string;
}

// --- API FUNCTIONS ---
const fetchPendingTutors = async () => {
  const { data } = await api.get("/admin/pending-tutors");
  return data;
};

const approveTutor = async (userId: number) => {
  const { data } = await api.post(`/admin/approve-tutor/${userId}`);
  return data;
};

const rejectTutor = async ({ userId, message }: { userId: number, message: string }) => {
  const { data } = await api.post(`/admin/reject-tutor/${userId}`, {
    rejection_message: message,
  });
  return data;
};

// New API functions
const fetchStats = async () => {
  const { data } = await api.get("/admin/stats");
  return data;
};

const fetchAllUsers = async () => {
  const { data } = await api.get("/admin/users");
  return data;
};

const deleteUser = async (userId: number) => {
  await api.delete(`/admin/user/${userId}`);
};

const updateUserRole = async ({ userId, newRole }: { userId: number, newRole: Role }) => {
  const { data } = await api.put(`/admin/user/${userId}/role`, { newRole });
  return data;
};


// --- ADMIN PAGE COMPONENT ---
const AdminPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <Tabs defaultValue="applications">
          <TabsList className="mb-6 grid w-full grid-cols-3">
            <TabsTrigger value="applications">
              <UserCheck className="h-4 w-4 mr-2" />
              Tutor Applications
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart3 className="h-4 w-4 mr-2" />
              Site Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <PendingTutorsTab />
          </TabsContent>
          <TabsContent value="users">
            <UserManagementTab />
          </TabsContent>
          <TabsContent value="stats">
            <SiteStatisticsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// --- TAB 1: PENDING TUTORS ---
const PendingTutorsTab = () => {
  const queryClient = useQueryClient();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<PendingProfile | null>(null);
  const [rejectionMessage, setRejectionMessage] = useState("");

  const { data: tutors, isLoading, isError } = useQuery<PendingProfile[]>({
    queryKey: ["pendingTutors"],
    queryFn: fetchPendingTutors,
  });

  const approveMutation = useMutation({
    mutationFn: approveTutor,
    onSuccess: (data, userId) => {
      toast.success(`Tutor (ID: ${userId}) approved successfully!`);
      queryClient.invalidateQueries({ queryKey: ["pendingTutors"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] }); // Refresh stats
      queryClient.invalidateQueries({ queryKey: ["allUsers"] }); // Refresh user list
    },
    onError: (error: any, userId) => {
      toast.error(`Failed to approve tutor (ID: ${userId}): ${error.response?.data?.message || error.message}`);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectTutor,
    onSuccess: (data, variables) => {
      toast.success(`Tutor (ID: ${variables.userId}) rejected successfully.`);
      queryClient.invalidateQueries({ queryKey: ["pendingTutors"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] }); // Refresh stats
      closeRejectModal();
    },
    onError: (error: any, variables) => {
      toast.error(`Failed to reject tutor (ID: ${variables.userId}): ${error.response?.data?.message || error.message}`);
    },
  });

  const openRejectModal = (tutor: PendingProfile) => {
    setSelectedTutor(tutor);
    setRejectionMessage("");
    setIsRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
    setSelectedTutor(null);
    setRejectionMessage("");
  };

  const handleSubmitRejection = () => {
    if (selectedTutor && rejectionMessage.trim()) {
      rejectMutation.mutate({ userId: selectedTutor.user_id, message: rejectionMessage });
    } else {
      toast.error("Please provide a rejection message.");
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  const isMutating = approveMutation.isPending || rejectMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Tutor Applications</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {isError && (
          <div className="text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <p>Failed to load applications.</p>
          </div>
        )}

        {!isLoading && !isError && tutors && tutors.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No pending applications.
          </p>
        )}

        {!isLoading && !isError && tutors && tutors.length > 0 && (
          <div className="space-y-4">
            {tutors.map((profile) => (
              <div key={profile.user_id} className="flex flex-col md:flex-row items-start justify-between rounded-lg border p-4">
                <div className="flex items-start gap-4 mb-4 md:mb-0">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{getInitials(profile.user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <p className="font-semibold">{profile.user.name} <span className="font-normal text-muted-foreground">({profile.user.email})</span></p>
                    <p className="text-sm text-muted-foreground italic border-l-4 pl-2">"{profile.application_message}"</p>
                    <div className="space-y-1">
                      <p className="text-xs font-medium">APPLYING FOR:</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.subjects_applying_for.split(',').map((sub: string) => (
                          <Badge key={sub} variant="secondary">{sub.trim()}</Badge>
                        ))}
                      </div>
                    </div>
                    {profile.credentials_url && (
                      <a href={profile.credentials_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" />
                        View Credentials
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                  <Button size="sm" className="w-full md:w-auto" onClick={() => approveMutation.mutate(profile.user.id)} disabled={isMutating}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive" className="w-full md:w-auto" onClick={() => openRejectModal(profile)} disabled={isMutating}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              You are rejecting the application for <span className="font-medium">{selectedTutor?.user.name}</span>. Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionMessage">Rejection Message</Label>
              <Textarea id="rejectionMessage" rows={5} placeholder="e.g., We are unable to approve your application at this time due to..." value={rejectionMessage} onChange={(e) => setRejectionMessage(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeRejectModal}>Cancel</Button>
            <Button variant="destructive" onClick={handleSubmitRejection} disabled={rejectMutation.isPending}>
              {rejectMutation.isPending ? "Rejecting..." : "Submit Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// --- TAB 2: USER MANAGEMENT ---
const UserManagementTab = () => {
  const { userId: adminId } = useAuth(); // Get current admin's ID
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: users, isLoading, isError } = useQuery<User[]>({
    queryKey: ["allUsers"],
    queryFn: fetchAllUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: (_, userId) => {
      toast.success(`User (ID: ${userId}) deleted successfully.`);
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] }); // Refresh stats
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any, userId) => {
      toast.error(`Failed to delete user (ID: ${userId}): ${error.response?.data?.message || error.message}`);
    },
  });

  const roleMutation = useMutation({
    mutationFn: updateUserRole,
    onSuccess: (data, variables) => {
      toast.success(`User (ID: ${variables.userId}) role updated to ${variables.newRole}.`);
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] }); // Refresh stats
    },
    onError: (error: any, variables) => {
      toast.error(`Failed to update role for user (ID: ${variables.userId}): ${error.response?.data?.message || error.message}`);
    },
  });

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const isMutating = deleteMutation.isPending || roleMutation.isPending;

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return <Badge variant="destructive">Admin</Badge>;
      case Role.tutor:
        return <Badge variant="default">Tutor</Badge>;
      default:
        return <Badge variant="outline">Student</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}
        {isError && <p className="text-destructive">Failed to load users.</p>}
        
        {!isLoading && !isError && users && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{format(new Date(user.created_at), "MMM dd, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={user.id === adminId || isMutating}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => roleMutation.mutate({ userId: user.id, newRole: Role.student })}>
                          <UserX className="h-4 w-4 mr-2" /> Make Student
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => roleMutation.mutate({ userId: user.id, newRole: Role.tutor })}>
                          <UserCheck className="h-4 w-4 mr-2" /> Make Tutor
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => roleMutation.mutate({ userId: user.id, newRole: Role.ADMIN })}>
                          <UserCog className="h-4 w-4 mr-2" /> Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onSelect={() => openDeleteModal(user)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user <span className="font-medium">{selectedUser?.name}</span> and all their associated data (bookings, reviews, etc.).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteMutation.mutate(selectedUser!.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

// --- TAB 3: SITE STATISTICS ---
const SiteStatisticsTab = () => {
  const { data: stats, isLoading, isError } = useQuery<SiteStats>({
    queryKey: ["stats"],
    queryFn: fetchStats,
  });

  const StatCard = ({ title, value, isLoading }: { title: string, value?: number, isLoading: boolean }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-1/2" />
        ) : (
          <div className="text-3xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {isError && <p className="text-destructive col-span-4">Failed to load statistics.</p>}
      <StatCard title="Total Users" value={stats?.totalUsers} isLoading={isLoading} />
      <StatCard title="Total Tutors" value={stats?.totalTutors} isLoading={isLoading} />
      <StatCard title="Total Bookings" value={stats?.totalBookings} isLoading={isLoading} />
      <StatCard title="Pending Applications" value={stats?.pendingApps} isLoading={isLoading} />
    </div>
  );
};

export default AdminPage;