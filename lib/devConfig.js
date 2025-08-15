// Development Configuration
// This file allows you to easily disable performance-impacting features during development

const DEV_CONFIG = {
  // Disable artificial delays in API routes during development
  DISABLE_API_DELAYS: true,

  // Disable heavy operations during development
  DISABLE_HEAVY_OPERATIONS: true,

  // Use mock data instead of real API calls during development
  USE_MOCK_DATA: true,

  // Disable animations and transitions during development
  DISABLE_ANIMATIONS: false,

  // Log performance metrics during development
  LOG_PERFORMANCE: true,
};

// Helper function to check if we're in development mode
export const isDevelopment = () => {
  return process.env.NODE_ENV === "development";
};

// Helper function to get config value
export const getDevConfig = (key) => {
  if (!isDevelopment()) {
    return false; // Always return false in production
  }
  return DEV_CONFIG[key] || false;
};

// Helper function to add artificial delay (only if not disabled)
export const addDevDelay = async (delayMs = 500) => {
  if (isDevelopment() && !getDevConfig("DISABLE_API_DELAYS")) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
};

// Helper function to log performance metrics
export const logPerformance = (operation, startTime) => {
  if (isDevelopment() && getDevConfig("LOG_PERFORMANCE")) {
    const duration = Date.now() - startTime;
    console.log(`⏱️ ${operation}: ${duration}ms`);
  }
};

export default DEV_CONFIG;
