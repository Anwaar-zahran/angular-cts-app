export interface Delegation {
  id?: number;  
  //userId: number;
  fromDate: string;
  toDate: string;
  toUser: string;
  categoryIds: number;
  privacyId: number;
  privacyName?: string; 
  createdDate?: string; 
  allowSign: boolean;
  showOldCorrespondecne: boolean;
  toUserValueText: toUserValue;
  draftInbox: boolean;
  note: string;
  startDate:string;
}

export interface toUserValue {
  id?: number;
  text:string | null;
  parentName:string | null;
  parentNodeId?: number;
   
}
