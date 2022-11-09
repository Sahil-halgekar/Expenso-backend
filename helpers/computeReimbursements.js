const { toTwoDecimals } = require('./toTwoDecimals');

exports.computeReimbursements = (balances) => {
  const reimbursements = [];

  // Create a deep copy of group stats in order update the stats overs interations without changing the original stats
  const currentBalances = JSON.parse(
    JSON.stringify(
      balances.map((e) => {
        return { user: e.user, balance: e.balance };
      })
    )
  );

  while (
    currentBalances.some((e) => {
      return e.balance !== 0;
    })
  ) {
    // Sort by balance in ascending order
    currentBalances.sort((a, b) => {
      return a.balance - b.balance;
    });

    // Get user with min balance
    const withMinBalance = currentBalances[0];

    // Get user with max balance
    const withMaxBalance = currentBalances[currentBalances.length - 1];

    // Compute the reimbursement value by comparing the two balance (in absolute value)
    let reimbursement = 0;
    if (Math.abs(withMinBalance.balance) <= withMaxBalance.balance) {
      reimbursement = Math.abs(withMinBalance.balance);
    } else {
      reimbursement = withMaxBalance.balance;
    }

    // Add to reimbursements and update current balances
    reimbursements.push({
      user: withMinBalance.user,
      owed_amount: reimbursement,
      owes_to: withMaxBalance.user,
    });
    withMinBalance.balance = toTwoDecimals(
      withMinBalance.balance + reimbursement
    );
    withMaxBalance.balance = toTwoDecimals(
      withMaxBalance.balance - reimbursement
    );
  }

  return reimbursements.sort((a, b) => {
    return a.user._id.localeCompare(b.user._id);
  });
};
