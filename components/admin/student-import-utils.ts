export type ParsedImportRow = {
  line: number;
  email: string;
  full_name: string;
  student_id: string;
  group_id: string;
  errors: string[];
};

function parseDelimitedRows(input: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (quoted) {
      if (character === '"' && input[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
    } else if (character === '"' && cell.length === 0) {
      quoted = true;
    } else if (character === delimiter) {
      row.push(cell);
      cell = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && input[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  if (quoted) throw new Error("The CSV contains an unfinished quoted field.");
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function serializePipeValue(value: string) {
  const normalized = value.replace(/\r?\n/g, " ").trim();
  return /[|\"]/.test(normalized) ? `"${normalized.replace(/"/g, '""')}"` : normalized;
}

export function parseStudentImport(data: string): ParsedImportRow[] {
  let rows: { values: string[]; line: number }[];
  try {
    rows = parseDelimitedRows(data, "|").map((values, index) => ({ values, line: index + 1 }));
  } catch (error) {
    return [{
      line: 1,
      email: "",
      full_name: "",
      student_id: "",
      group_id: "G1",
      errors: [error instanceof Error ? error.message : "Check the quoted fields in this row."],
    }];
  }
  const emailCounts = new Map<string, number>();
  const parsed = rows.map(({ values, line }) => {
    const [email = "", full_name = "", student_id = "", group_id = ""] = values.map((value) => value.trim());
    const errors: string[] = [];
    if (!email || !full_name || !student_id) errors.push("Email, name, and student ID are required.");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Enter a valid email address.");
    if (email) emailCounts.set(email.toLocaleLowerCase(), (emailCounts.get(email.toLocaleLowerCase()) || 0) + 1);
    return { line, email, full_name, student_id, group_id: group_id || "G1", errors };
  });
  return parsed.map((row) => {
    if ((emailCounts.get(row.email.toLocaleLowerCase()) || 0) > 1) row.errors.push("Email appears more than once in this import.");
    return row;
  });
}

export function csvToPipeRows(csv: string) {
  const rows = parseDelimitedRows(csv, ",");
  if (!rows.length) throw new Error("The selected CSV does not contain any student rows.");

  const normalizeHeader = (value: string) => value.toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
  const headers = rows[0].map(normalizeHeader);
  const aliases = {
    email: ["email", "emailaddress"],
    full_name: ["fullname", "name", "studentname"],
    student_id: ["studentid", "id", "studentnumber"],
    group_id: ["group", "groupid", "class", "section"],
  };
  const columns = Object.fromEntries(Object.entries(aliases).map(([key, names]) => [key, headers.findIndex((header) => names.includes(header))])) as Record<keyof typeof aliases, number>;
  const hasHeader = columns.email >= 0 && columns.full_name >= 0 && columns.student_id >= 0;
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const valuesFor = (row: string[], column: number, fallback: number) => row[column >= 0 ? column : fallback] || "";

  if (!dataRows.length) throw new Error("The CSV contains headers but no student rows.");
  return dataRows.map((row) => [
    valuesFor(row, columns.email, 0),
    valuesFor(row, columns.full_name, 1),
    valuesFor(row, columns.student_id, 2),
    valuesFor(row, columns.group_id, hasHeader ? -1 : 3),
  ].map(serializePipeValue).join(" | ")).join("\n");
}
