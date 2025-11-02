import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Input is already imported
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

// --- NEW TYPES ---
interface Skill {
  id?: number;
  name: string;
  experienceLevel: string;
  hourlyRate: string; // Use string for form state
}

const experienceLevels = ["Beginner", "Intermediate", "Expert", "Professional"];

// --- API FUNCTIONS ---
const fetchTutorProfile = async () => {
  const { data } = await api.get("/profile");
  return data;
};

// --- REMOVE fetchAllSkills, it's no longer needed ---
// const fetchAllSkills = async () => { ... };

const updateTutorProfile = async (profileData: {
  bio: string;
  hourly_rate: string;
  avatar_url: string;
  skills: Skill[];
}) => {
  const { data } = await api.put("/profile", profileData);
  return data;
};
// --- END API FUNCTIONS ---

const EditProfile = () => {
  const [bio, setBio] = useState("");
  const [mainHourlyRate, setMainHourlyRate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [skills, setSkills] = useState<Skill[]>([]);

  // State for the "Add Skill" form
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState("Intermediate");
  const [newSkillRate, setNewSkillRate] = useState("");

  const queryClient = useQueryClient();

  // --- DATA FETCHING ---
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["tutorProfile"],
    queryFn: fetchTutorProfile,
  });

  // --- REMOVE useQuery for allSkills ---
  // const { data: allSkills, isLoading: isLoadingSkills } = useQuery<string[]>({ ... });

  // Populate form when data loads
  useEffect(() => {
    if (profile) {
      setBio(profile.bio || "");
      setMainHourlyRate(profile.hourly_rate?.toString() || "0");
      setAvatarUrl(profile.avatar_url || "");
      setSkills(
        profile.skills.map((s: any) => ({
          ...s,
          hourlyRate: s.hourlyRate.toString(),
        })) || []
      );
    }
  }, [profile]);

  // --- DATA MUTATION ---
  const mutation = useMutation({
    mutationFn: updateTutorProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["tutorProfile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });
  // --- END DATA MUTATION ---

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName || !newSkillLevel || !newSkillRate) {
      toast.error("Please fill all skill fields (Name, Level, and Rate)");
      return;
    }
    // Check against trimmed, case-insensitive name
    if (skills.find((s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      toast.error("Skill already added");
      return;
    }
    setSkills([
      ...skills,
      {
        name: newSkillName.trim(), // Trim whitespace
        experienceLevel: newSkillLevel,
        hourlyRate: newSkillRate,
      },
    ]);
    // Reset form
    setNewSkillName("");
    setNewSkillLevel("Intermediate");
    setNewSkillRate("");
  };

  const handleRemoveSkill = (skillToRemove: Skill) => {
    setSkills(skills.filter((skill) => skill.name !== skillToRemove.name));
    toast.success("Skill removed");
  };

  const handleSaveProfile = () => {
    mutation.mutate({
      bio,
      hourly_rate: mainHourlyRate,
      avatar_url: avatarUrl,
      skills,
    });
  };

  // --- REMOVE isLoadingSkills ---
  const isLoading = isLoadingProfile; // Only check profile loading

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
          <p className="text-xs text-muted-foreground">{bio.length} characters</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mainHourlyRate">Main Hourly Rate (₹)</Label>
            <Input
              id="mainHourlyRate"
              type="number"
              value={mainHourlyRate}
              onChange={(e) => setMainHourlyRate(e.target.value)}
              min="0"
              step="50"
              disabled={mutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://your-image.com/avatar.png"
              disabled={mutation.isPending}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label>Your Skills & Subjects</Label>
          {/* List of added skills */}
          <div className="space-y-3">
            {skills.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No skills added yet.
              </p>
            )}
            {skills.map((skill) => (
              <div
                key={skill.name}
                className="flex items-center gap-2 rounded-md border p-3"
              >
                <div className="flex-1 font-semibold">{skill.name}</div>
                <Badge variant="outline">{skill.experienceLevel}</Badge>
                <div className="text-sm font-medium">₹{skill.hourlyRate}/hr</div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveSkill(skill)}
                  disabled={mutation.isPending}
                >
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add new skill form */}
          <form
            onSubmit={handleAddSkill}
            className="rounded-lg border bg-muted/50 p-4"
          >
            <h4 className="font-semibold mb-3">Add New Skill</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              
              {/* --- THIS IS THE MODIFIED BLOCK --- */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="newSkillName">Skill Name</Label>
                <Input
                  id="newSkillName"
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g., JavaScript"
                  disabled={mutation.isPending}
                />
              </div>
              {/* --- END MODIFIED BLOCK --- */}

              <div className="space-y-2">
                <Label htmlFor="newSkillLevel">Experience</Label>
                <Select
                  value={newSkillLevel}
                  onValueChange={setNewSkillLevel}
                  disabled={mutation.isPending}
                >
                  <SelectTrigger id="newSkillLevel">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newSkillRate">Rate (₹/hr)</Label>
                <Input
                  id="newSkillRate"
                  type="number"
                  value={newSkillRate}
                  onChange={(e) => setNewSkillRate(e.target.value)}
                  placeholder="e.g., 500"
                  disabled={mutation.isPending}
                />
              </div>
            </div>
            <Button
              type="submit"
              size="sm"
              className="mt-4 w-full"
              disabled={mutation.isPending}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </form>
        </div>

        <Button
          onClick={handleSaveProfile}
          className="w-full"
          size="lg"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : "Save Profile Changes"}
        </Button>
      </div>
    </Card>
  );
};

export default EditProfile;