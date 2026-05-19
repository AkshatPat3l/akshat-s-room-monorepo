import express from 'express';
import cors from 'cors';
import { prisma, seedDatabase } from '@monorepo/database';
import { CreateBookingRequest } from '@monorepo/types';

const app = express();
app.use(cors());
app.use(express.json());

// Get service catalog and slots
app.get('/api/v1/services', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        slots: {
          orderBy: { startTime: 'asc' },
        },
      },
    });
    return res.json(services);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Get slots list
app.get('/api/v1/slots', async (req, res) => {
  try {
    const slots = await prisma.availabilitySlot.findMany({
      include: { service: true },
      orderBy: { startTime: 'asc' },
    });
    return res.json(slots);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Book a slot with concurrency protection
app.post('/api/v1/bookings', async (req, res) => {
  const { slotId, customerName, customerEmail } = req.body as CreateBookingRequest;

  if (!slotId || !customerName || !customerEmail) {
    return res.status(400).json({ error: 'Missing required fields: slotId, customerName, customerEmail.' });
  }

  try {
    const newBooking = await prisma.$transaction(async (tx) => {
      // 1. Retrieve the slot inside transaction
      const slot = await tx.availabilitySlot.findUnique({
        where: { id: slotId },
      });

      if (!slot) {
        throw new Error('SLOT_NOT_FOUND');
      }

      if (slot.status === 'BOOKED') {
        throw new Error('SLOT_ALREADY_BOOKED');
      }

      // 2. Mark the slot as BOOKED
      await tx.availabilitySlot.update({
        where: { id: slotId },
        data: { status: 'BOOKED' },
      });

      // 3. Create the Booking entry
      const booking = await tx.booking.create({
        data: {
          slotId,
          customerName,
          customerEmail,
        },
        include: {
          slot: {
            include: { service: true }
          }
        }
      });

      return booking;
    });

    return res.status(201).json({
      message: 'Booking completed successfully!',
      booking: newBooking,
    });
  } catch (err: any) {
    if (err.message === 'SLOT_NOT_FOUND') {
      return res.status(404).json({ error: 'The requested booking slot was not found.' });
    }
    if (err.message === 'SLOT_ALREADY_BOOKED') {
      return res.status(409).json({ error: 'This slot has already been booked by another customer.' });
    }
    return res.status(500).json({ error: err.message });
  }
});

// Get booking summary
app.get('/api/v1/bookings', async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        slot: {
          include: { service: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(bookings);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// A simple health check
app.get('/health', async (req, res) => {
  return res.json({ status: 'healthy', service: 'marketplace-api' });
});

const start = async () => {
  // Ensure the database is generated and seeded
  try {
    await seedDatabase();
  } catch (err) {
    console.warn('Database seeding skipped or already initialized.', err);
  }

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3002;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Marketplace Concurrency Booking Engine listening on port ${port}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  start();
}

export { app };
