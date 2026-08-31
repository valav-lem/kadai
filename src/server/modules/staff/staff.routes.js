import * as staffService from './staff.service.js';

export default async function staffRoutes(fastify, _options) {
  fastify.get('/', async (_request, _reply) => {
    const staff = await staffService.getAllStaff();
    return { staff };
  });

  fastify.get('/:id', async (request, reply) => {
    const staff = await staffService.getStaffById(request.params.id);
    if (!staff) {
      return reply.status(404).send({ error: 'Staff member not found' });
    }
    return { staff };
  });

  fastify.patch('/:id', async (request, reply) => {
    const updated = await staffService.updateStaff(request.params.id, request.body || {});
    if (!updated) {
      return reply.status(404).send({ error: 'Staff member not found' });
    }
    return { staff: updated };
  });
}
