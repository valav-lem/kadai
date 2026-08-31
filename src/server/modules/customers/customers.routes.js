import * as customersService from './customers.service.js';

export default async function customersRoutes(fastify, _options) {
  fastify.get('/', async (request, _reply) => {
    const { search, limit } = request.query;
    const customers = await customersService.getCustomers({
      search,
      limit: limit ? parseInt(limit, 10) : 50,
    });
    return { customers };
  });

  fastify.get('/:id', async (request, reply) => {
    const customer = await customersService.getCustomerById(request.params.id);
    if (!customer) {
      return reply.status(404).send({ error: 'Customer not found' });
    }
    return { customer };
  });

  fastify.post('/', async (request, reply) => {
    try {
      const customer = await customersService.createCustomer(request.body || {});
      return reply.status(201).send({ customer });
    } catch (err) {
      return reply.status(400).send({ error: err.message });
    }
  });
}
