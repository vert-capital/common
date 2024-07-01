import { useContext } from 'react';
import {
  ClientFetchContext,
  ClientFetchContextProps,
} from './client-fetch-context';

export const useClientFetchContext = <T = any, R = any>() => {
  const context = useContext(ClientFetchContext) as ClientFetchContextProps<
    T,
    R
  > | null;

  if (!context) {
    throw new Error(
      'useClientFetchContext must be used within a ClientFetchProvider',
    );
  }

  return context;
};
