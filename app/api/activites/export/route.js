import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { prisma } from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/auth';

export const GET = requireAuth(async (request) => {
  const user = request.user;
  try {
    // Construire les conditions de filtrage selon le rôle de l'utilisateur
    let whereConditions = {};
    
    if (user.role === 'superadmin') {
      // Superadmin peut exporter toutes les activités
      whereConditions = {};
    } else if (user.role === 'conseiller') {
      // Conseillers ne peuvent exporter que leurs propres activités
      whereConditions = {
        createdById: user.userId
      };
    } else {
      // Admin et superviseurs ne peuvent exporter que les activités de leurs régions
      if (user.regions && user.regions.length > 0) {
        whereConditions = {
          regionId: {
            in: user.regions
          }
        };
      } else {
        // Si l'utilisateur n'a pas de régions assignées, aucune activité
        whereConditions = {
          id: -1 // Condition impossible pour retourner 0 résultat
        };
      }
    }

    // Récupérer les activités avec leurs relations (optimisé pour éviter les problèmes de mémoire)
    const activites = await prisma.activite.findMany({
      where: whereConditions,
      select: {
        id: true,
        type: true,
        thematique: true,
        duree: true,
        statut: true,
        dateCreation: true,
        beneficiaires: true,
        commentaires: true,
        regionId: true, // Ajouter regionId pour le debug
        site: {
          select: {
            nom: true
          }
        },
        region: {
          select: {
            nom: true
          }
        },
        createdBy: {
          select: {
            prenom: true,
            nom: true
          }
        }
      },
      orderBy: {
        id: 'asc', // Plus efficace que dateCreation pour le tri
      },
      take: 5000, // Limiter à 5000 enregistrements pour éviter les problèmes de mémoire
    });

    // Créer un nouveau workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Activités');

    // Définir les colonnes
    worksheet.columns = [
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Thématique', key: 'thematique', width: 20 },
      { header: 'Site', key: 'site', width: 25 },
      { header: 'Région', key: 'region', width: 15 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Durée (heures)', key: 'duree', width: 12 },
      { header: 'Statut', key: 'statut', width: 15 },
      { header: 'Bénéficiaires Hommes', key: 'beneficiairesHommes', width: 12 },
      { header: 'Bénéficiaires Femmes', key: 'beneficiairesFemmes', width: 12 },
      { header: 'Bénéficiaires Jeunes', key: 'beneficiairesJeunes', width: 12 },
      { header: 'Total Bénéficiaires', key: 'totalBeneficiaires', width: 12 },
      { header: 'Renseigné par', key: 'renseignePar', width: 25 },
      { header: 'Commentaires', key: 'commentaires', width: 40 }
    ];

    // Styliser l'en-tête
    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE9ECEF' }
      };
      cell.font = {
        bold: true,
        color: { argb: 'FF495057' },
        size: 11,
        name: 'Calibri'
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Ajouter les données avec couleurs selon le statut
    activites.forEach((activite, index) => {
      const statutText = activite.statut === 'approuve' ? 'Approuvé' : 
                        activite.statut === 'rejete' ? 'Rejeté' : 'En attente';
      
      // Ajouter un préfixe coloré pour identifier visuellement le statut
      const statutWithIndicator = activite.statut === 'approuve' ? '✅ ' + statutText :
                                  activite.statut === 'rejete' ? '❌ ' + statutText :
                                  '⏳ ' + statutText;

      const rowData = {
        type: activite.type,
        thematique: activite.thematique,
        site: activite.site?.nom || 'N/A',
        region: activite.region?.nom || 'N/A',
        date: new Date(activite.dateCreation).toLocaleDateString('fr-FR'),
        duree: activite.duree,
        statut: statutWithIndicator,
        beneficiairesHommes: activite.beneficiaires?.hommes || 0,
        beneficiairesFemmes: activite.beneficiaires?.femmes || 0,
        beneficiairesJeunes: activite.beneficiaires?.jeunes || 0,
        totalBeneficiaires: (activite.beneficiaires?.hommes || 0) + (activite.beneficiaires?.femmes || 0),
        renseignePar: activite.createdBy ? `${activite.createdBy.prenom} ${activite.createdBy.nom}` : 'N/A',
        commentaires: activite.commentaires || ''
      };

      const row = worksheet.addRow(rowData);

      // Définir les couleurs selon le statut
      let fillColor, fontColor;
      
      switch (activite.statut) {
        case 'approuve':
          fillColor = 'FFD4EDDA'; // Vert clair
          fontColor = 'FF155724'; // Vert foncé
          break;
        case 'rejete':
          fillColor = 'FFF8D7DA'; // Rouge clair
          fontColor = 'FF721C24'; // Rouge foncé
          break;
        case 'en_attente':
          fillColor = 'FFFFF3CD'; // Jaune clair
          fontColor = 'FF856404'; // Orange foncé
          break;
        default:
          fillColor = 'FFFFFFFF'; // Blanc
          fontColor = 'FF000000'; // Noir
      }

      // Appliquer le style à toute la ligne
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: fillColor }
        };
        cell.font = {
          color: { argb: fontColor },
          size: 11,
          name: 'Calibri'
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
        };
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      });
    });

    // Ajouter un filtre automatique
    worksheet.autoFilter = {
      from: 'A1',
      to: `M${activites.length + 1}`
    };

    // Figer la première ligne (en-tête)
    worksheet.views = [
      { state: 'frozen', ySplit: 1 }
    ];

    // Générer le buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Retourner le fichier
    return new Response(buffer, {
      headers: {
        'Content-Disposition': 'attachment; filename="activites_avec_couleurs.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    console.error('Error exporting activities:', error);
    return new Response(JSON.stringify({ error: 'Erreur lors de l\'exportation des activités' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
});
