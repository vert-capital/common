export function redirectBack(
  request: Request,
  { fallback, ...init }: ResponseInit & { fallback: string },
): Response {
  let responseInit = init;
  if (typeof responseInit === 'number') {
    responseInit = { status: responseInit };
  } else if (responseInit.status === undefined) {
    responseInit.status = 302;
  }

  const headers = new Headers(responseInit.headers);
  headers.set('Location', request.headers.get('Referer') ?? fallback);

  return new Response(null, {
    ...responseInit,
    headers,
  });
}
