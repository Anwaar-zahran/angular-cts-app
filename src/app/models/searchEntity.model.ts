export interface Entity {
  id: number;
  name: string;
  code: string | null;
  managerId: number;
  parentId: number;
  external: boolean;
  attributes: Attribute[];
}
export interface Attribute {
  text: string;
  value: string | null;
  type: string | null;
}
