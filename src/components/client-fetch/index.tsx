import { getFiltersFromUrl, useFetchClient } from '@/hooks';
import { useEffect, useRef, useState } from 'react';
import { ClientFetchContext } from './client-fetch-context';
import { IFetchParamsProps, Props } from './client-fetch-types';

export function ClientFetchProvider({
  componentId,
  endpointGet,
  endpointPost,
  initialQuery,
  config: _config,
  children,
}: Props) {
  const {
    query,
    data,
    dataSubmit,
    error,
    errorSubmit,
    loading,
    loadingSubmit,
    setQuery,
    fetchData,
  } = useFetchClient();
  const urlParams = useRef<any | undefined>();
  const [queryAll, setQueryAll] = useState<any>({});

  const fetchDataGet = ({ query: _query, config }: IFetchParamsProps) => {
    if (!endpointGet) throw new Error('endpointGet is required');
    const data = {
      ...initialQuery,
      ...(_query || query(componentId)),
    };

    fetchData({
      componentId,
      resourcePath: endpointGet,
      data: data,
      method: 'GET',
      config: {
        ...config,
        noPrefixQuery: _config?.noPrefixQuery || config?.noPrefixQuery,
        noUrlParams: _config?.noUrlParams || config?.noUrlParams,
        initialLoading: _config?.initialLoading,
      },
    });
  };

  const fetchDataPost = ({ body, config }: IFetchParamsProps) => {
    if (!endpointPost) throw new Error('endpointPost is required');
    fetchData({
      componentId,
      resourcePath: endpointPost,
      method: 'POST',
      body,
      config,
    });
  };

  const setQueryComponent = (_data: any) => {
    setQuery({
      componentId,
      data: _data,
    });
  };

  const onRefresh = () => {
    setQueryComponent({ componentId });
  };

  useEffect(() => {
    urlParams.current = getFiltersFromUrl({
      componentId,
      noPrefixQuery: _config?.noPrefixQuery,
    });

    if (endpointGet) {
      fetchDataGet({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query(componentId)]);

  useEffect(() => {
    const _urlParams = getFiltersFromUrl({
      componentId,
      noPrefixQuery: _config?.noPrefixQuery,
    });

    setQueryAll({
      ...initialQuery,
      ...query(componentId),
      ..._urlParams,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query(componentId), initialQuery]);

  return (
    <ClientFetchContext.Provider
      value={{
        initialQuery: initialQuery,
        query: query(componentId),
        queryAll: queryAll,
        urlParams: urlParams.current,
        data: data(componentId),
        dataSubmit: dataSubmit(componentId),
        error: error(componentId) || '',
        errorSubmit: errorSubmit(componentId) || '',
        loading: loading(componentId) || false,
        loadingSubmit: loadingSubmit(componentId),
        setQuery: setQueryComponent,
        get: fetchDataGet,
        post: fetchDataPost,
        onRefresh,
      }}
    >
      {children}
    </ClientFetchContext.Provider>
  );
}
