import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import TutorCard from "@/components/TutorCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

// Mock skills data
const mockSkills = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Programming",
  "Web Development",
  "Python",
  "Java",
  "English",
  "IELTS",
  "Science",
  "React",
  "Node.js",
  "Data Science",
];

// Mock tutors data
const mockTutors = [
  {
    id: 1,
    name: "Priya Sharma",
    bio: "Experienced Mathematics tutor with 8+ years of teaching experience. Specialized in calculus, algebra, and competitive exam preparation.",
    hourly_rate: 800,
    average_rating: 4.8,
    subjects: ["Mathematics", "Physics"],
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    bio: "Computer Science expert passionate about teaching programming. Proficient in Python, Java, and web development.",
    hourly_rate: 1200,
    average_rating: 4.9,
    subjects: ["Programming", "Web Development"],
  },
  {
    id: 3,
    name: "Anita Patel",
    bio: "English language specialist helping students improve their communication skills and IELTS preparation.",
    hourly_rate: 600,
    average_rating: 4.7,
    subjects: ["English", "IELTS"],
  },
  {
    id: 4,
    name: "Vikram Singh",
    bio: "Chemistry tutor with a knack for making complex concepts simple. Specialized in organic and inorganic chemistry.",
    hourly_rate: 750,
    average_rating: 4.6,
    subjects: ["Chemistry", "Science"],
  },
];

const FindTutorPage = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minRating, setMinRating] = useState('0');
  const [filteredTutors, setFilteredTutors] = useState(mockTutors);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  useEffect(() => {
    let filtered = mockTutors;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(tutor =>
        tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutor.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutor.subjects.some(subject => 
          subject.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filter by selected skills
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(tutor =>
        selectedSkills.some(skill =>
          tutor.subjects.some(subject =>
            subject.toLowerCase() === skill.toLowerCase()
          )
        )
      );
    }

    // Filter by rating
    const rating = parseFloat(minRating);
    if (rating > 0) {
      filtered = filtered.filter(tutor => tutor.average_rating >= rating);
    }

    setFilteredTutors(filtered);
  }, [searchQuery, selectedSkills, minRating]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Filter Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="mb-4 text-lg font-bold">Filters</h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Search</Label>
                <Input
                  id="subject"
                  placeholder="Search by name or keyword"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Filter by Skills</Label>
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedSkills.map(skill => (
                      <Badge
                        key={skill}
                        variant="default"
                        className="cursor-pointer"
                        onClick={() => toggleSkill(skill)}
                      >
                        {skill}
                        <X className="ml-1 h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {mockSkills.map(skill => (
                    <Badge
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Minimum Rating</Label>
                <RadioGroup value={minRating} onValueChange={setMinRating}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="all" />
                    <Label htmlFor="all" className="font-normal cursor-pointer">
                      All Ratings
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4" id="4plus" />
                    <Label htmlFor="4plus" className="font-normal cursor-pointer">
                      4.0+ ⭐
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4.5" id="4.5plus" />
                    <Label htmlFor="4.5plus" className="font-normal cursor-pointer">
                      4.5+ ⭐⭐
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </Card>
          </aside>

          {/* Tutor List */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Find Tutors</h1>
              <p className="text-muted-foreground">
                Showing {filteredTutors.length} tutor{filteredTutors.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-4">
              {filteredTutors.length > 0 ? (
                filteredTutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))
              ) : (
                <Card className="p-12 text-center">
                  <p className="text-lg text-muted-foreground">
                    No tutors found matching your criteria. Try adjusting your filters.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FindTutorPage;
