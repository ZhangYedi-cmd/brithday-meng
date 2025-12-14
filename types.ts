export enum Page {
  Loading = 'LOADING',
  Hall = 'HALL',
  Radio = 'RADIO',
  PostOffice = 'POST_OFFICE',
  Cake = 'CAKE',
  StarBottle = 'STAR_BOTTLE', // New Page
  Finale = 'FINALE',
}

export interface AppState {
  page: Page;
  completed: {
    radio: boolean;
    post: boolean;
    cake: boolean;
    starBottle: boolean; // New State
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
