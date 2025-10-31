import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, Clock, Video, Award } from "lucide-react";
import { toast } from "sonner";
import ReviewsList from "@/components/ReviewsList";

// Mock data - in real app, this would come from an API
const mockTutorData: Record<string, {
  id: number;
  name: string;
  bio: string;
  hourly_rate: number;
  average_rating: number;
  subjects: string[];
  avatar?: string;
  skills: { name: string; experienceLevel: string; hourlyRate: number; }[];
  sessions: { id: number; date: string; time: string; }[];
  lectures: { id: number; title: string; description: string; videoUrl: string; }[];
  reviews: { id: number; learnerName: string; rating: number; comment: string; date: string; }[];
}> = {
  "1": {
    id: 1,
    name: "Priya Sharma",
    bio: "Experienced Mathematics tutor with 8+ years of teaching experience. I specialize in calculus, algebra, and competitive exam preparation. My teaching philosophy focuses on building strong fundamentals and developing problem-solving skills.",
    hourly_rate: 800,
    average_rating: 4.8,
    subjects: ["Mathematics", "Physics"],
    skills: [
      { name: "Calculus", experienceLevel: "Expert", hourlyRate: 850 },
      { name: "Algebra", experienceLevel: "Expert", hourlyRate: 800 },
      { name: "Physics", experienceLevel: "Advanced", hourlyRate: 750 },
    ],
    sessions: [
      { id: 1, date: "2025-11-01", time: "10:00 AM - 11:00 AM" },
      { id: 2, date: "2025-11-01", time: "2:00 PM - 3:00 PM" },
      { id: 3, date: "2025-11-02", time: "4:00 PM - 5:00 PM" },
    ],
    lectures: [
      {
        id: 1,
        title: "Introduction to Calculus",
        description: "Master the fundamentals of differential calculus",
        videoUrl: "https://youtube.com/watch?v=example1",
      },
      {
        id: 2,
        title: "Advanced Integration Techniques",
        description: "Learn complex integration methods for competitive exams",
        videoUrl: "https://youtube.com/watch?v=example2",
      },
    ],
    reviews: [
      {
        id: 1,
        learnerName: "Sneha Reddy",
        rating: 5,
        comment: "Excellent teacher! She explained calculus concepts very clearly and patiently answered all my questions.",
        date: "2025-10-15",
      },
      {
        id: 2,
        learnerName: "Amit Singh",
        rating: 5,
        comment: "Best math tutor I've ever had. Her teaching methods are very effective and easy to understand.",
        date: "2025-10-10",
      },
      {
        id: 3,
        learnerName: "Divya Patel",
        rating: 4,
        comment: "Very knowledgeable and helpful. The sessions were well-structured and informative.",
        date: "2025-10-05",
      },
    ],
  },
  "2": {
    id: 2,
    name: "Rajesh Kumar",
    bio: "Computer Science expert with a passion for teaching programming. I have industry experience as a software engineer and love helping students understand complex concepts through practical examples.",
    hourly_rate: 1200,
    average_rating: 4.9,
    subjects: ["Programming", "Web Development"],
    skills: [
      { name: "Python", experienceLevel: "Expert", hourlyRate: 1200 },
      { name: "React", experienceLevel: "Expert", hourlyRate: 1300 },
      { name: "Node.js", experienceLevel: "Advanced", hourlyRate: 1100 },
      { name: "Java", experienceLevel: "Intermediate", hourlyRate: 900 },
    ],
    sessions: [
      { id: 4, date: "2025-11-01", time: "11:00 AM - 12:00 PM" },
      { id: 5, date: "2025-11-02", time: "3:00 PM - 4:00 PM" },
    ],
    lectures: [
      {
        id: 3,
        title: "Python for Beginners",
        description: "Start your programming journey with Python basics",
        videoUrl: "https://youtube.com/watch?v=example3",
      },
    ],
    reviews: [
      {
        id: 4,
        learnerName: "Rahul Verma",
        rating: 5,
        comment: "Fantastic instructor! Made programming concepts easy to grasp even for a complete beginner.",
        date: "2025-10-20",
      },
    ],
  },
};

const TutorProfilePage = () => {
  const { id } = useParams();
  const tutor = id ? mockTutorData[id] : undefined;

  if (!tutor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Tutor not found</h1>
        </div>
      </div>
    );
  }

  const handleBookSession = (sessionId: number) => {
    toast.success("Session booked successfully!", {
      description: "You will receive a confirmation email shortly.",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <Card className="mb-6 p-8">
          <div className="flex items-start gap-6">
            <Avatar className="h-32 w-32">
              <AvatarImage src={tutor.avatar} alt={tutor.name} />
              <AvatarFallback className="bg-accent text-3xl font-semibold text-primary">
                {getInitials(tutor.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold">{tutor.name}</h1>
              <div className="mb-3 flex flex-wrap gap-2">
                {tutor.subjects.map((subject) => (
                  <span key={subject} className="px-3 py-1 bg-accent text-accent-foreground text-sm rounded-full font-medium">
                    {subject}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold">{tutor.average_rating}</span>
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
              <p className="text-muted-foreground leading-relaxed">{tutor.bio}</p>
            </Card>

            <Card className="p-6 mb-6">
              <h2 className="mb-4 text-2xl font-bold flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                Skills & Expertise
              </h2>
              <div className="space-y-4">
                {tutor.skills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
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
                  {tutor.sessions.map((session) => (
                    <Card key={session.id} className="p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(session.date).toLocaleDateString('en-IN', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div className="mb-3 flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{session.time}</span>
                      </div>
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => handleBookSession(session.id)}
                      >
                        Book Session
                      </Button>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="lectures">
                <div className="space-y-4">
                  {tutor.lectures.map((lecture) => (
                    <Card key={lecture.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-primary/10 p-3">
                          <Video className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-1 font-semibold">{lecture.title}</h3>
                          <p className="mb-3 text-sm text-muted-foreground">
                            {lecture.description}
                          </p>
                          <a
                            href={lecture.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Watch Video →
                          </a>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <ReviewsList reviews={tutor.reviews} />
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
              <Button className="w-full" size="lg">
                Contact Tutor
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TutorProfilePage;
