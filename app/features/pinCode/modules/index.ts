export const pinInactivityOptions: Record<number, { label: string; value: number | null }> = {
  0: { label: "Never", value: null },
  10: { label: "10 seconds", value: 10 },
  30: { label: "30 seconds", value: 30 },
  60: { label: "1 minute", value: 60 },
  120: { label: "2 minutes", value: 120 },
  300: { label: "5 minutes", value: 300 },
  600: { label: "10 minutes", value: 600 },
};
