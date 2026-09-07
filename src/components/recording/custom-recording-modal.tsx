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

export interface RecordingScheduleValues {
  startDate: Date;
  startTime: string;
  endDate: Date;
  endTime: string;
  /** Only meaningful in edit mode; creating derives the title from the stream. */
  title: string;
}

interface CustomRecordingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (values: RecordingScheduleValues) => void;
  streamName?: string;
  /**
   * Seeds the fields from an existing recording and switches the dialog into edit mode, which
   * also exposes the title. Absent means scheduling something new.
   */
  initialValues?: { start: Date; end: Date; title: string };
  isSubmitting?: boolean;
}

const toTimeValue = (date: Date) =>
  `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

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
  initialValues,
  isSubmitting = false,
}) => {
  const isEditing = !!initialValues;

  // Seeded once per mount. One instance serves every row in the list, so callers editing an
  // existing recording pass a key tied to its id - React then remounts with fresh state rather
  // than the previous row's times, which is what an effect resetting state would be papering over.
  const [startDate, setStartDate] = useState<Date | undefined>(
    () => initialValues?.start ?? new Date()
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    () => initialValues?.end ?? new Date()
  );
  const [startTime, setStartTime] = useState<string>(() =>
    initialValues ? toTimeValue(initialValues.start) : getNextHalfHour()
  );
  const [endTime, setEndTime] = useState<string>(() =>
    initialValues ? toTimeValue(initialValues.end) : "01:00"
  );
  const [title, setTitle] = useState<string>(() => initialValues?.title ?? "");

  const handleConfirm = () => {
    if (!startDate || !endDate) {
      return;
    }
    onConfirm({ startDate, startTime, endDate, endTime, title });
    if (!isEditing) {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const isValid =
    startDate && endDate && startTime && endTime && (!isEditing || title.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Recording" : "Schedule Custom Recording"}
          </DialogTitle>
          {streamName && (
            <p className="text-sm text-muted-foreground mt-2">
              Recording: {streamName}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="recording-title">Title</Label>
              <Input
                id="recording-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What is being recorded?"
              />
            </div>
          )}

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
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid || isSubmitting}>
            {isSubmitting && <Icons.loader className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Save Changes" : "Schedule Recording"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
