import React from "react";

interface TricolorStripeProps {
  className?: string;
  rounded?: boolean;
}

export const TricolorStripe: React.FC<TricolorStripeProps> = ({
  className = "",
  rounded = true,
}) => {
  return (
    <div
      className={`h-1.5 w-full flex overflow-hidden ${
        rounded ? "rounded-t-2xl" : ""
      } ${className}`}
    >
      <div className="w-1/3 bg-[#C89B3C]" />
      <div className="w-1/3 bg-[#0E1B2E] dark:bg-[#1A2A44]" />
      <div className="w-1/3 bg-[#7A142A]" />
    </div>
  );
};
