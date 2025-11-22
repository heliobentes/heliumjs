// ANSI color codes
const colors = {
    gray: "\x1b[90m",
    green: "\x1b[32m",
    orange: "\x1b[33m", // yellow/orange
    red: "\x1b[31m",
    teal: "\x1b[36m",
    reset: "\x1b[0m",
};

export function log(level: "info" | "warn" | "error" = "info", ...args: any[]) {
    const timestamp = new Date().toISOString();
    const levelColor = level === "error" ? colors.red : level === "warn" ? colors.orange : colors.green;
    const formattedMessage = `${colors.gray}${timestamp}${colors.reset} ${levelColor}${level.toUpperCase()}${colors.reset} ${colors.teal}[Helium]${colors.reset} ➜`;

    if (level === "error") {
        console.error(formattedMessage, ...args);
    } else if (level === "warn") {
        console.warn(formattedMessage, ...args);
    } else {
        console.log(formattedMessage, ...args);
    }
}
