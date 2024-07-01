import {
  handleError,
  queryStringToJSON,
  toQueryString,
  urlTransform,
} from '@/lib';
import { useEffect, useRef, useState } from 'react';

type Props = {
  method?: 'get' | 'post' | 'put' | 'delete' | 'patch';
  resourcePath: string;
  params?: any;
  initialLoading?: boolean;
  initialQuery?: any;
  ignoreQuery?: boolean;
  prefixQuery?: string;
  location?: any;
};

const loadingDelay = 400;

export const useComponentFetch = <TData,>({
  method = 'get',
  resourcePath,
  params,
  initialLoading,
  initialQuery,
  ignoreQuery,
  prefixQuery,
  location,
}: Props) => {
  const [loading, setLoading] = useState(initialLoading || false);
  const [query, setQuery] = useState<any>(initialQuery);
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState('');
  const timeoutRef = useRef<any | null>(null);
  const isReady = useRef(false);
  const [querySearch, setQuerySearch] = useState('');

  const loadData = async (_query?: any) => {
    const { search } = location || {};
    const search_filter = queryStringToJSON(search) || {};

    const _queryString = ignoreQuery
      ? ''
      : _query
      ? `?${toQueryString(
          prefixQuery
            ? {
                [prefixQuery]: JSON.stringify({
                  ..._query,
                  ...search_filter,
                }),
              }
            : {
                ..._query,
                ...search_filter,
              },
        )}`
      : '';

    try {
      setError('');

      let response: any;
      if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          setLoading(true);
        }, loadingDelay);
      }

      const url = urlTransform({
        url: resourcePath,
        params: params || {},
      });

      if (method === 'get') {
        response = await api.get(`${url}${_queryString}`, {});
      } else if (method === 'post') {
        response = await api.post(`${url}${_queryString}`, {});
      } else if (method === 'put') {
        response = await api.put(`${url}${_queryString}`, {});
      } else if (method === 'delete') {
        response = await api.delete(`${url}${_queryString}`, {});
      } else if (method === 'patch') {
        response = await api.patch(`${url}${_queryString}`, {});
      }

      if (response?.error) {
        setError(handleError(response?.error).message);
      } else {
        setData(response as TData);
        setQuery(_query);
      }
    } catch (error: any) {
      setError(handleError(error).message);
    } finally {
      setLoading(false);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    setTimeout(() => {
      if (!isReady.current || querySearch !== location?.search) {
        loadData(query);
        isReady.current = true;
      }
      setQuerySearch(location?.search);
    }, 1);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.search]);

  return { loading, error, query, data, loadData };
};

type FetchProps = {
  request?: Request;
  body?: any;
  baseUrl?: string;
  token?: string;
};

export const api = {
  get: async (url: string, options?: FetchProps) => {
    return await request('GET', url, options);
  },
  post: async (url: string, options?: FetchProps) => {
    return await request('POST', url, options);
  },
  put: async (url: string, options?: FetchProps) => {
    return await request('PUT', url, options);
  },
  delete: async (url: string, options?: FetchProps) => {
    return await request('DELETE', url, options);
  },
  patch: async (url: string, options?: FetchProps) => {
    return await request('PATCH', url, options);
  },
};

async function request(method: string, url: string, options?: FetchProps) {
  const _url = `${options?.baseUrl || ''}${url}`;
  const headers: any = {
    'Content-Type': 'application/json',
  };

  if (options?.token) {
    headers['Authorization'] = `${options?.token}`;
  }
  const response = await fetch(_url, {
    method: method,
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });
  const contentType = response.headers.get('content-type');

  if (!response.ok) {
    if (contentType && contentType.includes('application/json')) {
      throw await response.json();
    } else {
      throw await response.text();
    }
  }
  if (!contentType || !contentType.includes('application/json'))
    return await response.text();
  return await response.json();
}
