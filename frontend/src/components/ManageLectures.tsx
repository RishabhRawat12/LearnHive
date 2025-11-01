import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Video, Trash2 } from "lucide-react";
import { toast } from "sonner";
// --- NEW IMPORTS ---
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
// --- END NEW IMPORTS ---

interface LectureData {
  title: string;
  description: string;
  video_url: string;
}

// --- API FUNCTIONS ---
const fetchLectures = async () => {
  const { data } = await api.get("/lectures");
  return data;
};

const addLecture = async (newLecture: LectureData) => {
  const { data } = await api.post("/lectures", newLecture);
  return data;
};

const deleteLecture = async (lectureId: number) => {
  await api.delete(`/lectures/${lectureId}`);
};
// --- END API FUNCTIONS ---

const ManageLectures = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
  });
  const queryClient = useQueryClient();

  // --- DATA FETCHING ---
  const { data: lectures, isLoading } = useQuery<any[]>({
    queryKey: ["lectures"],
    queryFn: fetchLectures,
  });

  // --- DATA MUTATIONS ---
  const addMutation = useMutation({
    mutationFn: addLecture,
    onSuccess: () => {
      toast.success("Lecture added successfully!");
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      setFormData({ title: "", description: "", video_url: "" });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add lecture");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLecture,
    onSuccess: () => {
      toast.success("Lecture removed");
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to remove lecture");
    },
  });
  // --- END DATA MUTATIONS ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.video_url) {
      toast.error("Please fill in all fields");
      return;
    }

    addMutation.mutate(formData);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const isMutating = addMutation.isPending || deleteMutation.isPending;

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
              disabled={isMutating}
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
              disabled={isMutating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL</Label>
            <Input
              id="videoUrl"
              type="url"
              value={formData.video_url}
              onChange={(e) =>
                setFormData({ ...formData, video_url: e.target.value })
              }
              placeholder="https://youtube.com/watch?v=..."
              required
              disabled={isMutating}
            />
            <p className="text-xs text-muted-foreground">
              Paste a YouTube or Vimeo link
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isMutating}>
            {addMutation.isPending ? "Uploading..." : "Upload Lecture"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-xl font-semibold">Your Lectures</h3>
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : lectures && lectures.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No lectures uploaded yet
            </p>
          ) : (
            lectures?.map((lecture) => (
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
                      href={lecture.video_url}
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
                    disabled={isMutating}
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