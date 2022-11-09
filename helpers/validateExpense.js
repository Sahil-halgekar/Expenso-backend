exports.validateExpense = (expense_amount, shares) => {
  const EPSILON = 0.0000001;
  const totalShares = shares.reduce((a, b) => a + b.share_amount, 0);
  return Math.abs(totalShares - Number(expense_amount)) < EPSILON;
};
