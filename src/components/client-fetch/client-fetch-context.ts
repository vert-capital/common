import { createContext } from 'react';
import { IFetchParamsProps } from './client-fetch-types';

export interface ClientFetchContextProps<T = any, R = any> {
  data: T | undefined;
  dataSubmit: R | undefined;
  initialQuery: any | undefined;
  query: any | undefined;
  queryAll: any | undefined;
  urlParams: any | undefined;
  loading: boolean;
  loadingSubmit: boolean;
  error: string;
  errorSubmit: string;
  setQuery: (data: any) => void;
  get: (params: IFetchParamsProps) => void;
  post: (params: IFetchParamsProps) => void;
  onRefresh: () => void;
}

export const ClientFetchContext = createContext<ClientFetchContextProps<
  any,
  any
> | null>(null);
