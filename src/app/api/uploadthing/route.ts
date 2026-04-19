import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Exportamos las rutas manejadoras para Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
