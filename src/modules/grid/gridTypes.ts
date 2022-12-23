export type CellType = "text" | "number" | "sidc" | "dots";

export interface ColumnProperties<TData = Record<string, any>> {
  field: keyof TData;
  id?: string;
  label?: string;
  width?: number;
  type?: CellType;
}

export interface RuntimeColumnProperties extends Required<ColumnProperties> {}

export interface IId {
  id: string;
}
export interface RowData<TData = any> extends IId {
  id: string;
}
