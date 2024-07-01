type Props = {
  data: any;
  removeProp?: boolean;
};
export const clearObj = ({ data: obj, removeProp }: Props) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === null || obj[key] === undefined || obj[key] === '') {
      if (removeProp) delete obj[key];
      else obj[key] = undefined;
      obj[key] = undefined;
    } else if (Array.isArray(obj[key])) {
      if (obj[key].length === 0)
        if (removeProp) delete obj[key];
        else obj[key] = undefined;
    } else if (typeof obj[key] === 'object') {
      clearObj({
        data: obj[key],
        removeProp,
      });
    }
  });
  // check object is empty
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && Object.keys(obj[key]).length === 0) {
      if (removeProp) delete obj[key];
      else obj[key] = undefined;
    }
  });

  return obj;
};

export function isObjectEmpty(obj?: any) {
  if (!obj) return true;
  // Verifica se obj é um objeto (excluindo arrays e datas, e considerando objetos como instâncias diretas de Object)
  const isDirectObject = obj.constructor === Object;

  // Se não for um "objeto direto", considera-se não vazio (ou ajuste essa lógica conforme necessário)
  if (!isDirectObject) return false;

  // Pega as chaves do objeto
  const keys = Object.keys(obj);

  // Se não tiver chaves, o objeto está vazio
  if (keys.length === 0) return true;

  // Verifica cada propriedade do objeto
  for (const key of keys) {
    const value = obj[key];

    // Se a propriedade for um objeto, faz a verificação recursiva
    if (typeof value === 'object' && value !== null) {
      // Se o objeto interno não estiver vazio, retorna false
      if (!isObjectEmpty(value)) return false;
    } else {
      // Se a propriedade não for um objeto e não estiver vazia, retorna false
      // Ajuste as condições conforme necessário para tipos específicos (e.g., strings, arrays)
      if (value !== null && value !== '' && value !== undefined) return false;
    }
  }

  // Se todas as propriedades estiverem vazias, retorna true
  return true;
}
