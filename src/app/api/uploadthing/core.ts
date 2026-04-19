import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter para tu aplicación, puede contener múltiples "rutas" (endpoints)
export const ourFileRouter = {
  // Define tantas rutas de subida como requieras.
  // En este caso, crearemos una para imágenes de productos.
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    // Esta función se ejecuta antes de la subida, se podría validar el administrador
    .middleware(async ({ req }) => {
      // Como esto es un backend rápido sin sesión estricta aquí, solo retornamos metadata
      return { uploadedBy: "admin" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Este código funciona en tu servidor después de subirse
      console.log("Upload guardado permanentemente:", file.ufsUrl);

      // El return será la información que obtendrá el cliente en `onClientUploadComplete`
      return { uploadedBy: metadata.uploadedBy, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
