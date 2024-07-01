function dateDisplay(
  date: string | Date | undefined,
  options: Intl.DateTimeFormatOptions = {},
  locale = 'pt-BR',
): string {
  try {
    if (date instanceof Date) date = date.toISOString();
    if (!date || typeof date !== 'string') return '';

    let _date;
    if (!date.includes('T')) {
      const arrDt = date.split('-');
      if (!arrDt || arrDt.length < 3) return '';
      _date = new Date(
        parseInt(arrDt[0]),
        parseInt(arrDt[1]) - 1,
        parseInt(arrDt[2]),
      );
    } else {
      _date = new Date(date);
    }

    const optionDefault: Intl.DateTimeFormatOptions = {};
    return new Intl.DateTimeFormat(locale, {
      ...optionDefault,
      ...options,
    }).format(_date);
  } catch (error) {
    return '';
  }
}

function dateOutput(
  date: string | Date | undefined,
  withTime?: boolean,
): string {
  try {
    let time = '';
    if (date && !(date instanceof Date) && typeof date !== 'string') {
      date = new Date(date);
    }

    if (date instanceof Date) {
      date = date.toISOString();
    }

    if (!date || typeof date !== 'string') return '';

    if (date.includes('T')) {
      const arr = date.split('T');
      date = arr[0];
      time = arr[1];
    }

    const arrDt = date.split('-');
    if (arrDt && arrDt.length == 3) {
      return withTime && time
        ? `${arrDt[0]}-${arrDt[1]}-${arrDt[2]}T${time}`
        : `${arrDt[0]}-${arrDt[1]}-${arrDt[2]}`;
    }
    const arrDtf = date.split('/');
    if (arrDtf && arrDtf.length == 3) {
      return `${arrDtf[2]}-${arrDtf[1]}-${arrDtf[0]}` + withTime
        ? `${time}`
        : '';
    }

    return date + withTime ? `${time}` : '';
  } catch (error) {
    return '';
  }
}

export type AmountDisplayProps = {
  locale?: string;
  currency?: string;
  showSymbol?: boolean;
  minimumFractionDigits?: number;
  style?: 'currency' | 'decimal' | 'percent' | 'unit';
  disableNegative?: boolean;
};

function amountDisplay(
  amount: number | string | undefined,
  options: AmountDisplayProps = {},
): string {
  try {
    const currency = options?.currency || 'BRL';
    const locale = options?.locale || 'pt-BR';
    if (typeof amount === 'string') amount = parseFloat(amount);
    if (typeof amount !== 'number') return '';
    if (options.disableNegative) amount = Math.abs(amount);
    const value = new Intl.NumberFormat(locale, {
      style: options.style || 'currency',
      currency: currency,
      currencyDisplay: options?.showSymbol ? 'symbol' : 'code',
      minimumFractionDigits: options.minimumFractionDigits || 2,
    }).format(amount);
    if (value && !options?.showSymbol)
      return value.replace(currency, '').trim();

    return value;
  } catch (error) {
    return '';
  }
}

function percentageDisplay(value?: number): string {
  if (value === undefined) return '';
  // Define the format options
  const formatOptions: Intl.NumberFormatOptions = {
    style: 'percent',
    maximumFractionDigits: 2,
  };

  // If the value is an integer, don't show decimal places
  if (Math.floor(value) === value) {
    formatOptions.maximumFractionDigits = 0;
  }

  // Create the formatter
  const formatter = new Intl.NumberFormat('pt-BR', formatOptions);

  // Format the number
  return formatter.format(value / 100); // Dividing by 100 to convert to percentage
}

function camelToSnake(str?: string): string {
  if (!str) return '';
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function snakeToCamel(str?: string): string {
  if (!str) return '';
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', ''),
  );
}

function upperFisrtLetter(str?: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const formatDateArrayToDateRange = (
  dateArray: [string, string],
): { from: Date; to: Date } => {
  const [fromDate, toDate] = dateArray;
  const [startYear, startMonth, startDay] = fromDate.split('-').map(Number);
  const [endYear, endMonth, endDay] = toDate.split('-').map(Number);

  // Create a new date object using the local time zone
  // Note that months are 0-indexed in JavaScript Date (0 for January, 1 for February, etc.)
  const fromISODate = new Date(startYear, startMonth - 1, startDay);
  const toISODate = new Date(endYear, endMonth - 1, endDay);

  return {
    from: fromISODate,
    to: toISODate,
  };
};

const formatDateRangeToDateArray = (form: any): { [key: string]: string[] } => {
  const formattedForm: { [key: string]: string[] } = {};

  Object.entries(form).forEach(([key, dateRange]) => {
    const _dateRange: any = dateRange;
    if (
      _dateRange?.from &&
      _dateRange?.to &&
      typeof dateRange !== 'string' &&
      !Array.isArray(dateRange) &&
      typeof dateRange !== 'undefined' &&
      'from' in _dateRange &&
      'to' in _dateRange
    ) {
      const fromDate = `${dateDisplay(_dateRange.from, {
        year: 'numeric',
      })}-${dateDisplay(_dateRange.from, {
        month: '2-digit',
      })}-${dateDisplay(_dateRange.from, {
        day: '2-digit',
      })}`;
      const toDate = `${dateDisplay(_dateRange.to, {
        year: 'numeric',
      })}-${dateDisplay(_dateRange.to, {
        month: '2-digit',
      })}-${dateDisplay(_dateRange.to, {
        day: '2-digit',
      })}`;
      formattedForm[key] = [fromDate, toDate];
    }
  });
  return formattedForm;
};

const quantityDisplay = (value?: number): string => {
  if (value === undefined) return '';
  // Define the format options
  const formatOptions: Intl.NumberFormatOptions = {
    style: 'decimal', // Mudança para 'decimal' ao invés de 'percent'
    maximumFractionDigits: 0, // Sem dígitos fracionários para quantidades inteiras
  };

  // Create the formatter for Brazilian Portuguese
  const formatter = new Intl.NumberFormat('pt-BR', formatOptions);

  // Format the number directly without dividing it
  return formatter.format(value);
};

export {
  amountDisplay,
  camelToSnake,
  dateDisplay,
  dateOutput,
  formatDateArrayToDateRange,
  formatDateRangeToDateArray,
  percentageDisplay,
  quantityDisplay,
  snakeToCamel,
  upperFisrtLetter,
};
