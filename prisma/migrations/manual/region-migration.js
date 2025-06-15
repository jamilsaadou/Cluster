const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting region migration...');

  // Step 1: Create the initial regions
  const regions = ['Agadez', 'Tahoua', 'Tillaberi'];
  const regionMap = {};

  for (const regionName of regions) {
    try {
      const region = await prisma.region.create({
        data: {
          nom: regionName
        }
      });
      regionMap[regionName] = region.id;
      console.log(`Created region: ${regionName} with ID: ${region.id}`);
    } catch (error) {
      if (error.code === 'P2002') {
        // Region already exists, get its ID
        const existingRegion = await prisma.region.findUnique({
          where: { nom: regionName }
        });
        regionMap[regionName] = existingRegion.id;
        console.log(`Region ${regionName} already exists with ID: ${existingRegion.id}`);
      } else {
        throw error;
      }
    }
  }

  // Step 2: Update Users
  const users = await prisma.user.findMany();
  console.log(`Updating ${users.length} users...`);

  for (const user of users) {
    const regionId = regionMap[user.region];
    if (!regionId) {
      console.warn(`Warning: User ${user.id} has invalid region: ${user.region}`);
      continue;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { regionId }
    });
  }

  // Step 3: Update Sites
  const sites = await prisma.site.findMany();
  console.log(`Updating ${sites.length} sites...`);

  for (const site of sites) {
    const regionId = regionMap[site.region];
    if (!regionId) {
      console.warn(`Warning: Site ${site.id} has invalid region: ${site.region}`);
      continue;
    }

    await prisma.site.update({
      where: { id: site.id },
      data: { regionId }
    });
  }

  // Step 4: Update Activities
  const activities = await prisma.activite.findMany();
  console.log(`Updating ${activities.length} activities...`);

  for (const activity of activities) {
    const regionId = regionMap[activity.region];
    if (!regionId) {
      console.warn(`Warning: Activity ${activity.id} has invalid region: ${activity.region}`);
      continue;
    }

    await prisma.activite.update({
      where: { id: activity.id },
      data: { regionId }
    });
  }

  console.log('Migration completed successfully!');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
