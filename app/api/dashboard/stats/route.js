import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireAuth, isSuperAdmin } from '../../../../lib/auth';

export const GET = requireAuth(async (request) => {
  const user = request.user;

  try {
    let whereClause = {};

    // Filter data based on user role
    if (user.role === 'conseiller') {
      // Conseillers see only their own data
      whereClause = {
        createdById: user.userId
      };
    } else if (user.role === 'admin') {
      // Admins see data from their regions
      whereClause = {
        regionId: { in: user.regions }
      };
    }
    // Superadmins see all data (no filter)

    // Get sites statistics
    const sites = await prisma.site.findMany({
      where: whereClause,
      include: {
        region: true,
        activites: {
          where: user.role === 'conseiller' ? { createdById: user.userId } : {}
        }
      }
    });

    // Get activities statistics
    let activitiesWhereClause = {};
    if (user.role === 'conseiller') {
      activitiesWhereClause = { createdById: user.userId };
    } else if (user.role === 'admin') {
      activitiesWhereClause = { regionId: { in: user.regions } };
    }

    const activities = await prisma.activite.findMany({
      where: activitiesWhereClause,
      include: {
        region: true,
        site: true
      }
    });

    // Calculate statistics
    const stats = {
      // Sites statistics
      totalSites: sites.length,
      totalSurface: sites.reduce((sum, site) => sum + (site.superficie || 0), 0),
      operatorsBreakdown: sites.reduce((acc, site) => {
        const operators = site.operateurs || {};
        acc.hommes += operators.hommes || 0;
        acc.femmes += operators.femmes || 0;
        acc.jeunes += operators.jeunes || 0;
        return acc;
      }, { hommes: 0, femmes: 0, jeunes: 0 }),

      // Activities statistics
      totalActivities: activities.length,
      activitiesByStatus: activities.reduce((acc, activity) => {
        acc[activity.statut] = (acc[activity.statut] || 0) + 1;
        return acc;
      }, {}),
      activitiesByType: activities.reduce((acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1;
        return acc;
      }, {}),
      totalBeneficiaries: activities.reduce((sum, activity) => {
        const beneficiaires = activity.beneficiaires || {};
        return sum + (beneficiaires.hommes || 0) + (beneficiaires.femmes || 0);
      }, 0),
      beneficiariesBreakdown: activities.reduce((acc, activity) => {
        const beneficiaires = activity.beneficiaires || {};
        acc.hommes += beneficiaires.hommes || 0;
        acc.femmes += beneficiaires.femmes || 0;
        acc.jeunes += beneficiaires.jeunes || 0;
        return acc;
      }, { hommes: 0, femmes: 0, jeunes: 0 }),

      // Systems statistics
      irrigationSystems: sites.reduce((acc, site) => {
        const systems = site.systemes?.irrigationSystems || [];
        systems.forEach(system => {
          acc[system] = (acc[system] || 0) + 1;
        });
        return acc;
      }, {}),
      captageSystems: sites.reduce((acc, site) => {
        const systems = site.systemes?.captageSystems || [];
        systems.forEach(system => {
          acc[system] = (acc[system] || 0) + 1;
        });
        return acc;
      }, {}),

      // Regional distribution (for admins and superadmins)
      regionDistribution: user.role !== 'conseiller' ? sites.reduce((acc, site) => {
        const regionName = site.region?.nom || 'Non définie';
        acc[regionName] = (acc[regionName] || 0) + 1;
        return acc;
      }, {}) : null,

      // Recent activities (last 5)
      recentActivities: activities
        .sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation))
        .slice(0, 5)
        .map(activity => ({
          id: activity.id,
          type: activity.type,
          thematique: activity.thematique,
          site: activity.site?.nom,
          region: activity.region?.nom,
          statut: activity.statut,
          dateCreation: activity.dateCreation
        }))
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
});
