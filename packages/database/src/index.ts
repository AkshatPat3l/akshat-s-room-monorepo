import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Dynamically locate and load the root .env configuration
const possiblePaths = [
  path.resolve(__dirname, '../../../.env'),
  path.resolve(__dirname, '../../../../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
];

for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function seedDatabase() {
  // Check if we already have services
  const serviceCount = await prisma.service.count();
  if (serviceCount > 0) {
    return;
  }

  // Create services
  const infobusService = await prisma.service.create({
    data: {
      name: 'Infobus Tech Consulting',
      description: 'Book a consultation slot with our Blue Block Infobus architect for system design reviews.',
    },
  });

  const securityService = await prisma.service.create({
    data: {
      name: 'Security Audit & Assessment',
      description: 'A comprehensive security analysis session scheduled via the Red Column Security Terminal.',
    },
  });

  const marketplaceService = await prisma.service.create({
    data: {
      name: 'Marketplace Integration Setup',
      description: 'Onboard and configure your custom API pipelines with a Gold Service Desk expert.',
    },
  });

  const now = new Date();
  
  // Helper to create hours in future
  const getFutureTime = (hours: number) => {
    const d = new Date(now);
    d.setHours(d.getHours() + hours);
    d.setMinutes(0, 0, 0);
    return d;
  };

  const services = [infobusService, securityService, marketplaceService];

  for (const s of services) {
    // Generate 5 slots for each service starting from tomorrow
    for (let i = 1; i <= 5; i++) {
      const startTime = getFutureTime(24 * i);
      const endTime = getFutureTime(24 * i + 1);
      await prisma.availabilitySlot.create({
        data: {
          serviceId: s.id,
          startTime,
          endTime,
          status: 'AVAILABLE',
        },
      });
    }
  }

  console.log('Database successfully seeded with services and availability slots!');
}

export * from '@prisma/client';
