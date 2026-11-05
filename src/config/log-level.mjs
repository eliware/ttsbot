export function configureLogLevel(logger, value) {
  if (value == null || value === "") return;
  const level = String(value).trim().toLowerCase();
  if (!Object.hasOwn(logger.levels ?? {}, level)) {
    logger.warn?.("Ignoring unsupported LOG_LEVEL value.", { logLevel: level });
    return;
  }
  logger.level = level;
}
