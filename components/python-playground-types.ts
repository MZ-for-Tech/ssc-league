export type OutputKind = "stdout" | "stderr" | "result" | "system" | "plot";
export type ConsoleTab = "output" | "errors" | "plots";

export interface OutputLine {
  id: number;
  kind: OutputKind;
  text?: string;
  imageDataUrl?: string;
  figureNumber?: number;
}

export interface ConsoleTabItem {
  id: ConsoleTab;
  label: string;
  count: number;
}
