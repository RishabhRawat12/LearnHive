import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "sonner";
// --- NEW IMPORTS ---
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
// --- END NEW IMPORTS ---

// --- API FUNCTIONS ---
const fetchTutorProfile = async () => {
  const { data } = await api.get("/profile");
  return data;
};

const updateTutorProfile = async (profileData: {
  bio: string;
  hourly_rate: string;
  skills: string[];
}) => {
  const { data } = await api.put("/profile", profileData);
  return data;
};
// --- END API FUNCTIONS ---

const EditProfile = () => {
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const queryClient = useQueryClient();

  // --- DATA FETCHING ---
  const { data: profile, isLoading } = useQuery({
    queryKey: ["tutorProfile"],
    queryFn: fetchTutorProfile,
  });

  // Populate form when data loads
  useEffect(() => {
    if (profile) {
      setBio(profile.bio || "");
      setHourlyRate(profile.hourly_rate?.toString() || "0");
      setSkills(profile.skills || []);
    }
  }, [profile]);

  // --- DATA MUTATION ---
  const mutation = useMutation({
    mutationFn: updateTutorProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["tutorProfile"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });
  // --- END DATA MUTATION ---

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (skills.includes(newSkill.trim())) {
      toast.error("Skill already added");
      return;
    }
    setSkills([...skills, newSkill.trim()]);
    setNewSkill("");
    toast.success("Skill added");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
    toast.success("Skill removed");
  };

  const handleSaveProfile = () => {
    mutation.mutate({ bio, hourly_rate: hourlyRate, skills });
  };

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="mb-6 text-xl font-semibold">Edit Your Profile</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    );
  }
  // --- END LOADING STATE ---

  return (
    <Card className="p-6">
      <h3 className="mb-6 text-xl font-semibold">Edit Your Profile</h3>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
            placeholder="Tell students about your experience and teaching style..."
            disabled={mutation.isPending}
          />
          <p className="text-xs text-muted-foreground">
            {bio.length} characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
          <Input
            id="hourlyRate"
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            min="0"
            step="50"
            disabled={mutation.isPending}
          />
        </div>

        <div className="space-y-2">
          <Label>Skills & Subjects</Label>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                {skill}
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-1 rounded-full hover:bg-muted"
                  disabled={mutation.isPending}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          <form onSubmit={handleAddSkill} className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill or subject"
              disabled={mutation.isPending}
            />
            <Button type="submit" disabled={mutation.isPending}>
              Add
            </Button>
          </form>
        </div>

        <Button
          onClick={handleSaveProfile}
          className="w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </Card>
  );
};

export default EditProfile;