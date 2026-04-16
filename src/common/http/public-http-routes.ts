/** Routes that must stay reachable without JWT (Swagger UI + OpenAPI JSON). */
export function isSwaggerDocumentationPath(path: string): boolean {
  return (
    path === '/docs' ||
    path === '/docs-json' ||
    path.startsWith('/docs/')
  );
}
