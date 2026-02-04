/**
 * Formats a date string (YYYY-MM-DD or ISO) to DD/MM/YYYY without timezone shifts.
 */
export const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';

    // If it's an ISO string or just YYYY-MM-DD, take the date part
    const datePart = dateStr.split('T')[0];
    const [year, month, day] = datePart.split('-');

    if (!year || !month || !day) return dateStr;

    return `${day}/${month}/${year}`;
};

/**
 * Returns today's date in YYYY-MM-DD format based on local time.
 */
export const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Parses a date string to a Date object in a way that avoids timezone shifts.
 * Useful for calculations like number of days.
 */
export const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = datePart(dateStr).split('-').map(Number);
    return new Date(year, month - 1, day);
};

const datePart = (dateStr: string): string => {
    return dateStr.split('T')[0];
};
