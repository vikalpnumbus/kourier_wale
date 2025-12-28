const queueConfig = {
  kyc: {
    exchange: "kyc_exchange",
    routingKey: "kyc_routingKey",
    queue: "kyc_queue",
  },
  companyDetails: {
    exchange: "companyDetails_exchange",
    routingKey: "companyDetails_routingKey",
    queue: "companyDetails_queue",
  },
  bankDetails: {
    exchange: "bankDetails_exchange",
    routingKey: "bankDetails_routingKey",
    queue: "bankDetails_queue",
  },
  products: {
    exchange: "products_exchange",
    routingKey: "products_routingKey",
    queue: "products_queue",

    import: {
      exchange: "products_import_exchange",
      routingKey: "products_import_routingKey",
      queue: "products_import_queue",
    },
  },
  warehouse: {
    import: {
      exchange: "warehouse_import_exchange",
      routingKey: "warehouse_import_routingKey",
      queue: "warehouse_import_queue",
    },
  },
  orders: {
    exchange: "orders_exchange",
    import: {
      routingKey: "orders_import_routingKey",
      queue: "orders_import_queue",
    },
    create: {
      routingKey: "orders_create_routingKey",
      queue: "orders_create_queue",
    },
  },
  shipping: {
    exchange: "shipping_exchange",
    create: {
      routingKey: "shipping_routingKey",
      queue: "shipping_queue",
    },
    cancel: {
      routingKey: "shipping_cancel_routingKey",
      queue: "shipping_cancel_queue",
    },
    retry: {
      routingKey: "shipping_retry_routingKey",
      queue: "shipping_retry_queue",
    },
  },
  weightReco: {
    exchange: "weightReco_exchange",
    routingKey: "weightReco_routingKey",
    queue: "weightReco_queue",
  },
  adminExports: {
    exchange: "admin_exports_exchange",
    routingKey: "admin_exports_routingKey",
    queue: "admin_exports_queue",
  },
  adminImports: {
    exchange: "admin_imports_exchange",
    routingKey: "admin_imports_routingKey",
    queue: "admin_imports_queue",
  },
  
};

export default queueConfig;
