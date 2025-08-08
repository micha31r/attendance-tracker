export function DateFormat({ className, date }: { className?: string, date: string }) {
  const formattedDate = new Date(date).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return <span className={className}>{formattedDate}</span>;
}

export function TimeFormat({ className, date }: { className?: string, date: string }) {
  const formattedDate = new Date(date).toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return <span className={className}>{formattedDate}</span>;
}

export function DateTimeFormat({ className, date, connective = " " }: { className?: string, date: string, connective?: string }) {
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const formattedTime = dateObj.toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return <span className={className}>{formattedDate}{connective}{formattedTime}</span>;
}