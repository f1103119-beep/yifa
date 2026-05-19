export interface TravelAdvice {
  places: {
    name: string;
    description: string;
    imageQuery: string;
  }[];
  foods: {
    name: string;
    description: string;
    imageQuery: string;
  }[];
  summary: string;
  lastUpdated: string;
}

export interface TripSearch {
  id: string;
  city: string;
  country: string;
  duration: number;
  timestamp: string;
  advice?: TravelAdvice;
}
