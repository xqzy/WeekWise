
"use client";

import type { JiraTaskInput } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, PlusCircle } from "lucide-react";
import { useState } from "react";

interface JiraTaskFormProps {
  tasks: JiraTaskInput[];
  setTasks: React.Dispatch<React.SetStateAction<JiraTaskInput[]>>;
}

export default function JiraTaskForm({ tasks, setTasks }: JiraTaskFormProps) {
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskLink, setNewTaskLink] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");

  const handleAddTask = () => {
    if (newTaskName.trim() === "" || newTaskLink.trim() === "") return;
    setTasks([
      ...tasks,
      { 
        id: crypto.randomUUID(), 
        name: newTaskName, 
        link: newTaskLink,
        deadline: newTaskDeadline || undefined,
      },
    ]);
    setNewTaskName("");
    setNewTaskLink("");
    setNewTaskDeadline("");
  };

  const handleRemoveTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-headline">Jira Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="jira-task-name">Task Name</Label>
          <Input
            id="jira-task-name"
            placeholder="e.g., Implement feature X"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jira-task-link">Task Link</Label>
          <Input
            id="jira-task-link"
            type="url"
            placeholder="e.g., https://jira.example.com/browse/PROJ-123"
            value={newTaskLink}
            onChange={(e) => setNewTaskLink(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jira-task-deadline">Deadline (Optional)</Label>
          <Input
            id="jira-task-deadline"
            type="date"
            value={newTaskDeadline}
            onChange={(e) => setNewTaskDeadline(e.target.value)}
          />
        </div>
        <Button onClick={handleAddTask} className="w-full" variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Jira Task
        </Button>
        {tasks.length > 0 && (
          <div className="space-y-2 pt-4">
            <h4 className="font-medium text-sm">Current Tasks:</h4>
            <ul className="space-y-2 max-h-40 overflow-y-auto rounded-md border p-2">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between p-2 bg-secondary/50 rounded-md text-sm"
                >
                  <a href={task.link} target="_blank" rel="noopener noreferrer" className="hover:underline truncate" title={task.name}>
                    {task.name}
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveTask(task.id)}
                    aria-label={`Remove task ${task.name}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
