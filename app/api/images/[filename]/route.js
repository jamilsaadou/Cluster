import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'images');

export async function GET(request, { params }) {
  try {
    const { filename } = await params;

    if (!filename) {
      return new NextResponse('Nom de fichier requis', { status: 400 });
    }

    // Sécurité: empêcher l'accès aux fichiers en dehors du dossier d'upload
    const safePath = path.normalize(filename).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(UPLOAD_DIR, safePath);

    // Vérifier que le fichier existe
    if (!existsSync(filePath)) {
      return new NextResponse('Image non trouvée', { status: 404 });
    }

    // Lire le fichier
    const fileBuffer = await readFile(filePath);

    // Déterminer le type MIME basé sur l'extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/jpeg'; // par défaut

    switch (ext) {
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
    }

    // Retourner l'image avec les en-têtes appropriés
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache pendant 1 an
      },
    });

  } catch (error) {
    console.error('Erreur lors de la lecture de l\'image:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}
