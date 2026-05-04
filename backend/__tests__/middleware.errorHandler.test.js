describe('Error Handler Middleware', () => {
  const { notFound, errorHandler } = require('../middleware/errorHandler');
  
  describe('notFound', () => {
    it('should create a 404 error and pass it to next', () => {
      const req = { originalUrl: '/not-existing-route' };
      const res = {};
      const next = jest.fn();
      
      notFound(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Route not found - /not-existing-route',
        statusCode: 404
      }));
    });
  });
  
  describe('errorHandler', () => {
    let res;
    let consoleErrorSpy;
    const originalNodeEnv = process.env.NODE_ENV;
    
    beforeEach(() => {
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });
    
    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
      consoleErrorSpy.mockRestore();
    });
    
    it('should handle errors with status code and message', () => {
      const err = {
        statusCode: 400,
        message: 'Bad Request',
        stack: 'Error stack trace'
      };
      
      errorHandler(err, {}, res, {});
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          statusCode: 400,
          message: 'Bad Request',
          stack: 'Error stack trace'  // Stack included in development
        }
      });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    
    it('should use default status and message if not provided', () => {
      const err = {};
      
      errorHandler(err, {}, res, {});
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          statusCode: 500,
          message: 'Internal Server Error',
          stack: undefined  // No stack in the error object
        }
      });
    });
    
    it('should not include stack trace in production', () => {
      process.env.NODE_ENV = 'production';
      
      const err = {
        statusCode: 400,
        message: 'Bad Request',
        stack: 'Error stack trace'
      };
      
      errorHandler(err, {}, res, {});
      
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          statusCode: 400,
          message: 'Bad Request'
          // No stack trace in production
        }
      });
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });
});
