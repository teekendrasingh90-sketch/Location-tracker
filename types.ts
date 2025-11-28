export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationDetails {
  text: string;
  sources?: {
    uri: string;
    title: string;
  }[];
}

export enum LoadingState {
  IDLE = 'IDLE',
  GETTING_COORDS = 'GETTING_COORDS',
  FETCHING_DETAILS = 'FETCHING_DETAILS',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}