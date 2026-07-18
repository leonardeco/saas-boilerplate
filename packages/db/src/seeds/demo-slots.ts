/** Helper dates for demo slots — used by seed runner. */
export function upcomingSlots(days = 7) {
  const slots: Array<{ startsAt: Date; endsAt: Date; capacity: number; label: string }> =
    [];
  const now = new Date();
  for (let d = 1; d <= days; d++) {
    for (const hour of [19, 21]) {
      const startsAt = new Date(now);
      startsAt.setDate(now.getDate() + d);
      startsAt.setHours(hour, 0, 0, 0);
      const endsAt = new Date(startsAt);
      endsAt.setHours(hour + 2);
      slots.push({
        startsAt,
        endsAt,
        capacity: 12,
        label: `${hour}:00`,
      });
    }
  }
  return slots;
}
