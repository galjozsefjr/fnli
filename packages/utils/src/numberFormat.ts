import { config } from "process";

type NumberFormatConfig = {
  thousandsSeparator: string;
  decimals: number;
};

export const numberFormat = (number: number, configOverride?: Partial<NumberFormatConfig>): string => {
  const config: NumberFormatConfig = {
    thousandsSeparator: ' ',
    ...configOverride,
    decimals: Math.abs(configOverride?.decimals ?? 0),
  };
  const rounded = roundTo(number, config.decimals);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandsSeparator);
};

const roundTo = (number: number, decimals: number) => {
  if (decimals === 0) {
    return Math.round(number);
  }
  const keepDecimals = Math.pow(10, decimals);
  return Math.round(number * keepDecimals) / keepDecimals;
}