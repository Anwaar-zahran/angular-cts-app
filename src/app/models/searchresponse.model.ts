export interface SearchResponse {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: DataItem[];
}

export interface DataItem {
  id: number;
  categoryId: number;
  categoryText: string;
  referenceNumber: string;
  subject: string;
  createdDate: string; 
  statusId: number;
  statusText: string;
  priorityId: number;
  priorityText: string;
  privacyId: number;
  privacyText: string;
  importanceId: number | null;
  importanceText: string | null;
  sendingEntity: string;
  receivingEntity: string;
  createdByUser: string;
  dueDate: string; 
  documentDate: string;
  isOverDue: boolean;
}
