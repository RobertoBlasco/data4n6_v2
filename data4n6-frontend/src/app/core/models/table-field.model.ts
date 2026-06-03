export interface TableField {
  id: string;
  appTableId: string;
  fieldName: string;
  displayName: string | null;
  fieldType: string;
  required: boolean;
  defaultValue: string | null;
  placeholder: string | null;
  endpoint: string | null;
  visibleInGrid: boolean;
  visibleInForm: boolean;
  orden: number | null;
  gridWidth: number | null;
  gridAlign: string | null;
}
