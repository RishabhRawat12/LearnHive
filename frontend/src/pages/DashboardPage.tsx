import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Star, User, Mail, AlertCircle } from "lucide-react";
import ManageAvailability from "@/components/ManageAvailability";
import ManageLectures from "@/components/ManageLectures";
import EditProfile from "@/components/EditProfile";
import ReviewForm from "@/components/ReviewForm";

// --- NEW IMPORTS ---
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
// --- END NEW IMPORTS ---

// --- REMOVE MOCK DATA ---
// const mockUser = { ... }
// --- END REMOVE MOCK DATA ---

// API fetch function
const fetchDashboard = async () => {
  const { data } = await api.get("/dashboard");
  return data;
};

// Define Booking type based on API response
interface Booking {
  id: number;
  tutorName: string;
  subject: string;
  date: string;
  time: string;
  status: "upcoming" | "completed" | "cancelled";
  hasReview: boolean; // This property is provided by the dashboard API
}

const DashboardPage = () => {
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // --- NEW HOOKS ---
  const { logout } = useAuth();
  const navigate = useNavigate();
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });
  // --- END NEW HOOKS ---

  const handleLogout = () => {
    logout();
    navigate("/"); // Redirect to home after logout
  };

  const handleOpenReviewModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setReviewModalOpen(true);
  };

  // --- DERIVED STATE: Moved inside render ---
  const upcomingBookings: Booking[] =
    user?.bookings.filter((b: Booking) => b.status === "upcoming") || [];
  const pastBookings: Booking[] =
    user?.bookings.filter((b: Booking) => b.status === "completed") || [];

  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "upcoming":
        return "secondary";
      default:
        return "default";
    }
  };

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isAuthenticated={true} onLogout={handleLogout} />
        <main className="container mx-auto px-4 py-8">
          <Card className="mb-6 p-8">
            <div className="flex items-start gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
                <div className="flex gap-6 pt-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            </div>
          </Card>
          <Skeleton className="h-10 w-1/3 mb-6" />
          <Card className="p-6">
            <Skeleton className="h-8 w-1/4 mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        </main>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (isError || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isAuthenticated={true} onLogout={handleLogout} />
        <main className="container mx-auto px-4 py-8 text-center">
          <Card className="p-12">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h1 className="text-2xl font-bold mb-2">Error Loading Dashboard</h1>
            <p className="text-muted-foreground mb-4">
              There was a problem fetching your data. Please try again.
            </p>
            <Button onClick={handleLogout}>Logout and Try Again</Button>
          </Card>
        </main>
      </div>
    );
  }

  // --- SUCCESS STATE (user data is available) ---
  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <Card className="mb-6 p-8">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-accent text-2xl font-semibold text-primary">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold">{user.name}</h1>
              <p className="mb-4 text-muted-foreground">{user.email}</p>

              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {user.totalSessions}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Sessions
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-2xl font-bold">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    {user.averageRating}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average Rating
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="info">Personal Info</TabsTrigger>
            <TabsTrigger value="bookings">Booking History</TabsTrigger>
            {user.isTutor && (
              <>
                <TabsTrigger value="availability">Availability</TabsTrigger>
                <TabsTrigger value="lectures">Lectures</TabsTrigger>
                <TabsTrigger value="profile">Edit Profile</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="info">
            <Card className="p-6">
              <h2 className="mb-6 text-2xl font-bold">Personal Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Full Name</div>
                    <div className="font-medium">{user.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Email Address
                    </div>
                    <div className="font-medium">{user.email}</div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="mb-6 text-2xl font-bold">Upcoming Sessions</h2>
                <div className="space-y-4">
                  {upcomingBookings.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No upcoming sessions
                    </p>
                  ) : (
                    upcomingBookings.map((booking: Booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between rounded-lg border bg-card p-4"
                      >
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h3 className="font-semibold">
                              {booking.tutorName}
                            </h3>
                            <Badge variant={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {booking.subject}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {new Date(booking.date).toLocaleDateString(
                                "en-IN",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <span className="text-muted-foreground">
                            {booking.time}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="mb-6 text-2xl font-bold">Past Sessions</h2>
                <div className="space-y-4">
                  {pastBookings.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No past sessions
                    </p>
                  ) : (
                    pastBookings.map((booking: Booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between rounded-lg border bg-card p-4"
                      >
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h3 className="font-semibold">
                              {booking.tutorName}
                            </h3>
                            <Badge variant={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {booking.subject}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {new Date(booking.date).toLocaleDateString(
                                "en-IN",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <span className="text-muted-foreground">
                            {booking.time}
                          </span>
                          
                          {/* --- MODIFICATION HERE --- */}
                          {/* Only show button if a review has NOT been submitted */}
                          {!booking.hasReview && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenReviewModal(booking)}
                            >
                              Leave Review
                            </Button>
                          )}
                          {/* --- END MODIFICATION --- */}
                          
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {user.isTutor && (
            <>
              <TabsContent value="availability">
                <ManageAvailability />
              </TabsContent>

              <TabsContent value="lectures">
                <ManageLectures />
              </TabsContent>

              <TabsContent value="profile">
                <EditProfile />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>

      {selectedBooking && (
        <ReviewForm
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          tutorName={selectedBooking.tutorName}
          bookingId={selectedBooking.id}
        />
      )}
    </div>
  );
};

export default DashboardPage;