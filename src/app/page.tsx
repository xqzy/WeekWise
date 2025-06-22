import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Link as LinkIcon, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 p-4">
      <header className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary rounded-full mb-4 shadow-lg">
          <Zap className="w-12 h-12 text-primary-foreground" />
        </div>
        <h1 className="text-5xl font-headline font-bold text-gray-800 mb-2">
          Welcome to WeekWise
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Intelligently plan your work week by balancing Jira tasks and Google Calendar events with AI-powered scheduling.
        </p>
      </header>

      <main className="w-full max-w-4xl mb-12">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-center">How It Works</CardTitle>
            <CardDescription className="text-center text-lg">
              Streamline your weekly planning in a few simple steps.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center p-4 rounded-lg bg-background shadow-md">
              <LinkIcon className="w-10 h-10 text-accent mb-3" />
              <h3 className="text-xl font-semibold mb-1">Connect Your Tools</h3>
              <p className="text-sm text-muted-foreground">
                Provide (mock) Jira tasks and Google Calendar events. Set your unavailable hours.
              </p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-background shadow-md">
              <Clock className="w-10 h-10 text-accent mb-3" />
              <h3 className="text-xl font-semibold mb-1">Generate Schedule</h3>
              <p className="text-sm text-muted-foreground">
                Our AI crafts a balanced weekly schedule, respecting your commitments and unavailability.
              </p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-background shadow-md">
              <CheckCircle className="w-10 h-10 text-accent mb-3" />
              <h3 className="text-xl font-semibold mb-1">Adapt & Improve</h3>
              <p className="text-sm text-muted-foreground">
                Provide feedback on task completion to help the AI learn and refine future schedules.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <div className="mb-12">
         <Image 
            src="https://placehold.co/600x400.png" 
            alt="Abstract representation of a schedule or calendar" 
            width={600} 
            height={400}
            className="rounded-lg shadow-2xl"
            data-ai-hint="schedule calendar"
          />
      </div>

      <Link href="/dashboard" passHref>
        <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-primary/50 transition-shadow">
          Get Started with WeekWise
          <Zap className="ml-2 w-5 h-5" />
        </Button>
      </Link>

      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} WeekWise. All rights reserved.</p>
        <p>Powered by AI, designed for productivity.</p>
      </footer>
    </div>
  );
}
