#!/usr/bin/env node
// Load environment before importing modules that read LOG_LEVEL at import time.
import dotenv from "dotenv";

dotenv.config({ quiet: true });
const { startMain } = await import("../src/main.mjs");
await startMain();
