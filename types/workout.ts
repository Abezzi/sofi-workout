export type Step = {
  step: number;
  name: string;
  information: string | null;
  automatic: boolean;
  isRest: boolean;
  // if its automatic quantity is the amount of seconds and if not is the amount of repetitions
  quantity: number;
  weight: number | null;
};
