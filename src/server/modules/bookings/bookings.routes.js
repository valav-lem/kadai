import * as bookingsService from './bookings.service.js';

export default async function bookingsRoutes(fastify, _options) {
  fastify.get('/', async (request, _reply) => {
    const { start, end, staffId, status } = request.query;
    const bookings = await bookingsService.getBookings({ start, end, staffId, status });
    return { bookings };
  });

  fastify.get('/stats', async (_request, _reply) => {
    const stats = await bookingsService.getDashboardStats();
    return { stats };
  });

  fastify.get('/:id', async (request, reply) => {
    const booking = await bookingsService.getBookingById(request.params.id);
    if (!booking) {
      return reply.status(404).send({ error: 'Booking not found' });
    }
    return { booking };
  });

  fastify.post('/', async (request, reply) => {
    try {
      const booking = await bookingsService.createBooking(request.body || {});
      return reply.status(201).send({ booking });
    } catch (err) {
      const status = err.statusCode || (err.code === 'DOUBLE_BOOKED' ? 409 : 400);
      return reply.status(status).send({
        error: err.message,
        code: err.code || 'BOOKING_FAILED',
      });
    }
  });

  fastify.patch('/:id/status', async (request, reply) => {
    const { status, payment_mode, paid_amount_paise } = request.body || {};
    if (!status) {
      return reply.status(400).send({ error: 'Status is required' });
    }
    try {
      const booking = await bookingsService.updateBookingStatus(request.params.id, status, {
        payment_mode,
        paid_amount_paise,
      });
      if (!booking) {
        return reply.status(404).send({ error: 'Booking not found' });
      }
      return { booking };
    } catch (err) {
      const statusCode = err.statusCode || 400;
      return reply.status(statusCode).send({ error: err.message, code: err.code });
    }
  });

  fastify.put('/:id', async (request, reply) => {
    try {
      const booking = await bookingsService.updateBooking(request.params.id, request.body || {});
      if (!booking) {
        return reply.status(404).send({ error: 'Booking not found' });
      }
      return { booking };
    } catch (err) {
      const status = err.statusCode || (err.code === 'DOUBLE_BOOKED' ? 409 : 400);
      return reply.status(status).send({
        error: err.message,
        code: err.code || 'UPDATE_FAILED',
      });
    }
  });
}
