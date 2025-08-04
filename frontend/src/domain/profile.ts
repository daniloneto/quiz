export interface Profile {
  id: string;
  name: string;
  points: number;
  level: string;
}

export interface Level {
  name: string;
  minPoints: number;
  maxPoints: number;
}
