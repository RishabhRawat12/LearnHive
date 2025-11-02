import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

// API Functions
const fetchPendingTutors = async () => {
  const { data } = await api.get("/admin/pending-tutors");
  return data;
};

const approveTutor = async (userId: number) => {
  const { data } = await api.post(`/admin/approve-tutor/${userId}`);
  return data;
};

const AdminPage = () => {
  const queryClient = useQueryClient();

  const {
    data: tutors,
    isLoading,
    isError,
  } = useQuery<any[]>({
    queryKey: ["pendingTutors"],
    queryFn: fetchPendingTutors,
  });

  const mutation = useMutation({
    mutationFn: approveTutor,
    onSuccess: (data, userId) => {
      toast.success(`Tutor (ID: ${userId}) approved successfully!`);
      // Refetch the list of pending tutors
      queryClient.invalidateQueries({ queryKey: ["pendingTutors"] });
    },
    onError: (error: any, userId) => {
      toast.error(`Failed to approve tutor (ID: ${userId}): ${error.response?.data?.message || error.message}`);
    },
  });

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

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
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
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
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(profile.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{profile.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {profile.user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Applied: {format(new Date(profile.user.created_at), "dd MMM, yyyy")}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => mutation.mutate(profile.user.id)}
                      disabled={mutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminPage;