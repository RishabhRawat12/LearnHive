import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Calendar,
  Clock,
  Video,
  Award,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner"; // Ensure toast is imported
import ReviewsList from "@/components/ReviewsList";

// --- NEW IMPORTS ---
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
// --- END NEW IMPORTS ---

// --- API FUNCTIONS ---
const fetchTutorProfile = async (tutorId: string) => {
  const { data } = await api.get(`/tutors/${tutorId}`);
  return data;
};

const bookSession = async (availability_id: number) => {
  const { data } = await api.post("/bookings", { availability_id });
  return data;
};
// --- END API FUNCTIONS ---

const TutorProfilePage = () => {
  const { id } = useParams();

  // --- DATA FETCHING ---
  const {
    data: tutor,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tutor", id],
    queryFn: () => fetchTutorProfile(id!),
    enabled: !!id, // Only run query if id is present
  });

  const bookingMutation = useMutation({
    mutationFn: bookSession,
    onSuccess: () => {
      toast.success("Session booked successfully!", {
        description: "You will receive a confirmation shortly.",
      });
      // Optionally refetch tutor data to remove the booked slot
      // queryClient.invalidateQueries(['tutor', id]);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to book session"
      );
    },
  });
  // --- END DATA FETCHING ---

  const handleBookSession = (sessionId: number) => {
    bookingMutation.mutate(sessionId);
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card className="mb-6 p-8">
            <div className="flex items-start gap-6">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </div>
          </Card>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <Skeleton className="h-6 w-1/4 mb-4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </Card>
              <Card className="p-6">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full mt-4" />
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (isError || !tutor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16 text-center">
          <Card className="p-12">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h1 className="text-2xl font-bold">Tutor not found</h1>
            <p className="text-muted-foreground">
              We couldn't find a profile for this tutor.
            </p>
          </Card>
        </main>
      </div>
    );
  }

  // --- SUCCESS STATE ---
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <Card className="mb-6 p-8">
          <div className="flex items-start gap-6">
            <Avatar className="h-32 w-32">
              <AvatarImage src={tutor.avatar_url} alt={tutor.user.name} />
              <AvatarFallback className="bg-accent text-3xl font-semibold text-primary">
                {getInitials(tutor.user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold">{tutor.user.name}</h1>
              <div className="mb-3 flex flex-wrap gap-2">
                {tutor.skills.map((skill: any) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 bg-accent text-accent-foreground text-sm rounded-full font-medium"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold">
                    {tutor.average_rating}
                  </span>
                  <span className="text-muted-foreground">rating</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  ₹{tutor.hourly_rate}/hr
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
              <h2 className="mb-4 text-2xl font-bold">About Me</h2>
              <p className="text-muted-foreground leading-relaxed">
                {tutor.bio}
              </p>
            </Card>

            <Card className="p-6 mb-6">
              <h2 className="mb-4 text-2xl font-bold flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                Skills & Expertise
              </h2>
              <div className="space-y-4">
                {tutor.skills.map((skill: any) => (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-accent/50"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{skill.name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {skill.experienceLevel}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        ₹{skill.hourlyRate}/hr
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Tabs defaultValue="sessions" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="sessions">Available Sessions</TabsTrigger>
                <TabsTrigger value="lectures">Recorded Lectures</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="sessions">
                <div className="grid gap-4 sm:grid-cols-2">
                  {tutor.availability.length === 0 ? (
                    <p className="text-muted-foreground col-span-2 text-center py-4">
                      No available sessions.
                    </p>
                  ) : (
                    tutor.availability.map((session: any) => (
                      <Card key={session.id} className="p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(session.start_time).toLocaleDateString(
                              "en-IN",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <div className="mb-3 flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(
                              session.start_time
                            ).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            -{" "}
                            {new Date(session.end_time).toLocaleTimeString(
                              "en-IN",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </span>
                        </div>
                        <Button
                          className="w-full"
                          size="sm"
                          onClick={() => handleBookSession(session.id)}
                          disabled={bookingMutation.isPending}
                        >
                          {bookingMutation.isPending
                            ? "Booking..."
                            : "Book Session"}
                        </Button>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="lectures">
                <div className="space-y-4">
                  {tutor.lectures.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No lectures available.
                    </p>
                  ) : (
                    tutor.lectures.map((lecture: any) => (
                      <Card key={lecture.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-primary/10 p-3">
                            <Video className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="mb-1 font-semibold">
                              {lecture.title}
                            </h3>
                            <p className="mb-3 text-sm text-muted-foreground">
                              {lecture.description}
                            </p>
                            <a
                              href={lecture.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              Watch Video →
                            </a>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <ReviewsList
                  reviews={tutor.reviews.map((r: any) => ({
                    ...r,
                    learnerName: r.student_name,
                  }))}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <div className="mb-4 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  ₹{tutor.hourly_rate}/hr
                </div>
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{tutor.average_rating}</span>
                  <span>({tutor.reviews.length} reviews)</span>
                </div>
              </div>
              
              {/* --- MODIFICATION HERE --- */}
              <Button
                className="w-full"
                size="lg"
                onClick={() => toast.info("Contact feature is coming soon!")}
              >
                Contact Tutor
              </Button>
              {/* --- END MODIFICATION --- */}
              
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TutorProfilePage;