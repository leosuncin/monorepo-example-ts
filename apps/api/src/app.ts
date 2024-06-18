import { contract } from '@monorepo/contract';
import { createExpressEndpoints } from '@ts-rest/express';
import { generateOpenApi } from '@ts-rest/open-api';
import cors from 'cors';
import express from 'express';
import { serve, setup } from 'swagger-ui-express';

import { router } from './router.js';

export const app: express.Express = express();
const openApi = generateOpenApi(
  contract,
  {
    info: {
      title: 'To-Do API',
      version: '1.0.0',
      description: 'API description',
    },
  },
  {
    jsonQuery: true,
    setOperationId: true,
  },
);

app.use(express.urlencoded({ extended: true }), express.json());
app.get('/docs/openapi.json', (_, response) => {
  response.json(openApi);
});
app.use(
  '/docs',
  serve,
  setup(openApi, {
    swaggerUrl: '/docs/openapi.json',
    swaggerOptions: {
      displayOperationId: true,
      tryItOutEnabled: true,
      requestSnippetsEnabled: true,
      displayRequestDuration: true,
    },
  }),
);

createExpressEndpoints(contract, router, app, {
  logInitialization: false,
  responseValidation: true,
  jsonQuery: true,
  globalMiddleware: [cors({ origin: true })],
});
