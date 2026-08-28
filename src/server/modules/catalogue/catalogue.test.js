import test from 'node:test';
import assert from 'node:assert/strict';
import { createCatalogueItem } from './catalogue.service.js';

test('Catalogue: validates that product requires HSN and valid GST slab', async () => {
  // Missing HSN
  await assert.rejects(
    async () => {
      await createCatalogueItem({
        kind: 'product',
        name: 'Test Oil',
        price_paise: 10000,
        gst_slab: 18,
      });
    },
    { message: 'Product must have an HSN code' }
  );

  // Invalid GST slab
  await assert.rejects(
    async () => {
      await createCatalogueItem({
        kind: 'product',
        name: 'Test Oil',
        hsn: '33059011',
        price_paise: 10000,
        gst_slab: 15, // Invalid slab (must be 0, 5, 12, 18, 28)
      });
    },
    /Invalid GST slab/
  );
});

test('Catalogue: validates that service requires SAC and positive duration', async () => {
  // Missing SAC
  await assert.rejects(
    async () => {
      await createCatalogueItem({
        kind: 'service',
        name: 'Test Cut',
        price_paise: 15000,
        gst_slab: 18,
      });
    },
    { message: 'Service must have a SAC code' }
  );

  // Missing duration
  await assert.rejects(
    async () => {
      await createCatalogueItem({
        kind: 'service',
        name: 'Test Cut',
        sac: '999721',
        price_paise: 15000,
        gst_slab: 18,
        duration_min: 0,
      });
    },
    { message: 'Service must have a positive duration in minutes' }
  );
});
