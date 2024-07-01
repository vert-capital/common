export async function fetchImageAsBuffer(
  url?: string,
): Promise<Buffer | undefined> {
  try {
    if (!url) {
      return undefined;
    }
    const response = await fetch(url);

    // Verifica se a resposta é bem-sucedida
    if (!response.ok) {
      return undefined;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (_) {
    // Trata erros de rede e de resposta
    return undefined;
  }
}
