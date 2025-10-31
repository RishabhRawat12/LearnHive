import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Star, User, Mail } from "lucide-react";
import ManageAvailability from "@/components/ManageAvailability";
import ManageLectures from "@/components/ManageLectures";
import EditProfile from "@/components/EditProfile";
import ReviewForm from "@/components/ReviewForm";

// Mock user data
const mockUser = {
  name: "Arjun Mehta",
  email: "arjun.mehta@example.com",
  avatar: "",
  isTutor: true, // Set to false to see learner view
  totalSessions: 12,
  averageRating: 4.7,
  bookings: [
    {
      id: 1,
      tutorName: "Priya Sharma",
      subject: "Mathematics",
      date: "2025-10-25",
      time: "10:00 AM",
      status: "completed",
    },
    {
      id: 2,
      tutorName: "Rajesh Kumar",
      subject: "Programming",
      date: "2025-10-28",
      time: "2:00 PM",
      status: "upcoming",
    },
    {
      id: 3,
      tutorName: "Anita Patel",
      subject: "English",
      date: "2025-11-02",
      time: "4:00 PM",
      status: "upcoming",
    },
  ],
};

const DashboardPage = () => {
  const [user] = useState(mockUser);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<typeof mockUser.bookings[0] | null>(null);

  const handleOpenReviewModal = (booking: typeof mockUser.bookings[0]) => {
    setSelectedBooking(booking);
    setReviewModalOpen(true);
  };

  const upcomingBookings = user.bookings.filter(b => b.status === 'upcoming');
  const pastBookings = user.bookings.filter(b => b.status === 'completed');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'upcoming':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} />
      
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
                  <div className="text-2xl font-bold text-primary">{user.totalSessions}</div>
                  <div className="text-sm text-muted-foreground">Total Sessions</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-2xl font-bold">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    {user.averageRating}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
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
                    <div className="text-sm text-muted-foreground">Email Address</div>
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
                    <p className="text-center text-muted-foreground py-8">No upcoming sessions</p>
                  ) : (
                    upcomingBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between rounded-lg border bg-card p-4"
                      >
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h3 className="font-semibold">{booking.tutorName}</h3>
                            <Badge variant={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{booking.subject}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {new Date(booking.date).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <span className="text-muted-foreground">{booking.time}</span>
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
                    <p className="text-center text-muted-foreground py-8">No past sessions</p>
                  ) : (
                    pastBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between rounded-lg border bg-card p-4"
                      >
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h3 className="font-semibold">{booking.tutorName}</h3>
                            <Badge variant={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{booking.subject}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {new Date(booking.date).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <span className="text-muted-foreground">{booking.time}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenReviewModal(booking)}
                          >
                            Leave Review
                          </Button>
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
