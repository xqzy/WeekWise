"use client";

import type { GroupedSchedule, ScheduledItem } from "@/types";
import ScheduledItemCard from "./ScheduledItemCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addDays, isSameDay } from "date-fns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface WeekCalendarProps {
  schedule: GroupedSchedule;
  onOpenLearnDialog: (item: ScheduledItem) => void;
  currentDate: Date; // To determine the week to display
}

export default function WeekCalendar({ schedule, onOpenLearnDialog, currentDate }: WeekCalendarProps) {
  const daysToDisplay = Array.from({ length: 7 }, (_, i) => addDays(currentDate, i));

  return (
    <Card className="w-full shadow-lg flex-1 flex flex-col min-h-0">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-center">
          Weekly Schedule: {format(currentDate, "MMM d")} - {format(addDays(currentDate, 6), "MMM d, yyyy")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 md:p-2 lg:p-4 min-h-0">
        <ScrollArea className="h-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7 gap-2 lg:gap-4 h-full">
            {daysToDisplay.map((dayDate) => {
              const dayKey = format(dayDate, "yyyy-MM-dd");
              const itemsForDay = schedule[dayKey] || [];
              // Sort items by start time
              const sortedItemsForDay = [...itemsForDay].sort((a, b) => 
                new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
              );

              return (
                <div key={dayKey} className="flex flex-col border rounded-lg bg-card shadow min-h-[300px] md:min-h-[400px] lg:min-h-[500px]">
                  <div className={`p-2 md:p-3 border-b text-center font-semibold ${isSameDay(dayDate, new Date()) ? 'bg-primary/20 text-primary-foreground' : 'bg-muted/50'}`}>
                    <span className="text-sm md:text-base">{format(dayDate, "E")}</span>
                    <span className="block text-xs md:text-sm text-muted-foreground">{format(dayDate, "MMM d")}</span>
                  </div>
                  <ScrollArea className="flex-1 p-1 md:p-2">
                    {sortedItemsForDay.length > 0 ? (
                      sortedItemsForDay.map((item, idx) => (
                        <ScheduledItemCard key={`${item.name}-${idx}`} item={item} onOpenLearnDialog={onOpenLearnDialog} />
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4 text-center">
                        No items scheduled.
                      </div>
                    )}
                    <ScrollBar orientation="vertical" />
                  </ScrollArea>
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
