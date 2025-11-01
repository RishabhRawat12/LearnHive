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

// --- NEW IMPORTS ---
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
// --- END NEW IMPORTS ---

// --- REMOVE MOCK DATA ---
// const mockSkills = [...]
// const mockTutors = [...]
// --- END REMOVE MOCK DATA ---

// API fetch functions
const fetchSkills = async () => {
  const { data } = await api.get("/skills");
  return data;
};

const fetchTutors = async (
  search: string,
  skills: string[],
  minRating: string
) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (skills.length > 0) params.append("skills", skills.join(","));
  if (minRating !== "0") params.append("minRating", minRating);

  const { data } = await api.get("/tutors", { params });
  return data;
};

const FindTutorPage = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minRating, setMinRating] = useState("0");
  
  // --- REMOVE useState for filteredTutors ---
  // const [filteredTutors, setFilteredTutors] = useState(mockTutors);

  const { data: skills, isLoading: isLoadingSkills } = useQuery<string[]>({
    queryKey: ["skills"],
    queryFn: fetchSkills,
  });

  const {
    data: filteredTutors,
    isLoading: isLoadingTutors,
  } = useQuery({
    queryKey: ["tutors", searchQuery, selectedSkills, minRating],
    queryFn: () => fetchTutors(searchQuery, selectedSkills, minRating),
  });

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  // --- REMOVE useEffect filter logic ---
  // useEffect(() => { ... }, [searchQuery, selectedSkills, minRating]);

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
              {/* Search Input */}
              <div className="space-y-2">
                <Label htmlFor="subject">Search</Label>
                <Input
                  id="subject"
                  placeholder="Search by name or keyword"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Skills Filter */}
              <div className="space-y-3">
                <Label>Filter by Skills</Label>
                {/* Selected skills badges */}
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedSkills.map((skill) => (
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
                {/* Available skills badges */}
                <div className="flex flex-wrap gap-2">
                  {isLoadingSkills
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-6 w-20 rounded-full" />
                      ))
                    : skills?.map((skill) => (
                        <Badge
                          key={skill}
                          variant={
                            selectedSkills.includes(skill)
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() => toggleSkill(skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-3">
                <Label>Minimum Rating</Label>
                <RadioGroup value={minRating} onValueChange={setMinRating}>
                  {/* ... radio group items ... */}
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
                Showing {filteredTutors?.length || 0} tutor
                {filteredTutors?.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="space-y-4">
              {isLoadingTutors ? (
                // Loading Skeleton
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-6">
                    <div className="flex items-start gap-6">
                      <Skeleton className="h-20 w-20 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-10 w-32" />
                      </div>
                    </div>
                  </Card>
                ))
              ) : filteredTutors && filteredTutors.length > 0 ? (
                // Real Data
                filteredTutors.map((tutor: any) => (
                  <TutorCard
                    key={tutor.user_id}
                    tutor={{ ...tutor, id: tutor.user_id, subjects: tutor.skills }}
                  />
                ))
              ) : (
                // No Results
                <Card className="p-12 text-center">
                  <p className="text-lg text-muted-foreground">
                    No tutors found matching your criteria. Try adjusting your
                    filters.
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