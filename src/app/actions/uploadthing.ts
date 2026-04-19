'use server';

import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

export async function deleteImagesByUrl(urls: string[]) {
  if (!urls || urls.length === 0) return;
  
  // Extraemos la key del archivo de cada URL de UploadThing
  const keys = urls.map(url => {
    // Ejemplo de URL: https://utfs.io/f/xyz123 o https://abc.ufs.sh/f/xyz123
    const parts = url.split('/f/');
    if (parts.length === 2) {
      return parts[1];
    }
    return null;
  }).filter(Boolean) as string[];

  if (keys.length > 0) {
    try {
      await utapi.deleteFiles(keys);
      console.log('Archivos borrados correctamente de UploadThing:', keys);
    } catch (error) {
      console.error('Error al borrar archivos de UploadThing:', error);
    }
  }
}
