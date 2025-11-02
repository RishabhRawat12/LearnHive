import { useState } from "react"; // --- IMPORT useState ---
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertCircle, CheckCircle, Link as LinkIcon, XCircle } from "lucide-react"; // --- IMPORT XCircle ---
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
// --- NEW IMPORTS FOR MODAL ---
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
// --- END NEW IMPORTS ---

// --- Define Profile Type ---
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

// API Functions
const fetchPendingTutors = async () => {
  const { data } = await api.get("/admin/pending-tutors");
  return data;
};

const approveTutor = async (userId: number) => {
  const { data } = await api.post(`/admin/approve-tutor/${userId}`);
  return data;
};

// --- NEW REJECT API FUNCTION ---
const rejectTutor = async ({ userId, message }: { userId: number, message: string }) => {
  const { data } = await api.post(`/admin/reject-tutor/${userId}`, {
    rejection_message: message,
  });
  return data;
};
// --- END NEW FUNCTION ---

const AdminPage = () => {
  const queryClient = useQueryClient();
  
  // --- NEW STATE FOR MODAL ---
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<PendingProfile | null>(null);
  const [rejectionMessage, setRejectionMessage] = useState("");
  // --- END NEW STATE ---

  const {
    data: tutors,
    isLoading,
    isError,
  } = useQuery<PendingProfile[]>({ // Use PendingProfile type
    queryKey: ["pendingTutors"],
    queryFn: fetchPendingTutors,
  });

  const approveMutation = useMutation({
    mutationFn: approveTutor,
    onSuccess: (data, userId) => {
      toast.success(`Tutor (ID: ${userId}) approved successfully!`);
      queryClient.invalidateQueries({ queryKey: ["pendingTutors"] });
    },
    onError: (error: any, userId) => {
      toast.error(`Failed to approve tutor (ID: ${userId}): ${error.response?.data?.message || error.message}`);
    },
  });

  // --- NEW REJECT MUTATION ---
  const rejectMutation = useMutation({
    mutationFn: rejectTutor,
    onSuccess: (data, variables) => {
      toast.success(`Tutor (ID: ${variables.userId}) rejected successfully.`);
      queryClient.invalidateQueries({ queryKey: ["pendingTutors"] });
      closeRejectModal(); // Close the modal on success
    },
    onError: (error: any, variables) => {
      toast.error(`Failed to reject tutor (ID: ${variables.userId}): ${error.response?.data?.message || error.message}`);
    },
  });
  // --- END NEW MUTATION ---

  // --- MODAL HELPER FUNCTIONS ---
  const openRejectModal = (tutor: PendingProfile) => {
    setSelectedTutor(tutor);
    setRejectionMessage(""); // Clear old message
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
  // --- END MODAL HELPERS ---

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  const isMutating = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
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
                  <div
                    key={profile.user_id}
                    className="flex flex-col md:flex-row items-start justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-start gap-4 mb-4 md:mb-0">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {getInitials(profile.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <p className="font-semibold">{profile.user.name} <span className="font-normal text-muted-foreground">({profile.user.email})</span></p>
                        <p className="text-sm text-muted-foreground italic border-l-4 pl-2">
                          "{profile.application_message}"
                        </p>
                        <div className="space-y-1">
                          <p className="text-xs font-medium">APPLYING FOR:</p>
                          <div className="flex flex-wrap gap-2">
                            {profile.subjects_applying_for.split(',').map((sub: string) => (
                              <Badge key={sub} variant="secondary">{sub.trim()}</Badge>
                            ))}
                          </div>
                        </div>
                        {profile.credentials_url && (
                          <a
                            href={profile.credentials_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            <LinkIcon className="h-3 w-3" />
                            View Credentials
                          </a>
                        )}
                      </div>
                    </div>
                    
                    {/* --- ACTION BUTTONS --- */}
                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                      <Button
                        size="sm"
                        className="w-full md:w-auto"
                        onClick={() => approveMutation.mutate(profile.user.id)}
                        disabled={isMutating}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full md:w-auto"
                        onClick={() => openRejectModal(profile)}
                        disabled={isMutating}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                    {/* --- END ACTION BUTTONS --- */}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* --- REJECTION MODAL --- */}
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
              <Textarea
                id="rejectionMessage"
                rows={5}
                placeholder="e.g., We are unable to approve your application at this time due to..."
                value={rejectionMessage}
                onChange={(e) => setRejectionMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeRejectModal}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleSubmitRejection}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Rejecting..." : "Submit Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* --- END REJECTION MODAL --- */}

    </div>
  );
};

export default AdminPage;