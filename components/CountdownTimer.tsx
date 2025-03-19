import { useState, useEffect, useRef } from "react";
import { PlayIcon, PauseIcon, StopIcon } from "./icons";
import { Tournament } from "@/types/game";

interface CountdownTimerProps {
  tournament: Tournament;
}

export function CountdownTimer({ tournament }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(
    tournament.config?.timerDuration ?? 300
  );
  const [isRunning, setIsRunning] = useState(false);
  const [isOvertime, setIsOvertime] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  const endTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && endTimeRef.current) {
      interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(
          0,
          Math.ceil((endTimeRef.current! - now) / 1000)
        );
        setTimeLeft(remaining);

        if (remaining === 0) {
          if (!isOvertime && tournament.config?.enableOvertimer) {
            // Start overtime
            setIsOvertime(true);
            endTimeRef.current =
              Date.now() + (tournament.config.overtimerDuration ?? 120) * 1000;
          } else {
            // Timer finished
            setIsRunning(false);
            setIsTimeout(true);
          }
        }
      }, 100);
    }

    return () => clearInterval(interval);
  }, [
    isRunning,
    isOvertime,
    tournament.config?.enableOvertimer,
    tournament.config?.overtimerDuration,
  ]);

  const handleStart = () => {
    if (!isRunning) {
      setIsRunning(true);
      setIsTimeout(false);
      if (isOvertime) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      } else {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsOvertime(false);
    setIsTimeout(false);
    setTimeLeft(tournament.config?.timerDuration ?? 300);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsOvertime(false);
    setIsTimeout(false);
    setTimeLeft(tournament.config?.timerDuration ?? 300);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
      <div className="flex flex-col items-center gap-4">
        <h2
          className={`text-xl font-semibold ${
            !isOvertime
              ? "bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent"
              : "bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent"
          }`}
        >
          {!isOvertime ? "Game Timer" : "Overtime"}
        </h2>
        {isTimeout ? (
          <div className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Time&apos;s Up!
          </div>
        ) : (
          <div
            className={`text-6xl font-bold ${
              !isOvertime
                ? "bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent"
            }`}
          >
            {formatTime(timeLeft)}
          </div>
        )}
        <div className="flex gap-2">
          {!isTimeout ? (
            <>
              <button
                onClick={isRunning ? handlePause : handleStart}
                className={`${
                  isRunning
                    ? "bg-amber-700 hover:bg-amber-600"
                    : "bg-emerald-600 hover:bg-emerald-700"
                } text-white font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer`}
              >
                {isRunning ? (
                  <PauseIcon className="h-5 w-5" />
                ) : (
                  <PlayIcon className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={handleStop}
                disabled={!isRunning}
                className={`${
                  isRunning
                    ? "bg-red-800 hover:bg-red-700 cursor-pointer text-white"
                    : "bg-slate-800 text-slate-500 text-white/50"
                } font-semibold px-4 py-2 rounded-lg transition-colors`}
              >
                <StopIcon className="h-5 w-5" />
              </button>
            </>
          ) : (
            <button
              onClick={handleReset}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Reset Timer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
