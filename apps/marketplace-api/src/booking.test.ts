import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '@monorepo/database';
import { app } from './server';
import request from 'supertest';

// We can use supertest to simulate requests against our Express app
describe('Marketplace Booking Concurrency test', () => {
  let serviceId: string;
  let targetSlotId: string;

  beforeAll(async () => {
    // Seed a service and a single available slot
    const service = await prisma.service.create({
      data: {
        name: 'Concurrency Stress Service',
        description: 'Testing double-booking transactions.',
      },
    });
    serviceId = service.id;

    const slot = await prisma.availabilitySlot.create({
      data: {
        serviceId,
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        status: 'AVAILABLE',
      },
    });
    targetSlotId = slot.id;
  });

  it('safely handles 10 parallel booking requests and prevents double-booking', async () => {
    // Construct 10 parallel requests targeting the exact same slot ID
    const promises = Array.from({ length: 10 }).map((_, i) => {
      return request(app)
        .post('/api/v1/bookings')
        .send({
          slotId: targetSlotId,
          customerName: `Customer ${i}`,
          customerEmail: `customer${i}@example.com`,
        });
    });

    // Execute all 10 booking actions concurrently
    const responses = await Promise.all(promises);

    // Count the successes and conflicts
    const successes = responses.filter((r) => r.status === 201);
    const conflicts = responses.filter((r) => r.status === 409);

    console.log(`Concurrency Test complete: ${successes.length} successful bookings, ${conflicts.length} rejected conflicts.`);

    // Assert that EXACTLY 1 booking succeeded
    expect(successes.length).toBe(1);

    // Assert that EXACTLY 9 bookings were rejected with 409 Conflict
    expect(conflicts.length).toBe(9);

    // Verify slot is booked in the database
    const slotState = await prisma.availabilitySlot.findUnique({
      where: { id: targetSlotId },
    });
    expect(slotState?.status).toBe('BOOKED');
  });
});
