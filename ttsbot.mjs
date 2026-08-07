#!/usr/bin/env node
// Load environment before importing modules whose loggers read LOG_LEVEL at import time.
import dotenv from 'dotenv';

dotenv.config({ quiet: true });
await import('./src/main.mjs');
