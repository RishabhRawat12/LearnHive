import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Star, UserPlus, Calendar, GraduationCap } from "lucide-react";
import heroImage from "@/assets/hero-learning.jpg";

// --- NEW IMPORTS ---
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
// --- END NEW IMPORTS ---

// --- API FETCH FUNCTIONS ---
const fetchFeaturedTutors = async () => {
  // Fetch top 3 tutors with a minimum rating of 4.5
  const { data } = await api.get("/tutors?minRating=4.5");
  return data.slice(0, 3);
};

const fetchPopularSkills = async () => {
  const { data } = await api.get("/skills");
  // Get a subset of skills, e.g., the first 8
  return data.slice(0, 8);
};
// --- END API FETCH FUNCTIONS ---

// --- REMOVE MOCK DATA ---
// const featuredTutors = [ ... ];
// const popularSkills = [ ... ];
// --- END REMOVE MOCK DATA ---

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // --- NEW DATA QUERIES ---
  const { data: featuredTutors, isLoading: isLoadingTutors } = useQuery({
    queryKey: ["featuredTutors"],
    queryFn: fetchFeaturedTutors,
  });

  const { data: popularSkills, isLoading: isLoadingSkills } = useQuery<string[]>({
    queryKey: ["popularSkills"],
    queryFn: fetchPopularSkills,
  });
  // --- END NEW DATA QUERIES ---

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/find-tutors?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/find-tutors");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/20" />
          <div
            className="absolute inset-0 opacity-10 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          />

          <div className="relative container mx-auto px-4 py-24 text-center">
            <h1 className="mb-6 text-5xl font-bold leading-tight text-foreground md:text-6xl">
              Find Your Perfect
              <br />
              <span className="text-primary">Learning Partner</span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Connect with expert tutors and unlock your potential
            </p>

            <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="What would you like to learn?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-14 pl-10 text-base"
                  />
                </div>
                <Button type="submit" size="lg" className="h-14 px-8">
                  Find Tutors
                </Button>
              </div>
            </form>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="container mx-auto px-4 py-16 bg-accent/30">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Search className="h-10 w-10" />
              </div>
              <div className="mb-2 text-sm font-semibold text-primary">STEP 1</div>
              <h3 className="mb-2 text-xl font-bold">Find a Tutor</h3>
              <p className="text-muted-foreground">
                Browse our diverse pool of expert tutors and find the perfect match for your learning needs
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Calendar className="h-10 w-10" />
              </div>
              <div className="mb-2 text-sm font-semibold text-primary">STEP 2</div>
              <h3 className="mb-2 text-xl font-bold">Book a Session</h3>
              <p className="text-muted-foreground">
                Choose a convenient time slot and book your session instantly with just a few clicks
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <GraduationCap className="h-10 w-10" />
              </div>
              <div className="mb-2 text-sm font-semibold text-primary">STEP 3</div>
              <h3 className="mb-2 text-xl font-bold">Start Learning</h3>
              <p className="text-muted-foreground">
                Join your session and experience personalized, one-on-one learning tailored to you
              </p>
            </div>
          </div>
        </section>

        {/* Featured Tutors Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Featured Tutors</h2>
              <p className="text-muted-foreground">Top-rated experts ready to help you succeed</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/find-tutors")}>
              View All
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {isLoadingTutors
              ? // Skeleton loaders
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-3" />
                    <Skeleton className="h-4 w-5/6 mb-3" />
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-1/3" />
                  </Card>
                ))
              : // Real data
                featuredTutors?.map((tutor: any) => (
                  <Card
                    key={tutor.user_id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/tutor/${tutor.user_id}`)}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={tutor.avatar_url} alt={tutor.name} />
                        <AvatarFallback className="bg-accent text-lg font-semibold text-primary">
                          {getInitials(tutor.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{tutor.name}</h3>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{tutor.average_rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{tutor.bio}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {tutor.skills.slice(0, 2).map((subject: string) => (
                        <Badge key={subject} variant="secondary">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xl font-bold text-primary">
                      ₹{tutor.hourly_rate}/hr
                    </div>
                  </Card>
                ))}
          </div>
        </section>

        {/* Popular Skills Section */}
        <section className="container mx-auto px-4 py-16 bg-accent/30">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Popular Skills</h2>
            <p className="text-muted-foreground">Explore the most sought-after subjects</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {isLoadingSkills
              ? // Skeleton loaders
                Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-28 rounded-full" />
                ))
              : // Real data
                popularSkills?.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="text-base py-2 px-4 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => navigate(`/find-tutors?search=${encodeURIComponent(skill)}`)}
                  >
                    {skill}
                  </Badge>
                ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16">
          <Card className="p-12 text-center bg-primary text-primary-foreground">
            <UserPlus className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of learners achieving their goals with expert tutors
            </p>
            <Button size="lg" variant="secondary" onClick={() => navigate("/find-tutors")}>
              Find Your Tutor Now
            </Button>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default HomePage;