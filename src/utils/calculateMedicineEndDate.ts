import { Medicine } from '@/types';

export interface MedicineEndInfo {
  endDate: Date;
  endTimeLabel: string;
  endSlot: 'Morning' | 'Noon' | 'Evening';
  daysLeft: number;
  alreadyFinished: boolean;
}

/**
 * Calculate when a medicine will run out based on its remaining quantity
 * and daily schedule (morning/afternoon/evening with specific hours).
 *
 * Algorithm:
 * 1. Build sorted list of schedule times for this medicine.
 * 2. Figure out how many remaining doses are left today (times > current hour).
 * 3. Deduct today's remaining doses from quantity.
 *    - If quantity runs out today, find exact slot.
 * 4. Divide remaining by doses-per-day to get full days + remainder.
 * 5. Add full days from tomorrow, then pick the Nth slot for the remainder.
 */
export function calculateMedicineEndDate(med: Medicine): MedicineEndInfo | null {
  const quantity = Number(med.quantity);

  // Build schedule: array of { hour, slot }
  const schedule: { hour: number; slot: 'Morning' | 'Noon' | 'Evening' }[] = [];
  if (med.takeMorning) schedule.push({ hour: med.morningTime ?? 9, slot: 'Morning' });
  if (med.takeAfternoon) schedule.push({ hour: med.afternoonTime ?? 14, slot: 'Noon' });
  if (med.takeEvening) schedule.push({ hour: med.eveningTime ?? 21, slot: 'Evening' });

  if (schedule.length === 0 || quantity <= 0) {
    return {
      endDate: new Date(),
      endTimeLabel: 'Already finished',
      endSlot: 'Morning',
      daysLeft: 0,
      alreadyFinished: quantity <= 0,
    };
  }

  // Sort schedule by hour ascending
  schedule.sort((a, b) => a.hour - b.hour);

  const dosesPerDay = schedule.length;
  const now = new Date();
  const currentHour = now.getHours();

  // Step 1: How many doses remain today (schedule times whose hour > currentHour)
  const remainingDosesToday = schedule.filter(s => s.hour > currentHour).length;

  // Step 2: Deduct today's remaining doses
  let remaining = quantity;

  if (remainingDosesToday >= remaining) {
    // Medicine finishes today
    // Find the exact slot where it runs out
    const todaySlots = schedule.filter(s => s.hour > currentHour);
    const finishIndex = remaining - 1; // 0-indexed
    const finishSlot = todaySlots[finishIndex];
    const endDate = new Date(now);
    endDate.setHours(finishSlot.hour, 0, 0, 0);

    return {
      endDate,
      endTimeLabel: formatEndDate(endDate, finishSlot.hour),
      endSlot: finishSlot.slot,
      daysLeft: 0,
      alreadyFinished: false,
    };
  }

  // Deduct today's doses
  remaining -= remainingDosesToday;

  // Step 3: Calculate full days and remainder
  const fullDays = Math.floor(remaining / dosesPerDay);
  const remainder = remaining % dosesPerDay;

  // Step 4: Count forward from tomorrow
  let endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 1); // Start from tomorrow
  endDate.setHours(0, 0, 0, 0);

  // Add full days
  endDate.setDate(endDate.getDate() + fullDays);

  let finishSlot: { hour: number; slot: 'Morning' | 'Noon' | 'Evening' };

  if (remainder === 0) {
    // Finishes at the last slot of the previous day
    endDate.setDate(endDate.getDate() - 1);
    finishSlot = schedule[schedule.length - 1];
  } else {
    // Finishes at the Nth slot of the extra day
    finishSlot = schedule[remainder - 1];
  }

  endDate.setHours(finishSlot.hour, 0, 0, 0);

  const daysLeft = Math.ceil(
    (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    endDate,
    endTimeLabel: formatEndDate(endDate, finishSlot.hour),
    endSlot: finishSlot.slot,
    daysLeft: Math.max(0, daysLeft),
    alreadyFinished: false,
  };
}

function formatEndDate(date: Date, hour: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const hourStr = hour.toString().padStart(2, '0');
  return `${month} ${day}, ${hourStr}:00`;
}
