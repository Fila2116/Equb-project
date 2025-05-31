export const formatCurrencyWithSymbolAfter = (
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string => {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Format the amount using the formatter
  const formattedAmount = formatter.format(amount);

  // Move the currency symbol to the end
  const currencySymbol =
    formatter.formatToParts(amount).find((part) => part.type === "currency")
      ?.value || currency;
  const amountOnly = formattedAmount.replace(currencySymbol, "").trim();

  return `${amountOnly} ${currencySymbol}`;
};
