const healthRoute = require('../routes/health');

describe('Health Route', () => {
  it('should return correct health status object', () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const originalEnv = process.env.NODE_ENV;
    process.env.TEST = 'test-value';

    healthRoute.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ok',
        message: 'Server is running',
        testVar: 'test-value'
      })
    );

    process.env.NODE_ENV = originalEnv;
    delete process.env.TEST;
  });
});
