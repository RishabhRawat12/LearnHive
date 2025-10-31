import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface TimeSlot {
  id: number;
  date: Date;
  startTime: string;
  endTime: string;
}

const ManageAvailability = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: 1, date: new Date(2025, 10, 1), startTime: "10:00", endTime: "11:00" },
    { id: 2, date: new Date(2025, 10, 1), startTime: "14:00", endTime: "15:00" },
    { id: 3, date: new Date(2025, 10, 2), startTime: "16:00", endTime: "17:00" },
  ]);

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !startTime || !endTime) {
      toast.error("Please fill in all fields");
      return;
    }

    const newSlot: TimeSlot = {
      id: Date.now(),
      date: selectedDate,
      startTime,
      endTime,
    };

    setTimeSlots([...timeSlots, newSlot]);
    setStartTime("");
    setEndTime("");
    toast.success("Availability slot added successfully!");
  };

  const handleDeleteSlot = (id: number) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
    toast.success("Slot removed");
  };

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
              disabled={(date) => date < new Date()}
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
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Add Time Slot
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-xl font-semibold">Your Available Slots</h3>
        <div className="space-y-3">
          {timeSlots.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No availability slots added yet
            </p>
          ) : (
            timeSlots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between rounded-lg border bg-muted/50 p-4"
              >
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    {format(slot.date, "MMM dd, yyyy")}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {slot.startTime} - {slot.endTime}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteSlot(slot.id)}
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
