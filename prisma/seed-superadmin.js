import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@cluster.ne';
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log('Super admin already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('AdminCluster2025!', 12);

  // Fetch all regions
  const regions = await prisma.region.findMany();

  // Create super admin user with all regions
  await prisma.user.create({
    data: {
      prenom: 'Admin',
      nom: 'Cluster',
      email,
      telephone: '+22700000000',
      motDePasse: hashedPassword,
      role: 'admin',
      statut: 'actif',
      permissions: {
        sites: true,
        activites: true,
          rapports: true,
        utilisateurs: true
      },
      regions: {
        connect: regions.map(region => ({ id: region.id }))
      }
    }
  });

  console.log('Super admin created successfully with email: admin@cluster.ne');
  console.log('Password: AdminCluster2025!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
