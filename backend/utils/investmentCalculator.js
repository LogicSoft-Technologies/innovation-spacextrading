export const getDurationInDays = (durationValue, durationUnit) => {
  const value = Number(durationValue);

  if (Number.isNaN(value) || value <= 0) {
    throw new Error("Investment duration must be greater than 0");
  }

  const units = {
    days: 1,
    weeks: 7,
    months: 30,
    years: 365,
  };

  if (!units[durationUnit]) {
    throw new Error("Invalid investment duration unit");
  }

  return value * units[durationUnit];
};

export const calculateInvestmentReturns = (amount, durationDays) => {
  const investedAmount = Number(amount);

  if (Number.isNaN(investedAmount) || investedAmount <= 0) {
    throw new Error("Investment amount must be greater than 0");
  }

  const twoDayCycles = Math.floor(durationDays / 2);
  const profit = investedAmount * 0.3 * twoDayCycles;
  const returns = investedAmount + profit;

  return {
    twoDayCycles,
    profit,
    returns,
  };
};