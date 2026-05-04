jest.mock('express', () => {
  const mockRouter = {
    use: jest.fn(),
  };
  return {
    Router: jest.fn(() => mockRouter),
  };
});

jest.mock('../routes/health', () => 'mockHealthRoutes');

describe('Routes Index', () => {
  let express;
  let router;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    express = require('express');
    
    router = express.Router();
  });
  
  it('should set up routes correctly', () => {
    const routes = require('../routes/index');
    
    expect(router.use).toHaveBeenCalledWith('/health', 'mockHealthRoutes');
    
    expect(routes).toBe(router);
    
    expect(router.use).toHaveBeenCalledTimes(1);
  });
});
