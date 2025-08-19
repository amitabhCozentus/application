
export interface DataTableRequest {
  pagination: {
    page: number;
    size: number;
  };
  searchFilter: {
    searchText: string;
  };
  columns: any[]; 
}

export interface ApiRequestBody {
  dataTableRequest: DataTableRequest;
  type: string;
}

export const DEFAULT_API_REQUEST: ApiRequestBody = {
  dataTableRequest: {
    pagination: {
      page: 200,
      size: 20
    },
    searchFilter: {
      searchText: ''
    },
    columns: []
  },
  type: 'PSA'
};
