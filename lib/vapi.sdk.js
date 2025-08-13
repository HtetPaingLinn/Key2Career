// VAPI SDK wrapper for JavaScript
import Vapi from "@vapi-ai/web";

// Initialize VAPI instance
export const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN);

// Call status enum
export const CallStatus = {
  INACTIVE: "INACTIVE",
  CONNECTING: "CONNECTING", 
  ACTIVE: "ACTIVE",
  FINISHED: "FINISHED",
};
