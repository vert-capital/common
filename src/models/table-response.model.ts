import { camelToSnake } from '@/lib';

export class TableResponseModel<T, F = any> {
  totalPaginas: number;
  paginaAtual: number;
  tamanhoPagina: number;
  totalRegistros: number;
  registros: T[];
  rodape?: F;

  constructor(
    private registersConstructor: new (itemData: any) => T,
    data?: any,
    private registerFooterConstructor?: new (itemData: any) => F,
  ) {
    this.totalPaginas = data?.total_paginas || 0;
    this.paginaAtual = data?.pagina_atual || 0;
    this.tamanhoPagina = data?.tamanho_pagina || 5;
    this.totalRegistros = data?.total_registros || 0;
    this.registros = data?.registros
      ? data.registros.map((item: any) => new this.registersConstructor(item))
      : [];
    this.rodape =
      data?.rodape && this.registerFooterConstructor
        ? new this.registerFooterConstructor(data.rodape)
        : undefined;
  }
}

export class TableQueryParamsModel {
  page?: number;
  page_size?: number;
  order_by?: string;
  sort_order?: string;
  search?: string;
  filters?: string;
  [key: string]: any;

  constructor(data?: any) {
    this.page = data?.page;
    this.page_size = data?.pageSize || data?.page_size;
    this.order_by = data?.orderBy || data?.order_by;
    this.sort_order = data?.sortOrder || data?.sort_order;
    this.search = data?.search;
    this.filters = data?.filters;
  }

  toQueryString(): string {
    if (!this?.page_size) this.page_size = 5;
    if (!this?.page) this.page = 0;
    return Object.keys(this)
      .filter((key) => this[key] !== undefined)
      .map((key) => {
        const value =
          typeof this[key] === 'string' ? camelToSnake(this[key]) : this[key];
        return `${key}=${value}`;
      })
      .join('&');
  }
}

export interface PaginationStateModel {
  page: number;
  pageSize: number;
}

export interface SortingStateModel {
  orderBy: string;
  sortOrder: string;
}
