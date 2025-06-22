
"use client";

import type { ScheduledItem } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, CalendarDays, ExternalLink, Brain } from "lucide-react";
import { format, isBefore, parse, startOfToday } from "date-fns";

interface ScheduledItemCardProps {
  item: ScheduledItem;
  onOpenLearnDialog: (item: ScheduledItem) => void;
}

export default function ScheduledItemCard({ item, onOpenLearnDialog }: ScheduledItemCardProps) {
  const Icon = item.type === "jira" ? CheckSquare : CalendarDays;
  const startTime = new Date(item.startTime);
  const endTime = new Date(item.endTime);
  const isOverdue = item.type === 'jira' && item.deadline && isBefore(parse(item.deadline, 'yyyy-MM-dd', new Date()), startOfToday());


  let cardBg = "bg-accent/10";
  let borderColor = "border-accent/50";
  let iconColor = "text-accent";

  if (item.type === "jira") {
    // SZH project tasks will have a different color
    if (item.projectKey === 'SZH') {
      cardBg = "bg-chart-4/10"; // A yellow/orange color from the theme
      borderColor = "border-chart-4/50";
      iconColor = "text-chart-4";
    } else { 
      // Default color for KAN project and any other Jira tasks
      cardBg = "bg-primary/10";
      borderColor = "border-primary/50";
      iconColor = "text-primary";
    }
  }

  return (
    <Card className={`mb-2 shadow-md hover:shadow-lg transition-shadow ${cardBg} ${borderColor}`}>
      <CardHeader className="p-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold flex items-start gap-2">
            <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${iconColor}`} />
            <span className="break-words" title={item.name}>{item.name}</span>
          </CardTitle>
          {item.link && (
            <a href={item.link} target="_blank" rel="noopener noreferrer" aria-label={`Open ${item.name} in new tab`} className="shrink-0">
              <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </a>
          )}
        </div>
        <CardDescription className="text-xs text-muted-foreground pl-6 pt-1">
          {format(startTime, "HH:mm")} - {format(endTime, "HH:mm")}
          {isOverdue && (
            <span className="font-semibold text-destructive ml-2">(Overdue)</span>
          )}
        </CardDescription>
      </CardHeader>
      {item.type === 'jira' && (
        <CardContent className="p-3 pt-0">
           <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => onOpenLearnDialog(item)}>
            <Brain className="mr-1 h-3 w-3" /> Mark & Feedback
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
