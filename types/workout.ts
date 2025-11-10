export type Step = {
  step: number;
  name: string;
  information: string | null;
  automatic: boolean;
  isRest: boolean;
  // if its automatic quantity is the amount of seconds and if not is the amount of repetitions
  quantity: number;
  weight: number | null;
  color: string | null;
  categoryName: string | null;
};

export type ExerciseItem = {
  key: string;
  isRest?: boolean;
  restSeconds?: number;
  exerciseTypeId: number;
  position?: number;
  exercise: {
    id: number;
    name: string;
    description: string;
  };
  category: {
    id: number;
    name: string;
    color: string;
  };
  amount: {
    quantity: number;
    weight: number;
  }[];
};
