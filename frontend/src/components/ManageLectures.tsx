import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Video, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Lecture {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
}

const ManageLectures = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
  });

  const [lectures, setLectures] = useState<Lecture[]>([
    {
      id: 1,
      title: "Introduction to Calculus",
      description: "Basic concepts and fundamental theorems",
      videoUrl: "https://youtube.com/watch?v=example1",
    },
    {
      id: 2,
      title: "Advanced Problem Solving",
      description: "Techniques for competitive exams",
      videoUrl: "https://youtube.com/watch?v=example2",
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.videoUrl) {
      toast.error("Please fill in all fields");
      return;
    }

    const newLecture: Lecture = {
      id: Date.now(),
      ...formData,
    };

    setLectures([newLecture, ...lectures]);
    setFormData({ title: "", description: "", videoUrl: "" });
    toast.success("Lecture added successfully!");
  };

  const handleDelete = (id: number) => {
    setLectures(lectures.filter((lecture) => lecture.id !== id));
    toast.success("Lecture removed");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <h3 className="mb-4 text-xl font-semibold">Upload New Lecture</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Lecture Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Introduction to Algebra"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe what students will learn..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL</Label>
            <Input
              id="videoUrl"
              type="url"
              value={formData.videoUrl}
              onChange={(e) =>
                setFormData({ ...formData, videoUrl: e.target.value })
              }
              placeholder="https://youtube.com/watch?v=..."
              required
            />
            <p className="text-xs text-muted-foreground">
              Paste a YouTube or Vimeo link
            </p>
          </div>

          <Button type="submit" className="w-full">
            Upload Lecture
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-xl font-semibold">Your Lectures</h3>
        <div className="space-y-3">
          {lectures.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No lectures uploaded yet
            </p>
          ) : (
            lectures.map((lecture) => (
              <div
                key={lecture.id}
                className="rounded-lg border bg-muted/50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold">{lecture.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {lecture.description}
                    </p>
                    <a
                      href={lecture.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      View Video
                    </a>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(lecture.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default ManageLectures;
