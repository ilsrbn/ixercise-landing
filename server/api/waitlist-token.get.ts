import { issueFormToken } from "../utils/waitlist-security";

// Short-lived signed timestamp; the form must be submitted at least a few
// seconds after it was issued, which cheap bots posting directly will not do.
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  setResponseHeader(event, "Cache-Control", "no-store");
  return { token: issueFormToken(config.resendApiKey || "dev-secret") };
});
