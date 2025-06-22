"use client";

import type { LearningInput, ScheduledItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";

interface LearnPatternDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  item: ScheduledItem | null;
  onSubmitFeedback: (feedback: LearningInput) => void;
}

export default function LearnPatternDialog({
  isOpen,
  onOpenChange,
  item,
  onSubmitFeedback,
}: LearnPatternDialogProps) {
  const [actualTime, setActualTime] = useState("");
  const [manualAdjustments, setManualAdjustments] = useState("");

  useEffect(() => {
    if (isOpen && item) {
      // Reset form when dialog opens or item changes
      setActualTime("");
      setManualAdjustments("");
    }
  }, [isOpen, item]);

  const handleSubmit = () => {
    if (!item || !item.originalId) {
      // originalId is used as jiraItemId for learning
      alert("Error: Jira item information is missing.");
      return;
    }
    if (actualTime.trim() === "" || isNaN(parseFloat(actualTime)) || parseFloat(actualTime) <=0 ) {
      alert("Please enter a valid actual time taken (positive number).");
      return;
    }

    onSubmitFeedback({
      jiraItemId: item.originalId, // Use originalId from ScheduledItem
      estimatedTime: 1, // As per requirement, Jira items take 1 hour
      actualTime: parseFloat(actualTime),
      manualAdjustments: manualAdjustments.trim() === "" ? undefined : manualAdjustments,
    });
    onOpenChange(false); // Close dialog
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Feedback for: {item.name}</DialogTitle>
          <DialogDescription>
            Help us improve future scheduling by providing feedback on this Jira task.
            Estimated time was 1 hour.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="actual-time" className="text-right col-span-1">
              Actual Time (hours)
            </Label>
            <Input
              id="actual-time"
              type="number"
              value={actualTime}
              onChange={(e) => setActualTime(e.target.value)}
              className="col-span-3"
              placeholder="e.g., 1.5"
              min="0.1"
              step="0.1"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="manual-adjustments" className="text-right col-span-1 pt-2">
              Manual Adjustments (Optional)
            </Label>
            <Textarea
              id="manual-adjustments"
              value={manualAdjustments}
              onChange={(e) => setManualAdjustments(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Task was more complex, needed help from John, etc."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit}>
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
