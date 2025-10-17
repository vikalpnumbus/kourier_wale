import { DateObject } from "react-multi-date-picker"; 


export function formatDateTime(isoString) {
  if (!isoString) return "";

  const date = new Date(isoString);


  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-based
  const year = date.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;

  
  const timeOptions = { hour: "numeric", minute: "numeric", hour12: true };
  const formattedTime = date.toLocaleTimeString("en-US", timeOptions);

  return `${formattedDate} ${formattedTime}`;
}


export function stringifyPayload(obj) {
  if (obj === null || obj === undefined) return "";
  if (Array.isArray(obj)) {
    return obj.map((item) => stringifyPayload(item));
  }
  if (typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, stringifyPayload(value)])
    );
  }
  if (typeof obj === "boolean") return obj;

  return String(obj);
}




export function getLastNDaysRange(n) {
  const now = new Date();
  const start = new Date();
  start.setDate(now.getDate() - (n - 1));
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  // format helper
  const formatDate = (d) => d.toISOString().split("T")[0]; // YYYY-MM-DD

  return [formatDate(start), formatDate(end)];
}
