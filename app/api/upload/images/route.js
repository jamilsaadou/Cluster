import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configuration pour l'upload
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'images');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export async function POST(request) {
  try {
    // Vérifier que le dossier d'upload existe
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const formData = await request.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    const uploadedFiles = [];

    for (const file of files) {
      // Vérifications de sécurité
      if (!file.name || file.size === 0) {
        continue;
      }

      // Vérifier la taille du fichier
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Le fichier ${file.name} est trop volumineux (max 5MB)` },
          { status: 400 }
        );
      }

      // Vérifier le type de fichier
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Type de fichier non autorisé: ${file.type}` },
          { status: 400 }
        );
      }

      // Générer un nom de fichier unique
      const fileExtension = path.extname(file.name);
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(UPLOAD_DIR, fileName);

      // Convertir le fichier en buffer et l'écrire
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      await writeFile(filePath, buffer);

      uploadedFiles.push({
        originalName: file.name,
        fileName: fileName,
        url: `/api/images/${fileName}`,
        size: file.size,
        type: file.type
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: `${uploadedFiles.length} fichier(s) uploadé(s) avec succès`
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Méthode pour supprimer une image
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json(
        { error: 'Nom de fichier requis' },
        { status: 400 }
      );
    }

    const filePath = path.join(UPLOAD_DIR, fileName);
    
    // Vérifier que le fichier existe
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Fichier non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer le fichier
    const { unlink } = await import('fs/promises');
    await unlink(filePath);

    return NextResponse.json({
      success: true,
      message: 'Fichier supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du fichier' },
      { status: 500 }
    );
  }
}
