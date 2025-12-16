// Global Jest setup for all test types
import { config } from "dotenv";

// Load test environment variables
config({ path: ".env.test" });

// Increase Jest timeout for database operations
jest.setTimeout(30000);

// Mock console methods in test environment to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
