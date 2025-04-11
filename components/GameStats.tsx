"use client";

import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";

interface GameStatsProps {
  score: number;
  timeLeft: number;
  highScore: number;
}

const GameStats = ({ score, timeLeft, highScore }: GameStatsProps) => {
  // Calculate progress percentage
  const timeProgress = (timeLeft / 60) * 100;
  
  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <span className="font-semibold">{highScore}</span>
      </div>
      
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Score: {score}</span>
          <span className="text-sm font-medium">{timeLeft}s</span>
        </div>
        <Progress value={timeProgress} className="w-32 h-2" />
      </div>
    </div>
  );
};

export default GameStats;