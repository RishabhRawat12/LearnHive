import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
// --- NEW IMPORTS ---
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
// --- END NEW IMPORTS ---

// --- API FUNCTIONS ---
const fetchAvailability = async () => {
  const { data } = await api.get("/availability");
  return data;
};

const addSlot = async (newSlot: {
  start_time: string;
  end_time: string;
}) => {
  const { data } = await api.post("/availability", newSlot);
  return data;
};

const deleteSlot = async (slotId: number) => {
  await api.delete(`/availability/${slotId}`);
};
// --- END API FUNCTIONS ---

const ManageAvailability = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const queryClient = useQueryClient();

  // --- DATA FETCHING ---
  const { data: timeSlots, isLoading } = useQuery<any[]>({
    queryKey: ["availability"],
    queryFn: fetchAvailability,
  });

  // --- DATA MUTATIONS ---
  const addMutation = useMutation({
    mutationFn: addSlot,
    onSuccess: () => {
      toast.success("Availability slot added successfully!");
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      setStartTime("");
      setEndTime("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add slot");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSlot,
    onSuccess: () => {
      toast.success("Slot removed");
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to remove slot");
    },
  });
  // --- END DATA MUTATIONS ---

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !startTime || !endTime) {
      toast.error("Please fill in all fields");
      return;
    }

    // Combine date and time into full ISO strings
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const start_time = `${dateStr}T${startTime}:00`;
    const end_time = `${dateStr}T${endTime}:00`;

    addMutation.mutate({ start_time, end_time });
  };

  const handleDeleteSlot = (id: number) => {
    deleteMutation.mutate(id);
  };

  const isMutating = addMutation.isPending || deleteMutation.isPending;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <h3 className="mb-4 text-xl font-semibold">Add Availability</h3>
        <form onSubmit={handleAddSlot} className="space-y-4">
          <div>
            <Label className="mb-2 block">Select Date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              disabled={(date) => date < new Date() || isMutating}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                disabled={isMutating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                disabled={isMutating}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isMutating}>
            {addMutation.isPending ? "Adding..." : "Add Time Slot"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-xl font-semibold">Your Available Slots</h3>
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : timeSlots && timeSlots.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No availability slots added yet
            </p>
          ) : (
            timeSlots?.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between rounded-lg border bg-muted/50 p-4"
              >
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    {format(new Date(slot.start_time), "MMM dd, yyyy")}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {format(new Date(slot.start_time), "HH:mm")} -{" "}
                    {format(new Date(slot.end_time), "HH:mm")}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteSlot(slot.id)}
                  disabled={isMutating}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default ManageAvailability;