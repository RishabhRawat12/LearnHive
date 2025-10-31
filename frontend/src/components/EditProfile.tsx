import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "sonner";

const EditProfile = () => {
  const [bio, setBio] = useState(
    "Experienced Mathematics tutor with 8+ years of teaching experience."
  );
  const [hourlyRate, setHourlyRate] = useState("800");
  const [skills, setSkills] = useState(["Mathematics", "Physics", "Calculus"]);
  const [newSkill, setNewSkill] = useState("");

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
    toast.success("Profile updated successfully!");
  };

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
            />
            <Button type="submit">Add</Button>
          </form>
        </div>

        <Button onClick={handleSaveProfile} className="w-full">
          Save Changes
        </Button>
      </div>
    </Card>
  );
};

export default EditProfile;
