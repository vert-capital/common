export interface IPropsConfig extends IFetchClientConfigProps {
  initialLoading?: boolean;
}

export type Props = {
  componentId: string;
  endpointGet?: string;
  endpointPost?: string;
  initialQuery?: any;
  config?: IPropsConfig;
  children: React.ReactNode;
};

export interface IFetchClientConfigProps {
  noUrlParams?: boolean;
  noPrefixQuery?: boolean;
}

export interface IFetchParamsProps {
  config?: IFetchClientConfigProps;
  body?: FormData;
  query?: any;
}
