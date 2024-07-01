import {
  camelToSnake,
  formatDateArrayToDateRange,
  isObjectEmpty,
  snakeToCamel,
} from '.';

type Props = {
  url: string;
  params?: any;
};

export function urlTransform({ url, params }: Props): string {
  let urlWithParams = url;
  if (!params) return urlWithParams;
  Object.keys(params).forEach((key) => {
    urlWithParams = urlWithParams.replace(`{${key}}`, params[key]);
  });

  return urlWithParams;
}

export function toQueryString(data: any, disableSnakeCase?: boolean): string {
  if (!data) return '';
  return Object.keys(data)
    .filter((key) => data[key] !== undefined)
    .map((key) => {
      return `${key && !disableSnakeCase ? camelToSnake(key) : key}=${
        data[key]
      }`;
    })
    .join('&');
}

export function queryStringToJSON(qs?: string): any {
  if (!qs || typeof qs !== 'string') return {};
  qs = qs?.replace('?', '') || ''; // remove first char if it is a '?'
  const pairs = qs.split('&');
  const result = {} as any;
  pairs.forEach(function (p) {
    const pair = p.split('=');
    const key = pair[0];
    const value = decodeURIComponent(pair[1] || '');

    if (result[key]) {
      if (Object.prototype.toString.call(result[key]) === '[object Array]')
        result[key].push(value);
      else result[key] = [result[key], value];
    } else result[key] = value;
  });

  // clean empty keys
  Object.keys(result).forEach((key) => {
    if (result[key] === '') delete result[key];
  });

  return JSON.parse(JSON.stringify(result));
}

export function mapQueryParamToForm<T>(params?: T, form?: any): any {
  if (!params || isObjectEmpty(params)) {
    const url = new URL(window.location.href);
    url.searchParams.forEach((value, key) => {
      const keyArr = key.split('-');
      if (keyArr.length > 1) {
        key = keyArr[1];
      }
      params = {
        ...params,
        [snakeToCamel(key)]: value,
      } as T;
    });
  }

  if (!params || isObjectEmpty(params)) return {};
  const objReturn: any = {};
  Object.keys(params).forEach((key) => {
    const formKey = snakeToCamel(key) as keyof T;
    const value = params?.[formKey];

    // Verifica se 'value' é uma string para chamar 'includes' de forma segura
    if (typeof value === 'string') {
      if (!value.includes(',')) {
        form?.setValue(formKey, value);
        objReturn[formKey] = value;
      } else {
        const valuesArray = value.split(',');
        const includesHyphen = valuesArray.every((_value) =>
          _value.includes('-'),
        );
        if (!includesHyphen) {
          form?.setValue(formKey, valuesArray as string[]);
          objReturn[formKey] = valuesArray;
        } else {
          form?.setValue(
            formKey,
            formatDateArrayToDateRange(valuesArray as [string, string]),
          );
          objReturn[formKey] = formatDateArrayToDateRange(
            valuesArray as [string, string],
          );
        }
      }
    }
  });

  return objReturn;
}
