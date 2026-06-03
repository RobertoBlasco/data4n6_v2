export interface Unit {
  id: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  deletedAt: string | null;
  forInventory: boolean;
  forData4n6: boolean;
}
