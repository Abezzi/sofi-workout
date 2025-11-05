type ImperialUnit = {
  feet: number;
  inches: number;
};

export const imperialToMetric = (feets: number, inches: number): number => {
  const result: number = (feets * 12 + inches) * 2.54;
  return result;
};

export const metricToImperial = (cm: number): ImperialUnit => {
  const result: ImperialUnit = { feet: 0, inches: 0 };
  result.feet = Math.floor(cm / 30.48);
  result.inches = Math.round((cm % 30.48) / 2.54);
  return result;
};
