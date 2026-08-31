import * as catalogueService from './catalogue.service.js';

export default async function catalogueRoutes(fastify, _options) {
  fastify.get('/', async (request, _reply) => {
    const { kind, search, lowStockOnly } = request.query;
    const items = await catalogueService.getCatalogueItems({
      kind,
      search,
      lowStockOnly: lowStockOnly === 'true' || lowStockOnly === true,
    });
    return { items };
  });

  fastify.get('/low-stock', async (_request, _reply) => {
    const items = await catalogueService.getCatalogueItems({ lowStockOnly: true });
    return { items };
  });

  fastify.get('/:id', async (request, reply) => {
    const item = await catalogueService.getCatalogueItemById(request.params.id);
    if (!item) {
      return reply.status(404).send({ error: 'Catalogue item not found' });
    }
    return { item };
  });

  fastify.post('/', async (request, reply) => {
    try {
      const item = await catalogueService.createCatalogueItem(request.body);
      return reply.status(201).send({ item });
    } catch (err) {
      return reply.status(400).send({ error: err.message });
    }
  });

  fastify.put('/:id', async (request, reply) => {
    try {
      const item = await catalogueService.updateCatalogueItem(request.params.id, request.body);
      if (!item) {
        return reply.status(404).send({ error: 'Catalogue item not found' });
      }
      return { item };
    } catch (err) {
      return reply.status(400).send({ error: err.message });
    }
  });

  fastify.patch('/:id/stock', async (request, reply) => {
    const { delta } = request.body || {};
    if (typeof delta !== 'number') {
      return reply.status(400).send({ error: 'delta must be a number' });
    }
    const item = await catalogueService.adjustStock(request.params.id, delta);
    if (!item) {
      return reply.status(404).send({ error: 'Product not found or not a product' });
    }
    return { item };
  });

  fastify.delete('/:id', async (request, reply) => {
    try {
      const item = await catalogueService.deleteCatalogueItem(request.params.id);
      if (!item) {
        return reply.status(404).send({ error: 'Catalogue item not found' });
      }
      return { success: true, item };
    } catch (err) {
      return reply.status(400).send({ error: err.message });
    }
  });
}
