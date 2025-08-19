export interface ApiResponse {
  success: boolean;
  data: DataItem[];
}

export interface DataItem {
  checked: boolean;
  label: string;
  data: CompanyData;
  icon: null | string;
  expandedIcon: null | string;
  collapsedIcon: null | string;
  expanded: boolean;
  parentId: null | number;
  children: DataItem[];
}

export interface CompanyData {
  id: number;
  companyName: string;
  parentId: null | number;
  onboardedByDate: string;
  updatedBy: null | string;
}
