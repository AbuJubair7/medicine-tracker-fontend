import React from "react";

export default function LoadingSpinner({
  size = "md",
  color = "border-blue-500",
}: {
  size?: "sm" | "md" | "lg";
  color?: string;
}) {
  const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-4",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className="flex justify-center items-center p-4">
      <div
        className={`animate-spin rounded-full border-t-transparent ${color} ${sizeClasses[size]}`}
      ></div>
    </div>
  );
}
