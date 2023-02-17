export type ExportFormat = "geojson" | "kml" | "kmz" | "msdl" | "xlsx" | "csv";
export type ImportFormat = "geojson" | "milx" | "msdl";
export type GuessedImportFormat = "unknown" | ImportFormat;

export interface ColumnMapping<TData = Record<string, any>> {
  label: string;
  field: keyof TData | string;
}

export interface XlsxSettings {
  oneSheetPerSide: boolean;
  columns: ColumnMapping[];
}

export interface CsvSettings {
  columns: ColumnMapping[];
}

export interface ExportSettings extends XlsxSettings, CsvSettings {
  fileName: string;
  includeUnits: boolean;
  includeFeatures: boolean;
  embedIcons: boolean;
  useShortName: boolean;
}

export interface ImportSettings {
  fileName: string;
  includeUnits: boolean;
  includeFeatures: boolean;
  embedIcons: boolean;
  useShortName: boolean;
}
