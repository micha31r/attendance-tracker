export function DateFormat({ date }: { date: string }) {
  const formattedDate = new Date(date).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return <span>{formattedDate}</span>;
}

export function TimeFormat({ date }: { date: string }) {
  const formattedDate = new Date(date).toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return <span>{formattedDate}</span>;
}

export function DateTimeFormat({ date }: { date: string }) {
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

  return <span>{formattedDate} at {formattedTime}</span>;
}