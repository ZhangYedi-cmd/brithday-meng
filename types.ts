export enum Page {
  Loading = 'LOADING',
  Hall = 'HALL',
  // Radio removed
  PostOffice = 'POST_OFFICE',
  Cake = 'CAKE',
  StarBottle = 'STAR_BOTTLE',
  Finale = 'FINALE',
}

export interface AppState {
  page: Page;
  completed: {
    // radio removed
    post: boolean;
    cake: boolean;
    starBottle: boolean;
  };
  mute: boolean;
  showIntroModal: boolean;
}

export interface EnvelopeCategory {
  id: string;
  label: string;
  messages: string[];
}

export interface Decoration {
  id: number;
  type: 'candle' | 'strawberry' | 'star' | 'cookie';
  x: number;
  y: number;
}