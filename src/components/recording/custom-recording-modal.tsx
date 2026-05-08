import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CustomRecordingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (startDate: Date, startTime: string, endDate: Date, endTime: string) => void;
  streamName?: string;
}

const getNextHalfHour = () => {
  const now = new Date();
  const minutes = now.getMinutes();
  const nextHalfHour = minutes < 30 ? 30 : 60;
  now.setMinutes(nextHalfHour);
  now.setSeconds(0);
  now.setMilliseconds(0);

  const hours = now.getHours().toString().padStart(2, '0');
  const mins = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${mins}`;
};

export const CustomRecordingModal: React.FC<CustomRecordingModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
  streamName,
}) => {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState<string>(() => getNextHalfHour());
  const [endTime, setEndTime] = useState<string>("01:00");

  const handleConfirm = () => {
    if (!startDate || !endDate) {
      return;
    }
    onConfirm(startDate, startTime, endDate, endTime);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const isValid = startDate && endDate && startTime && endTime;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Schedule Custom Recording</DialogTitle>
          {streamName && (
            <p className="text-sm text-muted-foreground mt-2">
              Recording: {streamName}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Start Date and Time */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Start</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="start-date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="start-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <Icons.calendar className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Start Time */}
              <div className="space-y-2">
                <Label htmlFor="start-time">Time</Label>
                <div className="relative">
                  <Icons.clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* End Date and Time */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">End</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="end-date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="end-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <Icons.calendar className="mr-2 h-4 w-4" />
                      {endDate ? (
                        format(endDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <Label htmlFor="end-time">Time</Label>
                <div className="relative">
                  <Icons.clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid}>
            Schedule Recording
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
