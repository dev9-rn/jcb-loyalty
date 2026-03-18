let maintenanceCallback: (() => Promise<void>) | null = null;
let lastMaintenanceCheck = 0;

const CHECK_INTERVAL = 30000; // 30 seconds

export const setMaintenanceHandler = (fn: () => Promise<void>) => {
  maintenanceCallback = fn;
};

export const triggerMaintenanceCheck = async () => {
  const now = Date.now();

  if (!maintenanceCallback) return;

  if (now - lastMaintenanceCheck < CHECK_INTERVAL) {
    return;
  }

  lastMaintenanceCheck = now;

  // run in background and ignore errors
  maintenanceCallback().catch((error) => {
    // Do nothing if maintenance API fails
    console.log(error, "MAINTAINANCE-API")
  });
};