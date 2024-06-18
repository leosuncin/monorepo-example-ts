import { initQueryClient } from '@ts-rest/react-query';
import { contract } from '@monorepo/contract';

export const client = initQueryClient(contract, {
  baseUrl: import.meta.env.VITE_APP_API_URL,
  jsonQuery: true,
});
