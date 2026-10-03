import React from "react";
import { ConfidenceLevel } from "../types";
import { CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";

interface Props {
  level: ConfidenceLevel;
  percentage?: number;
  size?: "sm" | "md" | "lg";
  isNonBird?: boolean;
}

export const ConfidenceBadge: React.FC<Props> = ({ level, percentage, size = "md", isNonBird }) => {
  let bg = "bg-emerald-50 text-emerald-800 border-emerald-200";
  let icon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  let labelText = level as string;

  if (isNonBird) {
    bg = "bg-rose-100 text-rose-800 border-rose-300";
    icon = <AlertTriangle className="w-4 h-4 text-rose-600" />;
    labelText = "No Bird Detected";
  } else if (level === "Possible identification") {
    bg = "bg-amber-50 text-amber-800 border-amber-200";
    icon = <AlertTriangle className="w-4 h-4 text-amber-600" />;
  } else if (level === "Identification uncertain") {
    bg = "bg-rose-50 text-rose-800 border-rose-200";
    icon = <HelpCircle className="w-4 h-4 text-rose-600" />;
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
    lg: "px-4 py-1.5 text-base gap-2 font-medium",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-sans font-medium tracking-tight shadow-sm ${bg} ${sizeClasses[size]}`}
    >
      {icon}
      <span>{labelText}</span>
      {!isNonBird && percentage !== undefined && (
        <span className="font-mono opacity-80 ml-1">({percentage}%)</span>
      )}
    </span>
  );
};
