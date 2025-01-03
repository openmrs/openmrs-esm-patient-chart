export interface OrderPriceData {
  resourceType: string;
  id: string;
  meta: {
    lastUpdated: string;
  };
  type: string;
  link: {
    relation: string;
    url: string;
  }[];
  entry: {
    resource: {
      resourceType: string;
      id: string;
      name: string;
      status: string;
      date: string;
      propertyGroup: {
        priceComponent: {
          type: string;
          amount: {
            value: number;
            currency: string;
          };
        }[];
      }[];
    };
  }[];
}

export interface OrderStockData {
  resourceType: string;
  id: string;
  meta: {
    lastUpdated: string;
  };
  type: string;
  link: {
    relation: string;
    url: string;
  }[];
  entry: {
    resource: {
      resourceType: string;
      id: string;
      meta: {
        profile: string[];
      };
      status: string;
      code: {
        coding: {
          system: string;
          code: string;
          display: string;
        }[];
      }[];
      name: {
        name: string;
      }[];
      netContent: {
        value: number;
        unit: string;
      };
    };
  }[];
}
