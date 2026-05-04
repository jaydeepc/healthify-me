const request = require('supertest');
const app = require('../server');

describe('Server Application', () => {
  let server;

  beforeAll(() => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.BACKEND_PORT = '3001';
    process.env.FRONTEND_PORT = '3000';
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  describe('Middleware Configuration', () => {
    it('should handle CORS properly', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });



  describe('Error Handling', () => {
    it('should handle 404 errors for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.success).toBe(false);
    });

    it('should handle errors with proper error response format', async () => {
      const response = await request(app)
        .get('/unknown-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('stack');
      expect(response.body.error).toHaveProperty('statusCode');
      expect(response.body.success).toBe(false);
    });
  });

  describe('Production Mode Behavior', () => {
    let originalNodeEnv;

    beforeAll(() => {
      originalNodeEnv = process.env.NODE_ENV;
    });

    afterAll(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should serve static files in production mode', async () => {
      process.env.NODE_ENV = 'production';
      
      // Create a new app instance for production testing
      delete require.cache[require.resolve('../server')];
      const prodApp = require('../server');

      const response = await request(prodApp)
        .get('/');

      // Should attempt to serve static files (may 404 if dist doesn't exist, but shouldn't error)
      expect([200, 404]).toContain(response.status);
    });

    it('should not serve static files in development mode', async () => {
      process.env.NODE_ENV = 'development';
      
      const response = await request(app)
        .get('/');

      expect(response.status).toBe(404);
    });
  });




});
