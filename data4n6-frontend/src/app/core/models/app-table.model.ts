import { App } from './app.model';

export interface AppTable {
  id: string;
  tableName: string;
  displayName: string;
  description: string | null;
  nombreSingular: string | null;
  nombrePlural: string | null;
  icono: string | null;
  vistas: string;
  endpointBase: string | null;
  seccionMenu: string | null;
  ordenMenu: number | null;
  formFields: string | null;
  dbSchema: string | null;
  formRoute: string | null;
  application: App | null;
}
