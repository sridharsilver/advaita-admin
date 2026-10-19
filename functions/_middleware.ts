export const onRequest: PagesFunction = async (context) => {
  const origin = context.request.headers.get("Origin") || "*";

  // Handle preflight OPTIONS request
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Pass request to next handler
  const response = await context.next();

  // Clone headers and attach CORS headers
  const newHeaders = new Headers(response.headers);
  newHeaders.set("Access-Control-Allow-Origin", origin);
  newHeaders.set("Access-Control-Allow-Credentials", "true");
  newHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  newHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
};
