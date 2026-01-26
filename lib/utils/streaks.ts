// Minimal type for streak calculations - only needs _id and createdAt
type JournalEntry = {
  _id: string;
  createdAt: string;
};

// What we return when calculating streaks
interface StreakData {
  currentStreak: number; // How many days in a row you've written (including today or yesterday)
  longestStreak: number; // The best streak you've ever had
  lastEntryDate: string | null; // When you last wrote an entry
  streakDates: string[]; // All the dates in your current streak
}

/**
 * Converts any date to a simple "YYYY-MM-DD" string format
 * Example: "2025-01-26T15:30:00Z" becomes "2025-01-26"
 */
const toDateString = (date: Date | string): string =>
  new Date(date).toISOString().split("T")[0];

/**
 * Gets all unique dates when you wrote entries, sorted from newest to oldest
 * If you wrote 3 entries on Monday and 2 on Tuesday, this returns ["Tuesday", "Monday"]
 */
const getUniqueDates = (entries: JournalEntry[]): string[] =>
  [...new Set(entries.map((entry) => toDateString(entry.createdAt)))].sort(
    (a, b) => b.localeCompare(a),
  );

/**
 * Adds (or subtracts) days from a date
 * Example: addDays("2025-01-26", -1) = "2025-01-25" (yesterday)
 * Example: addDays("2025-01-26", 3) = "2025-01-29" (3 days from now)
 */
const addDays = (date: string, days: number): string => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return toDateString(newDate);
};

/**
 * Calculates how many days are between two dates
 * Example: daysBetween("2025-01-26", "2025-01-24") = 2 days
 */
const daysBetween = (date1: string, date2: string): number =>
  Math.floor(
    (new Date(date1).getTime() - new Date(date2).getTime()) /
      (1000 * 60 * 60 * 24),
  );

/**
 * Figures out your CURRENT streak (how many days in a row you've written)
 * - Starts counting from today (if you wrote today) or yesterday (if you didn't)
 * - Counts backwards day by day until it finds a day you didn't write
 * - Example: Wrote Mon, Tue, Wed, [skipped Thu], Fri, Sat → streak is 2 days (Fri, Sat)
 */
const calculateCurrentStreak = (
  entryDates: string[],
): { streak: number; dates: string[] } => {
  const today = toDateString(new Date());
  const yesterday = addDays(today, -1);

  // If you wrote today, start from today. Otherwise start from yesterday
  const hasEntryToday = entryDates.includes(today);
  const startDate = hasEntryToday ? today : yesterday;

  // Create a list of consecutive dates going backwards: [start, start-1, start-2, ...]
  const generateConsecutiveDates = (start: string): string[] =>
    Array.from({ length: entryDates.length }, (_, i) => addDays(start, -i));

  const consecutiveDates = generateConsecutiveDates(startDate);
  
  // Keep only the dates you actually wrote on
  const streakDates = consecutiveDates.filter((date) =>
    entryDates.includes(date),
  );

  // Find the first day you DIDN'T write - that's where your streak breaks
  const streakEndIndex = consecutiveDates.findIndex(
    (date) => !entryDates.includes(date),
  );
  const streak = streakEndIndex === -1 ? streakDates.length : streakEndIndex;

  return {
    streak,
    dates: streakDates.slice(0, streak).reverse(), // Return dates oldest to newest
  };
};

/**
 * Finds your LONGEST streak ever (your personal best!)
 * - Looks through ALL your entries in history
 * - Finds the longest run of consecutive days
 * - Example: Wrote 3 days in a row in Jan, 7 days in a row in March → returns 7
 */
const findLongestStreak = (entryDates: string[]): number => {
  if (!entryDates.length) return 0;

  // Compare each date with the one before it to see if they're consecutive (1 day apart)
  const datePairs = entryDates.slice(1).map((date, i) => ({
    date,
    prevDate: entryDates[i],
    isConsecutive: daysBetween(entryDates[i], date) === 1, // Are these dates 1 day apart?
  }));

  // Group consecutive dates into separate streaks [3, 1, 7, 2] means 4 different streaks
  const streaks = datePairs.reduce(
    (acc, { isConsecutive }, index) => {
      if (isConsecutive) {
        // Extend the current streak
        acc[acc.length - 1] = (acc[acc.length - 1] || 1) + 1;
      } else {
        // Start a new streak
        acc.push(1);
      }
      return acc;
    },
    [1] as number[], // Start with 1 day (the first entry)
  );

  // Return the biggest streak number
  return Math.max(...streaks);
};

/**
 * MAIN FUNCTION: Calculates all your streak stats in one go
 * Give it your journal entries and it returns:
 * - Your current streak (how many days in a row recently)
 * - Your longest streak ever (personal record)
 * - When you last wrote
 * - All the dates in your current streak
 */
export const calculateStreaks = (entries: JournalEntry[]): StreakData => {
  // No entries? No streaks!
  if (!entries?.length) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastEntryDate: null,
      streakDates: [],
    };
  }

  const entryDates = getUniqueDates(entries);
  const { streak: currentStreak, dates: streakDates } =
    calculateCurrentStreak(entryDates);
  const longestStreak = findLongestStreak(entryDates);

  return {
    currentStreak,
    longestStreak,
    lastEntryDate: entryDates[0] ?? null, // First date = most recent
    streakDates,
  };
};

/**
 * Quick check: Is your streak still alive?
 * Returns true if you wrote today OR yesterday
 * Returns false if you haven't written in 2+ days (streak is broken)
 */
export const isStreakActive = (entries: JournalEntry[]): boolean => {
  if (!entries?.length) return false;

  const today = toDateString(new Date());
  const yesterday = addDays(today, -1);
  const entryDates = entries.map((entry) => toDateString(entry.createdAt));

  return entryDates.includes(today) || entryDates.includes(yesterday);
};

/**
 * Creates a motivational message based on your streak
 * - No streak? Encourages you to start
 * - Wrote today? Celebrates your streak
 * - Didn't write today? Reminds you to keep it going
 */
export const getStreakStatusMessage = ({
  currentStreak,
  lastEntryDate,
}: StreakData): string => {
  if (currentStreak === 0) {
    return "Start your journaling streak today! ✨";
  }

  const hasEntryToday = lastEntryDate === toDateString(new Date());

  const messages = {
    1: hasEntryToday
      ? "Great start! Keep it going tomorrow! 🔥"
      : "1 day streak - write today to continue! 💪",
    default: hasEntryToday
      ? `Amazing! ${currentStreak} day streak! 🔥`
      : `${currentStreak} day streak - write today to continue! 🔥`,
  };

  return messages[currentStreak as keyof typeof messages] ?? messages.default;
};

/**
 * Tells you how close you are to your next streak goal
 * Milestones: 5, 10, 25, 50, 100, 200, 365 days, etc.
 * Example: If you have a 7 day streak, tells you "3 days until 10 day milestone!"
 */
export const getDaysUntilNextMilestone = (
  currentStreak: number,
): {
  daysUntil: number;
  milestone: number;
} => {
  const milestones = [5, 10, 25, 50, 100, 200, 365, 500, 1000];

  // Find the first milestone you haven't reached yet
  const nextMilestone =
    milestones.find((milestone) => currentStreak < milestone) ??
    Math.ceil(currentStreak / 100) * 100; // If past all milestones, round up to next 100

  return {
    daysUntil: nextMilestone - currentStreak,
    milestone: nextMilestone,
  };
};
