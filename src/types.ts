export interface Planet {
  id: string;
  name: string;
  tagline: string;
  description: string;
  distance: string;
  orbit: string;
  gravity: string;
  temperature: string;
  image: string;
  color: string;
  order: string;
  details: {
    overview: string;
    structure: string;
    surface: string;
  };
}

export interface Skill {
  name: string;
  level: string;
}

export interface SimulationObject {
  id: string;
  name: string;
  icon: string;
  mass: number;
  drag: number;
}

export interface Environment {
  id: string;
  name: string;
  gravity: number;
  color: string;
}
