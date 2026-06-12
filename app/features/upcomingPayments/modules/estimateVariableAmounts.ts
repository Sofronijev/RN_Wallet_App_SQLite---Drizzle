export const ESTIMATE_SAMPLE_SIZE = 3;

type PaidSumRow = {
  upcomingPaymentId: number;
  paidTotal: number | null;
};

export const computeVariableEstimates = (rows: PaidSumRow[]): Map<number, number> => {
  const samples = new Map<number, number[]>();
  for (const row of rows) {
    if (row.paidTotal == null) continue;
    const existing = samples.get(row.upcomingPaymentId);
    if (!existing) {
      samples.set(row.upcomingPaymentId, [Math.abs(row.paidTotal)]);
    } else if (existing.length < ESTIMATE_SAMPLE_SIZE) {
      existing.push(Math.abs(row.paidTotal));
    }
  }
  const estimates = new Map<number, number>();
  for (const [paymentId, amounts] of samples) {
    const sum = amounts.reduce((total, amount) => total + amount, 0);
    estimates.set(paymentId, sum / amounts.length);
  }
  return estimates;
};
