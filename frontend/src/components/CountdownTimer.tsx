import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  timeRemaining: number; // in milliseconds
  phase: "active" | "submission" | "ended";
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  timeRemaining: initialTimeRemaining,
  phase,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTimeRemaining);

  useEffect(() => {
    setTimeRemaining(initialTimeRemaining);
  }, [initialTimeRemaining]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);

  const getColorClass = () => {
    if (phase === "submission") return "text-gold";
    if (minutes < 5) return "text-accent";
    if (minutes < 10) return "text-yellow-400";
    return "text-green-400";
  };

  const getStatusText = () => {
    if (phase === "submission") return "SUBMISSION WINDOW";
    if (phase === "active") return "ACTIVE ROUND";
    return "ROUND ENDED";
  };

  return (
    <div className="bg-secondary p-6 rounded-lg border-2 border-accent">
      <div className="text-center">
        <div className="text-sm font-semibold text-gray-400 mb-2">
          {getStatusText()}
        </div>
        <div className={`font-heading text-6xl ${getColorClass()}`}>
          {minutes.toString().padStart(2, "0")}:
          {seconds.toString().padStart(2, "0")}
        </div>
        <div className="text-sm text-gray-400 mt-2">
          {phase === "submission"
            ? "Time to submit"
            : "Until submission window"}
        </div>
      </div>
    </div>
  );
};
