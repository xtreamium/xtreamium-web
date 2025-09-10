/**
 * Example usage of the logging utility
 * 
 * This file demonstrates various ways to use the logger
 * to replace console.log statements throughout the application.
 */

import { logger } from './logger';

// Example service class using contextual logger
class ExampleService {
  private readonly log = logger.withContext('ExampleService');

  async fetchData() {
    // Debug logging (only shown in development)
    this.log.debug('Starting data fetch');

    try {
      // Info logging with data
      this.log.info('Fetching user data', { userId: 123 });
      
      // Simulate some work
      const data = { id: 123, name: 'John Doe' };
      
      // Success logging
      this.log.info('Data fetched successfully', data);
      
      return data;
    } catch (error) {
      // Error logging
      this.log.error('Failed to fetch data', error);
      throw error;
    }
  }

  processData(data: unknown) {
    // Warning example
    if (!data) {
      this.log.warn('No data provided for processing');
      return;
    }

    this.log.info('Processing data', { dataType: typeof data });
  }
}

// Example React component usage
export function useLogger() {
  const componentLogger = logger.withContext('MyComponent');

  const handleClick = () => {
    // Replace: console.log('Button clicked')
    componentLogger.info('Button clicked');
  };

  const handleError = (error: Error) => {
    // Replace: console.error('Something went wrong:', error)
    componentLogger.error('Something went wrong', error);
  };

  return { handleClick, handleError };
}

// Direct logger usage examples
export function loggerExamples() {
  // Simple info logging
  logger.info('Application started');

  // Info with data
  logger.info('User logged in', { userId: 123, timestamp: new Date() });

  // Debug logging (only in development)
  logger.debug('Debugging network request', { url: '/api/users' });

  // Warning
  logger.warn('Deprecated API usage detected');

  // Error
  logger.error('Database connection failed', { 
    host: 'localhost', 
    port: 5432,
    error: 'Connection timeout'
  });

  // With context
  logger.info('Processing payment', { amount: 100 }, 'PaymentService');
}

export default ExampleService;