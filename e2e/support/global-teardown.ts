import mongoose from "mongoose";

// Closes the shared mongoose connection opened by e2e/support/db.ts helpers
// so the Playwright process can exit cleanly instead of hanging on an open socket.
export default async function globalTeardown() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}
