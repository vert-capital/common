import { camelToSnake, handleError, isObjectEmpty, snakeToCamel } from '@/lib';
import { queryStringToJSON, toQueryString } from '@/lib/url-transform';
import { create } from 'zustand';

export const loadingDelay = 400; // 400 ms

interface IParamsProps {
  componentId: string;
  data?: any;
  noPrefixQuery?: boolean;
}

interface IParamsGroupsProps {
  componentIds: string[];
  data?: any;
  noPrefixQuery?: boolean;
}

interface IFetchClientConfigProps {
  noUrlParams?: boolean;
  noPrefixQuery?: boolean;
  initialLoading?: boolean;
}

interface IFetchParamsProps extends IParamsProps {
  resourcePath: string;
  config?: IFetchClientConfigProps;
  method?: 'GET' | 'POST';
  body?: FormData;
}

interface IFetchClientProps {
  components: any;
  setQuery: (p: IParamsProps) => void;
  setQueryGroup: (p: IParamsGroupsProps) => void;
  clearQuery: (componentId: string) => void;
  clearQueryGroup: (componentIds: [string]) => void;
  clearAllQuery: () => void;
  setData: (p: IParamsProps) => void;
  setDataSubmit: (p: IParamsProps) => void;
  setError: (p: IParamsProps) => void;
  setErrorSubmit: (p: IParamsProps) => void;
  fetchData: (p: IFetchParamsProps) => void;
  data: <T = any>(componentId: string) => T | undefined;
  dataSubmit: <T = any>(componentId: string) => T | undefined;
  query: (componentId: string) => any;
  loading: (componentId: string) => boolean;
  loadingSubmit: (componentId: string) => boolean;
  error: (componentId: string) => string;
  errorSubmit: (componentId: string) => string;
}

export const useFetchClient = create<IFetchClientProps>((set, get) => ({
  components: {},
  setQuery: ({ componentId, data }: IParamsProps) => {
    if (!data) data = {};
    const query = typeof data === 'string' ? queryStringToJSON(data) : data;
    set((state) => ({
      components: {
        ...state.components,
        [transformComponentId(componentId)]: {
          ...state.components[transformComponentId(componentId)],
          query: {
            ...state.components[transformComponentId(componentId)]?.query,
            ...query,
          },
        },
      },
    }));

    if (
      !get().components[transformComponentId(componentId)]?.config?.noUrlParams
    ) {
      updateUrlWithFilters({
        componentId: transformComponentId(componentId),
        data,
        noPrefixQuery:
          get().components[transformComponentId(componentId)]?.config
            ?.noPrefixQuery,
      });
    }
  },
  setQueryGroup: ({
    componentIds,
    data,
    noPrefixQuery,
  }: IParamsGroupsProps) => {
    if (!data) data = {};
    const query = typeof data === 'string' ? queryStringToJSON(data) : data;

    componentIds.forEach((componentId) => {
      set((state) => ({
        components: {
          ...state.components,
          [transformComponentId(componentId)]: {
            ...state.components[transformComponentId(componentId)],
            query: query,
          },
        },
      }));
      if (
        !get().components[transformComponentId(componentId)]?.config
          ?.noUrlParams
      ) {
        updateUrlWithFilters({
          componentId: !noPrefixQuery ? transformComponentId(componentId) : '',
          data,
          noPrefixQuery: !noPrefixQuery
            ? get().components[transformComponentId(componentId)]?.config
                ?.noPrefixQuery
            : false,
        });
      }
    });
  },
  clearQuery: (componentId: string) => {
    set((state) => ({
      components: {
        ...state.components,
        [transformComponentId(componentId)]: {
          ...state.components[transformComponentId(componentId)],
          query: {},
        },
      },
    }));
    updateUrlWithFilters({
      componentId: transformComponentId(componentId),
      data: {},
      noPrefixQuery:
        get().components[transformComponentId(componentId)]?.config
          ?.noPrefixQuery,
    });
  },
  clearQueryGroup: (componentIds: [string]) => {
    componentIds.forEach((componentId) => {
      set((state) => ({
        components: {
          ...state.components,
          [transformComponentId(componentId)]: {
            ...state.components[transformComponentId(componentId)],
            query: {},
          },
        },
      }));
      updateUrlWithFilters({
        componentId: transformComponentId(componentId),
        data: {},
        noPrefixQuery:
          get().components[transformComponentId(componentId)]?.config
            ?.noPrefixQuery,
      });
    });
  },
  clearAllQuery: () => {
    const componentIds = Object.keys(get().components);
    componentIds.forEach((componentId) => {
      set((state) => ({
        components: {
          ...state.components,
          [transformComponentId(componentId)]: {
            ...state.components[transformComponentId(componentId)],
            query: {},
          },
        },
      }));
    });
  },
  setData: ({ componentId, data }: IParamsProps) =>
    set((state) => ({
      components: {
        ...state.components,
        [transformComponentId(componentId)]: {
          ...state.components[transformComponentId(componentId)],
          data,
          loading: false,
          error: undefined,
        },
      },
    })),
  setDataSubmit: ({ componentId, data }: IParamsProps) =>
    set((state) => ({
      components: {
        ...state.components,
        [transformComponentId(componentId)]: {
          ...state.components[transformComponentId(componentId)],
          dataSubmit: data,
          loadingSubmit: false,
          errorSubmit: undefined,
        },
      },
    })),
  setError: ({ componentId, data }: IParamsProps) =>
    set((state) => ({
      components: {
        ...state.components,
        [transformComponentId(componentId)]: {
          ...state.components[transformComponentId(componentId)],
          data: undefined,
          error: data as string,
          loading: false,
        },
      },
    })),
  setErrorSubmit: ({ componentId, data }: IParamsProps) =>
    set((state) => ({
      components: {
        ...state.components,
        [transformComponentId(componentId)]: {
          ...state.components[transformComponentId(componentId)],
          dataSubmit: undefined,
          errorSubmit: data as string,
          loadingSubmit: false,
        },
      },
    })),
  data: (componentId: string) =>
    get().components[transformComponentId(componentId)]?.data,
  dataSubmit: (componentId: string) =>
    get().components[transformComponentId(componentId)]?.dataSubmit,
  query: (componentId: string) =>
    get().components[transformComponentId(componentId)]?.query,
  loading: (componentId: string) =>
    get().components[transformComponentId(componentId)]?.loading,
  loadingSubmit: (componentId: string) =>
    get().components[transformComponentId(componentId)]?.loadingSubmit,
  error: (componentId: string) =>
    get().components[transformComponentId(componentId)]?.error,
  errorSubmit: (componentId: string) =>
    get().components[transformComponentId(componentId)]?.errorSubmit,
  fetchData: async ({
    componentId,
    resourcePath,
    data,
    config,
    method,
    body,
  }: IFetchParamsProps) => {
    if (!componentId) throw new Error('componentId is required');
    const isPost = method === 'POST';
    let isRequestPending = true;

    set((state) => ({
      components: {
        ...state.components,
        [transformComponentId(componentId)]: {
          ...state.components[transformComponentId(componentId)],
          config,
          timeoutRequest: null,
          loading: false,
        },
      },
    }));

    // Controla se exibe o loading dependendo do tempo de resposta
    if (!isPost) {
      const timeoutRef = setTimeout(
        () => {
          if (isRequestPending) {
            set((state) => ({
              components: {
                ...state.components,
                [transformComponentId(componentId)]: {
                  ...state.components[transformComponentId(componentId)],
                  loading: true,
                  error: '',
                },
              },
            }));
          }
        },
        config?.initialLoading ? 0 : loadingDelay,
      );

      set((state) => ({
        components: {
          ...state.components,
          [transformComponentId(componentId)]: {
            ...state.components[transformComponentId(componentId)],
            timeoutRequest: timeoutRef,
          },
        },
      }));
    } else {
      set((state) => ({
        components: {
          ...state.components,
          [transformComponentId(componentId)]: {
            ...state.components[transformComponentId(componentId)],
            loadingSubmit: true,
            errorSubmit: '',
          },
        },
      }));
    }

    // Busca os filtros da url (caso tenha e esteja habilitado)
    const urlFilters = getFiltersFromUrl({
      componentId,
      noPrefixQuery: config?.noPrefixQuery,
    });
    const hasUrlFilters =
      urlFilters && Object.keys(urlFilters).length ? urlFilters : undefined;
    // Define os parametros da busca considerando prioridades
    const query =
      method === 'POST'
        ? {}
        : hasUrlFilters
        ? {
            ...data,
            ...hasUrlFilters,
          }
        : data || get().components[componentId]?.query || {};

    Object.entries(query).forEach(([key, value]) => {
      if (isObjectEmpty(value)) delete query[key];
    });

    // Atualiza o estado com os parametros da busca
    // set((state) => ({
    //   components: {
    //     ...state.components,
    //     [transformComponentId(componentId)]: {
    //       ...state.components[transformComponentId(componentId)],
    //       query: {
    //         ...state.components[transformComponentId(componentId)]?.query,
    //         ...query,
    //       },
    //     },
    //   },
    // }));
    try {
      const response = await fetch(resourcePath + '?' + toQueryString(query), {
        method: method || 'GET',
        body: method === 'POST' ? body : undefined,
      });

      const contentType = response.headers.get('content-type');

      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          throw await response.json();
        } else {
          throw await response.text();
        }
      }
      let result: any = {};
      if (!contentType || !contentType.includes('application/json'))
        result = await response.text();
      result = await response.json();

      if (result?.error) {
        if (isPost)
          get().setErrorSubmit({
            componentId,
            data: handleError(result.error).message,
          });
        else
          get().setError({
            componentId,
            data: handleError(result.error).message,
          });
      } else {
        if (isPost)
          get().setDataSubmit({
            componentId,
            data: result as any,
          });
        else
          get().setData({
            componentId,
            data: result as any,
          });
      }
    } catch (error) {
      if (isPost)
        get().setErrorSubmit({
          componentId,
          data: handleError(error).message,
        });
      else
        get().setError({
          componentId,
          data: handleError(error).message,
        });
    } finally {
      isRequestPending = false;
      if (!isPost) {
        clearTimeout(get()?.components[componentId]?.timeoutRequest);
        set((state) => ({
          components: {
            ...state.components,
            [transformComponentId(componentId)]: {
              ...state.components[transformComponentId(componentId)],
              timeoutRequest: null,
              loading: false,
            },
          },
        }));
      } else {
        set((state) => ({
          components: {
            ...state.components,
            [transformComponentId(componentId)]: {
              ...state.components[transformComponentId(componentId)],
              loadingSubmit: false,
            },
          },
        }));
      }
    }
  },
}));

// Utils

// Trata o id do componente para que seja sempre minusculo
function transformComponentId(componentId: string) {
  return componentId.toLocaleLowerCase();
}

// Monta a chave do filtro
function mountKey(props: IParamsProps, key: string) {
  return props.noPrefixQuery || !props.componentId
    ? camelToSnake(key)
    : `${props.componentId}-${camelToSnake(key)}`;
}

// Monta a propriedade do filtro
function mountProp(key: string) {
  return snakeToCamel(key);
}

// Atualiza a url com os filtros
function updateUrlWithFilters({
  componentId,
  data,
  noPrefixQuery,
}: IParamsProps) {
  const url = new URL(window.location.href);

  // Atualiza ou adiciona os novos parâmetros
  Object.entries(data).forEach(([key, value]) => {
    const _key = mountKey({ componentId, noPrefixQuery }, key);
    if (_key) {
      if (value) {
        url.searchParams.set(_key, value?.toString() || '');
      }
    }
  });

  // Itera sobre os parâmetros existentes e só remove os que foram passados no 'data'
  const searchParams = [] as { key: string; value: string }[];
  url.searchParams.forEach((value, key) => {
    searchParams.push({ key, value });
  });

  searchParams.forEach((item) => {
    const [key, prop] = item.key.split('-');
    const _prop = mountProp(prop || key);

    // Remove apenas parâmetros do componente atual ou aqueles que estão vazios no 'data'
    if (
      (componentId && key === componentId && isObjectEmpty(data[_prop])) ||
      (!componentId && isObjectEmpty(data[_prop])) ||
      (!Object.keys(data).includes(_prop) && data[_prop] === undefined)
    ) {
      url.searchParams.delete(item.key);
    }
  });

  // Atualiza o estado da URL sem recarregar a página
  window.history.replaceState({}, '', url);
}


// Busca os filtros da url
export function getFiltersFromUrl({
  componentId,
  noPrefixQuery,
}: IParamsProps): any {
  const url = new URL(window.location.href);
  let filters: any = {};

  const searchParams = [] as { key: string; value: string }[];
  url.searchParams.forEach((value, key) => {
    searchParams.push({ key, value });
  });

  const listNotPrefix = searchParams.filter((item) => !item.key.includes('-'));
  const listPrefix = searchParams.filter((item) => item.key.includes('-'));

  if (!noPrefixQuery) {
    listPrefix.forEach((item) => {
      const [id, filterKey] = item.key.split('-');
      if (id && filterKey && transformComponentId(componentId) === id) {
        filters = {
          ...filters,
          [snakeToCamel(filterKey)]: item.value,
        };
      }
    });
  }

  listNotPrefix.forEach((item) => {
    filters = {
      ...filters,
      [snakeToCamel(item.key)]: item.value,
    };
  });

  return filters;
}
