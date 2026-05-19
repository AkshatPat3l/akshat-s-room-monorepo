import Fastify from 'fastify';
import cors from '@fastify/cors';
import { globalModerator } from './trie';
import { performance } from 'perf_hooks';
import { ModerationRequest, ModerationResponse } from '@monorepo/types';

const fastify = Fastify({ logger: true });

// Enable CORS so the React app can call this backend
fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST'],
});

fastify.post<{ Body: ModerationRequest }>('/api/v1/moderate', async (request, reply) => {
  const { text } = request.body;
  
  if (typeof text !== 'string') {
    return reply.status(400).send({ error: 'Payload must contain a "text" field of type string.' });
  }

  const start = performance.now();
  const sanitized = globalModerator.moderate(text);
  const end = performance.now();
  const latencyMs = end - start;

  const response: ModerationResponse = {
    original: text,
    sanitized,
    latencyMs,
  };

  return reply.send(response);
});

// A simple health check/status route
fastify.get('/health', async () => {
  return { status: 'healthy', service: 'bobba-api' };
});

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Content Moderation Engine listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
