// Migration pour ajouter la table de liaison entre utilisateurs et sites
// Cette migration crée la relation many-to-many pour l'attribution des sites aux conseillers

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSiteAssignmentsTable() {
  try {
    // Créer la table de liaison pour les attributions de sites
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS _SiteAssignments (
        A INT NOT NULL,
        B INT NOT NULL,
        UNIQUE INDEX _SiteAssignments_AB_unique (A, B),
        INDEX _SiteAssignments_B_index (B),
        FOREIGN KEY (A) REFERENCES sites(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (B) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `;

    console.log('✅ Table _SiteAssignments créée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table _SiteAssignments:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Début de la migration pour les attributions de sites...');
  
  await createSiteAssignmentsTable();
  
  console.log('✅ Migration terminée avec succès');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

module.exports = { createSiteAssignmentsTable };
