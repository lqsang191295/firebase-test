import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";

export type Device = {
  id: string;
  token: string;
  name: string;
  userAgent: string;
  platform: string;
  language: string;
  screen: string;
  timezone: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string;
};

export type NotificationLog = {
  id: string;
  target: "broadcast" | "single";
  deviceId: string;
  title: string;
  body: string;
  successCount: number;
  failureCount: number;
  error: string;
  createdAt: string;
};

const DATA_FILE = path.join(process.cwd(), "data.xlsx");
const DEVICES_SHEET = "Devices";
const LOGS_SHEET = "NotificationLogs";
const FILE_ACCESS_ERROR_MESSAGE =
  "Khong the truy cap data.xlsx. Hay dong file data.xlsx trong Excel/LibreOffice/OneDrive preview roi thu lai.";

function now() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function isFileAccessError(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const code = "code" in error ? String(error.code) : "";
  const message = "message" in error ? String(error.message) : "";

  return (
    ["EBUSY", "EPERM", "EACCES"].includes(code) ||
    message.includes("Cannot access file") ||
    message.includes(DATA_FILE)
  );
}

function toExcelAccessError(error: unknown) {
  if (isFileAccessError(error)) {
    return new Error(FILE_ACCESS_ERROR_MESSAGE);
  }

  return error;
}

function writeWorkbook(workbook: XLSX.WorkBook) {
  try {
    const output = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    fs.writeFileSync(DATA_FILE, output);
  } catch (error: unknown) {
    throw toExcelAccessError(error);
  }
}

function createWorkbook() {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet([]),
    DEVICES_SHEET,
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet([]),
    LOGS_SHEET,
  );
  writeWorkbook(workbook);
  return workbook;
}

function readWorkbook() {
  try {
    if (!fs.existsSync(DATA_FILE) || fs.statSync(DATA_FILE).size === 0) {
      return createWorkbook();
    }
  } catch (error: unknown) {
    throw toExcelAccessError(error);
  }

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(fs.readFileSync(DATA_FILE), { type: "buffer" });
  } catch (error: unknown) {
    throw toExcelAccessError(error);
  }

  if (!workbook.Sheets[DEVICES_SHEET]) {
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet([]),
      DEVICES_SHEET,
    );
  }
  if (!workbook.Sheets[LOGS_SHEET]) {
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet([]),
      LOGS_SHEET,
    );
  }
  return workbook;
}

function writeSheet<T>(workbook: XLSX.WorkBook, sheetName: string, rows: T[]) {
  workbook.Sheets[sheetName] = XLSX.utils.json_to_sheet(rows);
  if (!workbook.SheetNames.includes(sheetName)) {
    workbook.SheetNames.push(sheetName);
  }

  writeWorkbook(workbook);
}

function readSheet<T>(sheetName: string): T[] {
  const workbook = readWorkbook();
  return XLSX.utils.sheet_to_json<T>(workbook.Sheets[sheetName], {
    defval: "",
  });
}

function normalizeDevice(row: Device): Device {
  return {
    ...row,
    platform: row.platform || "",
    language: row.language || "",
    screen: row.screen || "",
    timezone: row.timezone || "",
    active: row.active === true || String(row.active).toLowerCase() === "true",
  };
}

export function listDevices() {
  return readSheet<Device>(DEVICES_SHEET)
    .map(normalizeDevice)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listActiveDevices() {
  return listDevices().filter((device) => device.active);
}

export function getDevice(deviceId: string) {
  return listDevices().find((device) => device.id === deviceId);
}

export function upsertDevice(input: {
  token: string;
  name?: string;
  userAgent?: string;
  platform?: string;
  language?: string;
  screen?: string;
  timezone?: string;
}) {
  const workbook = readWorkbook();
  const devices = XLSX.utils
    .sheet_to_json<Device>(workbook.Sheets[DEVICES_SHEET], { defval: "" })
    .map(normalizeDevice);
  const existing = devices.find((device) => device.token === input.token);
  const timestamp = now();

  if (existing) {
    existing.name = input.name?.trim() || existing.name || "Mobile";
    existing.userAgent = input.userAgent || existing.userAgent;
    existing.platform = input.platform || existing.platform;
    existing.language = input.language || existing.language;
    existing.screen = input.screen || existing.screen;
    existing.timezone = input.timezone || existing.timezone;
    existing.active = true;
    existing.lastSeenAt = timestamp;
    existing.updatedAt = timestamp;
  } else {
    devices.push({
      id: id("dev"),
      token: input.token,
      name: input.name?.trim() || "Mobile",
      userAgent: input.userAgent || "",
      platform: input.platform || "",
      language: input.language || "",
      screen: input.screen || "",
      timezone: input.timezone || "",
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastSeenAt: timestamp,
    });
  }

  writeSheet(workbook, DEVICES_SHEET, devices);
  return devices.find((device) => device.token === input.token);
}

export function updateDevice(
  deviceId: string,
  patch: Partial<Pick<Device, "name" | "active">>,
) {
  const workbook = readWorkbook();
  const devices = XLSX.utils
    .sheet_to_json<Device>(workbook.Sheets[DEVICES_SHEET], { defval: "" })
    .map(normalizeDevice);
  const device = devices.find((item) => item.id === deviceId);

  if (!device) return null;
  if (typeof patch.name === "string") {
    device.name = patch.name.trim() || device.name;
  }
  if (typeof patch.active === "boolean") device.active = patch.active;
  device.updatedAt = now();

  writeSheet(workbook, DEVICES_SHEET, devices);
  return device;
}

export function deleteDevice(deviceId: string) {
  const workbook = readWorkbook();
  const devices = XLSX.utils
    .sheet_to_json<Device>(workbook.Sheets[DEVICES_SHEET], { defval: "" })
    .map(normalizeDevice);
  const nextDevices = devices.filter((device) => device.id !== deviceId);

  if (nextDevices.length === devices.length) return false;
  writeSheet(workbook, DEVICES_SHEET, nextDevices);
  return true;
}

export function listNotificationLogs() {
  return readSheet<NotificationLog>(LOGS_SHEET).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function addNotificationLog(
  input: Omit<NotificationLog, "id" | "createdAt">,
) {
  const workbook = readWorkbook();
  const logs = XLSX.utils.sheet_to_json<NotificationLog>(
    workbook.Sheets[LOGS_SHEET],
    {
      defval: "",
    },
  );
  const log: NotificationLog = {
    id: id("log"),
    createdAt: now(),
    ...input,
  };

  logs.push(log);
  writeSheet(workbook, LOGS_SHEET, logs);
  return log;
}
