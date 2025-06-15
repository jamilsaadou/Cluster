/**
 * Database Optimization Script
 * 
 * This script provides recommendations and utilities for optimizing
 * the MySQL database to handle large datasets and prevent memory errors.
 */

const { prisma } = require('../lib/prisma');

async function checkDatabaseHealth() {
  console.log('🔍 Checking database health...\n');

  try {
    // Check total number of records in each table
    const sitesCount = await prisma.site.count();
    const usersCount = await prisma.user.count();
    const activitesCount = await prisma.activite.count();
    const regionsCount = await prisma.region.count();

    console.log('📊 Database Statistics:');
    console.log(`   Sites: ${sitesCount.toLocaleString()}`);
    console.log(`   Users: ${usersCount.toLocaleString()}`);
    console.log(`   Activities: ${activitesCount.toLocaleString()}`);
    console.log(`   Regions: ${regionsCount.toLocaleString()}\n`);

    // Check for potential performance issues
    if (sitesCount > 1000) {
      console.log('⚠️  Large number of sites detected. Consider:');
      console.log('   - Implementing pagination in all site queries');
      console.log('   - Adding database indexes on frequently queried fields');
      console.log('   - Using SELECT with specific fields instead of SELECT *\n');
    }

    // Check for sites with many assignments
    const sitesWithManyAssignments = await prisma.site.findMany({
      include: {
        assignedUsers: true
      },
      take: 10
    });

    const maxAssignments = Math.max(...sitesWithManyAssignments.map(site => site.assignedUsers.length));
    if (maxAssignments > 10) {
      console.log('⚠️  Sites with many user assignments detected.');
      console.log('   Consider limiting the number of users per site.\n');
    }

    console.log('✅ Database health check completed.\n');

  } catch (error) {
    console.error('❌ Error checking database health:', error.message);
  }
}

async function suggestOptimizations() {
  console.log('💡 Database Optimization Recommendations:\n');

  console.log('1. MySQL Configuration (my.cnf or my.ini):');
  console.log('   sort_buffer_size = 2M');
  console.log('   read_buffer_size = 1M');
  console.log('   read_rnd_buffer_size = 2M');
  console.log('   max_allowed_packet = 64M');
  console.log('   innodb_buffer_pool_size = 1G (adjust based on available RAM)\n');

  console.log('2. Database Indexes to consider:');
  console.log('   CREATE INDEX idx_sites_region ON sites(regionId);');
  console.log('   CREATE INDEX idx_sites_created_by ON sites(createdById);');
  console.log('   CREATE INDEX idx_activites_site ON activites(siteId);');
  console.log('   CREATE INDEX idx_activites_region ON activites(regionId);');
  console.log('   CREATE INDEX idx_users_role ON users(role);\n');

  console.log('3. Query Optimization:');
  console.log('   - Use pagination for large result sets');
  console.log('   - Limit the use of complex JOINs');
  console.log('   - Use SELECT with specific fields instead of SELECT *');
  console.log('   - Consider using database views for complex queries\n');

  console.log('4. Application-level optimizations:');
  console.log('   - Implement caching for frequently accessed data');
  console.log('   - Use lazy loading for related data');
  console.log('   - Consider using database connection pooling\n');
}

async function testOptimizedQueries() {
  console.log('🧪 Testing optimized queries...\n');

  try {
    // Test paginated site query (the one that was failing)
    console.log('Testing paginated sites query...');
    const startTime = Date.now();
    
    const result = await prisma.site.findMany({
      take: 50,
      select: {
        id: true,
        nom: true,
        commune: true,
        village: true,
        assignedUsers: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            email: true,
            role: true
          }
        },
        region: {
          select: {
            id: true,
            nom: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ Query completed successfully in ${duration}ms`);
    console.log(`   Retrieved ${result.length} sites\n`);

    if (duration > 1000) {
      console.log('⚠️  Query took longer than 1 second. Consider further optimization.\n');
    }

  } catch (error) {
    console.error('❌ Error testing optimized queries:', error.message);
    
    if (error.message.includes('Out of sort memory')) {
      console.log('\n💡 The "Out of sort memory" error is still occurring.');
      console.log('   Please increase the MySQL sort_buffer_size setting.\n');
    }
  }
}

async function main() {
  console.log('🚀 Database Optimization Tool\n');
  console.log('=====================================\n');

  await checkDatabaseHealth();
  await suggestOptimizations();
  await testOptimizedQueries();

  console.log('🎯 Next Steps:');
  console.log('1. Apply the MySQL configuration changes');
  console.log('2. Restart your MySQL server');
  console.log('3. Consider adding the suggested database indexes');
  console.log('4. Monitor query performance in production\n');

  await prisma.$disconnect();
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = {
  checkDatabaseHealth,
  suggestOptimizations,
  testOptimizedQueries
};
