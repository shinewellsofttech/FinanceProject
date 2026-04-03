/**
 * Get current date in YYYY-MM-DD format
 */
export const getCurrentDateYYYYMMDD = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Format date for display in DD/MM/YYYY format
 * @param dateStr - Date string or Date object
 * @returns Formatted date string in DD/MM/YYYY format or "-" if invalid
 */
export const formatDateDisplay = (dateStr: string | Date | null | undefined): string => {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "-";
  }
};

/**
 * Format date for input fields in YYYY-MM-DD format (HTML date input requirement)
 * @param dateStr - Date string or Date object
 * @returns Formatted date string in YYYY-MM-DD format or empty string if invalid
 */
export const formatDateForInput = (dateStr: string | Date | null | undefined): string => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

