import { prisma } from './lib/prisma.js';

async function debugPhotos() {
  try {
    const sites = await prisma.site.findMany({
      where: {
        photos: {
          not: null
        }
      },
      select: {
        id: true,
        nom: true,
        photos: true
      },
      take: 3
    });

    console.log('Sites with photos:');
    sites.forEach(site => {
      console.log(`Site ${site.id} (${site.nom}):`);
      console.log('Photos:', JSON.stringify(site.photos, null, 2));
      console.log('---');
    });

    // Also check if any sites have photos
    const totalSitesWithPhotos = await prisma.site.count({
      where: {
        photos: {
          not: null
        }
      }
    });

    console.log(`Total sites with photos: ${totalSitesWithPhotos}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPhotos();
