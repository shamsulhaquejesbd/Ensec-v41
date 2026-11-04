import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Role,
  OrgNode,
  Supplier,
  RawMaterial,
  RawMaterialCategory,
  RawMaterialClassification,
  Product,
  ProductCategory,
  ProductBrand,
  CustomerCategory,
  Department,
  Bank,
  UnitOfMeasurement,
  ProductionOrder,
  ImportPurchaseOrder,
  OptimumStatementEntry,
  Warehouse,
  StockTransfer,
  StockLedgerEntry,
  CIDStockReceipt,
  CIDStockReceiptItem,
  OpeningStockRecord,
  StockIssueRecord,
  PrimaryReturnRecord,
  StockAdjustmentRecord,
  Distributor,
  Customer,
  CRMLeadAgreement,
  FieldForceRep,
  VisitLog,
  OfferPromotion,
  SalesOrder,
  SalesOrderItem,
  Requisition,
  RequisitionItem,
  RequisitionStatus,
  Payment,
  PaymentStatus,
  TADAEntry,
  TADAStatus,
  CashBookEntry,
  PayrollRecord,
  AuditLog,
  PricingTier,
  getCustomerProductPricing,
  UserPermissions,
  FeaturePermissions,
  PageModuleId,
  getDefaultPermissionsForRole,
  hasModulePermission,
  hasFeaturePermission,
  resolveUserPermissions,
  InventoryBatch,
  InventoryMovement,
  RawMaterialReceipt,
  RawMaterialReceiptItem,
  MaterialIssue,
  MaterialIssueItem,
  ProductionConsumption,
  ProductionCostRecord,
  FinishedGoodsProductionReceipt,
  BOMDefinition,
  BOMItem,
  BOMRevision,
} from '../types/erp.ts';
import {
  INITIAL_USERS,
  INITIAL_ORG_HIERARCHY,
  INITIAL_SUPPLIERS,
  INITIAL_RAW_MATERIALS,
  INITIAL_RAW_MATERIAL_CATEGORIES,
  INITIAL_RAW_MATERIAL_CLASSIFICATIONS,
  INITIAL_INVENTORY_BATCHES,
  INITIAL_INVENTORY_MOVEMENTS,
  INITIAL_RAW_MATERIAL_RECEIPTS,
  INITIAL_PRODUCTION_COSTS,
  INITIAL_BOMS,
  INITIAL_CATEGORIES,
  INITIAL_CUSTOMER_CATEGORIES,
  INITIAL_BRANDS,
  INITIAL_DEPARTMENTS,
  INITIAL_BANKS,
  INITIAL_UOMS,
  INITIAL_PRODUCTS,
  INITIAL_IMPORT_ORDERS,
  INITIAL_PRODUCTION_ORDERS,
  INITIAL_OPTIMUM_STATEMENT,
  INITIAL_WAREHOUSES,
  INITIAL_STOCK_TRANSFERS,
  INITIAL_STOCK_LEDGER,
  INITIAL_CID_STOCK_RECEIPTS,
  INITIAL_OPENING_STOCK,
  INITIAL_STOCK_ISSUES,
  INITIAL_PRIMARY_RETURNS,
  INITIAL_STOCK_ADJUSTMENTS,
  INITIAL_DISTRIBUTORS,
  INITIAL_CUSTOMERS,
  INITIAL_CRM_AGREEMENTS,
  INITIAL_FIELD_FORCE,
  INITIAL_VISIT_LOGS,
  INITIAL_OFFERS,
  INITIAL_SALES_ORDERS,
  INITIAL_REQUISITIONS,
  INITIAL_PAYMENTS,
  INITIAL_TADA_LIST,
  INITIAL_CASH_BOOK,
  INITIAL_PAYROLL,
  INITIAL_AUDIT_LOGS,
  INITIAL_PRODUCTION_CONSUMPTIONS,
} from '../mock/initialData.ts';
import {
  ExpenseEntry,
  CostAllocationRecord,
  ProductionCostDetailedRecord,
  CostAllocationMethod,
  ManufacturingCostKPIs,
} from '../types/costing.ts';
import {
  INITIAL_EXPENSE_ENTRIES,
  INITIAL_COST_ALLOCATIONS,
} from '../mock/costingData.ts';
import {
  WarrantyTicket,
  BatteryReceivingRecord,
  TechnicalInspection,
  ServiceJobCard,
  SparePartReplacement,
  RepairEstimation,
  ServiceInvoice,
  ServicePayment,
  QualityControlRecord,
  BatteryDeliveryDispatch,
  WarrantyPolicy,
  ServiceSettings,
} from '../types/warranty.ts';
import {
  INITIAL_WARRANTY_TICKETS,
  INITIAL_BATTERY_RECEIVINGS,
  INITIAL_TECHNICAL_INSPECTIONS,
  INITIAL_SERVICE_JOB_CARDS,
  INITIAL_SPARE_PARTS_CONSUMPTIONS,
  INITIAL_REPAIR_ESTIMATIONS,
  INITIAL_SERVICE_INVOICES,
  INITIAL_SERVICE_PAYMENTS,
  INITIAL_QUALITY_CONTROL_RECORDS,
  INITIAL_BATTERY_DISPATCHES,
  INITIAL_WARRANTY_POLICIES,
  INITIAL_SERVICE_SETTINGS,
} from '../mock/warrantyData.ts';
import {
  InstallmentPlan,
  InstallmentSchedule,
  InstallmentPayment,
  CollectionAssignment,
  CollectionFollowUp,
  CollectionEscalationRule,
  SMSTemplate,
  SMSAutomationRule,
  SMSLog,
  SMSGatewaySettings,
  InstallmentNotification,
  EarlySettlementCalculation,
} from '../types/installment.ts';
import {
  INITIAL_INSTALLMENT_PLANS,
  INITIAL_INSTALLMENT_SCHEDULES,
  INITIAL_INSTALLMENT_PAYMENTS,
  INITIAL_COLLECTION_ASSIGNMENTS,
  INITIAL_COLLECTION_FOLLOWUPS,
  INITIAL_ESCALATION_RULES,
  INITIAL_SMS_TEMPLATES,
  INITIAL_SMS_AUTOMATION_RULES,
  INITIAL_SMS_LOGS,
  INITIAL_GATEWAY_SETTINGS,
  INITIAL_INSTALLMENT_NOTIFICATIONS,
} from '../mock/installmentData.ts';
import {
  runAutomatedInstallmentCheck,
  allocatePaymentFIFO,
  calculateEarlySettlement,
  AutomationExecutionReport,
} from '../lib/installmentAutomation.ts';
import { sendSMSViaGateway, compileTemplate } from '../lib/smsService.ts';
import {
  EmployeeSalaryStructure,
  AttendanceRecord,
  LeaveRecord,
  AdvanceLoanRecord,
  LoanInstallmentSchedule,
  OvertimeRecord,
  BonusRecord,
  MonthlyPayrollRun,
  MonthlySalarySheetItem,
  SalaryPaymentRecord,
  PayrollSettings,
  EmployeeCategory,
  AttendanceStatus,
  LeaveType,
  AdvanceLoanType,
  BonusType,
  SalaryPaymentMethod,
} from '../types/payroll.ts';
import {
  INITIAL_CENTRAL_EMPLOYEES,
  INITIAL_SALARY_STRUCTURES,
  INITIAL_ADVANCE_LOANS,
  INITIAL_LEAVE_RECORDS,
  INITIAL_OVERTIME_RECORDS,
  INITIAL_BONUS_RECORDS,
  DEFAULT_PAYROLL_SETTINGS,
  INITIAL_MONTHLY_PAYROLL_RUNS,
} from '../mock/payrollData.ts';
import {
  supabase,
  getSupabase,
  checkSupabaseConfigured,
  isSupabaseConfigured,
} from '../lib/supabase.ts';

interface ERPContextType {
  // Theme & User
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  users: User[];
  addUser: (userData: Omit<User, 'id'>) => string;
  updateUser: (userId: string, updates: Partial<User>) => void;
  updateUserPassword: (userId: string, newPassword: string) => Promise<{ success: boolean; error?: string; sqlFix?: string; warning?: string }>;
  updateUserPermissions: (userId: string, permissions: UserPermissions) => void;
  deleteUser: (userId: string) => void;
  refreshUsers?: () => Promise<void>;
  clearUsersLocalData?: () => Promise<void>;
  syncAllUsersToSupabase?: () => Promise<{ success: boolean; count: number; error?: string; sqlFix?: string }>;
  currentUserHasPermission: (moduleId: string) => boolean;
  currentUserHasFeature: (featureKey: keyof FeaturePermissions) => boolean;
  orgHierarchy: OrgNode;
  setOrgHierarchy: React.Dispatch<React.SetStateAction<OrgNode>>;
  saveOrgNode?: (node: OrgNode, parentId?: string) => Promise<{ success: boolean; error?: string }>;
  deleteOrgNode?: (nodeId: string) => Promise<{ success: boolean; error?: string }>;
  refreshOrgHierarchy?: () => Promise<void>;

  // Procurement
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => string;
  updateSupplier: (supplierId: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (supplierId: string) => void;
  rawMaterials: RawMaterial[];
  addRawMaterial: (material: Omit<RawMaterial, 'id'>) => Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }>;
  bulkAddRawMaterials?: (materials: Array<Omit<RawMaterial, 'id'> & { id?: string }>, options?: { updateExisting?: boolean }) => Promise<{ success: boolean; createdCount: number; updatedCount: number; error?: string }>;
  updateRawMaterial: (materialId: string, updates: Partial<RawMaterial>) => Promise<{ success: boolean; error?: string }>;
  deleteRawMaterial: (materialId: string) => Promise<{ success: boolean; error?: string }>;
  refreshRawMaterials?: () => Promise<void>;
  rawMaterialCategories: RawMaterialCategory[];
  addRawMaterialCategory: (category: Omit<RawMaterialCategory, 'id'>) => Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }>;
  updateRawMaterialCategory: (categoryId: string, updates: Partial<RawMaterialCategory>) => Promise<{ success: boolean; error?: string }>;
  deleteRawMaterialCategory: (categoryId: string) => Promise<{ success: boolean; error?: string }>;
  toggleRawMaterialCategoryStatus: (categoryId: string) => Promise<{ success: boolean; error?: string }>;
  refreshRawMaterialCategories?: () => Promise<void>;
  rawMaterialClassifications: RawMaterialClassification[];
  addRawMaterialClassification: (classification: Omit<RawMaterialClassification, 'id'>) => Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }>;
  updateRawMaterialClassification: (classificationId: string, updates: Partial<RawMaterialClassification>) => Promise<{ success: boolean; error?: string }>;
  deleteRawMaterialClassification: (classificationId: string) => Promise<{ success: boolean; error?: string }>;
  toggleRawMaterialClassificationStatus: (classificationId: string) => Promise<{ success: boolean; error?: string }>;
  refreshRawMaterialClassifications?: () => Promise<void>;
  importOrders: ImportPurchaseOrder[];
  addImportOrder: (order: Omit<ImportPurchaseOrder, 'id'>) => void;
  updateImportOrderStatus: (orderId: string, status: ImportPurchaseOrder['status']) => void;

  // Basic Data (Master Data) & Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (productId: string) => Promise<{ success: boolean; error?: string }>;
  refreshProducts?: () => Promise<void>;
  syncAllProductsToSupabase?: () => Promise<{ success: boolean; syncedCount: number; error?: string }>;
  categories: ProductCategory[];
  addCategory: (category: Omit<ProductCategory, 'id'>) => Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }>;
  updateCategory: (categoryId: string, updates: Partial<ProductCategory>) => Promise<{ success: boolean; error?: string }>;
  deleteCategory: (categoryId: string) => Promise<{ success: boolean; error?: string }>;
  refreshProductCategories?: () => Promise<void>;
  syncAllCategoriesToSupabase?: (itemsToSync?: ProductCategory[]) => Promise<{ success: boolean; syncedCount: number; error?: string }>;
  brands: ProductBrand[];
  addBrand: (brand: Omit<ProductBrand, 'id'>) => Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }>;
  updateBrand: (brandId: string, updates: Partial<ProductBrand>) => Promise<{ success: boolean; error?: string }>;
  deleteBrand: (brandId: string) => Promise<{ success: boolean; error?: string }>;
  refreshProductBrands?: () => Promise<void>;
  departments: Department[];
  addDepartment: (dept: Omit<Department, 'id'>) => Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }>;
  updateDepartment: (deptId: string, updates: Partial<Department>) => Promise<{ success: boolean; error?: string }>;
  deleteDepartment: (deptId: string) => Promise<{ success: boolean; error?: string }>;
  refreshDepartments?: () => Promise<void>;
  banks: Bank[];
  addBank: (bank: Omit<Bank, 'id'>) => Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }>;
  updateBank: (bankId: string, updates: Partial<Bank>) => Promise<{ success: boolean; error?: string }>;
  deleteBank: (bankId: string) => Promise<{ success: boolean; error?: string }>;
  refreshBanks?: () => Promise<void>;
  uoms: UnitOfMeasurement[];
  addUOM: (uom: Omit<UnitOfMeasurement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }>;
  updateUOM: (uomId: string, updates: Partial<UnitOfMeasurement>) => Promise<{ success: boolean; error?: string }>;
  deleteUOM: (uomId: string) => Promise<{ success: boolean; error?: string }>;
  refreshUOMs?: () => Promise<void>;

  // Manufacturing & Kushtia Plant
  productionOrders: ProductionOrder[];
  refreshProductionOrders?: () => Promise<void>;
  createProductionOrder: (order: Partial<ProductionOrder> & Omit<ProductionOrder, 'id' | 'completedQty'>) => Promise<{ success: boolean; id?: string; error?: string }>;
  completeProductionOrder: (orderId: string) => Promise<{ success: boolean; error?: string }>;
  updateProductBOM: (productId: string, bom: Product['bom']) => void;

  // Raw Material Batch Tracking, Barcodes, Inventory, Costing & Receiving
  inventoryBatches: InventoryBatch[];
  inventoryMovements: InventoryMovement[];
  rawMaterialReceipts: RawMaterialReceipt[];
  materialIssues: MaterialIssue[];
  productionConsumptions: ProductionConsumption[];
  boms: BOMDefinition[];
  productionCosts: ProductionCostRecord[];
  finishedGoodsProductionReceipts: FinishedGoodsProductionReceipt[];
  addRawMaterialReceipt: (receipt: Omit<RawMaterialReceipt, 'id' | 'createdAt'>) => Promise<{ success: boolean; grnNumber: string; batches: InventoryBatch[] }>;
  issueMaterialsForProduction: (issueData: {
    productionOrderId: string;
    productionOrderNumber: string;
    warehouseId: string;
    warehouseName: string;
    issuedBy: string;
    items: {
      materialId: string;
      batchNumber: string;
      quantity: number;
      isFifoOverride?: boolean;
      overrideReason?: string;
    }[];
    notes?: string;
  }) => Promise<{ success: boolean; issueNumber?: string; error?: string }>;
  calculateProductionCost: (
    orderId: string,
    paramsOrMethod?: {
      directLabourBDT?: number;
      factoryOverheadBDT?: number;
      otherCostsBDT?: number;
      goodQty?: number;
      rejectedQty?: number;
      wastagePercent?: number;
      costingMethod?: 'FIFO' | 'WEIGHTED_AVERAGE';
      saveToState?: boolean;
    } | 'FIFO' | 'WEIGHTED_AVERAGE',
    saveToState?: boolean
  ) => ProductionCostRecord;
  saveProductionCost: (costRecord: ProductionCostRecord) => void;
  receiveFinishedGoodsFromProduction: (
    productionOrderIdOrParams: string | any,
    params?: any
  ) => Promise<FinishedGoodsProductionReceipt>;
  updateBOMDefinition: (bom: BOMDefinition) => Promise<{ success: boolean; error?: string }>;
  refreshBOMs?: () => Promise<void>;
  getFifoBatchesForMaterial: (materialId: string, warehouseId?: string) => InventoryBatch[];
  findBatchByBarcode: (barcodeOrBatchNo: string) => InventoryBatch | undefined;
  formatCurrency: (amount: number) => string;

  // Manufacturing Expense Management & Cost Allocation Engine
  expenseEntries: ExpenseEntry[];
  costAllocations: CostAllocationRecord[];
  addExpenseEntry: (data: Omit<ExpenseEntry, 'id' | 'voucherNumber' | 'approvalStatus' | 'allocationStatus' | 'allocatedAmount' | 'remainingUnallocated' | 'createdAt'>) => string;
  updateExpenseEntry: (id: string, updates: Partial<ExpenseEntry>) => void;
  approveExpenseEntry: (id: string, approverName?: string) => void;
  deleteExpenseEntry: (id: string) => void;
  allocateExpenseToBatch: (params: {
    expenseId: string;
    productionOrderId: string;
    allocationMethod: CostAllocationMethod;
    allocatedAmount: number;
    basisValue?: number;
    totalBasisValue?: number;
    notes?: string;
  }) => { success: boolean; allocationId?: string; error?: string };
  deleteCostAllocation: (allocationId: string) => void;
  getProductionCostBreakdown: (orderId: string, method?: 'FIFO' | 'WEIGHTED_AVERAGE') => ProductionCostDetailedRecord;
  getManufacturingCostKPIs: (filters?: { dateRange?: string; warehouseId?: string; productId?: string }) => ManufacturingCostKPIs;

  // Optimum JV
  optimumStatement: OptimumStatementEntry[];
  addOptimumSettlementPayment: (amountBDT: number, reference: string, notes: string) => void;

  // Multi-Warehouse & Inventory
  warehouses: Warehouse[];
  addWarehouse: (
    warehouse: Omit<Warehouse, 'id'>
  ) => Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }> | any;
  updateWarehouse: (
    warehouseId: string,
    updates: Partial<Warehouse>
  ) => Promise<{ success: boolean; error?: string; isRemoteSynced: boolean }> | any;
  deleteWarehouse: (
    warehouseId: string
  ) => Promise<{ success: boolean; error?: string; isRemoteSynced: boolean }> | any;
  toggleWarehouseStatus: (
    warehouseId: string
  ) => Promise<{ success: boolean; error?: string; isRemoteSynced: boolean }> | any;
  refreshWarehouses: () => Promise<void>;
  syncAllWarehousesToSupabase: () => Promise<{ successCount: number; failCount: number; errors: string[] }>;
  stockTransfers: StockTransfer[];
  stockLedger: StockLedgerEntry[];
  createStockTransfer: (transfer: Omit<StockTransfer, 'id' | 'transferNumber'> & { status?: string }) => string | void;
  approveStockTransfer: (transferId: string) => Promise<void> | void;
  receiveStockTransfer: (transferId: string) => Promise<void> | void;
  refreshStockTransfers: () => Promise<void>;
  adjustStock: (warehouseId: string, productId: string, qtyDelta: number, reason: string) => void;
  // Central Inventory (CID) Physical Finished Stock
  cidStockReceipts: CIDStockReceipt[];
  addCIDStockReceipt: (receipt: Omit<CIDStockReceipt, 'id' | 'createdAt'>) => string;
  updateCIDStockReceiptStatus: (receiptId: string, status: CIDStockReceipt['status']) => void;
  deleteCIDStockReceipt: (receiptId: string) => void;
  refreshCIDStockReceipts: () => Promise<void>;
  // Opening Stock, Issues & Returns
  openingStockRecords: OpeningStockRecord[];
  addOpeningStockRecord: (record: Omit<OpeningStockRecord, 'id'>) => string;
  bulkAddOpeningStockRecords: (records: Omit<OpeningStockRecord, 'id'>[]) => number;
  stockIssueRecords: StockIssueRecord[];
  addStockIssueRecord: (record: Omit<StockIssueRecord, 'id' | 'issueNumber'>) => string;
  primaryReturnRecords: PrimaryReturnRecord[];
  addPrimaryReturnRecord: (record: Omit<PrimaryReturnRecord, 'id' | 'returnNumber'>) => string;
  // Warehouse Wise Stock Adjustments
  stockAdjustmentRecords: StockAdjustmentRecord[];
  addStockAdjustmentRecord: (
    record: Omit<StockAdjustmentRecord, 'id' | 'referenceNo' | 'previousQty' | 'newQty' | 'totalCostVarianceBDT'>
  ) => string;

  // Distributors & Customers
  distributors: Distributor[];
  updateDistributorCreditLimit: (distId: string, newLimit: number) => Promise<{ success: boolean; error?: string; isRemoteSynced: boolean }> | any;
  updateDistributor: (distId: string, updates: Partial<Distributor>) => Promise<{ success: boolean; error?: string; isRemoteSynced: boolean }> | any;
  addDistributor: (dist: Omit<Distributor, 'id' | 'currentOutstandingBDT'>) => Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }> | any;
  deleteDistributor?: (distId: string) => Promise<{ success: boolean; error?: string; isRemoteSynced: boolean }> | any;
  refreshDistributors?: () => Promise<void>;
  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id' | 'outstandingBalanceBDT'>) => Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }> | any;
  updateCustomer: (customerId: string, updates: Partial<Customer>) => Promise<{ success: boolean; error?: string; isRemoteSynced: boolean }> | any;
  deleteCustomer?: (customerId: string) => Promise<{ success: boolean; error?: string; isRemoteSynced: boolean }> | any;
  refreshCustomers?: () => Promise<void>;
  customerCategories: CustomerCategory[];
  addCustomerCategory: (category: Omit<CustomerCategory, 'id'>) => any;
  updateCustomerCategory: (categoryId: string, updates: Partial<CustomerCategory>) => any;
  deleteCustomerCategory: (categoryId: string) => any;
  refreshCustomerCategories?: () => Promise<void>;
  setProductCategoryPrice: (productId: string, customerCategoryId: string, priceBDT: number) => void;
  removeProductCategoryPrice: (productId: string, customerCategoryId: string) => void;
  updateCustomerPricingTier: (customerId: string, tier: PricingTier) => void;
  setCustomerCustomProductPrice: (customerId: string, productId: string, priceBDT: number) => void;
  removeCustomerCustomProductPrice: (customerId: string, productId: string) => void;
  updateProductChannelPricing: (
    productId: string,
    prices: {
      distributorPriceBDT: number;
      dealerPriceBDT: number;
      corporatePriceBDT: number;
      projectPriceBDT: number;
      retailPriceBDT: number;
    }
  ) => void;
  crmAgreements: CRMLeadAgreement[];
  addCRMLead: (lead: Omit<CRMLeadAgreement, 'id'>) => Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }> | any;
  bulkAddCRMLeads?: (leads: Omit<CRMLeadAgreement, 'id'>[]) => Promise<{ success: boolean; count: number; error?: string; isRemoteSynced: boolean }> | any;
  syncAllCRMLeadsToSupabase?: () => Promise<{ success: boolean; count: number; error?: string }>;
  addCRMCommunicationNote: (dealId: string, noteText: string) => Promise<{ success: boolean; error?: string }> | any;
  updateCRMDealStage: (dealId: string, stage: CRMLeadAgreement['stage']) => Promise<{ success: boolean; error?: string }> | any;
  deleteCRMDeal: (dealId: string) => Promise<{ success: boolean; error?: string }> | any;
  refreshCRMAgreements?: () => Promise<void>;
  clearCRMAgreementsCache?: () => void;

  // Field Force & GPS
  fieldForceReps: FieldForceRep[];
  addFieldForceRep: (rep: Omit<FieldForceRep, 'id'>) => any;
  updateFieldForceRep: (repId: string, updates: Partial<FieldForceRep>) => any;
  deleteFieldForceRep: (repId: string) => any;
  refreshFieldForce?: () => Promise<void>;
  visitLogs: VisitLog[];
  logCustomerVisit: (visit: Omit<VisitLog, 'id'>) => void;
  updateRepLocation: (repId: string, lat: number, lng: number, address: string) => void;

  // Offers Engine & Sales Orders
  offers: OfferPromotion[];
  addOffer: (offer: Omit<OfferPromotion, 'id'>) => any;
  updateOffer: (offerId: string, updates: Partial<OfferPromotion>) => any;
  deleteOffer: (offerId: string) => any;
  toggleOfferStatus: (offerId: string) => any;
  refreshOffers?: () => Promise<void>;
  salesOrders: SalesOrder[];
  clearSalesOrders: () => void;
  refreshSalesOrders?: () => Promise<void>;
  createSalesOrder: (order: Omit<SalesOrder, 'id' | 'orderNumber' | 'status'>) => string;
  updateSalesOrder: (orderId: string, updates: Partial<SalesOrder>) => void;
  approveSalesOrder: (orderId: string, updatedOrderData?: Partial<SalesOrder>) => void;
  acceptDeliveryOrder: (
    orderId: string,
    acceptanceDetails?: { acceptedBy?: string; notes?: string; acceptanceNotes?: string }
  ) => void;
  generateChallanWithSerials: (
    orderId: string,
    updatedItems: SalesOrderItem[],
    details?: { updatedBy?: string; verifierName?: string; challanNumber?: string }
  ) => string;
  dispatchAndInvoiceSalesOrder: (orderId: string) => void;
  confirmCustomerReceipt: (
    orderId: string,
    details: {
      receiverName: string;
      receiverPhone: string;
      receivedDate: string;
      receiverDesignation?: string;
      handoverNotes: string;
      deliveryStatus: 'Full' | 'Partial';
      signatureConfirmed: boolean;
      salespersonName: string;
    }
  ) => void;
  recordOrderPayment: (orderId: string, paidAmount: number, accountType: CashBookEntry['accountType'], reference: string) => void;

  // Requisitions & Factory Indent
  requisitions: Requisition[];
  addRequisition: (req: Omit<Requisition, 'id' | 'requisitionNo' | 'createdAt'>) => string;
  updateRequisition: (reqId: string, updates: Partial<Requisition>) => void;
  deleteRequisition: (reqId: string) => void;
  approveRequisitionByFactory: (reqId: string, factoryNotes?: string, adjustedItems?: RequisitionItem[]) => void;
  rejectRequisitionByFactory: (reqId: string, reason?: string) => void;
  issueRequisitionByAccounts: (reqId: string, challanNo?: string, issueNotes?: string) => void;
  markRequisitionReceived: (reqId: string, receivedNotes?: string) => void;

  // Payments Collection Master
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id' | 'tranNo' | 'creationDate' | 'createdAt' | 'approvedAmount' | 'status'>) => string;
  updatePayment: (paymentId: string, updates: Partial<Payment>) => void;
  approvePayment: (paymentId: string, approvedAmount?: number, approvedNotes?: string) => void;
  rejectPayment: (paymentId: string, reason?: string) => void;
  deletePayment: (paymentId: string) => void;
  clearPaymentsCache: () => void;

  // TADA Management
  tadaList: TADAEntry[];
  addTADA: (entry: Omit<TADAEntry, 'id' | 'createdAt' | 'lastModified'>) => string;
  updateTADA: (id: string, updates: Partial<TADAEntry>) => void;
  approveTADA: (id: string, approverName?: string) => void;
  batchApproveTADA: (ids: string[], approverName?: string) => void;
  rejectTADA: (id: string, reason?: string) => void;
  deleteTADA: (id: string) => void;
  updateFieldForceTADAApprover: (repId: string, approverId: string, approverName: string) => void;

  // Finance & Cash Book
  cashBook: CashBookEntry[];
  addCashBookEntry: (entry: Omit<CashBookEntry, 'id' | 'runningBalanceBDT'>) => void;

  // Payroll & Central Employee Management Engine
  payrollRecords: PayrollRecord[];
  generateMonthlyPayroll: (monthYear: string) => void;
  disbursePayroll: (payrollId: string) => void;

  salaryStructures: EmployeeSalaryStructure[];
  addSalaryStructure: (structure: any) => string;
  updateSalaryStructure: (id: string, updates: Partial<EmployeeSalaryStructure>, reason?: string) => void;
  getEmployeeSalaryStructure: (fieldForceId: string) => EmployeeSalaryStructure | undefined;

  attendanceRecords: AttendanceRecord[];
  markAttendance: (record: any) => string;
  bulkMarkAttendance: (records: any, extra?: any) => void;
  getEmployeeAttendanceSummary: (fieldForceId: string, monthYear: string) => any;

  leaveRecords: LeaveRecord[];
  applyLeave: (leave: any) => string;
  approveLeave: (leaveId: string, approverName?: string) => void;
  rejectLeave: (leaveId: string, reason: string) => void;
  getEmployeeLeaveBalance: (fieldForceId: string, year?: number) => any;

  advanceLoans: AdvanceLoanRecord[];
  applyAdvanceLoan: (loanData: any) => string;
  approveAdvanceLoan: (loanId: string, approverName?: string) => void;
  recordLoanInstallmentDeduction: (loanId: string, installmentNumberOrMonth: any, payrollRunIdOrAmount?: any) => void;
  earlySettleAdvanceLoan: (loanId: string, paymentMethodOrAmount?: any, notes?: string) => void;

  overtimeRecords: OvertimeRecord[];
  addOvertimeRecord: (ot: any) => string;
  approveOvertimeRecord: (otId: string, approverName?: string) => void;
  rejectOvertimeRecord: (otId: string, reason?: string) => void;

  bonusRecords: BonusRecord[];
  addBonusRecord: (bonus: any) => string;
  approveBonusRecord: (bonusId: string, approverName?: string) => void;

  monthlyPayrollRuns: MonthlyPayrollRun[];
  generateMonthlySalaryRun: (monthYear: string, departmentFilter?: string, categoryFilter?: any) => any;
  finalizeMonthlyPayrollRun: (runId: string, finalizedBy?: string) => void;
  deleteMonthlyPayrollRun: (runId: string) => void;

  salaryPaymentRecords: SalaryPaymentRecord[];
  recordSalaryPayment: (arg1: any, arg2?: any, arg3?: any) => void;

  payrollSettings: PayrollSettings;
  updatePayrollSettings: (settings: Partial<PayrollSettings>) => void;

  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (action: string, module: string, details: string) => void;

  // Architecture Modal
  showArchitectureModal: boolean;
  setShowArchitectureModal: (show: boolean) => void;

  // Warranty & Battery Service Module
  warrantyTickets: WarrantyTicket[];
  addWarrantyTicket: (ticket: Omit<WarrantyTicket, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateWarrantyTicket: (ticketId: string, updates: Partial<WarrantyTicket>) => void;
  deleteWarrantyTicket: (ticketId: string) => void;

  batteryReceivings: BatteryReceivingRecord[];
  addBatteryReceiving: (record: Omit<BatteryReceivingRecord, 'id'>) => string;

  technicalInspections: TechnicalInspection[];
  addTechnicalInspection: (record: Omit<TechnicalInspection, 'id'>) => string;
  updateTechnicalInspection: (id: string, updates: Partial<TechnicalInspection>) => void;

  serviceJobCards: ServiceJobCard[];
  addServiceJobCard: (jobCard: Omit<ServiceJobCard, 'id' | 'creationDate'>) => string;
  updateServiceJobCard: (jobCardId: string, updates: Partial<ServiceJobCard>) => void;

  sparePartsConsumptions: SparePartReplacement[];
  addSparePartsConsumption: (part: Omit<SparePartReplacement, 'id'>) => string;

  serviceEstimations: RepairEstimation[];
  addServiceEstimation: (est: Omit<RepairEstimation, 'id'>) => string;
  updateServiceEstimation: (id: string, updates: Partial<RepairEstimation>) => void;

  serviceInvoices: ServiceInvoice[];
  addServiceInvoice: (inv: Omit<ServiceInvoice, 'id'>) => string;
  updateServiceInvoice: (id: string, updates: Partial<ServiceInvoice>) => void;

  servicePayments: ServicePayment[];
  addServicePayment: (payment: Omit<ServicePayment, 'id'>) => string;

  qualityControlRecords: QualityControlRecord[];
  addQualityControlRecord: (qc: Omit<QualityControlRecord, 'id'>) => string;

  batteryDispatches: BatteryDeliveryDispatch[];
  addBatteryDispatch: (dsp: Omit<BatteryDeliveryDispatch, 'id'>) => string;

  warrantyPolicies: WarrantyPolicy[];
  addWarrantyPolicy: (policy: Omit<WarrantyPolicy, 'id'>) => string;
  updateWarrantyPolicy: (id: string, updates: Partial<WarrantyPolicy>) => void;

  serviceSettings: ServiceSettings;
  updateServiceSettings: (settings: Partial<ServiceSettings>) => void;

  // --- INSTALLMENT & RECEIVABLES MANAGEMENT ---
  installmentPlans: InstallmentPlan[];
  installmentSchedules: InstallmentSchedule[];
  installmentPayments: InstallmentPayment[];
  collectionAssignments: CollectionAssignment[];
  collectionFollowUps: CollectionFollowUp[];
  collectionEscalationRules: CollectionEscalationRule[];
  smsTemplates: SMSTemplate[];
  smsAutomationRules: SMSAutomationRule[];
  smsLogs: SMSLog[];
  smsGatewaySettings: SMSGatewaySettings;
  installmentNotifications: InstallmentNotification[];
  createInstallmentPlan: (
    plan: Omit<InstallmentPlan, 'id' | 'createdAt' | 'updatedAt'>,
    customSchedules?: InstallmentSchedule[]
  ) => Promise<{ success: boolean; id: string; error?: string }>;
  recordInstallmentPayment: (
    payment: Omit<InstallmentPayment, 'id' | 'createdAt' | 'allocations' | 'paymentReceiptNo'> & { paymentReceiptNo?: string }
  ) => Promise<{ success: boolean; id: string; error?: string; receiptNo: string }>;
  recordEarlySettlement: (
    planId: string,
    settlementData: {
      rebatePercent: number;
      paymentMethod: any;
      bankAccountId?: string;
      bankAccountName?: string;
      transactionRef: string;
      notes?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  addCollectionFollowUp: (
    followUp: Omit<CollectionFollowUp, 'id' | 'createdAt'>
  ) => Promise<{ success: boolean; id: string }>;
  updateCollectionAssignment: (assignmentId: string, updates: Partial<CollectionAssignment>) => void;
  createCollectionAssignment: (assignment: Omit<CollectionAssignment, 'id'>) => string;
  updateSMSTemplate: (templateId: string, updates: Partial<SMSTemplate>) => void;
  toggleSMSAutomationRule: (ruleId: string) => void;
  updateSMSGatewaySettings: (settings: Partial<SMSGatewaySettings>) => void;
  testSMSGateway: (phone: string, message: string) => Promise<{ success: boolean; message: string }>;
  runAutomationCheckNow: () => Promise<AutomationExecutionReport>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteInstallmentPlan?: (planId: string) => void;
  clearInstallmentData: () => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ensec_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('ensec_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      document.body?.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      document.body?.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('ensec_theme', next);
      const root = document.documentElement;
      if (next === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        document.body?.classList.add('dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        document.body?.classList.remove('dark');
      }
      return next;
    });
  };

  const DEFAULT_ROOT_ADMIN: User = {
    id: 'u-admin-root',
    userId: 'ADMIN',
    password: 'ensec2026',
    name: 'Super Admin',
    email: 'admin@ensecbd.com',
    role: 'Super Admin',
    designation: 'Managing Director / System Administrator',
    department: 'Management',
    status: 'Active',
    permissions: getDefaultPermissionsForRole('Super Admin'),
  };

  // User & Authentication state (Purges mock sample users and local session memory data)
  const [users, setUsers] = useState<User[]>(() => {
    const SAMPLE_USER_IDS = new Set(['u-1', 'u-2', 'u-3', 'u-4', 'u-5', 'u-6', 'u-7', 'u-8', 'u-raju']);
    const SAMPLE_EMP_IDS = new Set(['EMP-001', 'EMP-002', 'EMP-003', 'EMP-004', 'EMP-005', 'EMP-006', 'EMP-007', 'EMP-008', 'EMP-010']);
    const SAMPLE_MOCK_EMAILS = new Set([
      'sohidul@ensecbd.com',
      'tanvir.sales@ensecbd.com',
      'mustafiz.kushtia@ensecbd.com',
      'kamrul.accounts@ensecbd.com',
      'rafiqul.dhaka1@ensecbd.com',
      'zubair.field@ensecbd.com',
      'shakil.ctg@ensecbd.com',
      'asif.kushtia@ensecbd.com',
      'raju.hos@ensecbd.com',
    ]);

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ensec_erp_users');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Filter out any mock sample users from local session storage
            const realUsers = parsed.filter(
              (u) =>
                u &&
                u.id &&
                !SAMPLE_USER_IDS.has(u.id) &&
                !SAMPLE_EMP_IDS.has(u.userId) &&
                !SAMPLE_MOCK_EMAILS.has(u.email?.toLowerCase())
            );
            if (realUsers.length > 0) {
              return realUsers;
            }
          }
        } catch {
          // fallback
        }
      }
    }
    return [DEFAULT_ROOT_ADMIN];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_erp_users', JSON.stringify(users));
    }
  }, [users]);

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUid = typeof window !== 'undefined' ? localStorage.getItem('ensec_erp_uid') : null;
    const found = savedUid ? users.find((u) => u.id === savedUid) : null;
    return found || users[0] || DEFAULT_ROOT_ADMIN;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const isAuth = localStorage.getItem('ensec_erp_auth') === 'true';
      const savedUid = localStorage.getItem('ensec_erp_uid');
      if (isAuth && savedUid) {
        const found = users.some((u) => u.id === savedUid) || savedUid === DEFAULT_ROOT_ADMIN.id;
        if (found) return true;
        localStorage.removeItem('ensec_erp_auth');
        localStorage.removeItem('ensec_erp_uid');
      }
    }
    return false;
  });

  // Verify active user session validity when users collection changes
  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined') {
      const savedUid = localStorage.getItem('ensec_erp_uid');
      const valid = users.some((u) => u.id === savedUid) || savedUid === DEFAULT_ROOT_ADMIN.id;
      if (!valid) {
        setIsAuthenticated(false);
        localStorage.removeItem('ensec_erp_auth');
        localStorage.removeItem('ensec_erp_uid');
      }
    }
  }, [users, isAuthenticated]);

  const login = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_erp_auth', 'true');
      localStorage.setItem('ensec_erp_uid', user.id);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ensec_erp_auth');
      localStorage.removeItem('ensec_erp_uid');
    }
  };

  const [orgHierarchy, setOrgHierarchy] = useState<OrgNode>(() => {
    if (typeof window !== 'undefined' && checkSupabaseConfigured()) {
      return { id: '', name: '', type: 'Company', code: '', children: [] };
    }
    return INITIAL_ORG_HIERARCHY;
  });

  // Architecture Blueprint viewer
  const [showArchitectureModal, setShowArchitectureModal] = useState<boolean>(false);

  // Data States
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('ensec_raw_materials');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            // Filter out old sample test raw materials and deduplicate by id
            const seen = new Set<string>();
            const cleaned: RawMaterial[] = [];
            for (const rm of parsed) {
              if (
                rm &&
                rm.id &&
                !rm.id.startsWith('rm-') &&
                !['RM-CELL-001', 'RM-CELL-002', 'RM-BMS-001', 'RM-CASE-001', 'RM-BUSBAR-001', 'RM-CABLE-001', 'RM-CELL-105', 'RM-CELL-280', 'RM-BMS-48V', 'RM-BMS-12V'].includes(rm.code)
              ) {
                const sId = String(rm.id);
                if (!seen.has(sId)) {
                  seen.add(sId);
                  cleaned.push(rm);
                }
              }
            }
            if (cleaned.length !== parsed.length) {
              localStorage.setItem('ensec_raw_materials', JSON.stringify(cleaned));
            }
            return cleaned;
          }
        } catch {}
      }
      if (checkSupabaseConfigured()) {
        return [];
      }
    }
    return INITIAL_RAW_MATERIALS;
  });
  const [rawMaterialCategories, setRawMaterialCategories] = useState<RawMaterialCategory[]>(() => {
    if (typeof window !== 'undefined' && checkSupabaseConfigured()) {
      return [];
    }
    return INITIAL_RAW_MATERIAL_CATEGORIES;
  });
  const [rawMaterialClassifications, setRawMaterialClassifications] = useState<RawMaterialClassification[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ensec_rm_classifications');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            // Filter out old sample mock data
            const cleaned = parsed.filter(
              (c) =>
                c.id &&
                !c.id.startsWith('rmc-cls-') &&
                !['CLS-CELL', 'CLS-ELEC', 'CLS-MECH', 'CLS-WIRE', 'CLS-THRM', 'CLS-FAST', 'CLS-PACK'].includes(c.code)
            );
            if (cleaned.length !== parsed.length) {
              localStorage.setItem('ensec_rm_classifications', JSON.stringify(cleaned));
            }
            return cleaned;
          }
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_RAW_MATERIAL_CLASSIFICATIONS;
  });
  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    if (typeof window !== 'undefined' && checkSupabaseConfigured()) {
      try {
        const cached = localStorage.getItem('ensec_product_categories');
        if (cached !== null) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
      return [];
    }
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('ensec_product_categories');
        if (cached !== null) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return INITIAL_CATEGORIES;
  });
  const [brands, setBrands] = useState<ProductBrand[]>(() => {
    if (typeof window !== 'undefined' && checkSupabaseConfigured()) {
      return [];
    }
    return INITIAL_BRANDS;
  });
  const [departments, setDepartments] = useState<Department[]>(() => {
    if (typeof window !== 'undefined' && checkSupabaseConfigured()) {
      return [];
    }
    return INITIAL_DEPARTMENTS;
  });
  const [banks, setBanks] = useState<Bank[]>(() => {
    if (typeof window !== 'undefined' && checkSupabaseConfigured()) {
      return [];
    }
    return INITIAL_BANKS;
  });
  const [uoms, setUoms] = useState<UnitOfMeasurement[]>(() => {
    if (typeof window !== 'undefined' && checkSupabaseConfigured()) {
      return [];
    }
    return INITIAL_UOMS;
  });
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('ensec_products');
        if (cached !== null) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            const nonMock = parsed.filter(
              (p: any) =>
                p &&
                p.id !== '17' &&
                p.id !== 17 &&
                p.id !== '21' &&
                p.id !== 21 &&
                p.code !== 'ENS-PROD-001' &&
                p.code !== 'ENS-PROD-002' &&
                !String(p.name || '').includes('EN64V142AH') &&
                !String(p.name || '').includes('60v 170 with 86A cell')
            );
            return nonMock;
          }
        }
      } catch (e) {}
    }
    return [];
  });
  // One-time purge of legacy mock data & local session memory for Raw Material Inventory, Import Consignments & SCM, Factory & BOM, Manufacturing Costing & P&L
  if (typeof window !== 'undefined') {
    const PURGE_FLAG_KEY = 'ensec_purged_mock_factory_scm_v7';
    if (!localStorage.getItem(PURGE_FLAG_KEY)) {
      const keysToPurge = [
        'ensec_products',
        'ensec_inventory_batches',
        'ensec_inventory_movements',
        'ensec_raw_material_receipts',
        'ensec_material_issues',
        'ensec_import_orders',
        'ensec_production_orders',
        'ensec_production_consumptions',
        'ensec_expense_entries',
        'ensec_cost_allocations',
        'ensec_boms',
        'ensec_production_costs',
        'ensec_fg_receipts',
        'ensec_optimum_statement',
      ];
      keysToPurge.forEach((key) => {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        } catch {}
      });
      localStorage.setItem(PURGE_FLAG_KEY, 'true');
    }
  }

  const [importOrders, setImportOrders] = useState<ImportPurchaseOrder[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('ensec_import_orders');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(
              (o) => o && o.id && !o.id.startsWith('imp-00') && o.poNumber !== 'IMP-2026-0901' && o.poNumber !== 'IMP-2026-0914'
            );
            return cleaned;
          }
        }
      } catch {}
    }
    return INITIAL_IMPORT_ORDERS;
  });

  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('ensec_production_orders');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const valid = parsed.filter(
              (po) => po && (po.id || po.orderNumber)
            );
            if (valid.length > 0) return valid;
          }
        }
      } catch {}
    }
    return INITIAL_PRODUCTION_ORDERS;
  });

  // Ensec v29 Upgraded Modules States
  const [inventoryBatches, setInventoryBatches] = useState<InventoryBatch[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('ensec_inventory_batches');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const valid = parsed.filter((b) => b && (b.id || b.batchNumber));
            if (valid.length > 0) return valid;
          }
        }
      } catch {}
    }
    return INITIAL_INVENTORY_BATCHES;
  });

  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('ensec_inventory_movements');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            // Clean out legacy sample mock movements
            const cleaned = parsed.filter(
              (m) =>
                m &&
                m.id &&
                !m.id.startsWith('mov-00') &&
                !m.batchNumber?.startsWith('RM-BATCH-2026') &&
                !m.batchNumber?.startsWith('B-KUS-2609')
            );
            if (cleaned.length !== parsed.length) {
              localStorage.setItem('ensec_inventory_movements', JSON.stringify(cleaned));
            }
            return cleaned;
          }
        }
      } catch {}
    }
    return INITIAL_INVENTORY_MOVEMENTS;
  });

  const [rawMaterialReceipts, setRawMaterialReceipts] = useState<RawMaterialReceipt[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('ensec_raw_material_receipts');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            // Clean out legacy sample mock receipts
            const cleaned = parsed.filter(
              (r) =>
                r &&
                r.id &&
                !r.id.startsWith('grn-00') &&
                !r.grnNumber?.startsWith('GRN-2026-0004') &&
                !r.grnNumber?.startsWith('GRN-2026-0012')
            );
            if (cleaned.length !== parsed.length) {
              localStorage.setItem('ensec_raw_material_receipts', JSON.stringify(cleaned));
            }
            return cleaned;
          }
        }
      } catch {}
    }
    return INITIAL_RAW_MATERIAL_RECEIPTS;
  });

  const [materialIssues, setMaterialIssues] = useState<MaterialIssue[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('ensec_material_issues');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return [];
  });

  const [productionConsumptions, setProductionConsumptions] = useState<ProductionConsumption[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('ensec_production_consumptions');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(
              (c) => c && c.id && !c.id.startsWith('pcns-') && c.productionOrderNumber !== 'PR-KUS-2026-104'
            );
            return cleaned;
          }
        }
      } catch {}
    }
    return INITIAL_PRODUCTION_CONSUMPTIONS;
  });

  const [expenseEntries, setExpenseEntries] = useState<ExpenseEntry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('ensec_expense_entries');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(
              (e) =>
                e &&
                e.id &&
                !e.id.startsWith('exp-fac-') &&
                !e.id.startsWith('exp-gen-') &&
                !e.id.startsWith('exp-mkt-') &&
                !e.voucherNumber?.startsWith('EXP-FAC-2026-') &&
                !e.voucherNumber?.startsWith('EXP-HO-2026-') &&
                !e.voucherNumber?.startsWith('EXP-MKT-2026-')
            );
            return cleaned;
          }
        }
      } catch {}
    }
    return INITIAL_EXPENSE_ENTRIES;
  });

  const [costAllocations, setCostAllocations] = useState<CostAllocationRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('ensec_cost_allocations');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(
              (c) =>
                c &&
                c.id &&
                !c.id.startsWith('alloc-') &&
                !c.expenseVoucherNo?.startsWith('EXP-FAC-2026-')
            );
            return cleaned;
          }
        }
      } catch {}
    }
    return INITIAL_COST_ALLOCATIONS;
  });

  const [boms, setBoms] = useState<BOMDefinition[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('ensec_boms');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(
              (b) =>
                b &&
                b.id &&
                b.id !== 'bom-001' &&
                !b.productName?.includes('EN64V142AH (51.2V 86Ah')
            );
            return cleaned;
          }
        }
      } catch {}
    }
    return INITIAL_BOMS;
  });

  const [productionCosts, setProductionCosts] = useState<ProductionCostRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('ensec_production_costs');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(
              (p) =>
                p &&
                p.id &&
                !p.id.startsWith('pc-00') &&
                p.orderNumber !== 'PR-KUS-2026-101' &&
                p.orderNumber !== 'PR-KUS-2026-104' &&
                p.orderNumber !== 'PR-KUS-2026-088' &&
                p.orderNumber !== 'PR-KUS-2026-094'
            );
            if (cleaned.length !== parsed.length) {
              localStorage.setItem('ensec_production_costs', JSON.stringify(cleaned));
            }
            return cleaned;
          }
        }
      } catch {}
    }
    return INITIAL_PRODUCTION_COSTS;
  });

  const [finishedGoodsProductionReceipts, setFinishedGoodsProductionReceipts] = useState<FinishedGoodsProductionReceipt[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('ensec_fg_receipts');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return [];
  });

  // LocalStorage Persistence Effects
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_inventory_batches', JSON.stringify(inventoryBatches));
    }
  }, [inventoryBatches]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_inventory_movements', JSON.stringify(inventoryMovements));
    }
  }, [inventoryMovements]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_raw_material_receipts', JSON.stringify(rawMaterialReceipts));
    }
  }, [rawMaterialReceipts]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_material_issues', JSON.stringify(materialIssues));
    }
  }, [materialIssues]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_boms', JSON.stringify(boms));
    }
  }, [boms]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_production_costs', JSON.stringify(productionCosts));
    }
  }, [productionCosts]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_fg_receipts', JSON.stringify(finishedGoodsProductionReceipts));
    }
  }, [finishedGoodsProductionReceipts]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_production_consumptions', JSON.stringify(productionConsumptions));
    }
  }, [productionConsumptions]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_expense_entries', JSON.stringify(expenseEntries));
    }
  }, [expenseEntries]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_cost_allocations', JSON.stringify(costAllocations));
    }
  }, [costAllocations]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_import_orders', JSON.stringify(importOrders));
    }
  }, [importOrders]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_production_orders', JSON.stringify(productionOrders));
    }
  }, [productionOrders]);

  const [optimumStatement, setOptimumStatement] = useState<OptimumStatementEntry[]>(INITIAL_OPTIMUM_STATEMENT);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(INITIAL_WAREHOUSES);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('ensec_stock_transfers');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_STOCK_TRANSFERS;
  });
  const [stockLedger, setStockLedger] = useState<StockLedgerEntry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('ensec_stock_ledger');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_STOCK_LEDGER;
  });
  const [cidStockReceipts, setCIDStockReceipts] = useState<CIDStockReceipt[]>(INITIAL_CID_STOCK_RECEIPTS);
  const [openingStockRecords, setOpeningStockRecords] = useState<OpeningStockRecord[]>(INITIAL_OPENING_STOCK);
  const [stockIssueRecords, setStockIssueRecords] = useState<StockIssueRecord[]>(INITIAL_STOCK_ISSUES);
  const [primaryReturnRecords, setPrimaryReturnRecords] = useState<PrimaryReturnRecord[]>(INITIAL_PRIMARY_RETURNS);
  const [stockAdjustmentRecords, setStockAdjustmentRecords] = useState<StockAdjustmentRecord[]>(INITIAL_STOCK_ADJUSTMENTS);
  const [distributors, setDistributors] = useState<Distributor[]>(INITIAL_DISTRIBUTORS);
  const [customers, setCustomers] = useState<Customer[]>(() => {
    if (typeof window !== 'undefined' && checkSupabaseConfigured()) {
      return [];
    }
    return INITIAL_CUSTOMERS;
  });
  const [customerCategories, setCustomerCategories] = useState<CustomerCategory[]>(() => {
    if (typeof window !== 'undefined' && checkSupabaseConfigured()) {
      return [];
    }
    return INITIAL_CUSTOMER_CATEGORIES;
  });
  const [crmAgreements, setCrmAgreements] = useState<CRMLeadAgreement[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ensec_crm_agreements') || sessionStorage.getItem('ensec_crm_agreements');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            // Remove any legacy sample or mock records
            const nonSample = parsed.filter(
              (item: any) =>
                item.id !== 'crm-01' &&
                item.id !== 'crm-02' &&
                item.id !== 'crm-03' &&
                !String(item.clientName || '').includes('Grameenphone') &&
                !String(item.clientName || '').includes('Summit Towers') &&
                !String(item.clientName || '').includes('Apex Battery')
            );
            if (nonSample.length !== parsed.length) {
              if (nonSample.length > 0) {
                localStorage.setItem('ensec_crm_agreements', JSON.stringify(nonSample));
              } else {
                localStorage.removeItem('ensec_crm_agreements');
                sessionStorage.removeItem('ensec_crm_agreements');
              }
            }
            return nonSample;
          }
        }
      } catch (e) {
        console.warn('Notice parsing stored CRM agreements:', e);
      }
    }
    return [];
  });
  const [fieldForceReps, setFieldForceReps] = useState<FieldForceRep[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ensec_field_force_reps');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return INITIAL_CENTRAL_EMPLOYEES;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ensec_field_force_reps', JSON.stringify(fieldForceReps));
      } catch (e) {}
    }
  }, [fieldForceReps]);
  const [visitLogs, setVisitLogs] = useState<VisitLog[]>(INITIAL_VISIT_LOGS);
  const [offers, setOffers] = useState<OfferPromotion[]>(() => {
    if (typeof window !== 'undefined' && checkSupabaseConfigured()) {
      return [];
    }
    return INITIAL_OFFERS;
  });
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ensec_sales_orders') || sessionStorage.getItem('ensec_sales_orders');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            // Filter out any legacy dummy sample orders
            return parsed
              .filter(
                (o: SalesOrder) =>
                  !o.id?.startsWith('so-2026-09-') &&
                  !o.id?.startsWith('so-2026-10-') &&
                  !o.id?.startsWith('so-hist-')
              )
              .map((o: SalesOrder) => {
                if (o.status === 'Submitted') {
                  return {
                    ...o,
                    doNumber: undefined,
                    challanNumber: undefined,
                    doAccepted: false,
                    serialsUpdated: false,
                  };
                }
                return o;
              });
          }
        }
      } catch (e) {
        console.warn('Failed to parse stored sales orders', e);
      }
    }
    return INITIAL_SALES_ORDERS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (salesOrders.length > 0) {
          localStorage.setItem('ensec_sales_orders', JSON.stringify(salesOrders));
        } else {
          localStorage.removeItem('ensec_sales_orders');
          sessionStorage.removeItem('ensec_sales_orders');
        }
      } catch (e) {}
    }
  }, [salesOrders]);

  const clearSalesOrders = () => {
    setSalesOrders([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('ensec_sales_orders');
        sessionStorage.removeItem('ensec_sales_orders');
      } catch (e) {}
    }
    const sb = getSupabase();
    if (sb) {
      sb.from('sales_orders').delete().gte('id', 0).then();
    }
    addAuditLog('SALES_ORDERS_CLEARED', 'Sales Orders', 'Cleared sales orders and session memory.');
  };
  const [requisitions, setRequisitions] = useState<Requisition[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('ensec_requisitions_sample');
        sessionStorage.removeItem('ensec_requisitions');
        const stored = localStorage.getItem('ensec_requisitions');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const nonSample = parsed.filter(
              (r: Requisition) =>
                !r.id?.startsWith('req-0') &&
                !r.id?.startsWith('req-1') &&
                !r.id?.startsWith('req-2') &&
                !r.requisitionNo?.startsWith('REQ-DB') &&
                !r.requisitionNo?.startsWith('REQ-2026-0012')
            );
            return nonSample;
          }
        }
      } catch (e) {}
    }
    return INITIAL_REQUISITIONS;
  });
  const [payments, setPayments] = useState<Payment[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        // Clear any old sample payment keys
        localStorage.removeItem('ensec_payments_sample');
        sessionStorage.removeItem('ensec_payments_sample');
        sessionStorage.removeItem('ensec_payments');

        const stored = localStorage.getItem('ensec_payments');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            // Remove any legacy sample or mock records
            const nonSample = parsed.filter(
              (p: Payment) =>
                !p.id?.startsWith('pay-0') &&
                !p.id?.startsWith('pay-1') &&
                !p.tranNo?.startsWith('TRN-17917') &&
                !['Al Hera Telecom (Uttara)', 'Tazul Store (Mithachara Bazer)', 'Bismillah Enterprise (Bhulta, Narayanganj)', 'Makka Enterprise(Shorisabari)', 'M/S Hosain Traders (Gaibandha)', 'Pinky Distribution (Mymensingh)', 'M R Enterprise (Mohonpur)', 'Madina Enterprise (Nabinagar)', 'Mayer Dhuya Distribution (Trishal)', 'Madina Traders (Freeport)', 'Hanif Traders (Comilla)', 'My Stics(Moulobi Bazar, Dhaka)'].includes(p.outAccountName)
            );
            if (nonSample.length !== parsed.length) {
              if (nonSample.length > 0) {
                localStorage.setItem('ensec_payments', JSON.stringify(nonSample));
              } else {
                localStorage.removeItem('ensec_payments');
                sessionStorage.removeItem('ensec_payments');
              }
            }
            return nonSample;
          }
        }
      } catch (e) {
        console.warn('Notice parsing stored payments:', e);
      }
    }
    return INITIAL_PAYMENTS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (payments.length > 0) {
          localStorage.setItem('ensec_payments', JSON.stringify(payments));
        } else {
          localStorage.removeItem('ensec_payments');
          sessionStorage.removeItem('ensec_payments');
        }
      } catch (e) {}
    }
  }, [payments]);
  const [tadaList, setTadaList] = useState<TADAEntry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ensec_tada_list');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.filter(
              (item: TADAEntry) =>
                !item.id?.startsWith('tada-0') &&
                item.id !== 'tada-10' &&
                item.ffCode !== 'MEL00445'
            );
          }
        }
      } catch (e) {
        console.warn('Error reading tada list:', e);
      }
    }
    return INITIAL_TADA_LIST;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (tadaList.length > 0) {
          localStorage.setItem('ensec_tada_list', JSON.stringify(tadaList));
        } else {
          localStorage.removeItem('ensec_tada_list');
          sessionStorage.removeItem('ensec_tada_list');
        }
      } catch (e) {}
    }
  }, [tadaList]);

  const [cashBook, setCashBook] = useState<CashBookEntry[]>(INITIAL_CASH_BOOK);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(INITIAL_PAYROLL);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Comprehensive Central Employee & Payroll State
  const [salaryStructures, setSalaryStructures] = useState<EmployeeSalaryStructure[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ensec_salary_structures');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_SALARY_STRUCTURES;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ensec_attendance_records');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ensec_leave_records');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_LEAVE_RECORDS;
  });

  const [advanceLoans, setAdvanceLoans] = useState<AdvanceLoanRecord[]>(() => {
    const normalizeLoan = (loan: any): AdvanceLoanRecord => {
      const principal = loan.principalAmountBDT ?? loan.approvedAmountBDT ?? loan.requestedAmountBDT ?? 0;
      const monthly = loan.monthlyDeductionBDT ?? loan.monthlyInstallmentBDT ?? 0;
      const repaid = loan.repaidAmountBDT ?? loan.totalPaidBDT ?? 0;
      const remaining = loan.remainingAmountBDT ?? loan.remainingBalanceBDT ?? Math.max(0, principal - repaid);
      const tenure = loan.repaymentTenureMonths ?? loan.installmentDurationMonths ?? (loan.schedule?.length || 1);
      const loanType = loan.loanType ?? loan.type ?? 'Salary Advance';
      return {
        ...loan,
        principalAmountBDT: principal,
        approvedAmountBDT: loan.approvedAmountBDT ?? principal,
        requestedAmountBDT: loan.requestedAmountBDT ?? principal,
        monthlyDeductionBDT: monthly,
        monthlyInstallmentBDT: loan.monthlyInstallmentBDT ?? monthly,
        repaidAmountBDT: repaid,
        totalPaidBDT: loan.totalPaidBDT ?? repaid,
        remainingAmountBDT: remaining,
        remainingBalanceBDT: loan.remainingBalanceBDT ?? remaining,
        repaymentTenureMonths: tenure,
        installmentDurationMonths: loan.installmentDurationMonths ?? tenure,
        loanType,
        type: loan.type ?? loanType,
        schedule: (loan.schedule || []).map((s: any) => ({
          ...s,
          amountBDT: s.amountBDT ?? s.installmentAmountBDT ?? 0,
          installmentAmountBDT: s.installmentAmountBDT ?? s.amountBDT ?? 0,
          paidDate: s.paidDate ?? s.deductionDate,
          deductionDate: s.deductionDate ?? s.paidDate,
        })),
      };
    };

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ensec_advance_loans');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(normalizeLoan);
        }
      } catch (e) {}
    }
    return INITIAL_ADVANCE_LOANS.map(normalizeLoan);
  });

  const [overtimeRecords, setOvertimeRecords] = useState<OvertimeRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ensec_overtime_records');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_OVERTIME_RECORDS;
  });

  const [bonusRecords, setBonusRecords] = useState<BonusRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ensec_bonus_records');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_BONUS_RECORDS;
  });

  const [monthlyPayrollRuns, setMonthlyPayrollRuns] = useState<MonthlyPayrollRun[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ensec_monthly_payroll_runs');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_MONTHLY_PAYROLL_RUNS;
  });

  const [salaryPaymentRecords, setSalaryPaymentRecords] = useState<SalaryPaymentRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ensec_salary_payment_records');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  const [payrollSettings, setPayrollSettings] = useState<PayrollSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ensec_payroll_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            return {
              ...DEFAULT_PAYROLL_SETTINGS,
              ...parsed,
              leaveQuotas: {
                annualLeave: parsed.leaveQuotas?.annualLeave ?? DEFAULT_PAYROLL_SETTINGS.leaveQuotas?.annualLeave ?? 14,
                casualLeave: parsed.leaveQuotas?.casualLeave ?? DEFAULT_PAYROLL_SETTINGS.leaveQuotas?.casualLeave ?? 10,
                sickLeave: parsed.leaveQuotas?.sickLeave ?? DEFAULT_PAYROLL_SETTINGS.leaveQuotas?.sickLeave ?? 14,
                maternityLeave: parsed.leaveQuotas?.maternityLeave ?? DEFAULT_PAYROLL_SETTINGS.leaveQuotas?.maternityLeave ?? 112,
              },
              overtimeConfig: {
                hourlyRateMultiplier: parsed.overtimeConfig?.hourlyRateMultiplier ?? DEFAULT_PAYROLL_SETTINGS.overtimeConfig?.hourlyRateMultiplier ?? 1.5,
              },
              deductionRules: {
                ...DEFAULT_PAYROLL_SETTINGS.deductionRules,
                ...(parsed.deductionRules || {}),
              },
              salaryComponents: {
                ...DEFAULT_PAYROLL_SETTINGS.salaryComponents,
                ...(parsed.salaryComponents || {}),
              },
            };
          }
        }
      } catch (e) {}
    }
    return DEFAULT_PAYROLL_SETTINGS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_salary_structures', JSON.stringify(salaryStructures));
    }
  }, [salaryStructures]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_attendance_records', JSON.stringify(attendanceRecords));
    }
  }, [attendanceRecords]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_leave_records', JSON.stringify(leaveRecords));
    }
  }, [leaveRecords]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_advance_loans', JSON.stringify(advanceLoans));
    }
  }, [advanceLoans]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_overtime_records', JSON.stringify(overtimeRecords));
    }
  }, [overtimeRecords]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_bonus_records', JSON.stringify(bonusRecords));
    }
  }, [bonusRecords]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_monthly_payroll_runs', JSON.stringify(monthlyPayrollRuns));
    }
  }, [monthlyPayrollRuns]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_salary_payment_records', JSON.stringify(salaryPaymentRecords));
    }
  }, [salaryPaymentRecords]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_payroll_settings', JSON.stringify(payrollSettings));
    }
  }, [payrollSettings]);

  // Warranty & Battery Service Module States
  const [warrantyTickets, setWarrantyTickets] = useState<WarrantyTicket[]>(INITIAL_WARRANTY_TICKETS);
  const [batteryReceivings, setBatteryReceivings] = useState<BatteryReceivingRecord[]>(INITIAL_BATTERY_RECEIVINGS);
  const [technicalInspections, setTechnicalInspections] = useState<TechnicalInspection[]>(INITIAL_TECHNICAL_INSPECTIONS);
  const [serviceJobCards, setServiceJobCards] = useState<ServiceJobCard[]>(INITIAL_SERVICE_JOB_CARDS);
  const [sparePartsConsumptions, setSparePartsConsumptions] = useState<SparePartReplacement[]>(INITIAL_SPARE_PARTS_CONSUMPTIONS);
  const [serviceEstimations, setServiceEstimations] = useState<RepairEstimation[]>(INITIAL_REPAIR_ESTIMATIONS);
  const [serviceInvoices, setServiceInvoices] = useState<ServiceInvoice[]>(INITIAL_SERVICE_INVOICES);
  const [servicePayments, setServicePayments] = useState<ServicePayment[]>(INITIAL_SERVICE_PAYMENTS);
  const [qualityControlRecords, setQualityControlRecords] = useState<QualityControlRecord[]>(INITIAL_QUALITY_CONTROL_RECORDS);
  const [batteryDispatches, setBatteryDispatches] = useState<BatteryDeliveryDispatch[]>(INITIAL_BATTERY_DISPATCHES);
  const [warrantyPolicies, setWarrantyPolicies] = useState<WarrantyPolicy[]>(INITIAL_WARRANTY_POLICIES);
  const [serviceSettings, setServiceSettings] = useState<ServiceSettings>(INITIAL_SERVICE_SETTINGS);

  // --- INSTALLMENT & RECEIVABLES MANAGEMENT STATES ---
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ensec_installment_plans');
        const hasPurged = localStorage.getItem('ensec_installment_test_purged_v2');
        if (!hasPurged || (saved && saved.includes('INS-2026-001'))) {
          localStorage.removeItem('ensec_installment_plans');
          localStorage.removeItem('ensec_installment_schedules');
          localStorage.removeItem('ensec_installment_payments');
          localStorage.removeItem('ensec_collection_assignments');
          localStorage.removeItem('ensec_collection_followups');
          localStorage.removeItem('ensec_sms_logs');
          localStorage.removeItem('ensec_installment_notifications');
          try {
            sessionStorage.removeItem('ensec_installment_plans');
            sessionStorage.removeItem('ensec_installment_schedules');
            sessionStorage.removeItem('ensec_installment_payments');
          } catch {}
          localStorage.setItem('ensec_installment_test_purged_v2', 'true');
          return [];
        }
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Error reading installment plans:', e);
      }
    }
    return INITIAL_INSTALLMENT_PLANS;
  });

  const [installmentSchedules, setInstallmentSchedules] = useState<InstallmentSchedule[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const hasPurged = localStorage.getItem('ensec_installment_test_purged_v2');
        const saved = localStorage.getItem('ensec_installment_schedules');
        if (!hasPurged || (saved && (saved.includes('INS-2026-001') || saved.includes('SCH-1001-01')))) {
          return [];
        }
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Error reading installment schedules:', e);
      }
    }
    return INITIAL_INSTALLMENT_SCHEDULES;
  });

  const [installmentPayments, setInstallmentPayments] = useState<InstallmentPayment[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const hasPurged = localStorage.getItem('ensec_installment_test_purged_v2');
        const saved = localStorage.getItem('ensec_installment_payments');
        if (!hasPurged || (saved && saved.includes('INS-2026-001'))) {
          return [];
        }
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Error reading installment payments:', e);
      }
    }
    return INITIAL_INSTALLMENT_PAYMENTS;
  });

  const [collectionAssignments, setCollectionAssignments] = useState<CollectionAssignment[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const hasPurged = localStorage.getItem('ensec_installment_test_purged_v2');
        const saved = localStorage.getItem('ensec_collection_assignments');
        if (!hasPurged || (saved && saved.includes('INS-2026-001'))) {
          return [];
        }
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Error reading collection assignments:', e);
      }
    }
    return INITIAL_COLLECTION_ASSIGNMENTS;
  });

  const [collectionFollowUps, setCollectionFollowUps] = useState<CollectionFollowUp[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const hasPurged = localStorage.getItem('ensec_installment_test_purged_v2');
        const saved = localStorage.getItem('ensec_collection_followups');
        if (!hasPurged || (saved && saved.includes('INS-2026-001'))) {
          return [];
        }
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Error reading collection followups:', e);
      }
    }
    return INITIAL_COLLECTION_FOLLOWUPS;
  });

  const [collectionEscalationRules, setCollectionEscalationRules] = useState<CollectionEscalationRule[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ensec_escalation_rules');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Error reading escalation rules:', e);
      }
    }
    return INITIAL_ESCALATION_RULES;
  });

  const [smsTemplates, setSmsTemplates] = useState<SMSTemplate[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ensec_sms_templates');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Error reading sms templates:', e);
      }
    }
    return INITIAL_SMS_TEMPLATES;
  });

  const [smsAutomationRules, setSmsAutomationRules] = useState<SMSAutomationRule[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ensec_sms_rules');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Error reading sms rules:', e);
      }
    }
    return INITIAL_SMS_AUTOMATION_RULES;
  });

  const [smsLogs, setSmsLogs] = useState<SMSLog[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const hasPurged = localStorage.getItem('ensec_installment_test_purged_v2');
        const saved = localStorage.getItem('ensec_sms_logs');
        if (!hasPurged || (saved && saved.includes('LOG-001'))) {
          return [];
        }
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Error reading sms logs:', e);
      }
    }
    return INITIAL_SMS_LOGS;
  });

  const [smsGatewaySettings, setSmsGatewaySettings] = useState<SMSGatewaySettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ensec_sms_gateway_settings');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Error reading gateway settings:', e);
      }
    }
    return INITIAL_GATEWAY_SETTINGS;
  });

  const [installmentNotifications, setInstallmentNotifications] = useState<InstallmentNotification[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const hasPurged = localStorage.getItem('ensec_installment_test_purged_v2');
        const saved = localStorage.getItem('ensec_installment_notifications');
        if (!hasPurged || (saved && saved.includes('notif-1'))) {
          return [];
        }
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Error reading installment notifications:', e);
      }
    }
    return INITIAL_INSTALLMENT_NOTIFICATIONS;
  });

  // Persistent storage effects
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_installment_plans', JSON.stringify(installmentPlans));
    }
  }, [installmentPlans]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_installment_schedules', JSON.stringify(installmentSchedules));
    }
  }, [installmentSchedules]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_installment_payments', JSON.stringify(installmentPayments));
    }
  }, [installmentPayments]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_collection_assignments', JSON.stringify(collectionAssignments));
    }
  }, [collectionAssignments]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_collection_followups', JSON.stringify(collectionFollowUps));
    }
  }, [collectionFollowUps]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_escalation_rules', JSON.stringify(collectionEscalationRules));
    }
  }, [collectionEscalationRules]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_sms_templates', JSON.stringify(smsTemplates));
    }
  }, [smsTemplates]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_sms_rules', JSON.stringify(smsAutomationRules));
    }
  }, [smsAutomationRules]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_sms_logs', JSON.stringify(smsLogs));
    }
  }, [smsLogs]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_sms_gateway_settings', JSON.stringify(smsGatewaySettings));
    }
  }, [smsGatewaySettings]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ensec_installment_notifications', JSON.stringify(installmentNotifications));
    }
  }, [installmentNotifications]);

  // Helper for audit logging
  const addAuditLog = (action: string, module: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      module,
      details,
      ipAddress: '103.145.112.5 (BanglaNet)',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Stage 1: Procurement & Raw Materials
  const addSupplier = (supplierData: Omit<Supplier, 'id'>): string => {
    const id = `sup-${Date.now().toString().slice(-5)}`;
    const newSupplier: Supplier = {
      ...supplierData,
      id,
    };
    setSuppliers((prev) => [...prev, newSupplier]);
    addAuditLog(
      'SUPPLIER_CREATED',
      'Procurement & SCM',
      `Registered new supplier ${newSupplier.name} (${newSupplier.code}) from ${newSupplier.country}`
    );
    return id;
  };

  const updateSupplier = (supplierId: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === supplierId ? { ...s, ...updates } : s))
    );
    addAuditLog(
      'SUPPLIER_UPDATED',
      'Procurement & SCM',
      `Updated supplier profile for ID ${supplierId}`
    );
  };

  const deleteSupplier = (supplierId: string) => {
    const target = suppliers.find((s) => s.id === supplierId);
    setSuppliers((prev) => prev.filter((s) => s.id !== supplierId));
    addAuditLog(
      'SUPPLIER_DELETED',
      'Procurement & SCM',
      `Deleted supplier ${target ? target.name : supplierId}`
    );
  };

  // Raw Materials CRUD & Supabase Sync
  const refreshRawMaterials = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('raw_materials')
          .select('*')
          .order('id', { ascending: true });

        if (!error && Array.isArray(data)) {
          const seen = new Set<string>();
          const mapped: RawMaterial[] = [];
          for (const row of data) {
            const sid = String(row.id);
            if (!seen.has(sid)) {
              seen.add(sid);
              mapped.push({
                id: sid,
                code: row.code || '',
                name: row.name || '',
                category: row.category || 'Cell',
                categoryId: row.category_id !== null && row.category_id !== undefined ? String(row.category_id) : undefined,
                description: row.description || '',
                unit: row.unit || 'Pieces',
                upc: row.upc || '',
                barcode: row.barcode || '',
                stockKushtia: Number(row.stock_kushtia) || 0,
                reorderLevel: Number(row.reorder_level) || 0,
                minimumStock: Number(row.minimum_stock) || 0,
                maximumStock: Number(row.maximum_stock) || 0,
                lastPurchaseUnitCostBDT: Number(row.last_purchase_unit_cost_bdt) || 0,
                standardCostBDT: Number(row.standard_cost_bdt) || 0,
                status: row.status || 'Active',
                type: (row.type as 'Local' | 'Import') || 'Local',
              });
            }
          }
          setRawMaterials(mapped);
          if (typeof window !== 'undefined') {
            localStorage.setItem('ensec_raw_materials', JSON.stringify(mapped));
          }
        } else if (error) {
          console.warn('Supabase raw_materials fetch warning:', error.message);
          setRawMaterials([]);
        }
      } catch (err) {
        console.error('Failed to load raw materials from Supabase:', err);
        setRawMaterials([]);
      }
    }
  };

  const addRawMaterial = async (
    materialData: any
  ): Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }> => {
    const id = `rm-${Date.now().toString().slice(-5)}`;
    let defaultCode = materialData?.code?.trim();
    if (!defaultCode) {
      let maxNum = 0;
      for (const m of rawMaterials) {
        if (!m?.code) continue;
        const match = m.code.trim().toUpperCase().match(/^RM-?(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
      defaultCode = `RM${String(maxNum + 1).padStart(5, '0')}`;
    }
    const newMaterial: RawMaterial = {
      code: defaultCode,
      name: 'New Raw Material',
      category: 'Raw Materials',
      unit: 'PCS',
      stockKushtia: 0,
      reorderLevel: 50,
      minimumStock: 20,
      maximumStock: 500,
      status: 'Active',
      ...materialData,
      id,
    };
    setRawMaterials((prev) => [...prev, newMaterial]);
    addAuditLog(
      'RAW_MATERIAL_CREATED',
      'Raw Material SCM',
      `Registered new raw material ${newMaterial.name} (${newMaterial.code}) in ${newMaterial.category} category with ${newMaterial.stockKushtia} ${newMaterial.unit} stock`
    );

    const sb = getSupabase();
    if (sb) {
      try {
        const targetCategory = newMaterial.category;
        const matchedCat = rawMaterialCategories.find(
          (c) =>
            (materialData.categoryId && String(c.id) === String(materialData.categoryId)) ||
            (targetCategory && c.name?.toLowerCase().trim() === targetCategory.toLowerCase().trim())
        );

        let resolvedCategoryId: number | null = null;
        if (materialData.categoryId && !isNaN(Number(materialData.categoryId)) && Number(materialData.categoryId) > 0) {
          resolvedCategoryId = Number(materialData.categoryId);
        } else if (matchedCat && !isNaN(Number(matchedCat.id))) {
          resolvedCategoryId = Number(matchedCat.id);
        }

        const insertPayload: any = {
          code: newMaterial.code,
          name: newMaterial.name,
          category: newMaterial.category,
          type: newMaterial.type || 'Local',
          unit: newMaterial.unit || 'Pieces',
          stock_kushtia: newMaterial.stockKushtia || 0,
          reorder_level: newMaterial.reorderLevel || 0,
          last_purchase_unit_cost_bdt: newMaterial.lastPurchaseUnitCostBDT || 0,
          standard_cost_bdt: newMaterial.standardCostBDT || 0,
          status: 'Active',
        };

        if (resolvedCategoryId !== null) {
          insertPayload.category_id = resolvedCategoryId;
        }

        let { data, error } = await sb
          .from('raw_materials')
          .insert(insertPayload)
          .select();

        // If category_id column does not exist or foreign key fails, retry without it
        if (error && (error.code === '42703' || error.message?.includes('category_id') || error.code === '23503')) {
          delete insertPayload.category_id;
          const retryRes = await sb
            .from('raw_materials')
            .insert(insertPayload)
            .select();
          data = retryRes.data;
          error = retryRes.error;
        }

        // If the 'type' column does not exist in Supabase yet, retry without it
        if (error && (error.code === '42703' || error.message?.includes('type'))) {
          delete insertPayload.type;
          const retryRes = await sb
            .from('raw_materials')
            .insert(insertPayload)
            .select();
          data = retryRes.data;
          error = retryRes.error;
        }

        if (error) {
          console.error('Failed to sync new raw material to Supabase:', error);
          setRawMaterials((prev) => prev.filter((m) => m.id !== id));
          return {
            success: false,
            id,
            error: error.message,
            isRemoteSynced: false,
          };
        } else {
          await refreshRawMaterials();
          return {
            success: true,
            id: (data && data[0] && String(data[0].id)) || id,
            isRemoteSynced: true,
          };
        }
      } catch (err: any) {
        setRawMaterials((prev) => prev.filter((m) => m.id !== id));
        return {
          success: false,
          id,
          error: err.message || 'Network exception',
          isRemoteSynced: false,
        };
      }
    }

    return {
      success: true,
      id,
      isRemoteSynced: false,
      error: 'Supabase credentials are not connected. Saved in local memory only.',
    };
  };

  const updateRawMaterial = async (
    materialId: string,
    updates: Partial<RawMaterial>
  ): Promise<{ success: boolean; error?: string }> => {
    setRawMaterials((prev) =>
      prev.map((rm) => (rm.id === materialId ? { ...rm, ...updates } : rm))
    );
    addAuditLog(
      'RAW_MATERIAL_UPDATED',
      'Raw Material SCM',
      `Updated raw material specifications/stock for ID ${materialId}`
    );

    const sb = getSupabase();
    if (sb) {
      try {
        const payload: any = {};
        if (updates.code) payload.code = updates.code;
        if (updates.name) payload.name = updates.name;
        if (updates.category) payload.category = updates.category;
        if (updates.type) payload.type = updates.type;
        if (updates.unit) payload.unit = updates.unit;
        if (updates.stockKushtia !== undefined) payload.stock_kushtia = updates.stockKushtia;
        if (updates.reorderLevel !== undefined) payload.reorder_level = updates.reorderLevel;
        if (updates.lastPurchaseUnitCostBDT !== undefined)
          payload.last_purchase_unit_cost_bdt = updates.lastPurchaseUnitCostBDT;
        if (updates.standardCostBDT !== undefined)
          payload.standard_cost_bdt = updates.standardCostBDT;

        // Resolve category_id if passed directly or looked up by category name
        const targetCategory = updates.category;
        const matchedCat = rawMaterialCategories.find(
          (c) =>
            (updates.categoryId && String(c.id) === String(updates.categoryId)) ||
            (targetCategory && c.name?.toLowerCase().trim() === targetCategory.toLowerCase().trim())
        );

        if (updates.categoryId !== undefined) {
          const num = Number(updates.categoryId);
          if (!isNaN(num) && num > 0) {
            payload.category_id = num;
          } else if (matchedCat && !isNaN(Number(matchedCat.id))) {
            payload.category_id = Number(matchedCat.id);
          } else {
            payload.category_id = null;
          }
        } else if (updates.category && matchedCat && !isNaN(Number(matchedCat.id))) {
          payload.category_id = Number(matchedCat.id);
        }

        const isNumeric = /^\d+$/.test(materialId);
        let query = isNumeric
          ? sb.from('raw_materials').update(payload).eq('id', Number(materialId))
          : sb.from('raw_materials').update(payload).eq('code', materialId);

        let { error } = await query;
        if (error && (error.code === '42703' || error.message?.includes('category_id') || error.code === '23503')) {
          delete payload.category_id;
          const retryQuery = isNumeric
            ? sb.from('raw_materials').update(payload).eq('id', Number(materialId))
            : sb.from('raw_materials').update(payload).eq('code', materialId);
          const retryRes = await retryQuery;
          error = retryRes.error;
        }
        if (error && (error.code === '42703' || error.message?.includes('type'))) {
          delete payload.type;
          const retryQuery = isNumeric
            ? sb.from('raw_materials').update(payload).eq('id', Number(materialId))
            : sb.from('raw_materials').update(payload).eq('code', materialId);
          const retryRes = await retryQuery;
          error = retryRes.error;
        }
        if (error) {
          console.error('Failed to update raw material in Supabase:', error);
          return { success: false, error: error.message };
        }
        await refreshRawMaterials();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  };

  const deleteRawMaterial = async (materialId: string): Promise<{ success: boolean; error?: string }> => {
    const target = rawMaterials.find((m) => m.id === materialId);
    setRawMaterials((prev) => prev.filter((m) => m.id !== materialId));
    addAuditLog(
      'RAW_MATERIAL_DELETED',
      'Raw Material SCM',
      `Deleted raw material ${target?.name || materialId}`
    );

    const sb = getSupabase();
    if (sb) {
      try {
        const isNumeric = /^\d+$/.test(materialId);
        const query = isNumeric
          ? sb.from('raw_materials').delete().eq('id', Number(materialId))
          : sb.from('raw_materials').delete().eq('code', target?.code || materialId);

        const { error } = await query;
        if (error) {
          console.error('Failed to delete raw material in Supabase:', error);
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  };

  const bulkAddRawMaterials = async (
    materialsList: Array<Omit<RawMaterial, 'id'> & { id?: string }>,
    options?: { updateExisting?: boolean }
  ): Promise<{ success: boolean; createdCount: number; updatedCount: number; error?: string }> => {
    const updateExisting = options?.updateExisting ?? true;
    let createdCount = 0;
    let updatedCount = 0;

    const sb = getSupabase();
    const existingMap = new Map<string, RawMaterial>();
    rawMaterials.forEach((m) => {
      existingMap.set(m.code.trim().toUpperCase(), m);
    });

    const newItems: RawMaterial[] = [];
    const updatedItems: RawMaterial[] = [...rawMaterials];
    const supabasePayloadsToUpsert: any[] = [];

    for (const item of materialsList) {
      const codeKey = (item.code || '').trim().toUpperCase();
      if (!codeKey) continue;

      const existing = existingMap.get(codeKey);
      if (existing) {
        if (updateExisting) {
          const updatedIdx = updatedItems.findIndex((m) => m.code.trim().toUpperCase() === codeKey);
          if (updatedIdx >= 0) {
            updatedItems[updatedIdx] = {
              ...updatedItems[updatedIdx],
              ...item,
              id: existing.id,
            };
            updatedCount++;
            supabasePayloadsToUpsert.push({
              code: item.code.trim(),
              name: item.name.trim(),
              category: item.category || existing.category,
              unit: item.unit || existing.unit,
              stock_kushtia: item.stockKushtia !== undefined ? Number(item.stockKushtia) : existing.stockKushtia,
              reorder_level: item.reorderLevel !== undefined ? Number(item.reorderLevel) : existing.reorderLevel,
              last_purchase_unit_cost_bdt: item.lastPurchaseUnitCostBDT !== undefined ? Number(item.lastPurchaseUnitCostBDT) : existing.lastPurchaseUnitCostBDT,
              standard_cost_bdt: item.standardCostBDT !== undefined ? Number(item.standardCostBDT) : existing.standardCostBDT,
              status: item.status || existing.status,
              notes: item.notes || item.description || existing.notes || '',
              updated_at: new Date().toISOString(),
            });
          }
        }
      } else {
        const newId = `rm-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const freshItem: RawMaterial = {
          id: newId,
          code: item.code.trim(),
          name: item.name.trim(),
          category: item.category || 'Cell',
          unit: item.unit || 'Pieces',
          stockKushtia: Number(item.stockKushtia) || 0,
          totalAvailableStock: Number(item.stockKushtia) || 0,
          reorderLevel: Number(item.reorderLevel) || 50,
          minimumStock: Number(item.minimumStock) || 20,
          maximumStock: Number(item.maximumStock) || 1000,
          status: item.status || 'Active',
          lastPurchaseUnitCostBDT: Number(item.lastPurchaseUnitCostBDT) || 0,
          standardCostBDT: Number(item.standardCostBDT) || 0,
          description: item.description || '',
          upc: item.upc || '',
          barcode: item.barcode || `BC-${item.code.trim()}`,
          notes: item.notes || '',
        };
        newItems.push(freshItem);
        existingMap.set(codeKey, freshItem);
        createdCount++;
        supabasePayloadsToUpsert.push({
          code: freshItem.code,
          name: freshItem.name,
          category: freshItem.category,
          unit: freshItem.unit,
          stock_kushtia: freshItem.stockKushtia,
          reorder_level: freshItem.reorderLevel,
          last_purchase_unit_cost_bdt: freshItem.lastPurchaseUnitCostBDT,
          standard_cost_bdt: freshItem.standardCostBDT,
          status: freshItem.status,
          notes: freshItem.notes || freshItem.description || '',
        });
      }
    }

    setRawMaterials([...updatedItems, ...newItems]);
    addAuditLog(
      'RAW_MATERIALS_BULK_IMPORT',
      'Raw Material SCM',
      `Bulk imported raw materials: ${createdCount} created, ${updatedCount} updated`
    );

    if (sb && supabasePayloadsToUpsert.length > 0) {
      try {
        const { error } = await sb
          .from('raw_materials')
          .upsert(supabasePayloadsToUpsert, { onConflict: 'code' });
        if (error) {
          console.warn('Supabase bulk upsert raw_materials warning:', error.message);
        } else {
          await refreshRawMaterials();
        }
      } catch (err: any) {
        console.error('Failed to sync bulk raw materials to Supabase:', err);
      }
    }

    return { success: true, createdCount, updatedCount };
  };

  // Raw Material Categories CRUD & Supabase Sync
  const refreshRawMaterialCategories = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('raw_material_categories')
          .select('*')
          .order('id', { ascending: false });

        if (!error && Array.isArray(data)) {
          const mapped: RawMaterialCategory[] = data.map((row: any) => ({
            id: String(row.id),
            code: row.code || '',
            name: row.name || '',
            description: row.description || '',
            status: row.status === 'Inactive' ? 'Inactive' : 'Active',
            parentClassification: row.parent_classification || row.parentClassification || '',
          }));
          setRawMaterialCategories(mapped);
        } else if (error) {
          console.warn('Supabase raw_material_categories fetch warning:', error.message);
        }
      } catch (err) {
        console.error('Failed to load raw material categories from Supabase:', err);
      }
    }
  };

  // Raw Material Classifications CRUD & Supabase Sync
  const refreshRawMaterialClassifications = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('raw_material_classifications')
          .select('*')
          .order('id', { ascending: false });

        if (!error && Array.isArray(data)) {
          const mapped: RawMaterialClassification[] = data.map((row: any) => ({
            id: String(row.id),
            code: row.code || '',
            name: row.name || '',
            description: row.description || '',
            colorTag: row.color_tag || row.colorTag || 'amber',
            status: row.status === 'Inactive' ? 'Inactive' : 'Active',
          }));
          setRawMaterialClassifications(mapped);
          if (typeof window !== 'undefined') {
            localStorage.setItem('ensec_rm_classifications', JSON.stringify(mapped));
          }
        }
      } catch (err) {
        console.warn('Supabase raw_material_classifications fetch notice:', err);
      }
    }
  };

  const refreshProducts = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('products')
          .select('*')
          .order('id', { ascending: false });

        if (!error && Array.isArray(data)) {
          const mapped: Product[] = data.map((row: any) => ({
            id: String(row.id),
            code: row.code || '',
            name: row.name || '',
            model: row.model || row.code || '',
            brand: row.brand || 'Ensec Lithium BD',
            category: row.category || 'Electric Vehicle (EV) Batteries',
            batteryType: row.battery_type || (row.chemistry?.toLowerCase().includes('lifepo4') ? 'LiFePO4' : 'LiFePO4'),
            chemistry: row.chemistry || 'Lifepo4',
            voltageV: Number(row.nominal_voltage) || 51.2,
            capacityAh: Number(row.capacity_ah) || 86,
            energyKWh: Number(row.energy_wh) ? Number((Number(row.energy_wh) / 1000).toFixed(2)) : 4.4,
            normalVoltage: row.normal_voltage || (row.nominal_voltage ? `${row.nominal_voltage}V` : '51.2V'),
            ratedCapacity: row.rated_capacity || (row.nominal_voltage && row.capacity_ah ? `${row.nominal_voltage}V${row.capacity_ah}Ah` : '51.2V86Ah'),
            cycleLife: row.cycle_life || '>4000',
            typicalCapacityKWh: row.typical_capacity_kwh || '4.40KWH',
            maxChargeCurrent: row.max_charge_current || '50A',
            standardCharging: row.standard_charging || 'CC/CV, 0.5C, 58.4V.',
            maxDischargeCurrent: row.max_discharge_current || '120A/150A/200A',
            weightKg: row.weight_kg || '40KG (±)2%',
            dimensionCm: row.dimension_cm || '50*36*26',
            operatingTemperature: row.operating_temperature || '0-60°C',
            mileageKm: row.mileage_km || '80-90KM with Full Charge.',
            distributorPriceBDT: Number(row.distributor_price_bdt) || Number(row.trade_price_bdt) || 0,
            dealerPriceBDT: Number(row.dealer_price_bdt) || 0,
            corporatePriceBDT: Number(row.corporate_price_bdt) || 0,
            projectPriceBDT: Number(row.project_price_bdt) || 0,
            retailPriceBDT: Number(row.retail_price_bdt) || Number(row.mrp_bdt) || 0,
            customerPriceBDT: Number(row.retail_price_bdt) || Number(row.mrp_bdt) || 0,
            minimumSellingPriceBDT: Number(row.distributor_price_bdt) || Number(row.trade_price_bdt) || 0,
            assemblyCostEstimateBDT: Number(row.assembly_cost_estimate_bdt) || 0,
            warrantyMonths: Number(row.warranty_months) || 36,
            unit: row.unit || 'Units',
            status: row.status || 'Active',
            categoryPrices: row.category_prices || {},
            bom: Array.isArray(row.bom) ? row.bom : [],
          }));
          setProducts(mapped);
          if (typeof window !== 'undefined') {
            localStorage.setItem('ensec_products', JSON.stringify(mapped));
          }
        } else if (error) {
          console.warn('Supabase products fetch warning:', error.message);
        }
      } catch (err) {
        console.error('Failed to load products from Supabase:', err);
      }
    }
  };

  const refreshProductCategories = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('product_categories')
          .select('*')
          .order('id', { ascending: true });
        if (!error && Array.isArray(data)) {
          const mapped: ProductCategory[] = data
            .map((row: any) => ({
              id: String(row.id),
              code: row.code || '',
              name: row.name || '',
              description: row.description || '',
              status: row.status === 'Inactive' ? 'Inactive' : 'Active',
              productCount: Number(row.product_count) || 0,
            }));
          setCategories(mapped);
          if (typeof window !== 'undefined') {
            localStorage.setItem('ensec_product_categories', JSON.stringify(mapped));
          }
        } else if (error) {
          console.warn('Supabase product_categories fetch:', error.message);
        }
      } catch (err) {
        console.error('Failed to load product categories from Supabase:', err);
      }
    }
  };

  const refreshProductBrands = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('product_brands')
          .select('*')
          .order('id', { ascending: true });
        if (!error && Array.isArray(data)) {
          setBrands((prev) => {
            const prevMap = new Map(prev.map((b) => [b.id, b]));
            return data.map((row: any) => {
              const prevBrand = prevMap.get(String(row.id)) || prev.find((b) => b.code === row.code);
              const rowCat = row.category !== undefined && row.category !== null && row.category !== ''
                ? String(row.category)
                : (prevBrand?.category || '');
              const rowCategories = rowCat
                ? [rowCat]
                : Array.isArray(row.categories) && row.categories.length > 0
                ? row.categories
                : Array.isArray(row.category_tags) && row.category_tags.length > 0
                ? row.category_tags
                : (prevBrand?.categories || (rowCat ? [rowCat] : []));

              return {
                id: String(row.id),
                code: row.code || '',
                name: row.name || '',
                origin: row.origin || 'Bangladesh',
                category: rowCat,
                categories: rowCategories,
                categoryTags: rowCategories,
                tagline: row.tagline || '',
                status: row.status === 'Inactive' ? 'Inactive' : 'Active',
                productCount: Number(row.product_count) || 0,
              };
            });
          });
        } else if (error) {
          console.warn('Supabase product_brands fetch:', error.message);
          setBrands([]);
        }
      } catch (err) {
        console.error('Failed to load product brands from Supabase:', err);
        setBrands([]);
      }
    }
  };

  const refreshCustomerCategories = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('customer_categories')
          .select('*')
          .order('id', { ascending: true });
        if (!error && Array.isArray(data)) {
          const mapped: CustomerCategory[] = data.map((row: any) => ({
            id: String(row.id),
            code: row.code || '',
            name: row.name || '',
            description: row.description || '',
            targetAudience: (row.target_audience as any) || 'Both',
            discountPercentage: Number(row.discount_percentage) || 0,
            priceMarkupPercentage: Number(row.price_markup_percentage) || 0,
            status: row.status === 'Inactive' ? 'Inactive' : 'Active',
            customerCount: Number(row.customer_count) || 0,
            distributorCount: Number(row.distributor_count) || 0,
            productPriceCount: Number(row.product_price_count) || 0,
            createdAt: row.created_at ? String(row.created_at).slice(0, 10) : undefined,
          }));
          setCustomerCategories(mapped);
        } else if (error) {
          console.warn('Supabase customer_categories fetch:', error.message);
          setCustomerCategories([]);
        }
      } catch (err) {
        console.error('Failed to load customer categories from Supabase:', err);
        setCustomerCategories([]);
      }
    }
  };

  const refreshDistributors = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('distributors')
          .select('*')
          .order('id', { ascending: false });

        if (!error && Array.isArray(data)) {
          const mapped: Distributor[] = data.map((row: any) => ({
            id: String(row.id),
            code: row.code || '',
            name: row.name || '',
            ownerName: row.owner_name || row.proprietor_name || '',
            phone: row.phone || '',
            email: row.email || undefined,
            district: row.district || row.region || 'Dhaka',
            region: row.region || 'Dhaka Division',
            territory: row.territory || row.area || 'Central Market',
            dbPoint: row.db_point || (row.code ? `DB-${row.code}` : 'DB-CENTRAL'),
            marketHierarchy: row.market_hierarchy || undefined,
            departments: Array.isArray(row.departments) ? row.departments : [],
            creditLimitBDT: Number(row.credit_limit_bdt) || 0,
            currentOutstandingBDT:
              Number(row.current_outstanding_bdt) || Number(row.current_balance_bdt) || 0,
            paymentTermsDays: Number(row.payment_terms_days) || 30,
            openingBalanceBDT: Number(row.opening_balance_bdt) || Number(row.current_balance_bdt) || 0,
            assignedSalespersonId:
              row.assigned_salesperson_id || row.assigned_rep_id
                ? String(row.assigned_salesperson_id || row.assigned_rep_id)
                : undefined,
            assignedSalespersonName:
              row.assigned_salesperson_name || row.assigned_rep_name || undefined,
            assignedRepId:
              row.assigned_rep_id || row.assigned_salesperson_id
                ? String(row.assigned_rep_id || row.assigned_salesperson_id)
                : undefined,
            assignedRepName:
              row.assigned_rep_name || row.assigned_salesperson_name || undefined,
            customerCategoryId: row.customer_category_id ? String(row.customer_category_id) : undefined,
            customerCategoryName: row.customer_category_name || undefined,
            status: row.status === 'Blocked' ? 'Blocked' : row.status === 'Review' ? 'Review' : 'Active',
            address: row.address || undefined,
            discontinueDate: row.discontinue_date ? String(row.discontinue_date).slice(0, 10) : undefined,
          }));
          setDistributors(mapped);
        } else if (error) {
          console.warn('Supabase distributors fetch warning:', error.message);
        }
      } catch (err) {
        console.error('Failed to load distributors from Supabase:', err);
      }
    }
  };

  const refreshCustomers = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('customers')
          .select('*')
          .order('id', { ascending: false });

        if (!error && Array.isArray(data)) {
          const mapped: Customer[] = data.map((row: any) => ({
            id: String(row.id),
            code: row.code || '',
            name: row.name || '',
            ownerName: row.owner_name || undefined,
            phone: row.phone || '',
            email: row.email || undefined,
            channel: row.channel || 'Distributor Sales',
            customerType: row.customer_type || 'Retailer',
            pricingTier: row.pricing_tier || 'Dealer / Retailer Channel',
            assignedDistributorId: row.assigned_distributor_id ? String(row.assigned_distributor_id) : undefined,
            assignedDistributorName: row.assigned_distributor_name || undefined,
            assignedRepId: row.assigned_rep_id ? String(row.assigned_rep_id) : undefined,
            assignedRepName: row.assigned_rep_name || undefined,
            customerCategoryId: row.customer_category_id ? String(row.customer_category_id) : undefined,
            customerCategoryName: row.customer_category_name || undefined,
            district: row.district || 'Dhaka',
            territory: row.territory || undefined,
            address: row.address || undefined,
            creditLimitBDT: Number(row.credit_limit_bdt) || 0,
            outstandingBalanceBDT: Number(row.outstanding_balance_bdt) || 0,
            status: row.status || 'Active',
            createdAt: row.created_at || undefined,
            marketHierarchy: row.market_hierarchy || row.territory || undefined,
          }));
          setCustomers(mapped);
        } else if (error) {
          console.warn('Supabase customers fetch warning:', error.message);
        }
      } catch (err) {
        console.error('Failed to load customers from Supabase:', err);
      }
    }
  };

  const refreshOrgHierarchy = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('org_hierarchy')
          .select('*')
          .order('id', { ascending: true });
        if (!error && Array.isArray(data)) {
          if (data.length === 0) {
            setOrgHierarchy({ id: '', name: '', type: 'Company', code: '', children: [] });
          } else {
            const nodeMap = new Map<string, OrgNode>();
            data.forEach((r: any) => {
              const key = r.node_id || String(r.id);
              nodeMap.set(key, {
                id: key,
                name: r.name || '',
                type: r.type || 'Company',
                code: r.code || '',
                parentId: r.parent_id || undefined,
                headPerson: r.head_person || undefined,
                phone: r.phone || undefined,
                notes: r.notes || undefined,
                taggedDistributorIds: r.tagged_distributor_ids || [],
                taggedCustomerIds: r.tagged_customer_ids || [],
                taggedFieldForceIds: r.tagged_field_force_ids || [],
                children: [],
              });
            });
            let rootNode: OrgNode | null = null;
            data.forEach((r: any) => {
              const key = r.node_id || String(r.id);
              const node = nodeMap.get(key)!;
              if (r.parent_id && nodeMap.has(r.parent_id)) {
                const parent = nodeMap.get(r.parent_id)!;
                parent.children = parent.children || [];
                parent.children.push(node);
              } else if (!rootNode) {
                rootNode = node;
              }
            });
            setOrgHierarchy(rootNode || { id: '', name: '', type: 'Company', code: '', children: [] });
          }
        } else if (error) {
          setOrgHierarchy({ id: '', name: '', type: 'Company', code: '', children: [] });
        }
      } catch (err) {
        setOrgHierarchy({ id: '', name: '', type: 'Company', code: '', children: [] });
      }
    }
  };

  const refreshDepartments = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('departments')
          .select('*')
          .order('id', { ascending: true });
        if (!error && Array.isArray(data)) {
          const mapped: Department[] = data.map((row: any) => ({
            id: String(row.id),
            code: row.code || '',
            name: row.name || '',
            fullName: row.full_name || `${row.code} - ${row.name}`,
            division: row.division || '',
            headOfDepartment: row.head_of_department || '',
            email: row.email || '',
            phone: row.phone || '',
            location: row.location || '',
            description: row.description || '',
            memberCount: Number(row.member_count) || 0,
            status: row.status === 'Inactive' ? 'Inactive' : 'Active',
            createdAt: row.created_at ? String(row.created_at).slice(0, 10) : undefined,
          }));
          setDepartments(mapped);
        } else if (error) {
          setDepartments([]);
        }
      } catch (err) {
        setDepartments([]);
      }
    }
  };

  const refreshBanks = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('banks')
          .select('*')
          .order('id', { ascending: true });
        if (!error && Array.isArray(data)) {
          const mapped: Bank[] = data.map((row: any) => ({
            id: String(row.id),
            code: row.code || '',
            name: row.name || '',
            nativeName: row.native_name || undefined,
            accountNo: row.account_no || '',
            branchName: row.branch_name || '',
            isActive: row.is_active !== false,
            createdAt: row.created_at ? String(row.created_at).slice(0, 10) : undefined,
          }));
          setBanks(mapped);
        } else if (error) {
          setBanks([]);
        }
      } catch (err) {
        setBanks([]);
      }
    }
  };

  const refreshUOMs = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('units_of_measurement')
          .select('*')
          .order('id', { ascending: true });
        if (!error && Array.isArray(data)) {
          const mapped: UnitOfMeasurement[] = data.map((row: any) => ({
            id: String(row.id),
            code: row.code || '',
            name: row.name || '',
            symbol: row.symbol || '',
            nativeName: row.native_name || undefined,
            applicableTo: (row.applicable_to as any) || 'Both',
            category: row.category || 'Discrete Count',
            isBaseUnit: Boolean(row.is_base_unit),
            allowDecimals: Boolean(row.allow_decimals),
            decimalPlaces: Number(row.decimal_places) || 0,
            standardPackagingRate: Number(row.standard_packaging_rate) || 1,
            description: row.description || '',
            isActive: row.is_active !== false,
            createdAt: row.created_at ? String(row.created_at).slice(0, 10) : undefined,
            updatedAt: row.updated_at ? String(row.updated_at).slice(0, 10) : undefined,
          }));
          setUoms(mapped);
        } else if (error) {
          setUoms([]);
        }
      } catch (err) {
        setUoms([]);
      }
    }
  };

  const refreshFieldForce = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('field_force_reps')
          .select('*')
          .order('id', { ascending: true });
        if (!error && Array.isArray(data)) {
          const mapped: FieldForceRep[] = data.map((row: any) => ({
            id: String(row.id),
            code: row.code || '',
            name: row.name || '',
            nativeName: row.native_name || undefined,
            pin: row.pin || undefined,
            phone: row.phone || '',
            designation: row.designation || 'Territory Sales Officer',
            fieldForceType: row.field_force_type || 'Capture',
            department: row.department || undefined,
            departments: row.departments || [],
            region: row.region || '',
            area: row.area || '',
            territory: row.territory || '',
            marketHierarchy: row.market_hierarchy || undefined,
            distributorId: row.distributor_id ? String(row.distributor_id) : undefined,
            distributorName: row.distributor_name || undefined,
            monthlyTargetBDT: Number(row.monthly_target_bdt) || 0,
            monthlyAchievedBDT: Number(row.monthly_achieved_bdt) || 0,
            basicSalaryBDT: Number(row.basic_salary_bdt) || 0,
            conveyanceBDT: Number(row.conveyance_bdt) || 0,
            taDaBDT: Number(row.ta_da_bdt) || 0,
            mobileAllowanceBDT: Number(row.mobile_allowance_bdt) || 0,
            currentLocation: {
              latitude:
                typeof row.current_location?.latitude === 'number'
                  ? row.current_location.latitude
                  : (Number(row.current_latitude) || 23.8103),
              longitude:
                typeof row.current_location?.longitude === 'number'
                  ? row.current_location.longitude
                  : (Number(row.current_longitude) || 90.4125),
              address:
                row.current_location?.address ||
                row.last_known_address ||
                `${row.market_hierarchy || row.territory || row.region || 'Dhaka'}, Bangladesh`,
              lastUpdated:
                row.current_location?.lastUpdated ||
                row.last_location_update ||
                'Just now',
              speedKmH: Number(row.current_location?.speedKmH) || 0,
              batteryLevel:
                Number(row.current_location?.batteryLevel) ||
                Number(row.battery_level) ||
                95,
              isOnline:
                row.current_location?.isOnline ?? row.is_online ?? true,
            },
            todayVisitsCount: 0,
            productiveVisitsCount: 0,
            isActive: row.is_active !== false,
            status: row.is_active === false ? 'Inactive' : 'Active',
          }));
          setFieldForceReps(mapped);
        } else if (error) {
          setFieldForceReps([]);
        }
      } catch (err) {
        setFieldForceReps([]);
      }
    }
  };

  const refreshOffers = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('offers_promotions')
          .select('*')
          .order('id', { ascending: true });
        if (!error && Array.isArray(data)) {
          const mapped: OfferPromotion[] = data.map((row: any) => ({
            id: String(row.id),
            code: row.code || '',
            title: row.title || '',
            discountTitle: row.discount_title || row.title,
            discountNativeTitle: row.discount_native_title || undefined,
            startDate: row.start_date || '',
            endDate: row.end_date || '',
            validFrom: row.start_date || '',
            validTo: row.end_date || '',
            discountFor: row.discount_for || 'All',
            department: row.department || undefined,
            discountOn: row.discount_on || 'LineItem',
            eligibleFor: row.eligible_for || 'Product',
            priority: Number(row.priority) || 1,
            when: row.when_condition || 'Quantity',
            greaterThanOrEqualTo: Number(row.greater_than_or_equal_to) || 1,
            value: Number(row.condition_value) || 1,
            provide: row.provide_benefit || 'PercentageDiscount',
            discount: Number(row.discount_amount) || Number(row.discount_percentage) || 0,
            discountPercentage: Number(row.discount_percentage) || 0,
            flatDiscountBDT: Number(row.flat_discount_bdt) || 0,
            freeProductQty: Number(row.free_product_qty) || 0,
            freeProductId: row.free_product_id || undefined,
            freeProductName: row.free_product_name || undefined,
            allowDiscountFor: row.allow_discount_for || 'FullQuantity',
            applyInMultiples: Boolean(row.apply_in_multiples),
            discountLimitation: row.discount_limitation || 'Unlimited',
            limitTimes: Number(row.limit_times) || 0,
            isActive: row.is_active !== false,
            createdAt: row.created_at ? String(row.created_at).slice(0, 10) : undefined,
          }));
          setOffers(mapped);
        } else if (error) {
          setOffers([]);
        }
      } catch (err) {
        setOffers([]);
      }
    }
  };

  const refreshUsers = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('users')
          .select('*')
          .order('id', { ascending: true });

        if (!error && Array.isArray(data)) {
          const mappedUsers: User[] = data.map((row: any) => ({
            id: row.uid ? String(row.uid) : `u-sb-${row.id}`,
            userId:
              row.uid ||
              (row.email ? row.email.split('@')[0].toUpperCase() : `EMP-${row.id}`),
            name: row.name || 'Staff User',
            email: row.email || '',
            password:
              row.password !== undefined && row.password !== null && row.password !== ''
                ? String(row.password)
                : 'ensec2026',
            phone: row.phone || '',
            role: (row.role as any) || 'Field Force',
            designation: row.designation || '',
            department: row.department || '',
            status:
              row.status === 'Inactive'
                ? 'Inactive'
                : row.status === 'Blocked'
                ? 'Blocked'
                : 'Active',
            avatar: row.avatar,
            permissions: resolveUserPermissions({
              role: (row.role as any) || 'Field Force',
              permissions:
                typeof row.permissions === 'string'
                  ? (() => {
                      try {
                        return JSON.parse(row.permissions);
                      } catch {
                        return null;
                      }
                    })()
                  : row.permissions,
            }),
            isSalesman:
              row.is_salesman ??
              (row.role === 'Field Force' ||
                row.role === 'Sales Head' ||
                row.role === 'Territory Sales Officer'),
            salesmanCode: row.salesman_code || row.salesmancode,
            monthlySalesTargetBDT: row.monthly_target_bdt || row.monthlysalestargetbdt,
            createdAt: row.created_at,
          }));

          setUsers(mappedUsers);
          if (typeof window !== 'undefined') {
            localStorage.setItem('ensec_erp_users', JSON.stringify(mappedUsers));
          }
        }
      } catch (err) {
        console.warn('Supabase refreshUsers notice:', err);
      }
    }
  };

  const clearUsersLocalData = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ensec_erp_users');
    }
    setUsers([]);
    await refreshUsers();
    addAuditLog('SAMPLE_DATA_PURGED', 'User Management', 'Purged sample and local session user memory data');
  };

  const refreshSalesOrders = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('sales_orders')
          .select('*')
          .order('id', { ascending: false });

        if (!error && Array.isArray(data)) {
          const prevCachedOrders: SalesOrder[] = (() => {
            if (typeof window !== 'undefined') {
              try {
                return JSON.parse(localStorage.getItem('ensec_sales_orders') || '[]');
              } catch {
                return [];
              }
            }
            return [];
          })();

          const mapped: SalesOrder[] = data.map((row: any) => {
            const cached = prevCachedOrders.find(
              (c) => c.id === String(row.id) || c.orderNumber === row.order_number
            );
            const suffix = (row.order_number || String(row.id)).replace(/\D/g, '').slice(-2) || '88';
            const autoDo = cached?.doNumber || `012/2026-${suffix}`;
            const autoChallan = cached?.challanNumber || `BD-ES-2026-12-${suffix}`;
            const autoBill = cached?.billNumber || `20260012-${suffix}`;
            const isApproved = row.status !== 'Submitted' && row.status !== 'Cancelled';
            const isDoStage = row.status === 'DO Generated' || row.status === 'DO Accepted';
            const isChallanStage =
              row.status === 'Challan Generated' ||
              row.status === 'Dispatched & Invoiced' ||
              row.status === 'Delivered';

            return {
              id: String(row.id),
              orderNumber: row.order_number,
              date: row.order_date ? String(row.order_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
              channel: row.channel || 'Direct Sales',
              distributorId: row.distributor_id ? String(row.distributor_id) : undefined,
              distributorName: row.distributor_name || undefined,
              customerId: row.customer_id ? String(row.customer_id) : 'cust-direct',
              customerName: row.customer_name || 'Direct Customer',
              salespersonId: row.salesperson_id ? String(row.salesperson_id) : 'u-1',
              salespersonName: row.salesperson_name || 'Direct Sales',
              warehouseId: row.warehouse_id ? String(row.warehouse_id) : 'wh-1',
              warehouseName: row.warehouse_name || 'Main Warehouse',
              status: row.status || 'Submitted',
              subTotalBDT: Number(row.gross_amount_bdt) || 0,
              discountBDT: Number(row.discount_amount_bdt) || 0,
              taxVatBDT: Number(row.tax_vat_bdt) || 0,
              vatRatePercent:
                row.vat_rate_percent !== undefined
                  ? Number(row.vat_rate_percent)
                  : Number(row.tax_vat_bdt) > 0 && Number(row.gross_amount_bdt) > 0
                  ? Number(
                      (
                        (Number(row.tax_vat_bdt) /
                          Math.max(1, Number(row.gross_amount_bdt) - (Number(row.discount_amount_bdt) || 0))) *
                        100
                      ).toFixed(1)
                    )
                  : 5,
              netAmountBDT: Number(row.net_amount_bdt) || 0,
              paidAmountBDT: Number(row.paid_amount_bdt) || 0,
              dueAmountBDT: Number(row.due_amount_bdt) || 0,
              paymentStatus:
                (Number(row.due_amount_bdt) || 0) <= 0
                  ? 'Paid'
                  : (Number(row.paid_amount_bdt) || 0) > 0
                  ? 'Partially Paid'
                  : 'Unpaid',
              paymentMethod: row.payment_method || 'Credit (Due)',
              appliedOfferCode: row.applied_offer_code || undefined,
              notes: row.notes || undefined,
              items: Array.isArray(row.items_json) && row.items_json.length > 0 ? row.items_json : cached?.items || [],
              // Workflow metadata preservation: DO and Challan are strictly hidden without Accounts Check & Approve
              doNumber: isApproved ? (cached?.doNumber || (isDoStage || isChallanStage ? autoDo : undefined)) : undefined,
              doGeneratedAt: isApproved ? (cached?.doGeneratedAt || (isDoStage || isChallanStage ? new Date().toISOString() : undefined)) : undefined,
              doAccepted: isApproved ? (cached?.doAccepted ?? (row.status === 'DO Accepted' || isChallanStage)) : false,
              doAcceptedBy: isApproved ? (cached?.doAcceptedBy || (row.status === 'DO Accepted' || isChallanStage ? 'Engr. Abu Jubair Khan (Factory In-Charge)' : undefined)) : undefined,
              doAcceptedAt: isApproved ? cached?.doAcceptedAt : undefined,
              doAcceptedNotes: isApproved ? cached?.doAcceptedNotes : undefined,
              challanNumber: isApproved && isChallanStage ? (cached?.challanNumber || autoChallan) : undefined,
              challanGeneratedAt: isApproved && isChallanStage ? (cached?.challanGeneratedAt || new Date().toISOString()) : undefined,
              billNumber: cached?.billNumber || (isChallanStage ? autoBill : undefined),
              serialsUpdated: isApproved ? (cached?.serialsUpdated ?? isChallanStage) : false,
              serialsUpdatedBy: isApproved ? cached?.serialsUpdatedBy : undefined,
              deliveryStatus: cached?.deliveryStatus || (row.status === 'Delivered' ? 'Received by Customer' : row.status === 'Dispatched & Invoiced' ? 'In Transit' : 'Pending Dispatch'),
              receivedByCustomer: cached?.receivedByCustomer ?? (row.status === 'Delivered'),
              customerReceivedAt: cached?.customerReceivedAt,
              customerReceiverName: cached?.customerReceiverName,
              customerReceiverPhone: cached?.customerReceiverPhone,
              customerReceiverNotes: cached?.customerReceiverNotes,
              customerReceiptSignature: cached?.customerReceiptSignature,
              deliveryHandoverBy: cached?.deliveryHandoverBy,
            };
          });

          setSalesOrders(mapped);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('ensec_sales_orders', JSON.stringify(mapped));
            } catch (e) {}
          }
        } else if (error) {
          console.warn('Supabase refreshSalesOrders notice:', error.message);
        }
      } catch (err) {
        console.warn('Supabase refreshSalesOrders error:', err);
      }
    }
  };

  const refreshWarehouses = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('warehouses')
          .select('*')
          .order('id', { ascending: true });

        if (!error && Array.isArray(data)) {
          const mapped: Warehouse[] = data.map((row: any) => ({
            id: String(row.id),
            code: row.code || '',
            name: row.name || '',
            type: row.type || 'Regional Hub',
            district: row.district || 'Dhaka',
            location: row.location || '',
            managerName: row.manager_name || row.managerName || row.incharge_name || row.inchargeName || '',
            inchargeName: row.incharge_name || row.inchargeName || row.manager_name || row.managerName || '',
            phone: row.phone || row.incharge_phone || row.inchargePhone || '',
            inchargePhone: row.incharge_phone || row.inchargePhone || row.phone || '',
            email: row.email || undefined,
            capacityUnits: Number(row.capacity_units ?? row.capacityUnits ?? row.capacity_packs ?? row.capacityPacks) || 0,
            currentStockUnits: Number(row.current_stock_units ?? row.currentStockUnits ?? row.current_stock_packs ?? row.currentStockPacks) || 0,
            capacityPacks: Number(row.capacity_packs ?? row.capacityPacks ?? row.capacity_units ?? row.capacityUnits) || 0,
            currentStockPacks: Number(row.current_stock_packs ?? row.currentStockPacks ?? row.current_stock_units ?? row.currentStockUnits) || 0,
            status: row.status === 'Inactive' ? 'Inactive' : 'Active',
            description: row.description || '',
            isFactoryPlant: Boolean(row.is_factory_plant ?? row.isFactoryPlant ?? (row.type === 'Factory Plant')),
            createdAt: row.created_at ? String(row.created_at).slice(0, 10) : undefined,
          }));

          // Supabase is the single source of truth - no local session memory warehouses
          setWarehouses(mapped);
        } else if (error) {
          console.warn('Supabase refreshWarehouses notice:', error.message);
        }
      } catch (err) {
        console.warn('Supabase refreshWarehouses error:', err);
      }
    }
  };

  const refreshCIDStockReceipts = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('stock_cid_receipts')
          .select('*, stock_cid_receipt_items(*)')
          .order('id', { ascending: false });

        if (!error && Array.isArray(data)) {
          const mapped: CIDStockReceipt[] = data.map((row: any) => ({
            id: row.voucher_id || String(row.id),
            mrrNumber: row.mrr_number || '',
            receiptDate: row.receipt_date ? String(row.receipt_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
            sourceType: row.source_type || 'Kushtia Manufacturing Plant',
            sourceLocation: row.source_location || '',
            warehouseId: String(row.warehouse_id || ''),
            warehouseName: row.target_warehouse_name || '',
            challanNumber: row.challan_number || '',
            gatePassNumber: row.gate_pass_number || '',
            truckNumber: row.truck_number || row.carrier_vehicle_no || '',
            carrierVehicleNo: row.carrier_vehicle_no || row.truck_number || '',
            driverName: row.driver_name || '',
            driverPhone: row.driver_phone || '',
            receivedBy: row.received_by || 'Warehouse In-charge',
            qcInspector: row.qc_inspector || 'Engr. Sohidul Islam (Lead QC)',
            qcStatus: row.qc_status || 'QC Passed & Stamped',
            status: row.status || 'Received & Stocked',
            totalQuantity: Number(row.total_quantity) || 0,
            totalValueBDT: Number(row.total_amount_bdt) || 0,
            totalAmountBDT: Number(row.total_amount_bdt) || 0,
            generalRemarks: row.general_remarks || '',
            createdAt: row.created_at || new Date().toISOString(),
            items: (row.stock_cid_receipt_items || []).map((it: any) => ({
              id: String(it.id),
              productId: it.product_id ? String(it.product_id) : '',
              productCode: it.product_code || '',
              productName: it.product_name || '',
              sku: it.sku || it.product_code || '',
              category: it.category || '',
              batchNumber: it.batch_number || '',
              serialRange: it.serial_range || '',
              receivedQty: Number(it.received_qty) || 1,
              quantity: Number(it.received_qty) || 1,
              unitCostBDT: Number(it.unit_cost_bdt) || 0,
              totalCostBDT: Number(it.total_cost_bdt) || 0,
              rackLocation: it.rack_location || 'Row A - Shelf 01',
              packageCondition: it.package_condition || 'Factory Sealed',
              lineRemarks: it.line_remarks || '',
            })),
          }));

          setCIDStockReceipts(mapped);

          // Update warehouse physical stock balances
          const totalUnitsByWh: Record<string, number> = {};
          mapped.forEach((r) => {
            const wid = r.warehouseId;
            if (wid) {
              totalUnitsByWh[wid] = (totalUnitsByWh[wid] || 0) + (r.totalQuantity || 0);
            }
          });
          setWarehouses((prev) =>
            prev.map((w) => {
              if (totalUnitsByWh[w.id] !== undefined) {
                return {
                  ...w,
                  currentStockUnits: totalUnitsByWh[w.id],
                };
              }
              return w;
            })
          );
        } else if (error) {
          console.warn('Supabase stock_cid_receipts fetch notice:', error.message);
        }
      } catch (err) {
        console.warn('Supabase refreshCIDStockReceipts error:', err);
      }
    }
  };

  const refreshCRMAgreements = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('crm_agreements')
          .select('*')
          .order('id', { ascending: false });

        if (!error && Array.isArray(data)) {
          const mapped: CRMLeadAgreement[] = data.map((row: any) => ({
            id: row.deal_code ? String(row.deal_code) : `crm-${row.id}`,
            clientName: row.client_name || row.company_name || 'Corporate Lead',
            companyName: row.company_name || row.client_name || '',
            phone: row.phone || '',
            stage: (row.stage as any) || 'Lead',
            expectedVolumeUnits: Number(row.expected_volume_units) || 100,
            estimatedValueBDT: Number(row.estimated_value_bdt) || 0,
            dealValueBDT: Number(row.deal_value_bdt || row.estimated_value_bdt) || 0,
            contractTermMonths: Number(row.contract_term_months) || 12,
            salespersonId: row.salesperson_id || '',
            salespersonName: row.salesperson_name || 'Tanvir Hossain',
            lastContactDate: row.last_contact_date ? String(row.last_contact_date).substring(0, 10) : new Date().toISOString().substring(0, 10),
            communicationNotes: Array.isArray(row.communication_notes)
              ? row.communication_notes
              : typeof row.communication_notes === 'string'
              ? JSON.parse(row.communication_notes || '[]')
              : [],
          }));
          setCrmAgreements(mapped);
          if (typeof window !== 'undefined') {
            if (mapped.length > 0) {
              localStorage.setItem('ensec_crm_agreements', JSON.stringify(mapped));
            } else {
              localStorage.removeItem('ensec_crm_agreements');
              sessionStorage.removeItem('ensec_crm_agreements');
            }
          }
        }
      } catch (err) {
        console.warn('Supabase refreshCRMAgreements notice:', err);
      }
    }
  };

  const clearCRMAgreementsCache = () => {
    setCrmAgreements([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('ensec_crm_agreements');
        sessionStorage.removeItem('ensec_crm_agreements');
      } catch (e) {}
    }
  };

  const refreshStockTransfers = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('stock_transfers')
          .select('*, stock_transfer_items(*)')
          .order('id', { ascending: false });

        if (!error && Array.isArray(data)) {
          const mapped: StockTransfer[] = data.map((row: any) => {
            const firstItem = (row.stock_transfer_items && row.stock_transfer_items[0]) || {};
            const rawStatus = row.status || 'In Transit';
            let normalizedStatus = rawStatus;
            if (rawStatus === 'Received at Destination' || rawStatus === 'Received & Verified' || rawStatus === 'Completed') {
              normalizedStatus = 'Received';
            } else if (rawStatus === 'Initiated' || rawStatus === 'Pending') {
              normalizedStatus = 'Requested';
            }

            return {
              id: String(row.id),
              transferNumber: row.transfer_number || `TR-${row.id}`,
              date: row.transfer_date ? String(row.transfer_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
              transferDate: row.transfer_date ? String(row.transfer_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
              fromWarehouseId: String(row.source_warehouse_id || ''),
              sourceWarehouseId: String(row.source_warehouse_id || ''),
              fromWarehouseName: row.source_warehouse_name || '',
              sourceWarehouseName: row.source_warehouse_name || '',
              toWarehouseId: String(row.destination_warehouse_id || ''),
              destWarehouseId: String(row.destination_warehouse_id || ''),
              destinationWarehouseId: String(row.destination_warehouse_id || ''),
              toWarehouseName: row.destination_warehouse_name || '',
              destWarehouseName: row.destination_warehouse_name || '',
              destinationWarehouseName: row.destination_warehouse_name || '',
              challanNo: row.challan_number || '',
              challanNumber: row.challan_number || '',
              truckNumber: row.vehicle_number || '',
              driverName: row.driver_name || '',
              driverPhone: row.driver_phone || '',
              totalQuantity: Number(row.total_quantity) || Number(firstItem.quantity) || 0,
              quantity: Number(row.total_quantity) || Number(firstItem.quantity) || 0,
              totalValueBDT: Number(row.total_value_bdt) || 0,
              status: normalizedStatus,
              requestedBy: row.dispatched_by || 'Supply Chain Officer',
              approvedBy: row.dispatched_by,
              receivedBy: row.received_by,
              remarks: row.remarks || '',
              productId: firstItem.product_id ? String(firstItem.product_id) : undefined,
              productName: firstItem.product_name || '',
              batchNumber: firstItem.batch_number || 'GEN-BATCH',
              items: (row.stock_transfer_items || []).map((it: any) => ({
                id: String(it.id),
                productId: it.product_id ? String(it.product_id) : '',
                productName: it.product_name || '',
                batchNumber: it.batch_number || '',
                quantity: Number(it.quantity) || 0,
                unitCostBDT: Number(it.unit_cost_bdt) || 0,
                totalBDT: Number(it.total_bdt) || 0,
              })),
            };
          });

          setStockTransfers(mapped);
          if (typeof window !== 'undefined') {
            localStorage.setItem('ensec_stock_transfers', JSON.stringify(mapped));
          }
        } else if (error) {
          console.warn('Supabase stock_transfers fetch notice:', error.message);
        }
      } catch (err) {
        console.warn('Supabase refreshStockTransfers error:', err);
      }
    }
  };

  const refreshProductionOrders = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('production_orders')
          .select('*')
          .order('id', { ascending: false });

        if (!error && Array.isArray(data)) {
          const mapped: ProductionOrder[] = data.map((row: any) => ({
            id: String(row.id),
            orderNumber: row.order_number || '',
            productId: row.product_id ? String(row.product_id) : undefined,
            productName: row.product_name || '',
            model: row.model || '',
            batchNumber: row.batch_number || '',
            plannedQty: Number(row.planned_qty) || 0,
            completedQty: Number(row.completed_qty) || 0,
            status: row.status || 'In Production',
            startDate: row.start_date || undefined,
            targetDate: row.target_date || undefined,
            manufacturingDate: row.manufacturing_date || undefined,
            date: row.date || row.start_date || undefined,
            shiftManager: row.shift_manager || undefined,
            notes: row.notes || undefined,
            rawMaterialCostBDT: Number(row.raw_material_cost_bdt) || 0,
            conversionCostBDT: Number(row.conversion_cost_bdt) || 0,
            totalProductionCostBDT: Number(row.total_production_cost_bdt) || 0,
            costPerUnitBDT: Number(row.cost_per_unit_bdt) || 0,
            wastagePercent: Number(row.wastage_percent) || 0,
            scrapKg: Number(row.scrap_kg) || 0,
            technicianInCharge: row.shift_manager || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));

          setProductionOrders((prev) => {
            if (mapped.length === 0) return prev;
            const merged = [...mapped];
            prev.forEach((localOrder) => {
              if (!merged.some((m) => m.orderNumber === localOrder.orderNumber || m.id === localOrder.id)) {
                merged.push(localOrder);
              }
            });
            return merged;
          });

          if (typeof window !== 'undefined') {
            localStorage.setItem('ensec_production_orders', JSON.stringify(mapped));
          }
        } else if (error) {
          console.warn('Supabase production_orders fetch notice:', error.message);
        }
      } catch (err) {
        console.warn('Supabase refreshProductionOrders error:', err);
      }
    }
  };

  const refreshAllBasicData = async () => {
    await Promise.allSettled([
      refreshUsers(),
      refreshWarehouses(),
      refreshCIDStockReceipts(),
      refreshStockTransfers(),
      refreshProducts(),
      refreshRawMaterials(),
      refreshBOMs(),
      refreshProductionOrders(),
      refreshRawMaterialCategories(),
      refreshRawMaterialClassifications(),
      refreshProductCategories(),
      refreshProductBrands(),
      refreshCustomerCategories(),
      refreshDistributors(),
      refreshCustomers(),
      refreshOrgHierarchy(),
      refreshDepartments(),
      refreshBanks(),
      refreshUOMs(),
      refreshFieldForce(),
      refreshOffers(),
      refreshSalesOrders(),
      refreshCRMAgreements(),
    ]);
  };

  useEffect(() => {
    // Purge test data Telecom Energy Storage and normalize any remnant products
    setCategories((prev) => prev.filter((c) => (c.name || '').trim().toLowerCase() !== 'telecom energy storage'));
    setProducts((prev) =>
      prev.map((p) =>
        (p.category || '').trim().toLowerCase() === 'telecom energy storage' ? { ...p, category: 'ENPOWER' } : p
      )
    );
    if (typeof window !== 'undefined') {
      try {
        const cachedCats = localStorage.getItem('ensec_product_categories');
        if (cachedCats && cachedCats.includes('Telecom Energy Storage')) {
          localStorage.removeItem('ensec_product_categories');
        }
      } catch {}
    }
    refreshAllBasicData();

    // Setup Supabase Realtime listener for live database synchronization
    const sb = getSupabase();
    let rmcChannel: any = null;
    let clsChannel: any = null;
    let whChannel: any = null;
    let prodChannel: any = null;
    let catChannel: any = null;
    let soChannel: any = null;
    let bomChannel: any = null;
    let poChannel: any = null;

    if (sb && typeof sb.channel === 'function') {
      try {
        poChannel = sb
          .channel('realtime:production_orders')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'production_orders' },
            () => {
              refreshProductionOrders();
            }
          )
          .subscribe();

        bomChannel = sb
          .channel('realtime:bill_of_materials')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'bill_of_materials' },
            () => {
              refreshBOMs();
            }
          )
          .subscribe();

        catChannel = sb
          .channel('realtime:product_categories')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'product_categories' },
            () => {
              refreshProductCategories();
            }
          )
          .subscribe();

        prodChannel = sb
          .channel('realtime:products')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'products' },
            () => {
              refreshProducts();
            }
          )
          .subscribe();
        rmcChannel = sb
          .channel('realtime:raw_material_categories')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'raw_material_categories' },
            (payload: any) => {
              if (payload.eventType === 'INSERT' && payload.new) {
                const row = payload.new;
                const newCat: RawMaterialCategory = {
                  id: String(row.id),
                  code: row.code || '',
                  name: row.name || '',
                  description: row.description || '',
                  status: row.status === 'Inactive' ? 'Inactive' : 'Active',
                  parentClassification: row.parent_classification || row.parentClassification || '',
                };
                setRawMaterialCategories((prev) => {
                  const exists = prev.some((c) => c.id === newCat.id || c.code === newCat.code);
                  if (exists) {
                    return prev.map((c) => (c.id === newCat.id || c.code === newCat.code ? newCat : c));
                  }
                  return [newCat, ...prev];
                });
              } else if (payload.eventType === 'UPDATE' && payload.new) {
                const row = payload.new;
                setRawMaterialCategories((prev) =>
                  prev.map((c) =>
                    c.id === String(row.id) || c.code === row.code
                      ? {
                          ...c,
                          id: String(row.id),
                          code: row.code || c.code,
                          name: row.name || c.name,
                          description: row.description ?? c.description,
                          status: row.status === 'Inactive' ? 'Inactive' : 'Active',
                          parentClassification: row.parent_classification || c.parentClassification || '',
                        }
                      : c
                  )
                );
              } else if (payload.eventType === 'DELETE' && payload.old) {
                const row = payload.old;
                setRawMaterialCategories((prev) =>
                  prev.filter((c) => c.id !== String(row.id) && c.code !== row.code)
                );
              }
            }
          )
          .subscribe();

        clsChannel = sb
          .channel('realtime:raw_material_classifications')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'raw_material_classifications' },
            (payload: any) => {
              if (payload.eventType === 'INSERT' && payload.new) {
                const row = payload.new;
                const newCls: RawMaterialClassification = {
                  id: String(row.id),
                  code: row.code || '',
                  name: row.name || '',
                  description: row.description || '',
                  colorTag: row.color_tag || row.colorTag || 'amber',
                  status: row.status === 'Inactive' ? 'Inactive' : 'Active',
                };
                setRawMaterialClassifications((prev) => {
                  const exists = prev.some((c) => c.id === newCls.id || c.code === newCls.code);
                  if (exists) {
                    return prev.map((c) => (c.id === newCls.id || c.code === newCls.code ? newCls : c));
                  }
                  return [newCls, ...prev];
                });
              } else if (payload.eventType === 'UPDATE' && payload.new) {
                const row = payload.new;
                setRawMaterialClassifications((prev) =>
                  prev.map((c) =>
                    c.id === String(row.id) || c.code === row.code
                      ? {
                          ...c,
                          id: String(row.id),
                          code: row.code || c.code,
                          name: row.name || c.name,
                          description: row.description ?? c.description,
                          colorTag: row.color_tag || row.colorTag || c.colorTag || 'amber',
                          status: row.status === 'Inactive' ? 'Inactive' : 'Active',
                        }
                      : c
                  )
                );
              } else if (payload.eventType === 'DELETE' && payload.old) {
                const row = payload.old;
                setRawMaterialClassifications((prev) =>
                  prev.filter((c) => c.id !== String(row.id) && c.code !== row.code)
                );
              }
            }
          )
          .subscribe();

        whChannel = sb
          .channel('realtime:warehouses')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'warehouses' },
            (payload: any) => {
              if (payload.eventType === 'INSERT' && payload.new) {
                const row = payload.new;
                const newWh: Warehouse = {
                  id: String(row.id),
                  code: row.code || '',
                  name: row.name || '',
                  type: row.type || 'Regional Hub',
                  district: row.district || 'Dhaka',
                  location: row.location || '',
                  managerName: row.manager_name || row.managerName || row.incharge_name || row.inchargeName || '',
                  inchargeName: row.incharge_name || row.inchargeName || row.manager_name || row.managerName || '',
                  phone: row.phone || row.incharge_phone || row.inchargePhone || '',
                  inchargePhone: row.incharge_phone || row.inchargePhone || row.phone || '',
                  email: row.email || undefined,
                  capacityUnits: Number(row.capacity_units ?? row.capacityUnits ?? row.capacity_packs ?? row.capacityPacks) || 0,
                  currentStockUnits: Number(row.current_stock_units ?? row.currentStockUnits ?? row.current_stock_packs ?? row.currentStockPacks) || 0,
                  status: row.status === 'Inactive' ? 'Inactive' : 'Active',
                  description: row.description || '',
                  isFactoryPlant: Boolean(row.is_factory_plant ?? (row.type === 'Factory Plant')),
                };
                setWarehouses((prev) => {
                  const exists = prev.some((w) => w.id === newWh.id || w.code === newWh.code);
                  if (exists) {
                    return prev.map((w) => (w.id === newWh.id || w.code === newWh.code ? newWh : w));
                  }
                  return [...prev, newWh];
                });
              } else if (payload.eventType === 'UPDATE' && payload.new) {
                const row = payload.new;
                setWarehouses((prev) =>
                  prev.map((w) =>
                    w.id === String(row.id) || w.code === row.code
                      ? {
                          ...w,
                          id: String(row.id),
                          code: row.code || w.code,
                          name: row.name || w.name,
                          type: row.type || w.type,
                          district: row.district || w.district,
                          location: row.location ?? w.location,
                          managerName: row.manager_name ?? row.managerName ?? w.managerName,
                          phone: row.phone ?? w.phone,
                          email: row.email ?? w.email,
                          capacityUnits: Number(row.capacity_units ?? row.capacityUnits ?? w.capacityUnits) || 0,
                          currentStockUnits: Number(row.current_stock_units ?? row.currentStockUnits ?? w.currentStockUnits) || 0,
                          status: row.status === 'Inactive' ? 'Inactive' : 'Active',
                          description: row.description ?? w.description,
                        }
                      : w
                  )
                );
              } else if (payload.eventType === 'DELETE' && payload.old) {
                const row = payload.old;
                setWarehouses((prev) =>
                  prev.filter((w) => w.id !== String(row.id) && w.code !== row.code)
                );
              }
            }
          )
          .subscribe();

        soChannel = sb
          .channel('realtime:sales_orders')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'sales_orders' },
            () => {
              refreshSalesOrders();
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Supabase Realtime subscription notice:', err);
      }
    }

    const handleConfigChange = () => {
      refreshAllBasicData();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('ensec-supabase-config-changed', handleConfigChange);
      return () => {
        window.removeEventListener('ensec-supabase-config-changed', handleConfigChange);
        if (rmcChannel && sb && typeof sb.removeChannel === 'function') {
          sb.removeChannel(rmcChannel);
        }
        if (clsChannel && sb && typeof sb.removeChannel === 'function') {
          sb.removeChannel(clsChannel);
        }
        if (whChannel && sb && typeof sb.removeChannel === 'function') {
          sb.removeChannel(whChannel);
        }
        if (prodChannel && sb && typeof sb.removeChannel === 'function') {
          sb.removeChannel(prodChannel);
        }
        if (catChannel && sb && typeof sb.removeChannel === 'function') {
          sb.removeChannel(catChannel);
        }
        if (soChannel && sb && typeof sb.removeChannel === 'function') {
          sb.removeChannel(soChannel);
        }
        if (bomChannel && sb && typeof sb.removeChannel === 'function') {
          sb.removeChannel(bomChannel);
        }
        if (poChannel && sb && typeof sb.removeChannel === 'function') {
          sb.removeChannel(poChannel);
        }
      };
    }
  }, []);

  const addRawMaterialCategory = async (
    catData: Omit<RawMaterialCategory, 'id'>
  ): Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }> => {
    const id = `rmc-${Date.now().toString().slice(-4)}`;
    const newCat: RawMaterialCategory = {
      ...catData,
      id,
    };
    // Optimistically insert at the top of the list for immediate visibility
    setRawMaterialCategories((prev) => [newCat, ...prev.filter((c) => c.code !== newCat.code)]);
    addAuditLog(
      'RAW_MATERIAL_CATEGORY_CREATED',
      'Basic Data Master',
      `Added raw material category ${newCat.name} (${newCat.code})`
    );

    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('raw_material_categories')
          .insert({
            code: newCat.code,
            name: newCat.name,
            parent_classification: newCat.parentClassification || 'Power Electronics & Control',
            description: newCat.description || '',
            status: newCat.status || 'Active',
          })
          .select();

        if (error) {
          console.error('Failed to sync new category to Supabase:', error);
          setRawMaterialCategories((prev) => prev.filter((c) => c.id !== id && c.code !== newCat.code));
          return {
            success: false,
            id,
            error: error.message,
            isRemoteSynced: false,
          };
        } else {
          // Immediately update state with confirmed database record from Supabase
          if (data && data[0]) {
            const confirmedRow = data[0];
            const syncedCat: RawMaterialCategory = {
              id: String(confirmedRow.id),
              code: confirmedRow.code || newCat.code,
              name: confirmedRow.name || newCat.name,
              parentClassification: confirmedRow.parent_classification || newCat.parentClassification || '',
              description: confirmedRow.description || '',
              status: confirmedRow.status === 'Inactive' ? 'Inactive' : 'Active',
            };
            setRawMaterialCategories((prev) => {
              const withoutTemp = prev.filter((c) => c.id !== id && c.code !== syncedCat.code && c.id !== syncedCat.id);
              return [syncedCat, ...withoutTemp];
            });
          }
          await refreshRawMaterialCategories();
          return {
            success: true,
            id: (data && data[0] && String(data[0].id)) || id,
            isRemoteSynced: true,
          };
        }
      } catch (err: any) {
        console.error('Error inserting category into Supabase:', err);
        setRawMaterialCategories((prev) => prev.filter((c) => c.id !== id && c.code !== newCat.code));
        return {
          success: false,
          id,
          error: err.message || 'Network exception',
          isRemoteSynced: false,
        };
      }
    }

    return {
      success: true,
      id,
      isRemoteSynced: false,
      error: 'Supabase credentials are not connected yet. Saved locally.',
    };
  };

  const updateRawMaterialCategory = async (
    catId: string,
    updates: Partial<RawMaterialCategory>
  ): Promise<{ success: boolean; error?: string }> => {
    setRawMaterialCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, ...updates } : c))
    );
    addAuditLog(
      'RAW_MATERIAL_CATEGORY_UPDATED',
      'Basic Data Master',
      `Updated raw material category ${catId}`
    );

    const sb = getSupabase();
    if (sb) {
      try {
        const payload: any = {};
        if (updates.code) payload.code = updates.code;
        if (updates.name) payload.name = updates.name;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.status) payload.status = updates.status;
        if (updates.parentClassification) payload.parent_classification = updates.parentClassification;

        const isNumeric = /^\d+$/.test(catId);
        const query = isNumeric
          ? sb.from('raw_material_categories').update(payload).eq('id', Number(catId))
          : sb.from('raw_material_categories').update(payload).eq('code', catId);

        const { error } = await query;
        if (error) {
          console.error('Failed to update category in Supabase:', error);
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  };

  const deleteRawMaterialCategory = async (catId: string): Promise<{ success: boolean; error?: string }> => {
    const target = rawMaterialCategories.find((c) => c.id === catId);
    setRawMaterialCategories((prev) => prev.filter((c) => c.id !== catId));
    addAuditLog(
      'RAW_MATERIAL_CATEGORY_DELETED',
      'Basic Data Master',
      `Deleted raw material category ${target?.name || catId}`
    );

    const sb = getSupabase();
    if (sb) {
      try {
        const isNumeric = /^\d+$/.test(catId);
        const query = isNumeric
          ? sb.from('raw_material_categories').delete().eq('id', Number(catId))
          : sb.from('raw_material_categories').delete().eq('code', target?.code || catId);

        const { error } = await query;
        if (error) {
          console.error('Failed to delete category in Supabase:', error);
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  };

  const toggleRawMaterialCategoryStatus = async (catId: string): Promise<{ success: boolean; error?: string }> => {
    const target = rawMaterialCategories.find((c) => c.id === catId);
    const nextStatus = target?.status === 'Active' ? 'Inactive' : 'Active';

    setRawMaterialCategories((prev) =>
      prev.map((c) =>
        c.id === catId ? { ...c, status: nextStatus } : c
      )
    );
    addAuditLog(
      'RAW_MATERIAL_CATEGORY_STATUS_TOGGLED',
      'Basic Data Master',
      `Toggled status for raw material category ${catId}`
    );

    const sb = getSupabase();
    if (sb) {
      try {
        const isNumeric = /^\d+$/.test(catId);
        const query = isNumeric
          ? sb.from('raw_material_categories').update({ status: nextStatus }).eq('id', Number(catId))
          : sb.from('raw_material_categories').update({ status: nextStatus }).eq('code', target?.code || catId);

        const { error } = await query;
        if (error) {
          console.error('Failed to toggle category status in Supabase:', error);
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  };

  const addRawMaterialClassification = async (
    data: Omit<RawMaterialClassification, 'id'>
  ): Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }> => {
    const id = `cls-${Date.now().toString().slice(-4)}`;
    const newCls: RawMaterialClassification = {
      ...data,
      id,
    };
    setRawMaterialClassifications((prev) => {
      const next = [newCls, ...prev.filter((c) => c.code !== newCls.code && c.name !== newCls.name)];
      if (typeof window !== 'undefined') {
        localStorage.setItem('ensec_rm_classifications', JSON.stringify(next));
      }
      return next;
    });
    addAuditLog(
      'RAW_MATERIAL_CLASSIFICATION_CREATED',
      'Basic Data Master',
      `Added raw material classification ${newCls.name} (${newCls.code})`
    );

    const sb = getSupabase();
    if (sb) {
      try {
        const { data: sbData, error } = await sb
          .from('raw_material_classifications')
          .insert({
            code: newCls.code,
            name: newCls.name,
            description: newCls.description || '',
            color_tag: newCls.colorTag || 'amber',
            status: newCls.status || 'Active',
          })
          .select();

        if (error) {
          console.warn('Supabase table raw_material_classifications insert warning:', error.message);
          // Rollback optimistic update if remote insert failed
          setRawMaterialClassifications((prev) => prev.filter((c) => c.id !== id && c.code !== newCls.code));
          return {
            success: false,
            id,
            error: error.message,
            isRemoteSynced: false,
          };
        } else {
          if (sbData && sbData[0]) {
            const confirmedRow = sbData[0];
            const syncedCls: RawMaterialClassification = {
              id: String(confirmedRow.id),
              code: confirmedRow.code || newCls.code,
              name: confirmedRow.name || newCls.name,
              description: confirmedRow.description || '',
              colorTag: confirmedRow.color_tag || newCls.colorTag || 'amber',
              status: confirmedRow.status === 'Inactive' ? 'Inactive' : 'Active',
            };
            setRawMaterialClassifications((prev) => {
              const next = [syncedCls, ...prev.filter((c) => c.id !== id && c.code !== syncedCls.code && c.id !== syncedCls.id)];
              if (typeof window !== 'undefined') {
                localStorage.setItem('ensec_rm_classifications', JSON.stringify(next));
              }
              return next;
            });
            await refreshRawMaterialClassifications();
          }
          return {
            success: true,
            id: (sbData && sbData[0] && String(sbData[0].id)) || id,
            isRemoteSynced: true,
          };
        }
      } catch (err: any) {
        setRawMaterialClassifications((prev) => prev.filter((c) => c.id !== id && c.code !== newCls.code));
        return {
          success: false,
          id,
          error: err.message,
          isRemoteSynced: false,
        };
      }
    }

    return {
      success: true,
      id,
      isRemoteSynced: false,
    };
  };

  const updateRawMaterialClassification = async (
    clsId: string,
    updates: Partial<RawMaterialClassification>
  ): Promise<{ success: boolean; error?: string }> => {
    let oldName = '';
    setRawMaterialClassifications((prev) => {
      const target = prev.find((c) => c.id === clsId);
      if (target) oldName = target.name;
      const next = prev.map((c) => (c.id === clsId ? { ...c, ...updates } : c));
      if (typeof window !== 'undefined') {
        localStorage.setItem('ensec_rm_classifications', JSON.stringify(next));
      }
      return next;
    });

    // If classification name changed, also update any rawMaterialCategories referencing it
    if (updates.name && oldName && updates.name !== oldName) {
      setRawMaterialCategories((prev) =>
        prev.map((cat) =>
          cat.parentClassification === oldName
            ? { ...cat, parentClassification: updates.name }
            : cat
        )
      );
    }

    addAuditLog(
      'RAW_MATERIAL_CLASSIFICATION_UPDATED',
      'Basic Data Master',
      `Updated raw material classification ${clsId}`
    );

    const sb = getSupabase();
    if (sb) {
      try {
        const payload: any = {};
        if (updates.code) payload.code = updates.code;
        if (updates.name) payload.name = updates.name;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.colorTag) payload.color_tag = updates.colorTag;
        if (updates.status) payload.status = updates.status;

        const isNumeric = /^\d+$/.test(clsId);
        const query = isNumeric
          ? sb.from('raw_material_classifications').update(payload).eq('id', Number(clsId))
          : sb.from('raw_material_classifications').update(payload).eq('code', clsId);

        const { error } = await query;
        if (error) {
          console.warn('Supabase update classification warning:', error.message);
          return { success: false, error: error.message };
        }
        await refreshRawMaterialClassifications();
      } catch (err: any) {
        console.warn('Supabase update classification warning:', err);
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  };

  const deleteRawMaterialClassification = async (
    clsId: string
  ): Promise<{ success: boolean; error?: string }> => {
    setRawMaterialClassifications((prev) => {
      const next = prev.filter((c) => c.id !== clsId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ensec_rm_classifications', JSON.stringify(next));
      }
      return next;
    });

    const sb = getSupabase();
    if (sb) {
      try {
        const isNumeric = /^\d+$/.test(clsId);
        const query = isNumeric
          ? sb.from('raw_material_classifications').delete().eq('id', Number(clsId))
          : sb.from('raw_material_classifications').delete().eq('code', clsId);
        const { error } = await query;
        if (error) {
          console.warn('Supabase delete classification warning:', error.message);
        } else {
          await refreshRawMaterialClassifications();
        }
      } catch (err: any) {
        console.warn('Supabase delete classification warning:', err);
      }
    }
    return { success: true };
  };

  const toggleRawMaterialClassificationStatus = async (
    clsId: string
  ): Promise<{ success: boolean; error?: string }> => {
    const target = rawMaterialClassifications.find((c) => c.id === clsId);
    const nextStatus = target?.status === 'Active' ? 'Inactive' : 'Active';
    return updateRawMaterialClassification(clsId, { status: nextStatus });
  };

  const addImportOrder = (order: Omit<ImportPurchaseOrder, 'id'>) => {
    const id = `imp-${Date.now().toString().slice(-4)}`;
    const newOrder: ImportPurchaseOrder = {
      ...order,
      id,
    };
    setImportOrders((prev) => [newOrder, ...prev]);
    addAuditLog('IMPORT_ORDER_CREATED', 'Raw Material Import', `Created PO ${newOrder.poNumber} from ${newOrder.supplierName} with total landed cost BDT ${newOrder.totalLandedCostBDT.toLocaleString()}`);
  };

  const updateImportOrderStatus = (orderId: string, status: ImportPurchaseOrder['status']) => {
    setImportOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          // If status changes to 'Received Kushtia', increment Kushtia raw material stock & post to Optimum ledger
          if (status === 'Received Kushtia' && o.status !== 'Received Kushtia') {
            o.items.forEach((item) => {
              setRawMaterials((rmList) =>
                rmList.map((rm) => (rm.id === item.materialId ? { ...rm, stockKushtia: rm.stockKushtia + item.quantity } : rm))
              );
            });
            // Post 50% Optimum Share to Optimum Statement
            const optShare = o.optimumContributionBDT;
            const lastEntry = optimumStatement[optimumStatement.length - 1];
            const prevBal = lastEntry ? lastEntry.runningBalanceBDT : 0;
            const newOptEntry: OptimumStatementEntry = {
              id: `opt-st-${Date.now()}`,
              date: new Date().toISOString().substring(0, 10),
              reference: o.poNumber,
              type: 'Raw Material Share',
              description: `Optimum 50% Raw Material cost share on received import shipment ${o.poNumber}`,
              debitBDT: optShare,
              creditBDT: 0,
              runningBalanceBDT: prevBal + optShare,
              status: 'Posted',
            };
            setOptimumStatement((optPrev) => [...optPrev, newOptEntry]);
            addAuditLog('IMPORT_RECEIVED_KUSHTIA', 'Manufacturing Plant', `Received raw materials for PO ${o.poNumber} at Kushtia plant. Stock updated.`);
          }
          return { ...o, status };
        }
        return o;
      })
    );
  };

  // Basic Data / Finished Products CRUD with Supabase Sync
  const addProduct = async (
    prodData: Omit<Product, 'id'>
  ): Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }> => {
    const tempId = `p-${Date.now().toString().slice(-4)}`;
    let defaultCode = prodData.code?.trim();
    if (!defaultCode) {
      let maxNum = 0;
      for (const p of products) {
        if (!p?.code) continue;
        const match = p.code.trim().toUpperCase().match(/^FG-?(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
      defaultCode = `FG${String(maxNum + 1).padStart(5, '0')}`;
    }
    const newProduct: Product = {
      ...prodData,
      code: defaultCode,
      id: tempId,
    };
    // Optimistic local state update
    setProducts((prev) => [newProduct, ...prev.filter((p) => p.code !== newProduct.code)]);

    // update category count
    if (newProduct.category) {
      setCategories((prev) =>
        prev.map((c) => (c.name === newProduct.category ? { ...c, productCount: (c.productCount || 0) + 1 } : c))
      );
    }
    // update brand count
    if (newProduct.brand) {
      setBrands((prev) =>
        prev.map((b) => (b.name === newProduct.brand ? { ...b, productCount: (b.productCount || 0) + 1 } : b))
      );
    }
    addAuditLog('PRODUCT_CREATED', 'Basic Data Master', `Created finished product ${newProduct.name} (${newProduct.code}) in ${newProduct.category}`);

    const sb = getSupabase();
    if (!sb) {
      return {
        success: true,
        id: tempId,
        isRemoteSynced: false,
        error: 'Supabase client is not connected or credentials are not configured.',
      };
    }

    try {
      const voltage = Number(newProduct.voltageV) || 51.2;
      const capacity = Number(newProduct.capacityAh) || 86;
      const energyWh = Number(newProduct.energyKWh ? newProduct.energyKWh * 1000 : voltage * capacity) || 4403.2;
      const fullPayload: any = {
        code: (newProduct.code || `ENS-${Date.now()}`).trim(),
        name: newProduct.name.trim(),
        model: (newProduct.model || newProduct.code).trim(),
        brand: (newProduct.brand || 'Ensec Lithium BD').trim(),
        category: (newProduct.category || 'Electric Vehicle (EV) Batteries').trim(),
        nominal_voltage: voltage,
        capacity_ah: capacity,
        energy_wh: energyWh,
        battery_type: newProduct.batteryType || 'LiFePO4',
        chemistry: newProduct.chemistry || (newProduct.batteryType === 'LiFePO4' ? 'Lifepo4' : newProduct.batteryType),
        normal_voltage: newProduct.normalVoltage || `${voltage}V`,
        rated_capacity: newProduct.ratedCapacity || `${voltage}V${capacity}Ah`,
        cycle_life: newProduct.cycleLife || '>4000',
        typical_capacity_kwh: newProduct.typicalCapacityKWh || `${(energyWh / 1000).toFixed(2)}KWH`,
        max_charge_current: newProduct.maxChargeCurrent || '50A',
        standard_charging: newProduct.standardCharging || 'CC/CV, 0.5C, 58.4V.',
        max_discharge_current: newProduct.maxDischargeCurrent || '120A/150A/200A',
        weight_kg: newProduct.weightKg || '40KG (±)2%',
        dimension_cm: newProduct.dimensionCm || '50*36*26',
        operating_temperature: newProduct.operatingTemperature || '0-60°C',
        mileage_km: newProduct.mileageKm || '80-90KM with Full Charge.',
        trade_price_bdt: Number(newProduct.distributorPriceBDT) || 0,
        distributor_price_bdt: Number(newProduct.distributorPriceBDT) || 0,
        dealer_price_bdt: Number(newProduct.dealerPriceBDT) || 0,
        corporate_price_bdt: Number(newProduct.corporatePriceBDT) || 0,
        project_price_bdt: Number(newProduct.projectPriceBDT) || 0,
        retail_price_bdt: Number(newProduct.retailPriceBDT) || 0,
        mrp_bdt: Number(newProduct.retailPriceBDT) || 0,
        assembly_cost_estimate_bdt: Number(newProduct.assemblyCostEstimateBDT) || 0,
        category_prices: newProduct.categoryPrices || {},
        warranty_months: Number(newProduct.warrantyMonths) || 36,
        stock_quantity: Number((newProduct as any).stockQuantity) || 0,
        unit: newProduct.unit || 'Units',
        bom: Array.isArray(newProduct.bom) ? newProduct.bom : [],
        status: newProduct.status || 'Active',
      };

      // Perform upsert on code
      let insertRes = await sb.from('products').upsert(fullPayload, { onConflict: 'code' }).select();

      // If insert failed due to missing extended columns (e.g. before schema migration is run on remote DB), retry with core columns
      if (insertRes.error && insertRes.error.message && insertRes.error.message.includes('column')) {
        console.warn('Retrying product upsert with baseline schema columns:', insertRes.error.message);
        const corePayload = {
          code: fullPayload.code,
          name: fullPayload.name,
          model: fullPayload.model,
          brand: fullPayload.brand,
          category: fullPayload.category,
          nominal_voltage: voltage,
          capacity_ah: capacity,
          energy_wh: energyWh,
          trade_price_bdt: fullPayload.trade_price_bdt,
          mrp_bdt: fullPayload.mrp_bdt,
          warranty_months: fullPayload.warranty_months,
          stock_quantity: 0,
          status: fullPayload.status,
        };
        insertRes = await sb.from('products').upsert(corePayload, { onConflict: 'code' }).select();
      }

      if (insertRes.error) {
        console.error('Supabase products insert/upsert error:', insertRes.error);
        return {
          success: false,
          id: tempId,
          error: insertRes.error.message,
          isRemoteSynced: false,
        };
      }

      const remoteId = insertRes.data && insertRes.data[0] ? String(insertRes.data[0].id) : tempId;
      if (remoteId !== tempId) {
        setProducts((prev) =>
          prev.map((p) => (p.id === tempId ? { ...p, id: remoteId } : p))
        );
      }
      await refreshProducts();
      return {
        success: true,
        id: remoteId,
        isRemoteSynced: true,
      };
    } catch (err: any) {
      console.error('Exception syncing product to Supabase:', err);
      return {
        success: false,
        id: tempId,
        error: err?.message || 'Network exception syncing to Supabase',
        isRemoteSynced: false,
      };
    }
  };

  const updateProduct = async (
    productId: string,
    updates: Partial<Product>
  ): Promise<{ success: boolean; error?: string }> => {
    const target = products.find((p) => p.id === productId);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updates } : p))
    );
    addAuditLog('PRODUCT_UPDATED', 'Basic Data Master', `Updated product specifications for ${productId}`);

    const sb = getSupabase();
    if (!sb) {
      return { success: true };
    }

    try {
      const payload: any = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.code !== undefined) payload.code = updates.code;
      if (updates.model !== undefined) payload.model = updates.model;
      if (updates.brand !== undefined) payload.brand = updates.brand;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.batteryType !== undefined) payload.battery_type = updates.batteryType;
      if (updates.chemistry !== undefined) payload.chemistry = updates.chemistry;
      if (updates.voltageV !== undefined) payload.nominal_voltage = Number(updates.voltageV);
      if (updates.capacityAh !== undefined) payload.capacity_ah = Number(updates.capacityAh);
      if (updates.normalVoltage !== undefined) payload.normal_voltage = updates.normalVoltage;
      if (updates.ratedCapacity !== undefined) payload.rated_capacity = updates.ratedCapacity;
      if (updates.cycleLife !== undefined) payload.cycle_life = updates.cycleLife;
      if (updates.typicalCapacityKWh !== undefined) payload.typical_capacity_kwh = updates.typicalCapacityKWh;
      if (updates.maxChargeCurrent !== undefined) payload.max_charge_current = updates.maxChargeCurrent;
      if (updates.standardCharging !== undefined) payload.standard_charging = updates.standardCharging;
      if (updates.maxDischargeCurrent !== undefined) payload.max_discharge_current = updates.maxDischargeCurrent;
      if (updates.weightKg !== undefined) payload.weight_kg = updates.weightKg;
      if (updates.dimensionCm !== undefined) payload.dimension_cm = updates.dimensionCm;
      if (updates.operatingTemperature !== undefined) payload.operating_temperature = updates.operatingTemperature;
      if (updates.mileageKm !== undefined) payload.mileage_km = updates.mileageKm;
      if (updates.distributorPriceBDT !== undefined) {
        payload.distributor_price_bdt = Number(updates.distributorPriceBDT);
        payload.trade_price_bdt = Number(updates.distributorPriceBDT);
      }
      if (updates.dealerPriceBDT !== undefined) payload.dealer_price_bdt = Number(updates.dealerPriceBDT);
      if (updates.corporatePriceBDT !== undefined) payload.corporate_price_bdt = Number(updates.corporatePriceBDT);
      if (updates.projectPriceBDT !== undefined) payload.project_price_bdt = Number(updates.projectPriceBDT);
      if (updates.retailPriceBDT !== undefined) {
        payload.retail_price_bdt = Number(updates.retailPriceBDT);
        payload.mrp_bdt = Number(updates.retailPriceBDT);
      }
      if (updates.assemblyCostEstimateBDT !== undefined) payload.assembly_cost_estimate_bdt = Number(updates.assemblyCostEstimateBDT);
      if (updates.warrantyMonths !== undefined) payload.warranty_months = Number(updates.warrantyMonths);
      if (updates.unit !== undefined) payload.unit = updates.unit;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.categoryPrices !== undefined) payload.category_prices = updates.categoryPrices;
      if (updates.bom !== undefined) payload.bom = updates.bom;

      const isNumeric = /^\d+$/.test(productId);
      const query = isNumeric
        ? sb.from('products').update(payload).eq('id', Number(productId))
        : sb.from('products').update(payload).eq('code', target?.code || updates.code || productId);

      const { error } = await query;
      if (error) {
        console.error('Supabase products update error:', error);
        return { success: false, error: error.message };
      } else {
        await refreshProducts();
        return { success: true };
      }
    } catch (err: any) {
      console.error('Exception updating product in Supabase:', err);
      return { success: false, error: err?.message || 'Error updating product' };
    }
  };

  const deleteProduct = async (
    productId: string
  ): Promise<{ success: boolean; error?: string }> => {
    const target = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    addAuditLog('PRODUCT_DELETED', 'Basic Data Master', `Deleted finished product ${target?.name || productId}`);

    const sb = getSupabase();
    if (!sb) {
      return { success: true };
    }

    try {
      const isNumeric = /^\d+$/.test(productId);
      const query = isNumeric
        ? sb.from('products').delete().eq('id', Number(productId))
        : sb.from('products').delete().eq('code', target?.code || productId);

      const { error } = await query;
      if (error) {
        console.error('Supabase products delete error:', error);
        return { success: false, error: error.message };
      } else {
        await refreshProducts();
        return { success: true };
      }
    } catch (err: any) {
      console.error('Exception deleting product in Supabase:', err);
      return { success: false, error: err?.message || 'Error deleting product' };
    }
  };

  const syncAllProductsToSupabase = async (): Promise<{ success: boolean; syncedCount: number; error?: string }> => {
    const sb = getSupabase();
    if (!sb) {
      return { success: false, syncedCount: 0, error: 'Supabase client is not connected or configured.' };
    }

    try {
      let count = 0;
      for (const p of products) {
        const voltage = Number(p.voltageV) || 51.2;
        const capacity = Number(p.capacityAh) || 86;
        const energyWh = Number(p.energyKWh ? p.energyKWh * 1000 : voltage * capacity) || 4403.2;

        const payload: any = {
          code: (p.code || `ENS-${p.name}`).trim(),
          name: p.name.trim(),
          model: (p.model || p.code || p.name).trim(),
          brand: (p.brand || 'Ensec Lithium BD').trim(),
          category: (p.category || 'Electric Vehicle (EV) Batteries').trim(),
          nominal_voltage: voltage,
          capacity_ah: capacity,
          energy_wh: energyWh,
          battery_type: p.batteryType || 'LiFePO4',
          chemistry: p.chemistry || (p.batteryType === 'LiFePO4' ? 'Lifepo4' : p.batteryType),
          normal_voltage: p.normalVoltage || `${voltage}V`,
          rated_capacity: p.ratedCapacity || `${voltage}V${capacity}Ah`,
          cycle_life: p.cycleLife || '>4000',
          typical_capacity_kwh: p.typicalCapacityKWh || `${(energyWh / 1000).toFixed(2)}KWH`,
          max_charge_current: p.maxChargeCurrent || '50A',
          standard_charging: p.standardCharging || 'CC/CV, 0.5C, 58.4V.',
          max_discharge_current: p.maxDischargeCurrent || '120A/150A/200A',
          weight_kg: p.weightKg || '40KG (±)2%',
          dimension_cm: p.dimensionCm || '50*36*26',
          operating_temperature: p.operatingTemperature || '0-60°C',
          mileage_km: p.mileageKm || '80-90KM with Full Charge.',
          trade_price_bdt: Number(p.distributorPriceBDT) || 0,
          distributor_price_bdt: Number(p.distributorPriceBDT) || 0,
          dealer_price_bdt: Number(p.dealerPriceBDT) || 0,
          corporate_price_bdt: Number(p.corporatePriceBDT) || 0,
          project_price_bdt: Number(p.projectPriceBDT) || 0,
          retail_price_bdt: Number(p.retailPriceBDT) || 0,
          mrp_bdt: Number(p.retailPriceBDT) || 0,
          assembly_cost_estimate_bdt: Number(p.assemblyCostEstimateBDT) || 0,
          category_prices: p.categoryPrices || {},
          warranty_months: Number(p.warrantyMonths) || 36,
          stock_quantity: Number((p as any).stockQuantity) || 0,
          unit: p.unit || 'Units',
          bom: Array.isArray(p.bom) ? p.bom : [],
          status: p.status || 'Active',
        };

        const { error } = await sb.from('products').upsert(payload, { onConflict: 'code' });
        if (!error) {
          count++;
        } else {
          console.warn(`Product ${p.code} upsert warning:`, error.message);
        }
      }

      await refreshProducts();
      return { success: true, syncedCount: count };
    } catch (err: any) {
      console.error('syncAllProductsToSupabase error:', err);
      return { success: false, syncedCount: 0, error: err?.message || 'Failed to sync products' };
    }
  };

  // Product Categories CRUD
  const addCategory = async (
    catData: Omit<ProductCategory, 'id'>
  ): Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }> => {
    const tempId = `cat-${Date.now().toString().slice(-4)}`;
    const newCat: ProductCategory = {
      ...catData,
      id: tempId,
      productCount: 0,
    };
    setCategories((prev) => [...prev, newCat]);
    addAuditLog('CATEGORY_CREATED', 'Basic Data Master', `Added product category ${newCat.name} (${newCat.code})`);

    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('product_categories')
          .insert({
            code: newCat.code,
            name: newCat.name,
            description: newCat.description || '',
            status: newCat.status || 'Active',
            product_count: 0,
          })
          .select();

        if (error) {
          console.error('Supabase product_categories insert failed:', error);
          setCategories((prev) => prev.filter((c) => c.id !== tempId));
          return { success: false, id: tempId, error: error.message, isRemoteSynced: false };
        } else {
          await refreshProductCategories();
          const savedId = (data && data[0] && String(data[0].id)) || tempId;
          return { success: true, id: savedId, isRemoteSynced: true };
        }
      } catch (err: any) {
        console.error('Error inserting product category into Supabase:', err);
        setCategories((prev) => prev.filter((c) => c.id !== tempId));
        return { success: false, id: tempId, error: err.message || 'Network exception', isRemoteSynced: false };
      }
    }

    return { success: true, id: tempId, isRemoteSynced: false, error: 'Supabase credentials are not connected yet. Saved locally.' };
  };

  const updateCategory = async (
    catId: string,
    updates: Partial<ProductCategory>
  ): Promise<{ success: boolean; error?: string }> => {
    const target = categories.find((c) => c.id === catId);
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, ...updates } : c))
    );
    addAuditLog('CATEGORY_UPDATED', 'Basic Data Master', `Updated category ${catId}`);

    const sb = getSupabase();
    if (sb) {
      try {
        const payload: any = { updated_at: new Date().toISOString() };
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.code !== undefined) payload.code = updates.code;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.status !== undefined) payload.status = updates.status;

        const isNumeric = /^\d+$/.test(catId);
        const query = isNumeric
          ? sb.from('product_categories').update(payload).eq('id', Number(catId))
          : sb.from('product_categories').update(payload).eq('code', target?.code || catId);

        const { error } = await query;
        if (error) {
          console.error('Failed to update category in Supabase:', error);
          return { success: false, error: error.message };
        }
        await refreshProductCategories();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  };

  const deleteCategory = async (catId: string): Promise<{ success: boolean; error?: string }> => {
    const target = categories.find((c) => c.id === catId);
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    addAuditLog('CATEGORY_DELETED', 'Basic Data Master', `Deleted category ${target?.name || catId}`);

    const sb = getSupabase();
    if (sb) {
      try {
        const isNumeric = /^\d+$/.test(catId);
        const query = isNumeric
          ? sb.from('product_categories').delete().eq('id', Number(catId))
          : sb.from('product_categories').delete().eq('code', target?.code || catId);

        const { error } = await query;
        if (error) {
          console.error('Failed to delete category in Supabase:', error);
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  };

  const syncAllCategoriesToSupabase = async (
    itemsToSync?: ProductCategory[]
  ): Promise<{ success: boolean; syncedCount: number; error?: string }> => {
    const sb = getSupabase();
    if (!sb) {
      return { success: false, syncedCount: 0, error: 'Supabase client is not connected.' };
    }
    try {
      const sourceList = itemsToSync && itemsToSync.length > 0 ? itemsToSync : categories;
      let count = 0;
      for (const c of sourceList) {
        const payload = {
          code: c.code.trim(),
          name: c.name.trim(),
          description: c.description || '',
          status: c.status || 'Active',
          product_count: c.productCount || 0,
        };
        const { error } = await sb.from('product_categories').upsert(payload, { onConflict: 'code' });
        if (!error) count++;
      }
      await refreshProductCategories();
      return { success: true, syncedCount: count };
    } catch (err: any) {
      console.error('syncAllCategoriesToSupabase error:', err);
      return { success: false, syncedCount: 0, error: err?.message || 'Sync failed' };
    }
  };

  // Product Brands CRUD
  const addBrand = async (
    brandData: Omit<ProductBrand, 'id'>
  ): Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }> => {
    const tempId = `brd-${Date.now().toString().slice(-4)}`;
    const newBrand: ProductBrand = {
      ...brandData,
      id: tempId,
      productCount: 0,
    };
    setBrands((prev) => [...prev, newBrand]);
    addAuditLog('BRAND_CREATED', 'Basic Data Master', `Added brand ${newBrand.name} (${newBrand.code})`);

    const sb = getSupabase();
    if (sb) {
      try {
        let insertPayload: any = {
          code: newBrand.code,
          name: newBrand.name,
          origin: newBrand.origin || 'Bangladesh',
          category: newBrand.category || '',
          tagline: newBrand.tagline || '',
          status: newBrand.status || 'Active',
          product_count: 0,
        };

        let { data, error } = await sb
          .from('product_brands')
          .insert(insertPayload)
          .select();

        // Handle case where category column does not exist yet on Supabase product_brands table
        if (error && (error.message?.toLowerCase().includes('category') || error.details?.toLowerCase().includes('category'))) {
          console.warn('Supabase product_brands table lacks category column. Retrying insert without category...');
          delete insertPayload.category;
          const fallback = await sb
            .from('product_brands')
            .insert(insertPayload)
            .select();
          data = fallback.data;
          error = fallback.error;
        }

        if (error) {
          console.error('Supabase product_brands insert failed:', error);
          setBrands((prev) => prev.filter((b) => b.id !== tempId));
          return { success: false, id: tempId, error: error.message, isRemoteSynced: false };
        } else {
          await refreshProductBrands();
          const savedId = (data && data[0] && String(data[0].id)) || tempId;
          return { success: true, id: savedId, isRemoteSynced: true };
        }
      } catch (err: any) {
        console.error('Error inserting brand into Supabase:', err);
        setBrands((prev) => prev.filter((b) => b.id !== tempId));
        return { success: false, id: tempId, error: err.message || 'Network exception', isRemoteSynced: false };
      }
    }

    return { success: true, id: tempId, isRemoteSynced: false, error: 'Supabase credentials are not connected yet. Saved locally.' };
  };

  const updateBrand = async (
    brandId: string,
    updates: Partial<ProductBrand>
  ): Promise<{ success: boolean; error?: string }> => {
    const target = brands.find((b) => b.id === brandId);
    setBrands((prev) =>
      prev.map((b) => (b.id === brandId ? { ...b, ...updates } : b))
    );
    addAuditLog('BRAND_UPDATED', 'Basic Data Master', `Updated brand ${brandId}`);

    const sb = getSupabase();
    if (sb) {
      try {
        const payload: any = { updated_at: new Date().toISOString() };
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.code !== undefined) payload.code = updates.code;
        if (updates.origin !== undefined) payload.origin = updates.origin;
        if (updates.category !== undefined) payload.category = updates.category;
        if (updates.tagline !== undefined) payload.tagline = updates.tagline;
        if (updates.status !== undefined) payload.status = updates.status;

        const isNumeric = /^\d+$/.test(brandId);
        const query = isNumeric
          ? sb.from('product_brands').update(payload).eq('id', Number(brandId))
          : sb.from('product_brands').update(payload).eq('code', target?.code || brandId);

        let { error } = await query;

        // If error occurred because 'category' column does not exist yet on Supabase product_brands table
        if (error && (error.message?.toLowerCase().includes('category') || error.details?.toLowerCase().includes('category')) && payload.category !== undefined) {
          console.warn('Supabase product_brands table is missing the "category" column. Retrying update without category column...');
          const fallbackPayload = { ...payload };
          delete fallbackPayload.category;
          const fallbackQuery = isNumeric
            ? sb.from('product_brands').update(fallbackPayload).eq('id', Number(brandId))
            : sb.from('product_brands').update(fallbackPayload).eq('code', target?.code || brandId);

          const fallbackRes = await fallbackQuery;
          if (fallbackRes.error) {
            console.error('Failed to update brand in Supabase:', fallbackRes.error);
            return { success: false, error: fallbackRes.error.message };
          }

          // Make sure local state keeps the updated category
          setBrands((prev) =>
            prev.map((b) => (b.id === brandId ? { ...b, ...updates } : b))
          );

          return {
            success: true,
            error: 'Updated locally. Please add "category" column to product_brands in Supabase: ALTER TABLE public.product_brands ADD COLUMN IF NOT EXISTS category TEXT;'
          };
        }

        if (error) {
          console.error('Failed to update brand in Supabase:', error);
          return { success: false, error: error.message };
        }
        await refreshProductBrands();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  };

  const deleteBrand = async (brandId: string): Promise<{ success: boolean; error?: string }> => {
    const target = brands.find((b) => b.id === brandId);
    setBrands((prev) => prev.filter((b) => b.id !== brandId));
    addAuditLog('BRAND_DELETED', 'Basic Data Master', `Deleted brand ${target?.name || brandId}`);

    const sb = getSupabase();
    if (sb) {
      try {
        const isNumeric = /^\d+$/.test(brandId);
        const query = isNumeric
          ? sb.from('product_brands').delete().eq('id', Number(brandId))
          : sb.from('product_brands').delete().eq('code', target?.code || brandId);

        const { error } = await query;
        if (error) {
          console.error('Failed to delete brand in Supabase:', error);
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  };

  // Departments CRUD
  const addDepartment = async (
    deptData: Omit<Department, 'id'>
  ): Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }> => {
    const tempId = `dept-${Date.now().toString().slice(-4)}`;
    const full = deptData.fullName || `${deptData.code} - ${deptData.name}`;
    const newDept: Department = {
      ...deptData,
      id: tempId,
      fullName: full,
      memberCount: deptData.memberCount ?? 0,
      createdAt: deptData.createdAt || new Date().toISOString().substring(0, 10),
    };
    setDepartments((prev) => [...prev, newDept]);
    addAuditLog('DEPARTMENT_CREATED', 'Basic Data Master', `Added department ${newDept.name} (${newDept.code})`);

    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('departments')
          .insert({
            code: newDept.code,
            name: newDept.name,
            full_name: newDept.fullName,
            division: newDept.division || '',
            head_of_department: newDept.headOfDepartment || '',
            email: newDept.email || '',
            phone: newDept.phone || '',
            location: newDept.location || '',
            description: newDept.description || '',
            member_count: newDept.memberCount || 0,
            status: newDept.status || 'Active',
          })
          .select();

        if (error) {
          console.error('Supabase departments insert failed:', error);
          setDepartments((prev) => prev.filter((d) => d.id !== tempId));
          return { success: false, id: tempId, error: error.message, isRemoteSynced: false };
        } else {
          await refreshDepartments();
          const savedId = (data && data[0] && String(data[0].id)) || tempId;
          return { success: true, id: savedId, isRemoteSynced: true };
        }
      } catch (err: any) {
        console.error('Error inserting department into Supabase:', err);
        setDepartments((prev) => prev.filter((d) => d.id !== tempId));
        return { success: false, id: tempId, error: err.message || 'Network exception', isRemoteSynced: false };
      }
    }

    return { success: true, id: tempId, isRemoteSynced: false, error: 'Supabase credentials are not connected yet. Saved locally.' };
  };

  const updateDepartment = async (
    deptId: string,
    updates: Partial<Department>
  ): Promise<{ success: boolean; error?: string }> => {
    const target = departments.find((d) => d.id === deptId);
    setDepartments((prev) =>
      prev.map((d) => {
        if (d.id === deptId) {
          const next = { ...d, ...updates };
          if (updates.code || updates.name) {
            next.fullName = `${next.code} - ${next.name}`;
          }
          return next;
        }
        return d;
      })
    );
    addAuditLog('DEPARTMENT_UPDATED', 'Basic Data Master', `Updated department ${deptId}`);

    const sb = getSupabase();
    if (sb) {
      try {
        const payload: any = { updated_at: new Date().toISOString() };
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.code !== undefined) payload.code = updates.code;
        if (updates.fullName !== undefined) payload.full_name = updates.fullName;
        if (updates.division !== undefined) payload.division = updates.division;
        if (updates.headOfDepartment !== undefined) payload.head_of_department = updates.headOfDepartment;
        if (updates.email !== undefined) payload.email = updates.email;
        if (updates.phone !== undefined) payload.phone = updates.phone;
        if (updates.location !== undefined) payload.location = updates.location;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.status !== undefined) payload.status = updates.status;

        const isNumeric = /^\d+$/.test(deptId);
        const query = isNumeric
          ? sb.from('departments').update(payload).eq('id', Number(deptId))
          : sb.from('departments').update(payload).eq('code', target?.code || deptId);

        const { error } = await query;
        if (error) {
          console.error('Failed to update department in Supabase:', error);
          return { success: false, error: error.message };
        }
        await refreshDepartments();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  };

  const deleteDepartment = async (deptId: string): Promise<{ success: boolean; error?: string }> => {
    const target = departments.find((d) => d.id === deptId);
    setDepartments((prev) => prev.filter((d) => d.id !== deptId));
    addAuditLog('DEPARTMENT_DELETED', 'Basic Data Master', `Deleted department ${target?.name || deptId}`);

    const sb = getSupabase();
    if (sb) {
      try {
        const isNumeric = /^\d+$/.test(deptId);
        const query = isNumeric
          ? sb.from('departments').delete().eq('id', Number(deptId))
          : sb.from('departments').delete().eq('code', target?.code || deptId);

        const { error } = await query;
        if (error) {
          console.error('Failed to delete department in Supabase:', error);
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  };

  // Banks CRUD
  const addBank = async (
    bankData: Omit<Bank, 'id'>
  ): Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }> => {
    const tempId = `bank-${Date.now().toString().slice(-4)}`;
    const newBank: Bank = {
      ...bankData,
      id: tempId,
    };
    setBanks((prev) => [newBank, ...prev]);
    addAuditLog('BANK_CREATED', 'Basic Data Master', `Created bank account ${newBank.code} - ${newBank.name}`);

    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('banks')
          .insert({
            code: newBank.code,
            name: newBank.name,
            native_name: newBank.nativeName || null,
            account_no: newBank.accountNo,
            branch_name: newBank.branchName,
            is_active: newBank.isActive !== false,
          })
          .select();

        if (error) {
          console.error('Supabase banks insert failed:', error);
          setBanks((prev) => prev.filter((b) => b.id !== tempId));
          return { success: false, id: tempId, error: error.message, isRemoteSynced: false };
        } else {
          await refreshBanks();
          const savedId = (data && data[0] && String(data[0].id)) || tempId;
          return { success: true, id: savedId, isRemoteSynced: true };
        }
      } catch (err: any) {
        console.error('Error inserting bank into Supabase:', err);
        setBanks((prev) => prev.filter((b) => b.id !== tempId));
        return { success: false, id: tempId, error: err.message || 'Network exception', isRemoteSynced: false };
      }
    }

    return { success: true, id: tempId, isRemoteSynced: false, error: 'Supabase credentials are not connected yet. Saved locally.' };
  };

  const updateBank = async (
    bankId: string,
    updates: Partial<Bank>
  ): Promise<{ success: boolean; error?: string }> => {
    const target = banks.find((b) => b.id === bankId || b.code === bankId);
    setBanks((prev) =>
      prev.map((b) => (b.id === bankId || b.code === bankId ? { ...b, ...updates } : b))
    );
    addAuditLog('BANK_UPDATED', 'Basic Data Master', `Updated bank account ${bankId}`);

    const sb = getSupabase();
    if (sb) {
      try {
        const payload: any = { updated_at: new Date().toISOString() };
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.code !== undefined) payload.code = updates.code;
        if (updates.nativeName !== undefined) payload.native_name = updates.nativeName;
        if (updates.accountNo !== undefined) payload.account_no = updates.accountNo;
        if (updates.branchName !== undefined) payload.branch_name = updates.branchName;
        if (updates.isActive !== undefined) payload.is_active = updates.isActive;

        const isNumeric = /^\d+$/.test(bankId);
        const query = isNumeric
          ? sb.from('banks').update(payload).eq('id', Number(bankId))
          : sb.from('banks').update(payload).eq('code', target?.code || bankId);

        const { error } = await query;
        if (error) {
          console.error('Failed to update bank in Supabase:', error);
          return { success: false, error: error.message };
        }
        await refreshBanks();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  };

  const deleteBank = async (bankId: string): Promise<{ success: boolean; error?: string }> => {
    const target = banks.find((b) => b.id === bankId || b.code === bankId);
    setBanks((prev) => prev.filter((b) => b.id !== bankId && b.code !== bankId));
    addAuditLog('BANK_DELETED', 'Basic Data Master', `Deleted bank account ${target?.name || bankId}`);

    const sb = getSupabase();
    if (sb) {
      try {
        const isNumeric = /^\d+$/.test(bankId);
        const query = isNumeric
          ? sb.from('banks').delete().eq('id', Number(bankId))
          : sb.from('banks').delete().eq('code', target?.code || bankId);

        const { error } = await query;
        if (error) {
          console.error('Failed to delete bank in Supabase:', error);
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  };

  // Units of Measurement CRUD
  const addUOM = async (
    uomData: Omit<UnitOfMeasurement, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }> => {
    const tempId = `uom-${Date.now().toString().slice(-4)}`;
    const newUOM: UnitOfMeasurement = {
      ...uomData,
      id: tempId,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setUoms((prev) => [newUOM, ...prev]);
    addAuditLog(
      'UOM_CREATED',
      'Basic Data Master',
      `Created Unit of Measurement ${newUOM.code} - ${newUOM.name} (${newUOM.applicableTo})`
    );

    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('units_of_measurement')
          .insert({
            code: newUOM.code,
            name: newUOM.name,
            symbol: newUOM.symbol,
            native_name: newUOM.nativeName || null,
            applicable_to: newUOM.applicableTo || 'Both',
            category: newUOM.category || 'Discrete Count',
            is_base_unit: Boolean(newUOM.isBaseUnit),
            allow_decimals: Boolean(newUOM.allowDecimals),
            decimal_places: Number(newUOM.decimalPlaces) || 0,
            standard_packaging_rate: Number(newUOM.standardPackagingRate) || 1,
            description: newUOM.description || '',
            is_active: newUOM.isActive !== false,
          })
          .select();

        if (error) {
          console.error('Supabase units_of_measurement insert failed:', error);
          setUoms((prev) => prev.filter((u) => u.id !== tempId));
          return { success: false, id: tempId, error: error.message, isRemoteSynced: false };
        } else {
          await refreshUOMs();
          const savedId = (data && data[0] && String(data[0].id)) || tempId;
          return { success: true, id: savedId, isRemoteSynced: true };
        }
      } catch (err: any) {
        console.error('Error inserting UOM into Supabase:', err);
        setUoms((prev) => prev.filter((u) => u.id !== tempId));
        return { success: false, id: tempId, error: err.message || 'Network exception', isRemoteSynced: false };
      }
    }

    return { success: true, id: tempId, isRemoteSynced: false, error: 'Supabase credentials are not connected yet. Saved locally.' };
  };

  const updateUOM = async (
    uomId: string,
    updates: Partial<UnitOfMeasurement>
  ): Promise<{ success: boolean; error?: string }> => {
    const target = uoms.find((u) => u.id === uomId || u.code === uomId);
    setUoms((prev) =>
      prev.map((u) =>
        u.id === uomId || u.code === uomId
          ? { ...u, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
          : u
      )
    );
    addAuditLog('UOM_UPDATED', 'Basic Data Master', `Updated Unit of Measurement ${uomId}`);

    const sb = getSupabase();
    if (sb) {
      try {
        const payload: any = { updated_at: new Date().toISOString() };
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.code !== undefined) payload.code = updates.code;
        if (updates.symbol !== undefined) payload.symbol = updates.symbol;
        if (updates.nativeName !== undefined) payload.native_name = updates.nativeName;
        if (updates.applicableTo !== undefined) payload.applicable_to = updates.applicableTo;
        if (updates.category !== undefined) payload.category = updates.category;
        if (updates.isBaseUnit !== undefined) payload.is_base_unit = updates.isBaseUnit;
        if (updates.allowDecimals !== undefined) payload.allow_decimals = updates.allowDecimals;
        if (updates.decimalPlaces !== undefined) payload.decimal_places = updates.decimalPlaces;
        if (updates.standardPackagingRate !== undefined) payload.standard_packaging_rate = updates.standardPackagingRate;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.isActive !== undefined) payload.is_active = updates.isActive;

        const isNumeric = /^\d+$/.test(uomId);
        const query = isNumeric
          ? sb.from('units_of_measurement').update(payload).eq('id', Number(uomId))
          : sb.from('units_of_measurement').update(payload).eq('code', target?.code || uomId);

        const { error } = await query;
        if (error) {
          console.error('Failed to update UOM in Supabase:', error);
          return { success: false, error: error.message };
        }
        await refreshUOMs();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  };

  const deleteUOM = async (uomId: string): Promise<{ success: boolean; error?: string }> => {
    const target = uoms.find((u) => u.id === uomId || u.code === uomId);
    setUoms((prev) => prev.filter((u) => u.id !== uomId && u.code !== uomId));
    addAuditLog('UOM_DELETED', 'Basic Data Master', `Deleted Unit of Measurement ${target?.name || uomId}`);

    const sb = getSupabase();
    if (sb) {
      try {
        const isNumeric = /^\d+$/.test(uomId);
        const query = isNumeric
          ? sb.from('units_of_measurement').delete().eq('id', Number(uomId))
          : sb.from('units_of_measurement').delete().eq('code', target?.code || uomId);

        const { error } = await query;
        if (error) {
          console.error('Failed to delete UOM in Supabase:', error);
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  };

  // Org Hierarchy Supabase CRUD
  const saveOrgNode = async (
    node: OrgNode,
    parentId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const sb = getSupabase();
    if (sb) {
      try {
        const payload: any = {
          node_id: node.id,
          code: node.code,
          name: node.name,
          type: node.type,
          parent_id: parentId || node.parentId || null,
          head_person: node.headPerson || null,
          phone: node.phone || null,
          notes: node.notes || null,
          tagged_distributor_ids: node.taggedDistributorIds || [],
          tagged_customer_ids: node.taggedCustomerIds || [],
          tagged_field_force_ids: node.taggedFieldForceIds || [],
          updated_at: new Date().toISOString(),
        };

        const { error } = await sb
          .from('org_hierarchy')
          .upsert(payload, { onConflict: 'node_id' });

        if (error) {
          console.error('Supabase org_hierarchy save failed:', error);
          return { success: false, error: error.message };
        }
        await refreshOrgHierarchy();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  };

  const deleteOrgNode = async (nodeId: string): Promise<{ success: boolean; error?: string }> => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { error } = await sb.from('org_hierarchy').delete().eq('node_id', nodeId);
        if (error) {
          console.error('Supabase org_hierarchy delete failed:', error);
          return { success: false, error: error.message };
        }
        await refreshOrgHierarchy();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  };

  // Stage 2 & 3: Manufacturing & Kushtia Plant
  const createProductionOrder = async (
    order: Partial<ProductionOrder> & Omit<ProductionOrder, 'id' | 'completedQty'>
  ): Promise<{ success: boolean; id?: string; error?: string }> => {
    // 1. Calculate sequential order number (e.g. PR-KUS-2026-325, PR-KUS-2026-326)
    let orderNumber = order.orderNumber?.trim();
    let batchNumber = order.batchNumber?.trim();
    let nextSeq = 325;

    if (!orderNumber || !batchNumber) {
      let maxSeq = 324;
      productionOrders.forEach((po) => {
        const match = (po.orderNumber || '').match(/PR-KUS-2026-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxSeq) {
            maxSeq = num;
          }
        }
      });
      nextSeq = maxSeq + 1;
      if (!orderNumber) {
        orderNumber = `PR-KUS-2026-${String(nextSeq).padStart(3, '0')}`;
      }
      if (!batchNumber) {
        const batchSuffix = String(nextSeq >= 300 ? nextSeq - 300 : nextSeq).padStart(2, '0');
        batchNumber = `KUS-B2610-${batchSuffix}`;
      }
    }

    const tempId = `pr-${Date.now()}`;
    const plannedQty = Number(order.plannedQty) || 0;
    const rawMaterialCostBDT = Number(order.rawMaterialCostBDT) || 0;
    const conversionCostBDT = Number(order.conversionCostBDT) || 0;
    const totalProductionCostBDT = Number(order.totalProductionCostBDT) || (rawMaterialCostBDT + conversionCostBDT);
    const costPerUnitBDT = Number(order.costPerUnitBDT) || (plannedQty > 0 ? Math.round(totalProductionCostBDT / plannedQty) : 0);
    const wastagePercent = Number(order.wastagePercent) || 0;
    const scrapKg = Number(order.scrapKg) || 0;
    const orderDate = order.date || order.manufacturingDate || new Date().toISOString().substring(0, 10);

    const newOrder: ProductionOrder = {
      ...order,
      id: tempId,
      orderNumber,
      batchNumber,
      plannedQty,
      completedQty: 0,
      status: order.status || 'In Production',
      date: orderDate,
      manufacturingDate: order.manufacturingDate || orderDate,
      startDate: order.startDate || orderDate,
      rawMaterialCostBDT,
      conversionCostBDT,
      totalProductionCostBDT,
      costPerUnitBDT,
      wastagePercent,
      scrapKg,
    };

    // Immediate optimistic local state update for zero-latency UI
    setProductionOrders((prev) => [newOrder, ...prev.filter((o) => o.orderNumber !== orderNumber && o.id !== tempId)]);
    if (typeof window !== 'undefined') {
      try {
        const currentOrders = JSON.parse(localStorage.getItem('ensec_production_orders') || '[]');
        const updated = [newOrder, ...(Array.isArray(currentOrders) ? currentOrders.filter((o: any) => o.orderNumber !== orderNumber) : [])];
        localStorage.setItem('ensec_production_orders', JSON.stringify(updated));
      } catch {}
    }

    addAuditLog(
      'PRODUCTION_ORDER_SCHEDULED',
      'Manufacturing Plant',
      `Scheduled batch ${batchNumber} for ${newOrder.productName} (Qty: ${plannedQty}) at Kushtia Factory with Order No ${orderNumber}.`
    );

    // 2. Persist to Supabase database
    const sb = getSupabase();
    if (sb) {
      try {
        let dbProductId: number | null = null;
        if (order.productId && /^\d+$/.test(String(order.productId))) {
          dbProductId = Number(order.productId);
        } else {
          const targetProd = products.find(
            (p) => p.id === order.productId || p.name === order.productName || p.model === order.model
          );
          if (targetProd && /^\d+$/.test(String(targetProd.id))) {
            dbProductId = Number(targetProd.id);
          }
        }

        // Validate foreign key constraint against products table
        if (dbProductId !== null) {
          const { data: pCheck } = await sb.from('products').select('id').eq('id', dbProductId).limit(1);
          if (!pCheck || pCheck.length === 0) {
            dbProductId = null;
          }
        }

        const payload: any = {
          order_number: orderNumber,
          product_name: newOrder.productName || 'ENPOWER Battery',
          model: newOrder.model || '60V170Ah',
          batch_number: batchNumber,
          planned_qty: plannedQty,
          completed_qty: 0,
          status: newOrder.status || 'In Production',
          date: orderDate,
          start_date: newOrder.startDate || orderDate,
          manufacturing_date: newOrder.manufacturingDate || orderDate,
          shift_manager: newOrder.shiftManager || newOrder.technicianInCharge || 'Production In-Charge',
          notes: newOrder.notes || '',
          raw_material_cost_bdt: rawMaterialCostBDT,
          conversion_cost_bdt: conversionCostBDT,
          total_production_cost_bdt: totalProductionCostBDT,
          cost_per_unit_bdt: costPerUnitBDT,
          wastage_percent: wastagePercent,
          scrap_kg: scrapKg,
        };

        if (dbProductId !== null) {
          payload.product_id = dbProductId;
        }

        let { data, error } = await sb.from('production_orders').insert(payload).select();

        // If error occurred due to product_id foreign key constraint, retry with null product_id
        if (error && (error.code === '23503' || error.message?.includes('product_id'))) {
          delete payload.product_id;
          const retry = await sb.from('production_orders').insert(payload).select();
          data = retry.data;
          error = retry.error;
        }

        if (error) {
          console.error('Supabase production_orders insert error:', error);
          return { success: false, error: error.message };
        }

        if (data && data[0]) {
          const remoteId = String(data[0].id);
          setProductionOrders((prev) =>
            prev.map((o) => (o.orderNumber === orderNumber || o.id === tempId ? { ...o, id: remoteId } : o))
          );
          if (typeof window !== 'undefined') {
            try {
              const currentOrders = JSON.parse(localStorage.getItem('ensec_production_orders') || '[]');
              if (Array.isArray(currentOrders)) {
                const updated = currentOrders.map((o: any) =>
                  o.orderNumber === orderNumber || o.id === tempId ? { ...o, id: remoteId } : o
                );
                localStorage.setItem('ensec_production_orders', JSON.stringify(updated));
              }
            } catch {}
          }
          return { success: true, id: remoteId };
        }
      } catch (err: any) {
        console.error('Supabase createProductionOrder exception:', err);
        return { success: false, error: err?.message };
      }
    }

    return { success: true, id: tempId };
  };

  const completeProductionOrder = async (orderId: string): Promise<{ success: boolean; error?: string }> => {
    let completedOrderNumber = orderId;
    let completedPlannedQty = 0;

    setProductionOrders((prev) =>
      prev.map((order) => {
        if ((order.id === orderId || order.orderNumber === orderId) && order.status !== 'Completed' && order.status !== 'Transferred') {
          completedOrderNumber = order.orderNumber || order.id;
          completedPlannedQty = order.plannedQty;
          const product = products.find((p) => p.id === order.productId);
          if (product) {
            // 1. Deduct raw materials consumed based on BOM * plannedQty
            product.bom.forEach((bomItem) => {
              const consumed = bomItem.requiredQty * order.plannedQty;
              setRawMaterials((rmList) =>
                rmList.map((rm) => (rm.id === bomItem.materialId ? { ...rm, stockKushtia: Math.max(0, rm.stockKushtia - consumed) } : rm))
              );
            });

            // 2. Add finished goods to Kushtia warehouse
            setWarehouses((whList) =>
              whList.map((wh) => (wh.id === 'wh-kushtia' ? { ...wh, currentStockUnits: wh.currentStockUnits + order.plannedQty } : wh))
            );

            // 3. Post to Stock Ledger
            const newLedger: StockLedgerEntry = {
              id: `sl-${Date.now()}`,
              date: new Date().toISOString().substring(0, 10),
              warehouseId: 'wh-kushtia',
              warehouseName: 'Kushtia Manufacturing Plant & Factory Store',
              productId: order.productId,
              productName: order.productName,
              batchNumber: order.batchNumber,
              transactionType: 'Production Receive',
              referenceNo: order.orderNumber,
              qtyIn: order.plannedQty,
              qtyOut: 0,
              balanceQty: order.plannedQty,
              unitCostBDT: order.costPerUnitBDT,
              totalCostBDT: order.totalProductionCostBDT,
            };
            setStockLedger((slPrev) => [newLedger, ...slPrev]);

            // 4. Update Optimum Statement with Kushtia Conversion / Assembly Fee
            const lastOpt = optimumStatement[optimumStatement.length - 1];
            const prevBal = lastOpt ? lastOpt.runningBalanceBDT : 0;
            const newOptEntry: OptimumStatementEntry = {
              id: `opt-st-${Date.now()}`,
              date: new Date().toISOString().substring(0, 10),
              reference: order.orderNumber,
              type: 'Manufacturing Conversion Cost',
              description: `Optimum Kushtia Factory conversion & assembly fee for ${order.plannedQty} units ${order.model}`,
              debitBDT: order.conversionCostBDT,
              creditBDT: 0,
              runningBalanceBDT: prevBal + order.conversionCostBDT,
              status: 'Posted',
            };
            setOptimumStatement((optPrev) => [...optPrev, newOptEntry]);

            addAuditLog(
              'PRODUCTION_COMPLETED',
              'Kushtia Manufacturing Plant',
              `Completed production batch ${order.batchNumber}. ${order.plannedQty} finished batteries added to Kushtia stock. Raw materials deducted per BOM.`
            );
          }
          return { ...order, status: 'Completed', completedQty: order.plannedQty };
        }
        return order;
      })
    );

    // Sync status to Supabase
    const sb = getSupabase();
    if (sb) {
      try {
        const updatePayload: any = {
          status: 'Completed',
          completed_qty: completedPlannedQty,
          updated_at: new Date().toISOString(),
        };
        const isNumeric = /^\d+$/.test(orderId);
        if (isNumeric) {
          await sb.from('production_orders').update(updatePayload).eq('id', Number(orderId));
        } else {
          await sb.from('production_orders').update(updatePayload).eq('order_number', completedOrderNumber);
        }
        return { success: true };
      } catch (e: any) {
        console.warn('Supabase completeProductionOrder notice:', e);
        return { success: false, error: e?.message };
      }
    }
    return { success: true };
  };

  const updateProductBOM = async (productId: string, bom: Product['bom']): Promise<{ success: boolean; error?: string }> => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return { ...p, bom };
        }
        return p;
      })
    );
    addAuditLog('BOM_UPDATED', 'Bill of Materials', `Updated BOM component specifications for product ID ${productId}`);

    const sb = getSupabase();
    if (!sb) return { success: true };

    try {
      const isNumeric = /^\d+$/.test(productId);
      const target = products.find((p) => p.id === productId);
      const query = isNumeric
        ? sb.from('products').update({ bom, updated_at: new Date().toISOString() }).eq('id', Number(productId))
        : sb.from('products').update({ bom, updated_at: new Date().toISOString() }).eq('code', target?.code || productId);

      const { error } = await query;
      if (error) {
        console.warn('updateProductBOM database warning:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.error('updateProductBOM error:', err);
      return { success: false, error: err?.message };
    }
  };

  // ============================================================================
  // ENSEC v29 UPGRADE: RAW MATERIAL RECEIVING, BATCH TRACKING & PRODUCTION COSTING
  // ============================================================================

  const addRawMaterialReceipt = async (
    receiptData: Omit<RawMaterialReceipt, 'id' | 'createdAt'>
  ): Promise<{ success: boolean; grnNumber: string; batches: InventoryBatch[] }> => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const grnSeq = Math.floor(1000 + Math.random() * 9000);
    const grnNumber = receiptData.grnNumber?.trim() || `GRN-${year}-${grnSeq}`;
    const receiptId = `grn-${Date.now()}`;

    const newBatches: InventoryBatch[] = [];
    const newMovements: InventoryMovement[] = [];
    const processedItems: RawMaterialReceiptItem[] = [];

    receiptData.items.forEach((item, idx) => {
      const batchSeq = Math.floor(100 + Math.random() * 900);
      const batchNumber = item.batchNumber?.trim() || `RM-BATCH-${year}${month}-${batchSeq}-${idx + 1}`;
      const batchBarcode = item.batchBarcode?.trim() || `BC-BATCH-${year.toString().slice(-2)}${month}-${batchSeq}${idx + 1}`;

      const newBatch: InventoryBatch = {
        id: `batch-${Date.now()}-${idx}`,
        batchNumber,
        batchBarcode,
        materialId: item.materialId,
        materialCode: item.materialCode,
        materialName: item.materialName,
        unit: item.unit,
        supplierId: receiptData.supplierId,
        supplierName: receiptData.supplierName,
        purchaseDate: receiptData.receiveDate || new Date().toISOString().substring(0, 10),
        unitPurchaseRate: Number(item.unitPurchaseRate) || 0,
        receivedQty: Number(item.receivedQty) || 0,
        issuedQty: 0,
        availableQty: Number(item.receivedQty) || 0,
        warehouseId: item.warehouseId || receiptData.warehouseId,
        warehouseName: receiptData.warehouseName,
        status: 'Active',
        grnRef: grnNumber,
        poRef: receiptData.poReference,
        invoiceRef: receiptData.invoiceReference,
        remarks: item.remarks || receiptData.remarks,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      newBatches.push(newBatch);

      const newMovement: InventoryMovement = {
        id: `mov-${Date.now()}-${idx}`,
        date: receiptData.receiveDate || new Date().toISOString().substring(0, 10),
        materialId: item.materialId,
        materialCode: item.materialCode,
        materialName: item.materialName,
        batchNumber,
        batchBarcode,
        movementType: 'RECEIPT',
        quantity: Number(item.receivedQty),
        unitCostBDT: Number(item.unitPurchaseRate),
        totalValueBDT: Number(item.totalPurchaseValue),
        referenceNo: grnNumber,
        targetWarehouseId: item.warehouseId || receiptData.warehouseId,
        targetWarehouseName: receiptData.warehouseName,
        performedBy: receiptData.receivedBy || currentUser.name,
        notes: `GRN Inward from ${receiptData.supplierName}. PO: ${receiptData.poReference || 'N/A'}`,
        balanceAfter: Number(item.receivedQty),
        createdAt: new Date().toISOString(),
      };
      newMovements.push(newMovement);

      processedItems.push({
        ...item,
        id: `grni-${Date.now()}-${idx}`,
        batchNumber,
        batchBarcode,
      });

      // Update aggregate raw material stock while preserving batch-level immutability
      setRawMaterials((prevRms) =>
        prevRms.map((rm) => {
          if (rm.id === item.materialId || rm.code === item.materialCode) {
            const currentStock = Number(rm.stockKushtia || 0);
            const addedStock = Number(item.receivedQty || 0);
            return {
              ...rm,
              stockKushtia: currentStock + addedStock,
              totalAvailableStock: (Number(rm.totalAvailableStock || currentStock)) + addedStock,
              lastPurchaseUnitCostBDT: Number(item.unitPurchaseRate) || rm.lastPurchaseUnitCostBDT,
              updatedAt: new Date().toISOString(),
            };
          }
          return rm;
        })
      );
    });

    const fullReceipt: RawMaterialReceipt = {
      ...receiptData,
      id: receiptId,
      grnNumber,
      items: processedItems,
      createdAt: new Date().toISOString(),
    };

    setRawMaterialReceipts((prev) => [fullReceipt, ...prev]);
    setInventoryBatches((prev) => [...newBatches, ...prev]);
    setInventoryMovements((prev) => [...newMovements, ...prev]);

    addAuditLog(
      'RAW_MATERIAL_RECEIVED_GRN',
      receiptData.warehouseName,
      `Received GRN ${grnNumber} from ${receiptData.supplierName}. Generated ${newBatches.length} inventory batches with barcodes.`
    );

    return { success: true, grnNumber, batches: newBatches };
  };

  const issueMaterialsForProduction = async (issueData: {
    productionOrderId: string;
    productionOrderNumber: string;
    warehouseId: string;
    warehouseName: string;
    issuedBy: string;
    items: {
      materialId: string;
      batchNumber: string;
      quantity: number;
      isFifoOverride?: boolean;
      overrideReason?: string;
    }[];
    notes?: string;
  }): Promise<{ success: boolean; issueNumber?: string; error?: string }> => {
    const year = new Date().getFullYear();
    const issueSeq = Math.floor(100 + Math.random() * 900);
    const issueNumber = `MI-KUS-${year}-${issueSeq}`;
    const issueDate = new Date().toISOString().substring(0, 10);

    const updatedBatches = [...inventoryBatches];

    // Ensure all requested batches exist or are dynamically registered for this production order
    for (const reqItem of issueData.items) {
      let batch = updatedBatches.find(
        (b) => b.batchNumber === reqItem.batchNumber || b.id === reqItem.batchNumber
      );
      if (!batch) {
        const rm = rawMaterials.find(
          (m) => String(m.id) === String(reqItem.materialId) || m.code === reqItem.materialId
        );
        const avail = Math.max(rm?.stockKushtia || 0, reqItem.quantity, 100);
        batch = {
          id: `batch-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          batchNumber: reqItem.batchNumber || `KUS-B2610-${issueData.productionOrderNumber?.replace(/\D/g, '').slice(-2) || '01'}`,
          batchBarcode: `BC-${Date.now().toString().slice(-6)}`,
          materialId: String(rm?.id || reqItem.materialId),
          materialCode: rm?.code || 'RM',
          materialName: rm?.name || 'Raw Material',
          unit: rm?.unit || 'PCS',
          supplierId: 'SUP-KUSHTIA',
          supplierName: 'Kushtia Factory Store',
          purchaseDate: issueDate,
          unitPurchaseRate: rm?.lastPurchaseUnitCostBDT || rm?.standardCostBDT || 0,
          receivedQty: avail,
          issuedQty: 0,
          availableQty: avail,
          warehouseId: issueData.warehouseId || 'WH-KUSHTIA',
          warehouseName: issueData.warehouseName || 'Kushtia Assembly Plant',
          status: 'Active',
        };
        updatedBatches.push(batch);
      }
      if (batch.availableQty < reqItem.quantity) {
        batch.availableQty = reqItem.quantity;
      }
    }

    const issueLineItems: MaterialIssueItem[] = [];
    const newMovements: InventoryMovement[] = [];
    const newConsumptions: ProductionConsumption[] = [];
    let totalMaterialCost = 0;
    let totalIssuedQty = 0;

    for (const reqItem of issueData.items) {
      const batchIndex = updatedBatches.findIndex(
        (b) => b.batchNumber === reqItem.batchNumber || b.id === reqItem.batchNumber
      );
      const batch = updatedBatches[batchIndex];
      const newAvail = batch.availableQty - reqItem.quantity;
      const newIssued = batch.issuedQty + reqItem.quantity;
      const itemCost = reqItem.quantity * batch.unitPurchaseRate;
      totalMaterialCost += itemCost;
      totalIssuedQty += reqItem.quantity;

      updatedBatches[batchIndex] = {
        ...batch,
        availableQty: newAvail,
        issuedQty: newIssued,
        status: newAvail === 0 ? 'Depleted' : 'Active',
        updatedAt: new Date().toISOString(),
      };

      issueLineItems.push({
        id: `mii-${Date.now()}-${issueLineItems.length}`,
        materialId: batch.materialId,
        materialCode: batch.materialCode,
        materialName: batch.materialName,
        batchNumber: batch.batchNumber,
        batchBarcode: batch.batchBarcode,
        unit: batch.unit,
        requestedQty: reqItem.quantity,
        issuedQty: reqItem.quantity,
        unitCostBDT: batch.unitPurchaseRate,
        totalMaterialCostBDT: itemCost,
        isFifoOverride: reqItem.isFifoOverride,
        overrideReason: reqItem.overrideReason,
      });

      newMovements.push({
        id: `mov-${Date.now()}-${newMovements.length}`,
        date: issueDate,
        materialId: batch.materialId,
        materialCode: batch.materialCode,
        materialName: batch.materialName,
        batchNumber: batch.batchNumber,
        batchBarcode: batch.batchBarcode,
        movementType: 'PRODUCTION_CONSUMPTION',
        quantity: -reqItem.quantity,
        unitCostBDT: batch.unitPurchaseRate,
        totalValueBDT: itemCost,
        referenceNo: issueData.productionOrderNumber,
        sourceWarehouseId: issueData.warehouseId,
        sourceWarehouseName: issueData.warehouseName,
        performedBy: issueData.issuedBy,
        notes: `Issued to ${issueData.productionOrderNumber}${reqItem.isFifoOverride ? ` [FIFO Override: ${reqItem.overrideReason}]` : ''}`,
        balanceAfter: newAvail,
        createdAt: new Date().toISOString(),
      });

      newConsumptions.push({
        id: `pcns-${Date.now()}-${newConsumptions.length}`,
        productionOrderId: issueData.productionOrderId,
        productionOrderNumber: issueData.productionOrderNumber,
        materialId: batch.materialId,
        materialCode: batch.materialCode,
        materialName: batch.materialName,
        batchNumber: batch.batchNumber,
        batchBarcode: batch.batchBarcode,
        quantity: reqItem.quantity,
        unitCostBDT: batch.unitPurchaseRate,
        totalCostBDT: itemCost,
        date: issueDate,
        issuedBy: issueData.issuedBy,
      });

      // Deduct from rawMaterials stock
      setRawMaterials((prevRms) =>
        prevRms.map((rm) =>
          rm.id === batch.materialId || rm.code === batch.materialCode
            ? {
                ...rm,
                stockKushtia: Math.max(0, (rm.stockKushtia || 0) - reqItem.quantity),
                totalAvailableStock: Math.max(0, (rm.totalAvailableStock || 0) - reqItem.quantity),
              }
            : rm
        )
      );
    }

    const newIssue: MaterialIssue = {
      id: `mi-${Date.now()}`,
      issueNumber,
      productionOrderId: issueData.productionOrderId,
      productionOrderNumber: issueData.productionOrderNumber,
      issueDate,
      warehouseId: issueData.warehouseId,
      warehouseName: issueData.warehouseName,
      issuedBy: issueData.issuedBy,
      department: 'Manufacturing & Assembly',
      status: 'Issued',
      items: issueLineItems,
      totalIssuedQty,
      totalMaterialCostBDT: totalMaterialCost,
      notes: issueData.notes,
      createdAt: new Date().toISOString(),
    };

    setInventoryBatches(updatedBatches);
    setMaterialIssues((prev) => [newIssue, ...prev]);
    setInventoryMovements((prev) => [...newMovements, ...prev]);
    setProductionConsumptions((prev) => [...newConsumptions, ...prev]);

    // Automatically recalculate production order raw material cost from actual consumed batch rates
    setProductionOrders((prevOrders) =>
      prevOrders.map((po) => {
        if (po.id === issueData.productionOrderId || po.orderNumber === issueData.productionOrderNumber) {
          const updatedRMCost = (po.rawMaterialCostBDT || 0) + totalMaterialCost;
          const convCost = po.conversionCostBDT || 0;
          const totalCost = updatedRMCost + convCost;
          const costPerUnit = Math.round(totalCost / (po.plannedQty || 1));
          return {
            ...po,
            rawMaterialCostBDT: updatedRMCost,
            totalProductionCostBDT: totalCost,
            costPerUnitBDT: costPerUnit,
          };
        }
        return po;
      })
    );

    addAuditLog(
      'MATERIAL_ISSUED_FOR_PRODUCTION',
      issueData.warehouseName,
      `Issued ${totalIssuedQty} units of raw materials (BDT ${totalMaterialCost.toLocaleString()}) to ${issueData.productionOrderNumber}. Traceable to specific purchase batches.`
    );

    return { success: true, issueNumber };
  };

  const formatCurrency = (amount: number): string => {
    return `BDT ${Number(amount || 0).toLocaleString('en-BD')}`;
  };

  const saveProductionCost = (costRecord: ProductionCostRecord) => {
    setProductionCosts((prev) => [
      costRecord,
      ...prev.filter((c) => c.productionOrderId !== costRecord.productionOrderId),
    ]);

    setProductionOrders((prev) =>
      prev.map((po) =>
        po.id === costRecord.productionOrderId
          ? {
              ...po,
              rawMaterialCostBDT: costRecord.rawMaterialCostBDT,
              optimumLaborCostBDT: costRecord.directLabourCostBDT,
              factoryOverheadBDT: costRecord.factoryOverheadCostBDT,
              totalProductionCostBDT: costRecord.totalProductionCostBDT,
              costPerUnitBDT: Math.round(costRecord.unitProductionCostBDT),
            }
          : po
      )
    );
  };

  const addExpenseEntry = (
    data: Omit<
      ExpenseEntry,
      'id' | 'voucherNumber' | 'approvalStatus' | 'allocationStatus' | 'allocatedAmount' | 'remainingUnallocated' | 'createdAt'
    >
  ): string => {
    const year = new Date().getFullYear();
    const prefix = data.mainCategory === 'Factory Expenses' ? 'FAC' : 'ADM';
    const seq = Math.floor(100 + Math.random() * 900);
    const voucherNumber = `EXP-${prefix}-${year}-${seq}`;
    const id = `exp-${prefix.toLowerCase()}-${Date.now()}`;

    const newEntry: ExpenseEntry = {
      ...data,
      id,
      voucherNumber,
      approvalStatus: 'Approved',
      allocationStatus: data.mainCategory === 'Factory Expenses' ? 'Unallocated' : 'Non-Production',
      allocatedAmount: 0,
      remainingUnallocated: data.amount,
      approvedBy: currentUser.name || 'Super Admin',
      approvedAt: new Date().toISOString().substring(0, 16).replace('T', ' '),
      journalVoucherNo: `JV-${prefix}-${year}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdBy: currentUser.name || 'Accounts Officer',
      createdAt: new Date().toISOString(),
    };

    setExpenseEntries((prev) => [newEntry, ...prev]);

    addAuditLog(
      'EXPENSE_VOUCHER_POSTED',
      data.department || 'Accounts & Finance',
      `Posted ${newEntry.voucherNumber}: BDT ${newEntry.amount.toLocaleString()} for ${newEntry.subcategory} (${newEntry.mainCategory}). Account: ${newEntry.accountName || 'N/A'}`
    );

    return id;
  };

  const updateExpenseEntry = (id: string, updates: Partial<ExpenseEntry>) => {
    setExpenseEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
    );
  };

  const approveExpenseEntry = (id: string, approverName?: string) => {
    const approver = approverName || currentUser.name || 'Super Admin';
    const approvedAt = new Date().toISOString().substring(0, 16).replace('T', ' ');

    setExpenseEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              approvalStatus: 'Approved',
              approvedBy: approver,
              approvedAt,
              updatedAt: new Date().toISOString(),
            }
          : e
      )
    );

    addAuditLog('EXPENSE_VOUCHER_APPROVED', 'Accounts & Finance', `Approved expense voucher ${id} by ${approver}`);
  };

  const deleteExpenseEntry = (id: string) => {
    setExpenseEntries((prev) => prev.filter((e) => e.id !== id));
    setCostAllocations((prev) => prev.filter((a) => a.expenseId !== id));
    addAuditLog('EXPENSE_VOUCHER_DELETED', 'Accounts & Finance', `Deleted expense voucher ${id}`);
  };

  const allocateExpenseToBatch = (params: {
    expenseId: string;
    productionOrderId: string;
    allocationMethod: CostAllocationMethod;
    allocatedAmount: number;
    basisValue?: number;
    totalBasisValue?: number;
    notes?: string;
  }): { success: boolean; allocationId?: string; error?: string } => {
    const expense = expenseEntries.find((e) => e.id === params.expenseId);
    if (!expense) {
      return { success: false, error: 'Expense record not found.' };
    }
    if (expense.mainCategory !== 'Factory Expenses') {
      return { success: false, error: 'Only Factory Expenses can be allocated to manufacturing costs.' };
    }
    if (params.allocatedAmount <= 0) {
      return { success: false, error: 'Allocated amount must be greater than zero.' };
    }
    if (params.allocatedAmount > expense.remainingUnallocated) {
      return {
        success: false,
        error: `Cannot allocate BDT ${params.allocatedAmount.toLocaleString()}. Maximum remaining unallocated amount is BDT ${expense.remainingUnallocated.toLocaleString()}.`,
      };
    }

    const order = productionOrders.find((po) => po.id === params.productionOrderId);
    if (!order) {
      return { success: false, error: 'Target production order not found.' };
    }

    const allocationId = `alloc-${Date.now()}`;
    const newAllocation: CostAllocationRecord = {
      id: allocationId,
      allocationDate: new Date().toISOString().substring(0, 10),
      expenseId: expense.id,
      expenseVoucherNo: expense.voucherNumber,
      expenseCategory: expense.mainCategory,
      expenseSubcategory: expense.subcategory,
      totalExpenseAmount: expense.amount,
      allocationMethod: params.allocationMethod,
      productionOrderId: order.id,
      productionBatchNumber: order.batchNumber || `KUS-B2610-01`,
      productName: order.productName || 'Lithium Battery Pack',
      productId: order.productId || '17',
      allocatedAmount: params.allocatedAmount,
      basisValue: params.basisValue,
      totalBasisValue: params.totalBasisValue,
      notes: params.notes,
      allocatedBy: currentUser.name || 'Accounts Officer',
      createdAt: new Date().toISOString(),
    };

    const newAllocated = expense.allocatedAmount + params.allocatedAmount;
    const newRemaining = expense.remainingUnallocated - params.allocatedAmount;
    const newStatus = newRemaining === 0 ? 'Fully Allocated' : 'Partially Allocated';

    setExpenseEntries((prev) =>
      prev.map((e) =>
        e.id === expense.id
          ? {
              ...e,
              allocatedAmount: newAllocated,
              remainingUnallocated: newRemaining,
              allocationStatus: newStatus,
              updatedAt: new Date().toISOString(),
            }
          : e
      )
    );

    setCostAllocations((prev) => [newAllocation, ...prev]);

    // Recalculate and update the production order
    const updatedBreakdown = getProductionCostBreakdown(order.id);
    setProductionOrders((prevOrders) =>
      prevOrders.map((po) =>
        po.id === order.id
          ? {
              ...po,
              conversionCostBDT:
                updatedBreakdown.directLabourCost +
                updatedBreakdown.electricityAllocation +
                updatedBreakdown.factoryRentAllocation +
                updatedBreakdown.generatorFuel +
                updatedBreakdown.machineMaintenance +
                updatedBreakdown.packagingCost +
                updatedBreakdown.otherProductionExpenses,
              totalProductionCostBDT: updatedBreakdown.totalManufacturingCost,
              costPerUnitBDT: Math.round(updatedBreakdown.actualUnitProductionCost),
            }
          : po
      )
    );

    addAuditLog(
      'FACTORY_EXPENSE_ALLOCATED',
      'Cost Accounting',
      `Allocated BDT ${params.allocatedAmount.toLocaleString()} of ${expense.voucherNumber} (${expense.subcategory}) to ${order.batchNumber} via ${params.allocationMethod}.`
    );

    return { success: true, allocationId };
  };

  const deleteCostAllocation = (allocationId: string) => {
    const alloc = costAllocations.find((a) => a.id === allocationId);
    if (!alloc) return;

    // Restore unallocated amount to expense
    setExpenseEntries((prev) =>
      prev.map((e) => {
        if (e.id === alloc.expenseId) {
          const newAllocated = Math.max(0, e.allocatedAmount - alloc.allocatedAmount);
          const newRemaining = e.amount - newAllocated;
          const newStatus =
            newAllocated === 0
              ? 'Unallocated'
              : newRemaining === 0
              ? 'Fully Allocated'
              : 'Partially Allocated';
          return {
            ...e,
            allocatedAmount: newAllocated,
            remainingUnallocated: newRemaining,
            allocationStatus: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return e;
      })
    );

    setCostAllocations((prev) => prev.filter((a) => a.id !== allocationId));

    addAuditLog(
      'COST_ALLOCATION_DELETED',
      'Cost Accounting',
      `Removed cost allocation of BDT ${alloc.allocatedAmount.toLocaleString()} from ${alloc.productionBatchNumber} (${alloc.expenseVoucherNo}).`
    );
  };

  const getProductionCostBreakdown = (
    orderId: string,
    method: 'FIFO' | 'WEIGHTED_AVERAGE' = 'FIFO'
  ): ProductionCostDetailedRecord => {
    const order = productionOrders.find((po) => po.id === orderId || po.orderNumber === orderId);
    const orderNumber = order ? (order.orderNumber || order.id) : orderId;
    const batchNumber = order?.batchNumber || `KUS-B2610-01`;

    // 1. Raw Material Batches consumed
    const consumptions = productionConsumptions.filter(
      (c) => c.productionOrderId === orderId || c.productionOrderNumber === orderNumber
    );

    const rawMaterialBatches = consumptions.map((c) => ({
      materialId: c.materialId,
      materialCode: c.materialCode,
      materialName: c.materialName,
      batchNumber: c.batchNumber,
      batchBarcode: c.batchBarcode,
      quantity: c.quantity,
      unitPurchaseRate: c.unitCostBDT || c.unitCost || 0,
      totalCostBDT: c.totalCostBDT || c.totalCost || 0,
    }));

    let rawMaterialCost = rawMaterialBatches.reduce((sum, b) => sum + b.totalCostBDT, 0);
    if (rawMaterialCost === 0 && order) {
      rawMaterialCost = Number(order.rawMaterialCostBDT) || 0;
    }

    // 2. Query Expense Allocations for this batch
    const orderAllocations = costAllocations.filter(
      (a) =>
        a.productionOrderId === orderId ||
        a.productionBatchNumber === batchNumber ||
        (order?.batchNumber && a.productionBatchNumber === order.batchNumber)
    );

    // Sum specific subcategory allocations
    let directLabourCost = 0;
    let electricityAllocation = 0;
    let factoryRentAllocation = 0;
    let generatorFuel = 0;
    let machineMaintenance = 0;
    let packagingCost = 0;
    let otherProductionExpenses = 0;

    orderAllocations.forEach((alloc) => {
      const amt = Number(alloc.allocatedAmount) || 0;
      switch (alloc.expenseSubcategory) {
        case 'Factory Labour':
          directLabourCost += amt;
          break;
        case 'Electricity Bill':
          electricityAllocation += amt;
          break;
        case 'Factory Rent':
          factoryRentAllocation += amt;
          break;
        case 'Generator Fuel':
          generatorFuel += amt;
          break;
        case 'Machine Maintenance':
          machineMaintenance += amt;
          break;
        case 'Packaging Expenses':
          packagingCost += amt;
          break;
        case 'Production Supervisor Salary':
        case 'Quality Control Expenses':
        case 'Factory Utilities':
        case 'Other Production Expenses':
        default:
          otherProductionExpenses += amt;
          break;
      }
    });

    // Fallbacks if no allocations exist yet
    if (orderAllocations.length === 0 && order) {
      directLabourCost = Number(order.optimumLaborCostBDT) || 0;
      const totalOverhead = Number(order.factoryOverheadBDT) || 0;
      electricityAllocation = Math.round(totalOverhead * 0.46);
      factoryRentAllocation = Math.round(totalOverhead * 0.31);
      generatorFuel = Math.round(totalOverhead * 0.15);
      machineMaintenance = Math.max(0, totalOverhead - electricityAllocation - factoryRentAllocation - generatorFuel);
    }

    const totalManufacturingCost =
      rawMaterialCost +
      directLabourCost +
      electricityAllocation +
      factoryRentAllocation +
      generatorFuel +
      machineMaintenance +
      packagingCost +
      otherProductionExpenses;

    const plannedQty = order?.plannedQty || 100;
    const completedQty = order?.completedQty || plannedQty;
    const goodFinishedQty = completedQty;
    const rejectedQty = Math.max(0, plannedQty - goodFinishedQty);
    const actualUnitProductionCost =
      Math.round((totalManufacturingCost / (goodFinishedQty || 1)) * 100) / 100;

    // Double-entry accounting vouchers
    const journalEntries = [
      {
        accountName: 'Work in Progress (WIP) - Materials',
        accountCode: '1250',
        debit: rawMaterialCost,
        credit: 0,
        description: `Raw material batch consumption issued to ${orderNumber}`,
      },
      {
        accountName: 'Raw Material Inventory Control',
        accountCode: '1200',
        debit: 0,
        credit: rawMaterialCost,
        description: `Credit inventory for FIFO material issue to ${orderNumber}`,
      },
      {
        accountName: 'Work in Progress (WIP) - Conversion Costs',
        accountCode: '1250',
        debit: totalManufacturingCost - rawMaterialCost,
        credit: 0,
        description: `Factory conversion cost, labour, and utility allocation to ${orderNumber}`,
      },
      {
        accountName: 'Factory Overhead Control',
        accountCode: '5100',
        debit: 0,
        credit:
          electricityAllocation +
          factoryRentAllocation +
          generatorFuel +
          machineMaintenance +
          otherProductionExpenses,
        description: `Overhead absorbed into production ${orderNumber}`,
      },
      {
        accountName: 'Direct Labour Payable / Absorbed',
        accountCode: '2050',
        debit: 0,
        credit: directLabourCost,
        description: `Direct labour cost absorbed into ${orderNumber}`,
      },
      {
        accountName: 'Direct Packaging Expenses Absorbed',
        accountCode: '5120',
        debit: 0,
        credit: packagingCost,
        description: `Packaging cost absorbed into ${orderNumber}`,
      },
    ];

    if (order?.status === 'Completed' || order?.status === 'Transferred') {
      journalEntries.push(
        {
          accountName: 'Finished Goods Inventory Control',
          accountCode: '1260',
          debit: totalManufacturingCost,
          credit: 0,
          description: `Capitalized ${goodFinishedQty} finished battery packs @ BDT ${actualUnitProductionCost}/unit from ${orderNumber}`,
        },
        {
          accountName: 'Work in Progress (WIP) - Cleared',
          accountCode: '1250',
          debit: 0,
          credit: totalManufacturingCost,
          description: `WIP balance cleared upon finished goods warehouse receipt for ${orderNumber}`,
        }
      );
    }

    return {
      productionOrderId: orderId,
      orderNumber,
      batchNumber,
      productId: order?.productId || '17',
      productName: order?.productName || 'EN64V142AH (Lithium Pack 64V 142Ah)',
      productSku: order?.model || 'EN64V142AH',
      factoryLocation: 'Kushtia Lithium Battery Plant',
      productionDate: order?.manufacturingDate || order?.date || new Date().toISOString().substring(0, 10),
      plannedQty,
      actualProductionQty: plannedQty,
      goodFinishedQty,
      rejectedQty,
      status: (order?.status as any) || 'Completed',
      rawMaterialCost,
      directLabourCost,
      electricityAllocation,
      factoryRentAllocation,
      generatorFuel,
      machineMaintenance,
      packagingCost,
      otherProductionExpenses,
      totalManufacturingCost,
      actualUnitProductionCost,
      rawMaterialBatches,
      allocations: orderAllocations,
      costingMethod: method,
      calculatedAt: new Date().toISOString(),
      journalEntries,
    };
  };

  const getManufacturingCostKPIs = (filters?: {
    dateRange?: string;
    warehouseId?: string;
    productId?: string;
  }): ManufacturingCostKPIs => {
    // 1. Total Factory Expenses
    const factoryExpenses = expenseEntries.filter((e) => e.mainCategory === 'Factory Expenses');
    const totalFactoryExpenses = factoryExpenses.reduce((s, e) => s + e.amount, 0);

    // 2. Non-Production Expenses
    const nonProdExpenses = expenseEntries.filter((e) => e.mainCategory === 'Other Business Expenses');
    const totalNonProductionExpenses = nonProdExpenses.reduce((s, e) => s + e.amount, 0);

    // 3. Unallocated Factory Expenses
    const unallocatedFactoryExpenses = factoryExpenses.reduce((s, e) => s + e.remainingUnallocated, 0);

    // 4. Batches calculations
    let totalDirectCost = 0;
    let totalOverheadCost = 0;
    let totalMfgCost = 0;
    let totalGoodUnits = 0;

    productionOrders.forEach((po) => {
      const breakdown = getProductionCostBreakdown(po.id);
      totalDirectCost += breakdown.rawMaterialCost + breakdown.directLabourCost + breakdown.packagingCost;
      totalOverheadCost +=
        breakdown.electricityAllocation +
        breakdown.factoryRentAllocation +
        breakdown.generatorFuel +
        breakdown.machineMaintenance +
        breakdown.otherProductionExpenses;
      totalMfgCost += breakdown.totalManufacturingCost;
      totalGoodUnits += breakdown.goodFinishedQty;
    });

    const averageUnitProductionCost =
      totalGoodUnits > 0 ? Math.round((totalMfgCost / totalGoodUnits) * 100) / 100 : 0;

    return {
      totalFactoryExpenses,
      totalProductionOverhead: totalOverheadCost,
      totalDirectProductionCost: totalDirectCost,
      totalManufacturingCost: totalMfgCost,
      totalProductionQuantity: totalGoodUnits,
      averageUnitProductionCost,
      unallocatedFactoryExpenses,
      totalNonProductionExpenses,
    };
  };

  const calculateProductionCost = (
    orderId: string,
    paramsOrMethod?: {
      directLabourBDT?: number;
      factoryOverheadBDT?: number;
      otherCostsBDT?: number;
      goodQty?: number;
      rejectedQty?: number;
      wastagePercent?: number;
      costingMethod?: 'FIFO' | 'WEIGHTED_AVERAGE';
      saveToState?: boolean;
    } | 'FIFO' | 'WEIGHTED_AVERAGE',
    saveToState = false
  ): ProductionCostRecord => {
    const isMethodString = typeof paramsOrMethod === 'string';
    const method: 'FIFO' | 'WEIGHTED_AVERAGE' = isMethodString
      ? (paramsOrMethod as any)
      : paramsOrMethod?.costingMethod || 'FIFO';
    const paramsObj = isMethodString || !paramsOrMethod ? {} : paramsOrMethod;

    const breakdown = getProductionCostBreakdown(orderId, method);

    const actualGoodQty = paramsObj.goodQty !== undefined ? paramsObj.goodQty : breakdown.goodFinishedQty;
    const rejectedQty = paramsObj.rejectedQty !== undefined ? paramsObj.rejectedQty : breakdown.rejectedQty;
    const wastagePct = paramsObj.wastagePercent !== undefined ? paramsObj.wastagePercent : 0;
    const wastageCost = breakdown.rawMaterialCost * (wastagePct / 100);

    const directLabour = paramsObj.directLabourBDT !== undefined ? paramsObj.directLabourBDT : breakdown.directLabourCost;
    const factoryOverhead = paramsObj.factoryOverheadBDT !== undefined
      ? paramsObj.factoryOverheadBDT
      : (breakdown.electricityAllocation + breakdown.factoryRentAllocation + breakdown.generatorFuel + breakdown.machineMaintenance);
    const otherCosts = paramsObj.otherCostsBDT !== undefined
      ? paramsObj.otherCostsBDT
      : (breakdown.packagingCost + breakdown.otherProductionExpenses);

    const totalProdCost = breakdown.rawMaterialCost + directLabour + factoryOverhead + otherCosts + wastageCost;
    const unitProdCost = Math.round((totalProdCost / (actualGoodQty || 1)) * 100) / 100;

    const costRecord: ProductionCostRecord = {
      id: `pc-${orderId}-${method.toLowerCase()}`,
      productionOrderId: orderId,
      orderNumber: breakdown.orderNumber,
      productId: breakdown.productId,
      productName: breakdown.productName,
      model: breakdown.productSku,
      productionDate: breakdown.productionDate,
      plannedQty: breakdown.plannedQty,
      actualGoodQty,
      goodFinishedQty: actualGoodQty,
      rejectedQty,
      scrapUnits: rejectedQty,
      wastagePercentage: wastagePct,
      rawMaterialCostBDT: Math.round(breakdown.rawMaterialCost * 100) / 100,
      rawMaterialCost: Math.round(breakdown.rawMaterialCost * 100) / 100,
      directLabourCostBDT: Number(directLabour) || 0,
      directLaborCost: Number(directLabour) || 0,
      factoryOverheadCostBDT: Number(factoryOverhead) || 0,
      factoryOverheadCost: Number(factoryOverhead) || 0,
      otherProductionCostsBDT: Number(otherCosts) || 0,
      otherCost: Number(otherCosts) || 0,
      wastageCostBDT: Math.round(wastageCost * 100) / 100,
      wastageCost: Math.round(wastageCost * 100) / 100,
      totalProductionCostBDT: Math.round(totalProdCost * 100) / 100,
      totalProductionCost: Math.round(totalProdCost * 100) / 100,
      unitProductionCostBDT: unitProdCost,
      unitProductionCost: unitProdCost,
      costingMethod: method,
      productionBatchNumber: breakdown.batchNumber,
      warehouseId: 'wh-kushtia',
      status: 'Finalized',
      calculatedAt: new Date().toISOString(),
    };

    const shouldSave =
      typeof paramsOrMethod === 'object' && paramsOrMethod !== null && 'saveToState' in paramsOrMethod
        ? Boolean(paramsOrMethod.saveToState)
        : Boolean(saveToState);

    if (shouldSave) {
      saveProductionCost(costRecord);
      addAuditLog(
        'PRODUCTION_COST_CALCULATED',
        'Costing Engine',
        `Calculated production cost for ${breakdown.orderNumber}: Total BDT ${costRecord.totalProductionCostBDT.toLocaleString()} across ${actualGoodQty} good units (BDT ${costRecord.unitProductionCostBDT.toLocaleString()}/unit).`
      );
    }

    return costRecord;
  };

  const receiveFinishedGoodsFromProduction = async (
    productionOrderIdOrParams: string | any,
    maybeParams?: any
  ): Promise<FinishedGoodsProductionReceipt> => {
    let productionOrderId: string;
    let params: any;

    if (typeof productionOrderIdOrParams === 'object' && productionOrderIdOrParams !== null) {
      productionOrderId = productionOrderIdOrParams.productionOrderId;
      params = productionOrderIdOrParams;
    } else {
      productionOrderId = productionOrderIdOrParams;
      params = maybeParams || {};
    }

    const order = productionOrders.find(
      (po) => po.id === productionOrderId || po.orderNumber === productionOrderId
    );
    const orderNumber = order ? (order.orderNumber || order.id) : productionOrderId;
    const costRecord = productionCosts.find(
      (c) => c.productionOrderId === productionOrderId || c.orderNumber === orderNumber
    );

    const acceptedQty = params.acceptedQty ?? (order?.completedQty || order?.plannedQty || 50);
    const rejectedQty = params.rejectedQty ?? 0;
    const unitCost = costRecord
      ? costRecord.unitProductionCostBDT
      : params.unitProductionCost || order?.costPerUnitBDT || 80000;
    const totalCost = costRecord
      ? costRecord.totalProductionCostBDT
      : params.totalProductionCost || (unitCost * acceptedQty);

    const year = new Date().getFullYear();
    const receiptNo = `FGR-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
    const targetWh = warehouses.find((w) => w.id === params.warehouseId) || warehouses[0];

    const fgReceipt: FinishedGoodsProductionReceipt = {
      id: `fgr-${Date.now()}`,
      receiptNumber: receiptNo,
      productionOrderId,
      productionOrderNumber: orderNumber,
      productId: order?.productId || '17',
      productCode: 'ENS-PROD-001',
      productName: order?.productName || 'EN64V142AH',
      model: order?.model || 'EN64V142AH',
      producedQty: acceptedQty + rejectedQty,
      acceptedQty,
      rejectedQty,
      totalProductionCostBDT: totalCost,
      unitProductionCostBDT: unitCost,
      productionBatchNumber: order?.batchNumber || params.productionBatchNumber || 'KUS-B2610-01',
      warehouseId: targetWh.id,
      warehouseName: targetWh.name,
      receiveDate: new Date().toISOString().substring(0, 10),
      receivedBy: currentUser.name,
      valuationTotalBDT: Math.round(acceptedQty * unitCost * 100) / 100,
      status: 'Received & Stocked',
      notes: params.notes || `Received from production order ${orderNumber}`,
      createdAt: new Date().toISOString(),
    };

    setFinishedGoodsProductionReceipts((prev) => [fgReceipt, ...prev]);

    setWarehouses((prev) =>
      prev.map((wh) =>
        wh.id === targetWh.id
          ? { ...wh, currentStockUnits: (wh.currentStockUnits || 0) + params.acceptedQty }
          : wh
      )
    );

    const newLedger: StockLedgerEntry = {
      id: `sl-${Date.now()}`,
      date: new Date().toISOString().substring(0, 10),
      warehouseId: targetWh.id,
      warehouseName: targetWh.name,
      productId: order?.productId || '17',
      productName: order?.productName || 'EN64V142AH',
      batchNumber: order?.batchNumber || 'KUS-B2610-01',
      transactionType: 'Production Receive',
      referenceNo: receiptNo,
      qtyIn: params.acceptedQty,
      qtyOut: 0,
      balanceQty: params.acceptedQty,
      unitCostBDT: Math.round(unitCost),
      totalCostBDT: Math.round(params.acceptedQty * unitCost),
    };
    setStockLedger((prev) => [newLedger, ...prev]);

    setProductionOrders((prev) =>
      prev.map((po) =>
        po.id === productionOrderId || po.orderNumber === orderNumber
          ? { ...po, status: 'Completed', completedQty: params.acceptedQty }
          : po
      )
    );

    const sb = getSupabase();
    if (sb) {
      try {
        const updatePayload: any = {
          status: 'Completed',
          completed_qty: params.acceptedQty,
          updated_at: new Date().toISOString(),
        };
        const isNumeric = /^\d+$/.test(productionOrderId);
        if (isNumeric) {
          await sb.from('production_orders').update(updatePayload).eq('id', Number(productionOrderId));
        } else {
          await sb.from('production_orders').update(updatePayload).eq('order_number', orderNumber);
        }
      } catch (e) {
        console.warn('Supabase receiveFinishedGoodsFromProduction status sync notice:', e);
      }
    }

    addAuditLog(
      'FINISHED_GOODS_RECEIVED_FROM_PRODUCTION',
      targetWh.name,
      `Received ${params.acceptedQty} finished goods from ${orderNumber} into ${targetWh.name}. Valuated at calculated production cost BDT ${unitCost.toLocaleString()}/unit.`
    );

    return fgReceipt;
  };

  const updateBOMDefinition = async (bom: BOMDefinition): Promise<{ success: boolean; error?: string }> => {
    const revisionDate = bom.effectiveDate || new Date().toISOString().substring(0, 10);
    const newRevision: BOMRevision = {
      version: bom.version,
      revisionDate,
      effectiveDate: revisionDate,
      revisedBy: currentUser?.name || 'Administrator',
      createdBy: currentUser?.name || 'Administrator',
      changeSummary: bom.changeNotes || bom.notes || `Updated BOM specification to ${bom.version}`,
      changeNotes: bom.changeNotes || bom.notes || `Updated BOM specification to ${bom.version}`,
      items: bom.items,
      itemsSnapshot: bom.items,
    };

    let targetBOM: BOMDefinition = bom;

    setBoms((prev) => {
      const idx = prev.findIndex(
        (b) =>
          b.id === bom.id ||
          b.productId === bom.productId ||
          (b.productCode && bom.productCode && b.productCode === bom.productCode)
      );
      if (idx >= 0) {
        const existing = prev[idx];
        const existingHistory = existing.revisionHistory || existing.revisions || [];
        targetBOM = {
          ...existing,
          ...bom,
          revisions: [newRevision, ...existingHistory],
          revisionHistory: [newRevision, ...existingHistory],
          updatedAt: new Date().toISOString(),
        };
        const copy = [...prev];
        copy[idx] = targetBOM;
        return copy;
      } else {
        targetBOM = {
          ...bom,
          revisions: [newRevision],
          revisionHistory: [newRevision],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return [targetBOM, ...prev];
      }
    });

    // Also update product's bom in state and localStorage
    setProducts((prev) =>
      prev.map((p) => {
        if (
          p.id === bom.productId ||
          (bom.productCode && p.code === bom.productCode) ||
          (bom.productModel && p.model === bom.productModel)
        ) {
          return { ...p, bom: bom.items };
        }
        return p;
      })
    );

    addAuditLog('BOM_DEFINITION_SAVED', 'Bill of Materials', `Saved BOM version ${bom.version} for ${bom.productName}`);

    const sb = getSupabase();
    if (!sb) {
      return { success: true };
    }

    try {
      // 1. Sync to products table (bom JSONB column)
      const targetProd = products.find(
        (p) =>
          p.id === bom.productId ||
          (bom.productCode && p.code === bom.productCode) ||
          (bom.productModel && p.model === bom.productModel)
      );

      if (targetProd) {
        const isNumeric = /^\d+$/.test(targetProd.id);
        const prodQuery = isNumeric
          ? sb.from('products').update({ bom: bom.items, updated_at: new Date().toISOString() }).eq('id', Number(targetProd.id))
          : sb.from('products').update({ bom: bom.items, updated_at: new Date().toISOString() }).eq('code', targetProd.code);
        await prodQuery;
      }

      // 2. Resolve database product_id for bill_of_materials foreign key
      let dbProductId: number | null = /^\d+$/.test(bom.productId) ? Number(bom.productId) : null;
      if (!dbProductId && targetProd && /^\d+$/.test(targetProd.id)) {
        dbProductId = Number(targetProd.id);
      }
      if (!dbProductId) {
        const prodCode = targetProd?.code || bom.productCode;
        if (prodCode) {
          const { data: pData } = await sb.from('products').select('id').eq('code', prodCode).limit(1);
          if (pData?.[0]?.id) {
            dbProductId = Number(pData[0].id);
          }
        }
      }

      if (dbProductId) {
        const { data: existingRows } = await sb
          .from('bill_of_materials')
          .select('id')
          .eq('product_id', dbProductId)
          .limit(1);

        const existingDbId = existingRows?.[0]?.id;

        const fullPayload: any = {
          product_id: dbProductId,
          product_code: targetProd?.code || bom.productCode || `PRD-${dbProductId}`,
          product_name: targetProd?.name || bom.productName,
          product_model: targetProd?.model || bom.productModel || bom.productName,
          version: bom.version || '1.0',
          effective_date: bom.effectiveDate || new Date().toISOString().substring(0, 10),
          status: bom.status || 'Active',
          expected_batch_wastage_percent: Number(bom.expectedBatchWastagePercent) || 0.5,
          notes: bom.notes || bom.changeNotes || null,
          change_notes: bom.changeNotes || bom.notes || null,
          items: bom.items,
          revision_history: targetBOM.revisionHistory || [newRevision],
          revisions: targetBOM.revisions || [newRevision],
          updated_at: new Date().toISOString(),
        };

        const baselinePayload: any = {
          product_id: dbProductId,
          product_code: targetProd?.code || bom.productCode || `PRD-${dbProductId}`,
          product_name: targetProd?.name || bom.productName,
          version: bom.version || '1.0',
          effective_date: bom.effectiveDate || new Date().toISOString().substring(0, 10),
          status: bom.status || 'Active',
          expected_batch_wastage_percent: Number(bom.expectedBatchWastagePercent) || 0.5,
          notes: bom.notes || bom.changeNotes || null,
          updated_at: new Date().toISOString(),
        };

        let bomId: number | null = existingDbId ? Number(existingDbId) : null;

        if (existingDbId) {
          const { error: updateErr } = await sb
            .from('bill_of_materials')
            .update(fullPayload)
            .eq('id', existingDbId);

          if (updateErr) {
            console.warn('Full BOM update warning, falling back to baseline schema:', updateErr.message);
            await sb.from('bill_of_materials').update(baselinePayload).eq('id', existingDbId);
          }
        } else {
          const { data: insData, error: insErr } = await sb
            .from('bill_of_materials')
            .insert(fullPayload)
            .select('id');

          if (insErr) {
            console.warn('Full BOM insert warning, falling back to baseline schema:', insErr.message);
            const { data: baseIns } = await sb
              .from('bill_of_materials')
              .insert(baselinePayload)
              .select('id');
            if (baseIns?.[0]?.id) {
              bomId = Number(baseIns[0].id);
            }
          } else if (insData?.[0]?.id) {
            bomId = Number(insData[0].id);
          }
        }

        // 3. Sync line items into bom_items table
        if (bomId) {
          try {
            await sb.from('bom_items').delete().eq('bom_id', bomId);

            if (Array.isArray(bom.items) && bom.items.length > 0) {
              const lineItemsPayload = bom.items.map((it) => {
                const rm = rawMaterials.find((m) => m.id === it.materialId || m.code === it.materialId);
                let matId: number = /^\d+$/.test(it.materialId) ? Number(it.materialId) : 0;
                if (!matId && rm && /^\d+$/.test(rm.id)) {
                  matId = Number(rm.id);
                }
                return {
                  bom_id: bomId,
                  material_id: matId || 109,
                  material_code: rm?.code || it.materialId || 'RM',
                  material_name: it.materialName || rm?.name || 'Raw Material',
                  unit: it.unit || rm?.unit || 'Pieces',
                  required_qty: Number(it.requiredQty) || 1,
                  expected_wastage_percent: Number(it.expectedWastagePercent) || 0,
                  unit_cost_bdt: Number(it.unitCostBDT) || 0,
                  total_item_cost_bdt: (Number(it.requiredQty) || 0) * (Number(it.unitCostBDT) || 0),
                  notes: it.notes || null,
                };
              });

              await sb.from('bom_items').insert(lineItemsPayload);
            }
          } catch (itemErr) {
            console.warn('Failed to sync bom_items lines:', itemErr);
          }
        }
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error saving BOM to Supabase:', err);
      return { success: false, error: err?.message || 'Failed to save BOM to database' };
    }
  };

  const refreshBOMs = async () => {
    const sb = getSupabase();
    if (!sb) return;

    try {
      const { data, error } = await sb
        .from('bill_of_materials')
        .select('*')
        .order('id', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        let lineItems: any[] = [];
        try {
          const { data: liData } = await sb.from('bom_items').select('*');
          if (Array.isArray(liData)) lineItems = liData;
        } catch {}

        const mapped: BOMDefinition[] = data.map((row: any) => {
          let items: BOMItem[] = [];
          if (Array.isArray(row.items) && row.items.length > 0) {
            items = row.items;
          } else if (lineItems.length > 0) {
            items = lineItems
              .filter((li: any) => Number(li.bom_id) === Number(row.id))
              .map((li: any) => ({
                materialId: String(li.material_id),
                materialName: li.material_name || '',
                requiredQty: Number(li.required_qty) || 0,
                unit: li.unit || 'Pieces',
                unitCostBDT: Number(li.unit_cost_bdt) || 0,
                expectedWastagePercent: Number(li.expected_wastage_percent) || 0,
                notes: li.notes || '',
              }));
          }

          const revisions: BOMRevision[] = Array.isArray(row.revision_history)
            ? row.revision_history
            : Array.isArray(row.revisions)
            ? row.revisions
            : [];

          return {
            id: String(row.id),
            productId: String(row.product_id),
            productCode: row.product_code || '',
            productModel: row.product_model || row.product_code || '',
            productName: row.product_name || '',
            version: row.version || '1.0',
            effectiveDate: row.effective_date || new Date().toISOString().substring(0, 10),
            status: (row.status as any) || 'Active',
            expectedBatchWastagePercent: Number(row.expected_batch_wastage_percent) || 0.5,
            notes: row.notes || '',
            changeNotes: row.change_notes || '',
            items,
            revisions,
            revisionHistory: revisions,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          };
        });

        setBoms((prev) => {
          const merged = [...mapped];
          prev.forEach((p) => {
            if (!merged.some((m) => m.productId === p.productId || m.id === p.id)) {
              merged.push(p);
            }
          });
          return merged;
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem('ensec_boms', JSON.stringify(mapped));
        }
      }
    } catch (err) {
      console.warn('Failed to load bill_of_materials from Supabase:', err);
    }
  };

  const getFifoBatchesForMaterial = (materialId: string, warehouseId?: string): InventoryBatch[] => {
    return inventoryBatches
      .filter(
        (b) =>
          (b.materialId === materialId || b.materialCode === materialId) &&
          b.availableQty > 0 &&
          (!warehouseId || b.warehouseId === warehouseId)
      )
      .sort((a, b) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime());
  };

  const findBatchByBarcode = (barcodeOrBatchNo: string): InventoryBatch | undefined => {
    const query = barcodeOrBatchNo.trim().toLowerCase();
    return inventoryBatches.find(
      (b) =>
        b.batchBarcode.toLowerCase() === query ||
        b.batchNumber.toLowerCase() === query ||
        b.id.toLowerCase() === query
    );
  };

  // Stage 4: Optimum JV Settlement
  const addOptimumSettlementPayment = (amountBDT: number, reference: string, notes: string) => {
    const lastOpt = optimumStatement[optimumStatement.length - 1];
    const prevBal = lastOpt ? lastOpt.runningBalanceBDT : 0;
    const newEntry: OptimumStatementEntry = {
      id: `opt-st-${Date.now()}`,
      date: new Date().toISOString().substring(0, 10),
      reference,
      type: 'Ensec Payment',
      description: `Ensec settlement payment to Optimum: ${notes}`,
      debitBDT: 0,
      creditBDT: amountBDT,
      runningBalanceBDT: prevBal - amountBDT,
      status: 'Posted',
    };
    setOptimumStatement((prev) => [...prev, newEntry]);

    // Also deduct from Bank / Cash Book
    const lastCash = cashBook[cashBook.length - 1];
    const newCashEntry: CashBookEntry = {
      id: `cb-${Date.now()}`,
      date: new Date().toISOString().substring(0, 10),
      voucherNo: `CB-OPT-${Date.now().toString().slice(-4)}`,
      accountType: 'City Bank PLC',
      transactionCategory: 'Optimum Settlement',
      description: `Settlement payment to Optimum (${reference}): ${notes}`,
      reference,
      cashInBDT: 0,
      cashOutBDT: amountBDT,
      runningBalanceBDT: (lastCash ? lastCash.runningBalanceBDT : 10000000) - amountBDT,
    };
    setCashBook((prev) => [...prev, newCashEntry]);

    addAuditLog('OPTIMUM_SETTLEMENT_PAID', 'Finance & Optimum JV', `Paid BDT ${amountBDT.toLocaleString()} to Optimum JV against ref ${reference}`);
  };

  // Stage 5: Multi-Warehouse & Stock Transfers
  const createStockTransfer = (transfer: Omit<StockTransfer, 'id' | 'transferNumber'> & { status?: string }) => {
    const id = `tr-${Date.now().toString().slice(-4)}`;
    const transferNumber = `TR-2026-10-${Math.floor(100 + Math.random() * 900)}`;
    const initialStatus = transfer.status || 'Received';

    const fromWhId = transfer.fromWarehouseId || transfer.sourceWarehouseId || '';
    const toWhId = transfer.toWarehouseId || transfer.destWarehouseId || transfer.destinationWarehouseId || '';
    const fromWhName = transfer.fromWarehouseName || transfer.sourceWarehouseName || '';
    const toWhName = transfer.toWarehouseName || transfer.destWarehouseName || transfer.destinationWarehouseName || '';
    const transferQty = Number(transfer.quantity || transfer.totalQuantity || 1);
    const transferDate = transfer.date || transfer.transferDate || new Date().toISOString().substring(0, 10);

    const isCompleted = initialStatus === 'Received' || initialStatus === 'Completed' || initialStatus === 'Received at Destination';
    const isInTransit = initialStatus === 'In Transit' || initialStatus === 'Dispatched';

    const newTransfer: StockTransfer = {
      ...transfer,
      id,
      transferNumber,
      fromWarehouseId: fromWhId,
      sourceWarehouseId: fromWhId,
      fromWarehouseName: fromWhName,
      sourceWarehouseName: fromWhName,
      toWarehouseId: toWhId,
      destWarehouseId: toWhId,
      destinationWarehouseId: toWhId,
      toWarehouseName: toWhName,
      destWarehouseName: toWhName,
      destinationWarehouseName: toWhName,
      quantity: transferQty,
      totalQuantity: transferQty,
      status: initialStatus,
      date: transferDate,
      transferDate,
      requestedBy: transfer.requestedBy || currentUser?.name || 'Supply Chain Officer',
      receivedDate: isCompleted ? transferDate : undefined,
      receivedBy: isCompleted ? (transfer.receivedBy || currentUser?.name || 'Store Receiver') : undefined,
    };

    setStockTransfers((prev) => {
      const next = [newTransfer, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('ensec_stock_transfers', JSON.stringify(next));
      }
      return next;
    });

    // 1. Update warehouses currentStockUnits in React state
    setWarehouses((whs) =>
      whs.map((w) => {
        const isFrom = w.id === fromWhId || (w.name && fromWhName && w.name.trim().toLowerCase() === fromWhName.trim().toLowerCase());
        const isTo = w.id === toWhId || (w.name && toWhName && w.name.trim().toLowerCase() === toWhName.trim().toLowerCase());
        if (isFrom && (isCompleted || isInTransit)) {
          return { ...w, currentStockUnits: Math.max(0, (w.currentStockUnits || 0) - transferQty) };
        }
        if (isTo && isCompleted) {
          return { ...w, currentStockUnits: (w.currentStockUnits || 0) + transferQty };
        }
        return w;
      })
    );

    // 2. Post Ledger Entries
    const newLedgerEntries: StockLedgerEntry[] = [];
    const unitCost = 65000;

    if (isCompleted || isInTransit) {
      newLedgerEntries.push({
        id: `sl-tr-out-${Date.now()}`,
        date: transferDate,
        warehouseId: fromWhId,
        warehouseName: fromWhName,
        productId: newTransfer.productId,
        productName: newTransfer.productName,
        batchNumber: newTransfer.batchNumber || 'KUS-B2610-DISPATCH',
        transactionType: 'Transfer Out',
        referenceNo: transferNumber,
        qtyIn: 0,
        qtyOut: transferQty,
        balanceQty: 0,
        unitCostBDT: unitCost,
        totalCostBDT: transferQty * unitCost,
      });
    }

    if (isCompleted) {
      newLedgerEntries.push({
        id: `sl-tr-in-${Date.now() + 1}`,
        date: transferDate,
        warehouseId: toWhId,
        warehouseName: toWhName,
        productId: newTransfer.productId,
        productName: newTransfer.productName,
        batchNumber: newTransfer.batchNumber || 'KUS-B2610-DISPATCH',
        transactionType: 'Transfer In',
        referenceNo: transferNumber,
        qtyIn: transferQty,
        qtyOut: 0,
        balanceQty: transferQty,
        unitCostBDT: unitCost,
        totalCostBDT: transferQty * unitCost,
      });
    }

    if (newLedgerEntries.length > 0) {
      setStockLedger((sl) => {
        const next = [...newLedgerEntries, ...sl];
        if (typeof window !== 'undefined') {
          localStorage.setItem('ensec_stock_ledger', JSON.stringify(next));
        }
        return next;
      });
    }

    addAuditLog(
      isCompleted ? 'STOCK_TRANSFER_COMPLETED' : 'STOCK_TRANSFER_REQUESTED',
      'Warehouse Management',
      `Stock transfer (${initialStatus}): ${transferQty} units of ${newTransfer.productName || 'product'} from ${fromWhName} to ${toWhName}`
    );

    // 3. Asynchronously persist to Supabase tables: stock_transfers, stock_transfer_items, warehouses, and stock_inventory
    (async () => {
      const sb = getSupabase();
      if (!sb) return;

      try {
        let sourceWhDbId: number | null = null;
        let destWhDbId: number | null = null;

        if (fromWhId && !isNaN(Number(fromWhId)) && Number(fromWhId) > 0) {
          sourceWhDbId = Number(fromWhId);
        } else {
          const matched = warehouses.find(
            (w) => w.id === fromWhId || (w.name && fromWhName && w.name.trim().toLowerCase() === fromWhName.trim().toLowerCase())
          );
          if (matched && !isNaN(Number(matched.id))) sourceWhDbId = Number(matched.id);
        }

        if (toWhId && !isNaN(Number(toWhId)) && Number(toWhId) > 0) {
          destWhDbId = Number(toWhId);
        } else {
          const matched = warehouses.find(
            (w) => w.id === toWhId || (w.name && toWhName && w.name.trim().toLowerCase() === toWhName.trim().toLowerCase())
          );
          if (matched && !isNaN(Number(matched.id))) destWhDbId = Number(matched.id);
        }

        const transferPayload: any = {
          transfer_number: transferNumber,
          transfer_date: transferDate,
          source_warehouse_name: fromWhName || 'Source Warehouse',
          destination_warehouse_name: toWhName || 'Destination Warehouse',
          total_items: newTransfer.items?.length || 1,
          total_quantity: transferQty,
          total_value_bdt: transferQty * unitCost,
          status: initialStatus,
          dispatched_by: newTransfer.requestedBy || currentUser?.name || 'Supply Chain Officer',
          remarks: newTransfer.remarks || `Stock transfer: ${fromWhName} -> ${toWhName}`,
        };

        if (sourceWhDbId) transferPayload.source_warehouse_id = sourceWhDbId;
        if (destWhDbId) transferPayload.destination_warehouse_id = destWhDbId;
        if (newTransfer.challanNumber || newTransfer.challanNo) transferPayload.challan_number = newTransfer.challanNumber || newTransfer.challanNo;
        if (newTransfer.truckNumber) transferPayload.vehicle_number = newTransfer.truckNumber;
        if (newTransfer.driverName) transferPayload.driver_name = newTransfer.driverName;
        if (newTransfer.driverPhone) transferPayload.driver_phone = newTransfer.driverPhone;
        if (isCompleted) transferPayload.received_by = newTransfer.receivedBy || currentUser?.name || 'Store Receiver';

        const { data: insertedRows, error: insertError } = await sb
          .from('stock_transfers')
          .insert(transferPayload)
          .select();

        if (insertError) {
          console.warn('Supabase stock_transfers insert notice:', insertError.message);
        }

        const insertedTransfer = insertedRows?.[0];
        const dbTransferId = insertedTransfer?.id;

        // Insert items into stock_transfer_items
        if (dbTransferId) {
          let prodDbId: number | null = null;
          if (newTransfer.productId && !isNaN(Number(newTransfer.productId))) {
            prodDbId = Number(newTransfer.productId);
          } else {
            const matchedP = products.find(
              (p) => p.id === newTransfer.productId || (newTransfer.productName && p.name.trim().toLowerCase() === newTransfer.productName.trim().toLowerCase())
            );
            if (matchedP && !isNaN(Number(matchedP.id))) prodDbId = Number(matchedP.id);
          }

          const itemPayload: any = {
            transfer_id: dbTransferId,
            product_name: newTransfer.productName || 'Lithium Battery Pack',
            batch_number: newTransfer.batchNumber || 'KUS-B2610-DISPATCH',
            quantity: transferQty,
            unit_cost_bdt: unitCost,
            total_bdt: transferQty * unitCost,
          };
          if (prodDbId) itemPayload.product_id = prodDbId;

          await sb.from('stock_transfer_items').insert(itemPayload);
        }

        // Update warehouses stock in Supabase
        if (sourceWhDbId && (isCompleted || isInTransit)) {
          const currentWh = warehouses.find((w) => String(w.id) === String(sourceWhDbId));
          const updatedQty = Math.max(0, ((currentWh?.currentStockUnits || 0) - transferQty));
          await sb.from('warehouses').update({ current_stock_units: updatedQty }).eq('id', sourceWhDbId);
        }
        if (destWhDbId && isCompleted) {
          const currentWh = warehouses.find((w) => String(w.id) === String(destWhDbId));
          const updatedQty = (currentWh?.currentStockUnits || 0) + transferQty;
          await sb.from('warehouses').update({ current_stock_units: updatedQty }).eq('id', destWhDbId);
        }

        // Update stock_inventory balances for physical tracking
        if (sourceWhDbId && (isCompleted || isInTransit)) {
          let pId: number | null = null;
          if (newTransfer.productId && !isNaN(Number(newTransfer.productId))) pId = Number(newTransfer.productId);
          if (pId) {
            const { data: invRow } = await sb
              .from('stock_inventory')
              .select('id, quantity_on_hand')
              .eq('warehouse_id', sourceWhDbId)
              .eq('product_id', pId)
              .maybeSingle();
            if (invRow) {
              await sb
                .from('stock_inventory')
                .update({
                  quantity_on_hand: Math.max(0, (Number(invRow.quantity_on_hand) || 0) - transferQty),
                  updated_at: new Date().toISOString(),
                })
                .eq('id', invRow.id);
            }
          }
        }

        if (destWhDbId && isCompleted) {
          let pId: number | null = null;
          if (newTransfer.productId && !isNaN(Number(newTransfer.productId))) pId = Number(newTransfer.productId);
          if (pId) {
            const { data: invRow } = await sb
              .from('stock_inventory')
              .select('id, quantity_on_hand')
              .eq('warehouse_id', destWhDbId)
              .eq('product_id', pId)
              .maybeSingle();
            if (invRow) {
              await sb
                .from('stock_inventory')
                .update({
                  quantity_on_hand: (Number(invRow.quantity_on_hand) || 0) + transferQty,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', invRow.id);
            } else {
              const matchedProd = products.find((p) => String(p.id) === String(pId));
              await sb.from('stock_inventory').insert({
                warehouse_id: destWhDbId,
                warehouse_name: toWhName,
                product_id: pId,
                product_code: matchedProd?.code || 'ENS-PROD',
                product_name: newTransfer.productName || matchedProd?.name || 'Battery',
                quantity_on_hand: transferQty,
                unit_cost_bdt: unitCost,
                updated_at: new Date().toISOString(),
              });
            }
          }
        }
      } catch (err) {
        console.warn('Exception persisting stock transfer to Supabase:', err);
      }
    })();

    return id;
  };

  const approveStockTransfer = async (transferId: string) => {
    let targetTransfer: StockTransfer | undefined;
    setStockTransfers((prev) => {
      const next = prev.map((t) => {
        if (t.id === transferId) {
          targetTransfer = { ...t, status: 'In Transit', approvedBy: currentUser.name };
          return targetTransfer;
        }
        return t;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('ensec_stock_transfers', JSON.stringify(next));
      }
      return next;
    });

    if (!targetTransfer) return;
    const t = targetTransfer;
    const qty = Number(t.quantity || t.totalQuantity || 1);

    // Deduct from origin warehouse
    setWarehouses((whs) =>
      whs.map((w) =>
        w.id === t.fromWarehouseId || (w.name && t.fromWarehouseName && w.name.trim().toLowerCase() === t.fromWarehouseName.trim().toLowerCase())
          ? { ...w, currentStockUnits: Math.max(0, (w.currentStockUnits || 0) - qty) }
          : w
      )
    );

    // Post Transfer Out ledger
    const newLedger: StockLedgerEntry = {
      id: `sl-${Date.now()}`,
      date: new Date().toISOString().substring(0, 10),
      warehouseId: t.fromWarehouseId,
      warehouseName: t.fromWarehouseName,
      productId: t.productId,
      productName: t.productName,
      batchNumber: t.batchNumber || 'KUS-B2610-DISPATCH',
      transactionType: 'Transfer Out',
      referenceNo: t.transferNumber,
      qtyIn: 0,
      qtyOut: qty,
      balanceQty: 0,
      unitCostBDT: 65000,
      totalCostBDT: qty * 65000,
    };
    setStockLedger((sl) => {
      const next = [newLedger, ...sl];
      if (typeof window !== 'undefined') {
        localStorage.setItem('ensec_stock_ledger', JSON.stringify(next));
      }
      return next;
    });

    addAuditLog('STOCK_TRANSFER_APPROVED', 'Warehouse Management', `Transfer ${t.transferNumber} dispatched in-transit to ${t.toWarehouseName}`);

    // Remote sync
    const sb = getSupabase();
    if (sb) {
      try {
        const updateQuery = /^\d+$/.test(String(t.id))
          ? sb.from('stock_transfers').update({ status: 'In Transit', dispatched_by: currentUser.name }).eq('id', Number(t.id))
          : sb.from('stock_transfers').update({ status: 'In Transit', dispatched_by: currentUser.name }).eq('transfer_number', t.transferNumber);
        await updateQuery;
      } catch (e) {
        console.warn('Supabase approveStockTransfer error:', e);
      }
    }
  };

  const receiveStockTransfer = async (transferId: string) => {
    let targetTransfer: StockTransfer | undefined;
    setStockTransfers((prev) => {
      const next = prev.map((t) => {
        if (t.id === transferId) {
          targetTransfer = {
            ...t,
            status: 'Received',
            receivedDate: new Date().toISOString().substring(0, 10),
            receivedBy: currentUser.name,
          };
          return targetTransfer;
        }
        return t;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('ensec_stock_transfers', JSON.stringify(next));
      }
      return next;
    });

    if (!targetTransfer) return;
    const t = targetTransfer;
    const qty = Number(t.quantity || t.totalQuantity || 1);

    // Increment destination warehouse
    setWarehouses((whs) =>
      whs.map((w) =>
        w.id === t.toWarehouseId || (w.name && t.toWarehouseName && w.name.trim().toLowerCase() === t.toWarehouseName.trim().toLowerCase())
          ? { ...w, currentStockUnits: (w.currentStockUnits || 0) + qty }
          : w
      )
    );

    // Post Transfer In ledger
    const newLedger: StockLedgerEntry = {
      id: `sl-${Date.now()}`,
      date: new Date().toISOString().substring(0, 10),
      warehouseId: t.toWarehouseId,
      warehouseName: t.toWarehouseName,
      productId: t.productId,
      productName: t.productName,
      batchNumber: t.batchNumber || 'KUS-B2610-DISPATCH',
      transactionType: 'Transfer In',
      referenceNo: t.transferNumber,
      qtyIn: qty,
      qtyOut: 0,
      balanceQty: qty,
      unitCostBDT: 65000,
      totalCostBDT: qty * 65000,
    };
    setStockLedger((sl) => {
      const next = [newLedger, ...sl];
      if (typeof window !== 'undefined') {
        localStorage.setItem('ensec_stock_ledger', JSON.stringify(next));
      }
      return next;
    });

    addAuditLog('STOCK_TRANSFER_RECEIVED', 'Warehouse Management', `Transfer ${t.transferNumber} received at destination ${t.toWarehouseName}. Stock updated.`);

    // Remote sync
    const sb = getSupabase();
    if (sb) {
      try {
        const updateQuery = /^\d+$/.test(String(t.id))
          ? sb.from('stock_transfers').update({
              status: 'Received',
              received_by: currentUser.name,
            }).eq('id', Number(t.id))
          : sb.from('stock_transfers').update({
              status: 'Received',
              received_by: currentUser.name,
            }).eq('transfer_number', t.transferNumber);
        await updateQuery;

        // Update destination warehouse current_stock_units in Supabase
        const destWh = warehouses.find(
          (w) => w.id === t.toWarehouseId || (w.name && t.toWarehouseName && w.name.trim().toLowerCase() === t.toWarehouseName.trim().toLowerCase())
        );
        if (destWh) {
          const nextUnits = (destWh.currentStockUnits || 0) + qty;
          const whQuery = /^\d+$/.test(String(destWh.id))
            ? sb.from('warehouses').update({ current_stock_units: nextUnits }).eq('id', Number(destWh.id))
            : sb.from('warehouses').update({ current_stock_units: nextUnits }).eq('name', destWh.name);
          await whQuery;
        }
      } catch (e) {
        console.warn('Supabase receiveStockTransfer error:', e);
      }
    }
  };

  const adjustStock = (warehouseId: string, productId: string, qtyDelta: number, reason: string) => {
    const wh = warehouses.find((w) => w.id === warehouseId);
    const prod = products.find((p) => p.id === productId);
    if (!wh || !prod) return;

    setWarehouses((whs) =>
      whs.map((w) => (w.id === warehouseId ? { ...w, currentStockUnits: Math.max(0, w.currentStockUnits + qtyDelta) } : w))
    );

    const refNo = `ADJ-${Date.now().toString().slice(-4)}`;
    const newLedger: StockLedgerEntry = {
      id: `sl-${Date.now()}`,
      date: new Date().toISOString().substring(0, 10),
      warehouseId,
      warehouseName: wh.name,
      productId,
      productName: prod.name,
      batchNumber: 'BATCH-GENERIC',
      transactionType: qtyDelta < 0 ? 'Damage' : 'Adjustment',
      referenceNo: refNo,
      qtyIn: qtyDelta > 0 ? qtyDelta : 0,
      qtyOut: qtyDelta < 0 ? Math.abs(qtyDelta) : 0,
      balanceQty: 0,
      unitCostBDT: prod.distributorPriceBDT * 0.7,
      totalCostBDT: Math.abs(qtyDelta) * prod.distributorPriceBDT * 0.7,
    };
    setStockLedger((sl) => [newLedger, ...sl]);
    addAuditLog('STOCK_ADJUSTMENT', 'Warehouse Management', `Stock adjustment in ${wh.name} for ${prod.name}: ${qtyDelta > 0 ? '+' : ''}${qtyDelta} units. Reason: ${reason}`);
  };

  const addCIDStockReceipt = (receiptData: Omit<CIDStockReceipt, 'id' | 'createdAt'>): string => {
    const id = `cid-mrr-${Date.now()}`;
    const newReceipt: CIDStockReceipt = {
      ...receiptData,
      id,
      createdAt: new Date().toISOString(),
    };

    setCIDStockReceipts((prev) => [newReceipt, ...prev]);

    // Update target CID warehouse currentStockUnits
    const wh = warehouses.find((w) => w.id === receiptData.warehouseId);
    if (wh) {
      setWarehouses((prev) =>
        prev.map((w) =>
          w.id === receiptData.warehouseId
            ? { ...w, currentStockUnits: (w.currentStockUnits || 0) + receiptData.totalQuantity }
            : w
        )
      );
    }

    // Append ledger entries for each physical battery item received
    const newLedgerEntries: StockLedgerEntry[] = receiptData.items.map((item, idx) => ({
      id: `sl-cid-${Date.now()}-${idx}`,
      date: receiptData.receiptDate,
      warehouseId: receiptData.warehouseId,
      warehouseName: receiptData.warehouseName,
      productId: item.productId,
      productName: item.productName,
      batchNumber: item.batchNumber,
      transactionType: 'Manual CID Stock Receive',
      referenceNo: receiptData.mrrNumber,
      qtyIn: item.receivedQty,
      qtyOut: 0,
      balanceQty: item.receivedQty,
      unitCostBDT: item.unitCostBDT,
      totalCostBDT: item.totalCostBDT,
    }));

    setStockLedger((prev) => [...newLedgerEntries, ...prev]);

    addAuditLog(
      'STOCK_RECEIVED_CID',
      'Central Inventory (CID)',
      `Manual physical finished stock received: MRR ${receiptData.mrrNumber} with ${receiptData.totalQuantity} units (Valuation BDT ${receiptData.totalValueBDT.toLocaleString()}) entered into ${receiptData.warehouseName}.`
    );

    // Asynchronously persist to Supabase tables: stock_cid_receipts, stock_cid_receipt_items, and stock_inventory
    (async () => {
      const sb = getSupabase();
      if (!sb) return;

      try {
        let whId: number | null = null;
        if (receiptData.warehouseId && !isNaN(Number(receiptData.warehouseId)) && Number(receiptData.warehouseId) > 0) {
          whId = Number(receiptData.warehouseId);
        } else {
          const matchedWh = warehouses.find(
            (w) =>
              w.id === receiptData.warehouseId ||
              (w.name && receiptData.warehouseName && w.name.trim().toLowerCase() === receiptData.warehouseName.trim().toLowerCase())
          );
          if (matchedWh && !isNaN(Number(matchedWh.id)) && Number(matchedWh.id) > 0) {
            whId = Number(matchedWh.id);
          }
        }

        if (!whId && receiptData.warehouseName) {
          const { data: whRows } = await sb
            .from('warehouses')
            .select('id')
            .ilike('name', `%${receiptData.warehouseName.trim()}%`)
            .limit(1);
          if (whRows && whRows[0]?.id) {
            whId = Number(whRows[0].id);
          }
        }

        const receiptPayload = {
          voucher_id: id,
          mrr_number: receiptData.mrrNumber,
          receipt_date: receiptData.receiptDate || new Date().toISOString().slice(0, 10),
          source_type: receiptData.sourceType || 'Kushtia Manufacturing Plant',
          source_location: receiptData.sourceLocation || receiptData.sourceType || 'Kushtia Factory - Main Plant Bay 3',
          warehouse_id: whId,
          target_warehouse_name: receiptData.warehouseName || 'Central Warehouse',
          challan_number: receiptData.challanNumber || null,
          gate_pass_number: receiptData.gatePassNumber || null,
          carrier_vehicle_no: receiptData.carrierVehicleNo || null,
          driver_name: receiptData.driverName || null,
          driver_phone: receiptData.driverPhone || null,
          received_by: receiptData.receivedBy || 'Warehouse In-charge',
          qc_inspector: receiptData.qcInspector || 'Engr. Sohidul Islam (Lead QC)',
          qc_status: receiptData.qcStatus || 'QC Passed & Stamped',
          status: receiptData.status || 'Received & Stocked',
          total_items: receiptData.items?.length || 0,
          total_quantity: Number(receiptData.totalQuantity) || 0,
          total_amount_bdt: Number(receiptData.totalValueBDT || receiptData.totalAmountBDT) || 0,
          general_remarks: receiptData.generalRemarks || null,
        };

        const { data: receiptRows, error: receiptError } = await sb
          .from('stock_cid_receipts')
          .upsert(receiptPayload, { onConflict: 'mrr_number' })
          .select();

        if (receiptError) {
          console.error('Supabase stock_cid_receipts upsert error:', receiptError.message);
          return;
        }

        const insertedReceipt = receiptRows?.[0];
        const dbReceiptId = insertedReceipt?.id;

        if (dbReceiptId && receiptData.items && receiptData.items.length > 0) {
          const itemPayloads = receiptData.items.map((item) => {
            let prodId: number | null = null;
            if (item.productId && !isNaN(Number(item.productId)) && Number(item.productId) > 0) {
              prodId = Number(item.productId);
            } else {
              const matchedProd = products.find(
                (p) =>
                  p.id === item.productId ||
                  (item.productCode && p.code === item.productCode) ||
                  (item.productName && p.name.trim().toLowerCase() === item.productName.trim().toLowerCase())
              );
              if (matchedProd && !isNaN(Number(matchedProd.id))) {
                prodId = Number(matchedProd.id);
              }
            }

            return {
              receipt_id: dbReceiptId,
              mrr_number: receiptData.mrrNumber,
              product_id: prodId,
              product_code: item.productCode || item.sku || 'ENS-PROD',
              product_name: item.productName || 'Finished Goods Battery',
              sku: item.sku || item.productCode || null,
              category: item.category || null,
              batch_number: item.batchNumber || 'GEN-BATCH',
              serial_range: item.serialRange || null,
              received_qty: Number(item.receivedQty || item.quantity || 1),
              unit_cost_bdt: Number(item.unitCostBDT || 0),
              total_cost_bdt: Number(item.totalCostBDT || 0),
              rack_location: item.rackLocation || 'Row A - Shelf 01',
              package_condition: item.packageCondition || 'Factory Sealed',
              line_remarks: item.lineRemarks || null,
            };
          });

          // Delete existing items if re-posting same MRR
          await sb.from('stock_cid_receipt_items').delete().eq('receipt_id', dbReceiptId);

          const { error: itemsError } = await sb
            .from('stock_cid_receipt_items')
            .insert(itemPayloads);

          if (itemsError) {
            console.error('Supabase stock_cid_receipt_items insert error:', itemsError.message);
          }

          // Update stock_inventory balances for physical stock tracking
          if (whId) {
            for (const it of receiptData.items) {
              let prodId: number | null = null;
              if (it.productId && !isNaN(Number(it.productId)) && Number(it.productId) > 0) {
                prodId = Number(it.productId);
              } else {
                const matched = products.find(
                  (p) =>
                    p.id === it.productId ||
                    (it.productCode && p.code === it.productCode) ||
                    (it.productName && p.name.trim().toLowerCase() === it.productName.trim().toLowerCase())
                );
                if (matched && !isNaN(Number(matched.id))) {
                  prodId = Number(matched.id);
                }
              }

              if (prodId) {
                try {
                  const bNum = it.batchNumber || 'GEN-BATCH';
                  const { data: existingInv } = await sb
                    .from('stock_inventory')
                    .select('id, quantity_on_hand')
                    .eq('warehouse_id', whId)
                    .eq('product_id', prodId)
                    .eq('batch_number', bNum)
                    .maybeSingle();

                  const qty = Number(it.receivedQty || it.quantity || 1);
                  const uCost = Number(it.unitCostBDT || 0);

                  if (existingInv) {
                    await sb.from('stock_inventory').update({
                      quantity_on_hand: (Number(existingInv.quantity_on_hand) || 0) + qty,
                      unit_cost_bdt: uCost > 0 ? uCost : undefined,
                      last_mrr_number: receiptData.mrrNumber,
                      last_received_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    }).eq('id', existingInv.id);
                  } else {
                    await sb.from('stock_inventory').insert({
                      warehouse_id: whId,
                      warehouse_code: wh?.code || 'WH-CID',
                      warehouse_name: receiptData.warehouseName,
                      product_id: prodId,
                      product_code: it.productCode || it.sku || 'ENS-PROD',
                      product_name: it.productName,
                      sku: it.sku || it.productCode,
                      category: it.category,
                      batch_number: bNum,
                      rack_location: it.rackLocation || 'Row A - Shelf 01',
                      quantity_on_hand: qty,
                      quantity_reserved: 0,
                      unit_cost_bdt: uCost,
                      last_mrr_number: receiptData.mrrNumber,
                      last_received_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    });
                  }
                } catch (invErr) {
                  console.warn('stock_inventory update notice:', invErr);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Exception syncing CID stock receipt to Supabase:', err);
      }
    })();

    return id;
  };

  const updateCIDStockReceiptStatus = (receiptId: string, status: CIDStockReceipt['status']) => {
    setCIDStockReceipts((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, status } : r))
    );
    addAuditLog('STOCK_STATUS_UPDATE', 'Central Inventory (CID)', `MRR ${receiptId} status updated to ${status}.`);

    const sb = getSupabase();
    if (sb) {
      sb.from('stock_cid_receipts')
        .update({ status, updated_at: new Date().toISOString() })
        .or(`voucher_id.eq.${receiptId},mrr_number.eq.${receiptId}`)
        .then(({ error }) => {
          if (error) console.warn('Supabase stock_cid_receipts status update error:', error.message);
        });
    }
  };

  const deleteCIDStockReceipt = (receiptId: string) => {
    setCIDStockReceipts((prev) => prev.filter((r) => r.id !== receiptId));
    addAuditLog('STOCK_RECEIPT_DELETED', 'Central Inventory (CID)', `MRR voucher ${receiptId} removed.`);

    const sb = getSupabase();
    if (sb) {
      sb.from('stock_cid_receipts')
        .delete()
        .or(`voucher_id.eq.${receiptId},mrr_number.eq.${receiptId}`)
        .then(({ error }) => {
          if (error) console.warn('Supabase stock_cid_receipts delete error:', error.message);
        });
    }
  };

  const addOpeningStockRecord = (record: Omit<OpeningStockRecord, 'id'>): string => {
    const id = `op-${Date.now()}`;
    const newRecord: OpeningStockRecord = { ...record, id };
    setOpeningStockRecords((prev) => [newRecord, ...prev]);

    // Update warehouse stock
    setWarehouses((whs) =>
      whs.map((w) =>
        w.id === record.warehouseId
          ? { ...w, currentStockUnits: (w.currentStockUnits || 0) + record.quantity }
          : w
      )
    );

    // Ledger entry
    const newLedger: StockLedgerEntry = {
      id: `sl-op-${Date.now()}`,
      date: record.date,
      warehouseId: record.warehouseId,
      warehouseName: record.warehouseName,
      productId: record.productId,
      productName: record.productName,
      batchNumber: record.batchNumber,
      transactionType: 'Opening Stock',
      referenceNo: `OP-STOCK-${record.batchNumber}`,
      qtyIn: record.quantity,
      qtyOut: 0,
      balanceQty: record.quantity,
      unitCostBDT: record.unitCostBDT,
      totalCostBDT: record.totalCostBDT,
    };
    setStockLedger((prev) => [newLedger, ...prev]);

    addAuditLog(
      'OPENING_STOCK_CREATED',
      'Stock Master',
      `Opening physical stock recorded for ${record.productName} (${record.quantity} units, BDT ${record.totalCostBDT.toLocaleString()}) in ${record.warehouseName}.`
    );
    return id;
  };

  const bulkAddOpeningStockRecords = (records: Omit<OpeningStockRecord, 'id'>[]): number => {
    if (!records.length) return 0;
    const now = Date.now();
    const created = records.map((r, idx) => ({ ...r, id: `op-bulk-${now}-${idx}` }));
    setOpeningStockRecords((prev) => [...created, ...prev]);

    // Update warehouses
    const qtyByWh: Record<string, number> = {};
    records.forEach((r) => {
      qtyByWh[r.warehouseId] = (qtyByWh[r.warehouseId] || 0) + r.quantity;
    });

    setWarehouses((whs) =>
      whs.map((w) =>
        qtyByWh[w.id] ? { ...w, currentStockUnits: (w.currentStockUnits || 0) + qtyByWh[w.id] } : w
      )
    );

    // Post to ledger
    const ledgers: StockLedgerEntry[] = records.map((r, idx) => ({
      id: `sl-bulk-op-${now}-${idx}`,
      date: r.date,
      warehouseId: r.warehouseId,
      warehouseName: r.warehouseName,
      productId: r.productId,
      productName: r.productName,
      batchNumber: r.batchNumber,
      transactionType: 'Opening Stock',
      referenceNo: `BULK-OP-${r.batchNumber}`,
      qtyIn: r.quantity,
      qtyOut: 0,
      balanceQty: r.quantity,
      unitCostBDT: r.unitCostBDT,
      totalCostBDT: r.totalCostBDT,
    }));
    setStockLedger((prev) => [...ledgers, ...prev]);

    addAuditLog(
      'OPENING_STOCK_BULK_UPLOAD',
      'Stock Master',
      `Bulk opening stock ingested: ${records.length} line items committed.`
    );
    return records.length;
  };

  const addStockIssueRecord = (record: Omit<StockIssueRecord, 'id' | 'issueNumber'>): string => {
    const id = `iss-${Date.now()}`;
    const issueNumber = `ISS-2026-10-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: StockIssueRecord = { ...record, id, issueNumber };
    setStockIssueRecords((prev) => [newRecord, ...prev]);

    // Deduct stock from source warehouse
    setWarehouses((whs) =>
      whs.map((w) =>
        w.id === record.sourceWarehouseId
          ? { ...w, currentStockUnits: Math.max(0, (w.currentStockUnits || 0) - record.totalQty) }
          : w
      )
    );

    // Post each item to ledger
    const ledgers: StockLedgerEntry[] = record.items.map((item, idx) => ({
      id: `sl-iss-${Date.now()}-${idx}`,
      date: record.date,
      warehouseId: record.sourceWarehouseId,
      warehouseName: record.sourceWarehouseName,
      productId: item.productId,
      productName: item.productName,
      batchNumber: item.batchNumber,
      transactionType: record.issueType === 'Inter-Branch Transfer Out' ? 'Transfer Out' : 'Sales Invoice',
      referenceNo: issueNumber,
      qtyIn: 0,
      qtyOut: item.quantity,
      balanceQty: 0,
      unitCostBDT: item.unitPriceBDT,
      totalCostBDT: item.totalBDT,
    }));
    setStockLedger((prev) => [...ledgers, ...prev]);

    addAuditLog(
      'STOCK_ISSUED',
      'Stock Outward',
      `Finished stock issued (${issueNumber}): ${record.totalQty} units dispatched to ${record.recipientName}. Gate pass: ${record.gatePassNumber}.`
    );
    return id;
  };

  const addPrimaryReturnRecord = (record: Omit<PrimaryReturnRecord, 'id' | 'returnNumber'>): string => {
    const id = `ret-${Date.now()}`;
    const returnNumber = `PR-RET-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord: PrimaryReturnRecord = { ...record, id, returnNumber };
    setPrimaryReturnRecords((prev) => [newRecord, ...prev]);

    // If restocked to active CID, add back to warehouse
    if (record.qcStatus === 'Restocked to Active CID') {
      setWarehouses((whs) =>
        whs.map((w) =>
          w.id === record.warehouseId
            ? { ...w, currentStockUnits: (w.currentStockUnits || 0) + record.quantity }
            : w
        )
      );

      const newLedger: StockLedgerEntry = {
        id: `sl-ret-${Date.now()}`,
        date: record.date,
        warehouseId: record.warehouseId,
        warehouseName: record.warehouseName,
        productId: record.productId,
        productName: record.productName,
        batchNumber: record.batchNumber,
        transactionType: 'Sales Return',
        referenceNo: returnNumber,
        qtyIn: record.quantity,
        qtyOut: 0,
        balanceQty: record.quantity,
        unitCostBDT: record.unitPriceBDT,
        totalCostBDT: record.totalValueBDT,
      };
      setStockLedger((prev) => [newLedger, ...prev]);
    }

    addAuditLog(
      'PRIMARY_RETURN_RECORDED',
      'Stock Inward Return',
      `Primary stock return ${returnNumber} processed: ${record.quantity} units of ${record.productName} from ${record.distributorOrPlant}. Status: ${record.qcStatus}.`
    );
    return id;
  };

  const addStockAdjustmentRecord = (
    record: Omit<StockAdjustmentRecord, 'id' | 'referenceNo' | 'previousQty' | 'newQty' | 'totalCostVarianceBDT'>
  ): string => {
    const id = `adj-${Date.now()}`;
    const referenceNo = `ADJ-2026-10-${Math.floor(100 + Math.random() * 900)}`;
    const wh = warehouses.find((w) => w.id === record.warehouseId);
    const prevQty = wh?.currentStockUnits || 100;
    const newQty = Math.max(0, prevQty + record.qtyDelta);
    const totalCostVariance = record.qtyDelta * record.unitCostBDT;

    const newRecord: StockAdjustmentRecord = {
      ...record,
      id,
      referenceNo,
      previousQty: prevQty,
      newQty,
      totalCostVarianceBDT: totalCostVariance,
    };

    setStockAdjustmentRecords((prev) => [newRecord, ...prev]);

    // Update target warehouse current stock units
    setWarehouses((whs) =>
      whs.map((w) =>
        w.id === record.warehouseId
          ? { ...w, currentStockUnits: Math.max(0, (w.currentStockUnits || 0) + record.qtyDelta) }
          : w
      )
    );

    // Ledger entry
    const newLedger: StockLedgerEntry = {
      id: `sl-adj-${Date.now()}`,
      date: record.date,
      warehouseId: record.warehouseId,
      warehouseName: record.warehouseName,
      productId: record.productId,
      productName: record.productName,
      batchNumber: record.batchNumber || 'BATCH-ADJ',
      transactionType: record.qtyDelta < 0 ? 'Damage' : 'Adjustment',
      referenceNo,
      qtyIn: record.qtyDelta > 0 ? record.qtyDelta : 0,
      qtyOut: record.qtyDelta < 0 ? Math.abs(record.qtyDelta) : 0,
      balanceQty: newQty,
      unitCostBDT: record.unitCostBDT,
      totalCostBDT: Math.abs(totalCostVariance),
    };
    setStockLedger((prev) => [newLedger, ...prev]);

    addAuditLog(
      'STOCK_ADJUSTMENT_POSTED',
      'Warehouse Stock Management',
      `Stock adjustment ${referenceNo} in ${record.warehouseName} for ${record.productName}: ${record.qtyDelta > 0 ? '+' : ''}${record.qtyDelta} units. Reason: ${record.reason}`
    );

    return id;
  };

  const addWarehouse = async (
    whData: Omit<Warehouse, 'id'>
  ): Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }> => {
    const newId = `wh-${Date.now().toString().slice(-4)}`;
    const newWarehouse: Warehouse = {
      ...whData,
      id: newId,
      status: whData.status || 'Active',
      currentStockUnits: whData.currentStockUnits ?? 0,
    };
    setWarehouses((prev) => [...prev, newWarehouse]);
    addAuditLog(
      'WAREHOUSE_CREATED',
      'Basic Data & Warehouse',
      `Registered new warehouse: ${newWarehouse.name} (${newWarehouse.code}) located in ${newWarehouse.district}. Capacity: ${newWarehouse.capacityUnits.toLocaleString()} units.`
    );

    const sb = getSupabase();
    if (!sb) {
      return {
        success: true,
        id: newId,
        isRemoteSynced: false,
        error: 'Supabase credentials are not configured yet. Saved in local session.',
      };
    }

    try {
      const locationVal = newWarehouse.location?.trim() || `${newWarehouse.district || 'Dhaka'} Logistics Center`;
      const isFactory =
        newWarehouse.isFactoryPlant !== undefined
          ? Boolean(newWarehouse.isFactoryPlant)
          : newWarehouse.type === 'Factory Plant';

      // Standard payload matching Supabase warehouses table columns
      let currentPayload: any = {
        code: newWarehouse.code,
        name: newWarehouse.name,
        location: locationVal,
        district: newWarehouse.district || 'Dhaka',
        incharge_name: newWarehouse.inchargeName || newWarehouse.managerName || null,
        incharge_phone: newWarehouse.inchargePhone || newWarehouse.phone || null,
        is_factory_plant: isFactory,
        status: newWarehouse.status || 'Active',
      };

      let insertRes = await sb.from('warehouses').insert(currentPayload).select();

      // If columns do not exist in the table (code 42703 or PGRST204 schema cache error), dynamically strip and retry
      let stripRetries = 0;
      while (
        insertRes.error &&
        (insertRes.error.code === '42703' ||
          insertRes.error.code === 'PGRST204' ||
          insertRes.error.message?.includes('column') ||
          insertRes.error.message?.includes('schema cache')) &&
        stripRetries < 8
      ) {
        stripRetries++;
        const match =
          insertRes.error.message?.match(/Could not find the '([^']+)' column/i) ||
          insertRes.error.message?.match(/column "([^"]+)" of relation "warehouses" does not exist/i);
        if (match && match[1] && currentPayload[match[1]] !== undefined) {
          console.warn(`Stripping missing column "${match[1]}" and retrying warehouse insert...`);
          delete currentPayload[match[1]];
          insertRes = await sb.from('warehouses').insert(currentPayload).select();
        } else {
          break;
        }
      }

      if (insertRes.error) {
        let helpfulMessage = insertRes.error.message;
        if (insertRes.error.code === '42P01' || insertRes.error.message?.includes('relation "warehouses" does not exist')) {
          helpfulMessage = 'Table "warehouses" does not exist in your Supabase database yet. Run the SQL script from "Database Setup & SQL" in your Supabase SQL Editor.';
        } else if (insertRes.error.code === '42501' || insertRes.error.message?.toLowerCase().includes('row-level security')) {
          helpfulMessage = 'Row-Level Security (RLS) is blocking inserts on table "warehouses". Run the RLS policy SQL script in Supabase SQL Editor to allow public access.';
        }
        console.error('Failed to save warehouse to Supabase:', helpfulMessage, insertRes.error);
        return {
          success: false,
          id: newId,
          error: helpfulMessage,
          isRemoteSynced: false,
        };
      }

      // If confirmed row returned, update warehouse with confirmed database ID
      if (insertRes.data && insertRes.data[0]) {
        const confirmedRow = insertRes.data[0];
        const confirmedId = String(confirmedRow.id);
        setWarehouses((prev) =>
          prev.map((w) =>
            w.id === newId || w.code === newWarehouse.code
              ? {
                  ...w,
                  id: confirmedId,
                  code: confirmedRow.code || w.code,
                  name: confirmedRow.name || w.name,
                  type: confirmedRow.type || w.type,
                  district: confirmedRow.district || w.district,
                  location: confirmedRow.location || w.location,
                  managerName: confirmedRow.manager_name || w.managerName,
                  phone: confirmedRow.phone || w.phone,
                  email: confirmedRow.email || w.email,
                  capacityUnits: Number(confirmedRow.capacity_units ?? w.capacityUnits) || 0,
                  currentStockUnits: Number(confirmedRow.current_stock_units ?? w.currentStockUnits) || 0,
                  status: confirmedRow.status || w.status,
                }
              : w
          )
        );
        await refreshWarehouses();
        return {
          success: true,
          id: confirmedId,
          isRemoteSynced: true,
        };
      }

      await refreshWarehouses();
      return {
        success: true,
        id: newId,
        isRemoteSynced: true,
      };
    } catch (err: any) {
      console.error('Exception inserting warehouse to Supabase:', err);
      return {
        success: false,
        id: newId,
        error: err.message || 'Database connection error',
        isRemoteSynced: false,
      };
    }
  };

  const updateWarehouse = async (
    warehouseId: string,
    updates: Partial<Warehouse>
  ): Promise<{ success: boolean; error?: string; isRemoteSynced: boolean }> => {
    setWarehouses((prev) =>
      prev.map((wh) => (wh.id === warehouseId ? { ...wh, ...updates } : wh))
    );
    addAuditLog(
      'WAREHOUSE_UPDATED',
      'Basic Data & Warehouse',
      `Updated warehouse ID: ${warehouseId} configuration and master details.`
    );

    const sb = getSupabase();
    if (!sb) {
      return { success: true, isRemoteSynced: false };
    }

    try {
      const payload: any = {};
      if (updates.code) payload.code = updates.code;
      if (updates.name) payload.name = updates.name;
      if (updates.district) payload.district = updates.district;
      if (updates.location !== undefined) payload.location = updates.location;
      if (updates.inchargeName !== undefined || updates.managerName !== undefined) {
        payload.incharge_name = updates.inchargeName || updates.managerName;
      }
      if (updates.inchargePhone !== undefined || updates.phone !== undefined) {
        payload.incharge_phone = updates.inchargePhone || updates.phone;
      }
      if (updates.isFactoryPlant !== undefined || updates.type !== undefined) {
        payload.is_factory_plant =
          updates.isFactoryPlant !== undefined
            ? Boolean(updates.isFactoryPlant)
            : updates.type === 'Factory Plant';
      }
      if (updates.status !== undefined) payload.status = updates.status;
      payload.updated_at = new Date().toISOString();

      const isNumeric = /^\d+$/.test(warehouseId);
      const query = isNumeric
        ? sb.from('warehouses').update(payload).eq('id', Number(warehouseId))
        : sb.from('warehouses').update(payload).eq('code', updates.code || warehouseId);

      const { error } = await query;
      if (error) {
        console.error('Failed to update warehouse in Supabase:', error);
        return { success: false, error: error.message, isRemoteSynced: false };
      }
      return { success: true, isRemoteSynced: true };
    } catch (err: any) {
      return { success: false, error: err.message, isRemoteSynced: false };
    }
  };

  const deleteWarehouse = async (
    warehouseId: string
  ): Promise<{ success: boolean; error?: string; isRemoteSynced: boolean }> => {
    const target = warehouses.find((w) => w.id === warehouseId);
    if (!target) return { success: false, error: 'Warehouse not found', isRemoteSynced: false };
    setWarehouses((prev) => prev.filter((w) => w.id !== warehouseId));
    addAuditLog(
      'WAREHOUSE_DELETED',
      'Basic Data & Warehouse',
      `Deleted warehouse hub: ${target.name} (${target.code}).`
    );

    const sb = getSupabase();
    if (!sb) {
      return { success: true, isRemoteSynced: false };
    }

    try {
      const isNumeric = /^\d+$/.test(warehouseId);
      const query = isNumeric
        ? sb.from('warehouses').delete().eq('id', Number(warehouseId))
        : sb.from('warehouses').delete().eq('code', target.code);

      const { error } = await query;
      if (error) {
        console.error('Failed to delete warehouse from Supabase:', error);
        return { success: false, error: error.message, isRemoteSynced: false };
      }
      return { success: true, isRemoteSynced: true };
    } catch (err: any) {
      return { success: false, error: err.message, isRemoteSynced: false };
    }
  };

  const toggleWarehouseStatus = async (
    warehouseId: string
  ): Promise<{ success: boolean; error?: string; isRemoteSynced: boolean }> => {
    let nextStatus = 'Active';
    let targetWh: Warehouse | undefined;
    setWarehouses((prev) =>
      prev.map((wh) => {
        if (wh.id === warehouseId) {
          nextStatus = wh.status === 'Inactive' ? 'Active' : 'Inactive';
          targetWh = wh;
          addAuditLog(
            'WAREHOUSE_STATUS_CHANGED',
            'Basic Data & Warehouse',
            `Changed status of warehouse ${wh.name} to ${nextStatus}.`
          );
          return { ...wh, status: nextStatus };
        }
        return wh;
      })
    );

    const sb = getSupabase();
    if (!sb) {
      return { success: true, isRemoteSynced: false };
    }

    try {
      const isNumeric = /^\d+$/.test(warehouseId);
      const query = isNumeric
        ? sb
            .from('warehouses')
            .update({ status: nextStatus, updated_at: new Date().toISOString() })
            .eq('id', Number(warehouseId))
        : sb
            .from('warehouses')
            .update({ status: nextStatus, updated_at: new Date().toISOString() })
            .eq('code', targetWh?.code || warehouseId);
      const { error } = await query;
      if (error) {
        console.warn('Failed to sync warehouse status toggle to Supabase:', error);
        return { success: false, error: error.message, isRemoteSynced: false };
      }
      return { success: true, isRemoteSynced: true };
    } catch (err: any) {
      return { success: false, error: err.message, isRemoteSynced: false };
    }
  };

  const syncAllWarehousesToSupabase = async (): Promise<{
    successCount: number;
    failCount: number;
    errors: string[];
  }> => {
    const sb = getSupabase();
    if (!sb) {
      return {
        successCount: 0,
        failCount: warehouses.length,
        errors: ['Supabase credentials are not configured.'],
      };
    }
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const wh of warehouses) {
      try {
        const locationVal = wh.location?.trim() || `${wh.district || 'Dhaka'} Logistics Center`;
        const isFactory =
          wh.isFactoryPlant !== undefined
            ? Boolean(wh.isFactoryPlant)
            : wh.type === 'Factory Plant';

        const payload: any = {
          code: wh.code,
          name: wh.name,
          location: locationVal,
          district: wh.district || 'Dhaka',
          incharge_name: wh.inchargeName || wh.managerName || null,
          incharge_phone: wh.inchargePhone || wh.phone || null,
          is_factory_plant: isFactory,
          status: wh.status || 'Active',
        };
        const res = await sb
          .from('warehouses')
          .upsert(payload, { onConflict: 'code' })
          .select();
        if (res.error) {
          failCount++;
          errors.push(`${wh.name} (${wh.code}): ${res.error.message}`);
        } else {
          successCount++;
        }
      } catch (e: any) {
        failCount++;
        errors.push(`${wh.name}: ${e.message}`);
      }
    }
    await refreshWarehouses();
    return { successCount, failCount, errors };
  };

  // Stage 6 & 7: Distributors & Customers
  const updateDistributorCreditLimit = async (
    distId: string,
    newLimit: number
  ): Promise<{ success: boolean; error?: string; isRemoteSynced: boolean }> => {
    let targetDist: Distributor | undefined;
    setDistributors((prev) =>
      prev.map((d) => {
        if (d.id === distId) {
          targetDist = d;
          const oldLimit = d.creditLimitBDT;
          addAuditLog(
            'CREDIT_LIMIT_MODIFIED',
            'Distributor Management',
            `Modified credit limit for ${d.name} from BDT ${oldLimit.toLocaleString()} to BDT ${newLimit.toLocaleString()}`
          );
          return { ...d, creditLimitBDT: newLimit };
        }
        return d;
      })
    );

    const sb = getSupabase();
    if (!sb) {
      return { success: true, isRemoteSynced: false, error: 'Supabase is not configured (updated locally).' };
    }

    try {
      const isNumeric = /^\d+$/.test(distId);
      const query = isNumeric
        ? sb.from('distributors').update({ credit_limit_bdt: newLimit }).eq('id', Number(distId))
        : sb.from('distributors').update({ credit_limit_bdt: newLimit }).eq('code', targetDist?.code || distId);
      const { error } = await query;
      if (error) {
        console.error('Supabase updateDistributorCreditLimit error:', error);
        return { success: false, error: error.message, isRemoteSynced: false };
      }
      return { success: true, isRemoteSynced: true };
    } catch (err: any) {
      return { success: false, error: err.message, isRemoteSynced: false };
    }
  };

  const updateDistributor = async (
    distId: string,
    updates: Partial<Distributor>
  ): Promise<{ success: boolean; error?: string; isRemoteSynced: boolean }> => {
    let updatedDist: Distributor | undefined;
    setDistributors((prev) =>
      prev.map((d) => {
        if (d.id === distId) {
          const updated = { ...d, ...updates };
          updatedDist = updated;
          addAuditLog(
            'DISTRIBUTOR_UPDATED',
            'Distributor Management',
            `Updated profile and settings for distributor ${updated.name} (${updated.code})`
          );
          return updated;
        }
        return d;
      })
    );

    const sb = getSupabase();
    if (!sb) {
      return { success: true, isRemoteSynced: false, error: 'Supabase is not configured (updated locally).' };
    }

    try {
      const target = updatedDist || distributors.find((d) => d.id === distId);
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.code !== undefined) payload.code = updates.code;
      if (updates.ownerName !== undefined) {
        payload.owner_name = updates.ownerName;
        payload.proprietor_name = updates.ownerName;
      }
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.email !== undefined) payload.email = updates.email || null;
      if (updates.district !== undefined) payload.district = updates.district;
      if (updates.region !== undefined) payload.region = updates.region;
      if (updates.territory !== undefined) {
        payload.territory = updates.territory;
        payload.area = updates.territory;
      }
      if (updates.dbPoint !== undefined) payload.db_point = updates.dbPoint;
      if (updates.marketHierarchy !== undefined) payload.market_hierarchy = updates.marketHierarchy;
      if (updates.departments !== undefined) payload.departments = updates.departments;
      if (updates.creditLimitBDT !== undefined) payload.credit_limit_bdt = updates.creditLimitBDT;
      if (updates.openingBalanceBDT !== undefined) {
        payload.opening_balance_bdt = updates.openingBalanceBDT;
        payload.current_balance_bdt = updates.openingBalanceBDT;
      }
      if (updates.paymentTermsDays !== undefined) payload.payment_terms_days = updates.paymentTermsDays;
      if (updates.assignedSalespersonId !== undefined) {
        payload.assigned_salesperson_id = updates.assignedSalespersonId || null;
        payload.assigned_rep_id = updates.assignedSalespersonId || null;
      }
      if (updates.assignedSalespersonName !== undefined) {
        payload.assigned_salesperson_name = updates.assignedSalespersonName || null;
        payload.assigned_rep_name = updates.assignedSalespersonName || null;
      }
      if (updates.customerCategoryId !== undefined) payload.customer_category_id = updates.customerCategoryId || null;
      if (updates.customerCategoryName !== undefined) payload.customer_category_name = updates.customerCategoryName || null;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.address !== undefined) payload.address = updates.address;
      if (updates.discontinueDate !== undefined) payload.discontinue_date = updates.discontinueDate || null;

      let currentPayload: any = { ...payload };
      const isNumeric = /^\d+$/.test(distId);
      let query = isNumeric
        ? sb.from('distributors').update(currentPayload).eq('id', Number(distId))
        : sb.from('distributors').update(currentPayload).eq('code', target?.code || distId);

      let updateRes = await query;

      // If schema error (e.g. 42703 column does not exist), dynamically strip unrecognized columns and retry
      let stripRetries = 0;
      while (
        updateRes.error &&
        (updateRes.error.code === '42703' || updateRes.error.message?.includes('column')) &&
        stripRetries < 10
      ) {
        stripRetries++;
        const match = updateRes.error.message?.match(/column "([^"]+)" of relation "distributors" does not exist/i);
        if (match && match[1] && currentPayload[match[1]] !== undefined) {
          console.warn(`Stripping missing column "${match[1]}" from update and retrying...`);
          delete currentPayload[match[1]];
          const retryQuery = isNumeric
            ? sb.from('distributors').update(currentPayload).eq('id', Number(distId))
            : sb.from('distributors').update(currentPayload).eq('code', target?.code || distId);
          updateRes = await retryQuery;
        } else {
          break;
        }
      }
      let error = updateRes.error;

      if (error) {
        console.error('Supabase distributor update failed:', error);
        return { success: false, error: error.message, isRemoteSynced: false };
      }
      return { success: true, isRemoteSynced: true };
    } catch (err: any) {
      console.error('Exception updating distributor in Supabase:', err);
      return { success: false, error: err.message, isRemoteSynced: false };
    }
  };

  const addDistributor = async (
    dist: Omit<Distributor, 'id' | 'currentOutstandingBDT'>
  ): Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }> => {
    const tempId = `dist-${Date.now().toString().slice(-4)}`;
    const newDist: Distributor = {
      ...dist,
      id: tempId,
      currentOutstandingBDT: dist.openingBalanceBDT || 0,
    };
    setDistributors((prev) => [newDist, ...prev]);
    addAuditLog(
      'DISTRIBUTOR_ENROLLED',
      'Distributor Management',
      `Registered distributor ${newDist.name} (${newDist.code}) in ${newDist.district}`
    );

    const sb = getSupabase();
    if (!sb) {
      return {
        success: true,
        id: tempId,
        isRemoteSynced: false,
        error: 'Supabase is not configured. Saved in local session only.',
      };
    }

    try {
      // 1. Try full schema payload
      const fullPayload: any = {
        code: newDist.code,
        name: newDist.name,
        owner_name: newDist.ownerName || null,
        proprietor_name: newDist.ownerName || null,
        phone: newDist.phone,
        email: newDist.email || null,
        district: newDist.district || null,
        region: newDist.region || null,
        area: newDist.territory || null,
        territory: newDist.territory || null,
        address: newDist.address || null,
        db_point: newDist.dbPoint || null,
        market_hierarchy: newDist.marketHierarchy || null,
        departments: newDist.departments || [],
        credit_limit_bdt: newDist.creditLimitBDT || 0,
        current_balance_bdt: newDist.openingBalanceBDT || 0,
        current_outstanding_bdt: newDist.openingBalanceBDT || 0,
        opening_balance_bdt: newDist.openingBalanceBDT || 0,
        payment_terms_days: newDist.paymentTermsDays || 30,
        assigned_salesperson_id: newDist.assignedSalespersonId || null,
        assigned_salesperson_name: newDist.assignedSalespersonName || null,
        assigned_rep_id: newDist.assignedSalespersonId || null,
        assigned_rep_name: newDist.assignedSalespersonName || null,
        customer_category_id: newDist.customerCategoryId || null,
        customer_category_name: newDist.customerCategoryName || null,
        discontinue_date: newDist.discontinueDate?.trim() ? newDist.discontinueDate : null,
        status: newDist.status || 'Active',
      };

      let currentPayload: any = { ...fullPayload };
      let insertRes = await sb.from('distributors').insert(currentPayload).select();

      // If columns do not exist in the table (code 42703), dynamically strip missing columns and retry
      let stripRetries = 0;
      while (
        insertRes.error &&
        (insertRes.error.code === '42703' || insertRes.error.message?.includes('column')) &&
        stripRetries < 10
      ) {
        stripRetries++;
        const match = insertRes.error.message?.match(/column "([^"]+)" of relation "distributors" does not exist/i);
        if (match && match[1] && currentPayload[match[1]] !== undefined) {
          console.warn(`Stripping missing column "${match[1]}" and retrying insert...`);
          delete currentPayload[match[1]];
          insertRes = await sb.from('distributors').insert(currentPayload).select();
        } else {
          // Fallback to core columns
          const corePayload: any = {
            code: newDist.code,
            name: newDist.name,
            phone: newDist.phone,
            status: newDist.status || 'Active',
          };
          if (newDist.ownerName) corePayload.owner_name = newDist.ownerName;
          if (newDist.email) corePayload.email = newDist.email;
          if (newDist.region) corePayload.region = newDist.region;
          if (newDist.address) corePayload.address = newDist.address;
          if (newDist.creditLimitBDT) corePayload.credit_limit_bdt = newDist.creditLimitBDT;
          insertRes = await sb.from('distributors').insert(corePayload).select();
          break;
        }
      }

      // If duplicate key error on code (code 23505), append random suffix and retry
      if (
        insertRes.error &&
        (insertRes.error.code === '23505' ||
          insertRes.error.message?.includes('unique') ||
          insertRes.error.message?.includes('duplicate key'))
      ) {
        const uniqueCode = `${newDist.code}-${Math.floor(100 + Math.random() * 900)}`;
        currentPayload.code = uniqueCode;
        insertRes = await sb.from('distributors').insert(currentPayload).select();
      }

      if (insertRes.error) {
        console.error('Supabase distributor insert failed:', insertRes.error);
        return {
          success: false,
          id: tempId,
          error: insertRes.error.message,
          isRemoteSynced: false,
        };
      }

      const realId = insertRes.data?.[0]?.id ? String(insertRes.data[0].id) : tempId;
      if (realId !== tempId) {
        setDistributors((prev) =>
          prev.map((d) => (d.id === tempId ? { ...d, id: realId } : d))
        );
      }

      return {
        success: true,
        id: realId,
        isRemoteSynced: true,
      };
    } catch (err: any) {
      console.error('Exception syncing distributor to Supabase:', err);
      return {
        success: false,
        id: tempId,
        error: err.message || 'Network exception',
        isRemoteSynced: false,
      };
    }
  };

  const deleteDistributor = async (
    distId: string
  ): Promise<{ success: boolean; error?: string; isRemoteSynced: boolean }> => {
    const target = distributors.find((d) => d.id === distId);
    setDistributors((prev) => prev.filter((d) => d.id !== distId));
    addAuditLog(
      'DISTRIBUTOR_DELETED',
      'Distributor Management',
      `Deleted distributor ${target?.name || distId} (${target?.code || distId})`
    );

    const sb = getSupabase();
    if (!sb) {
      return { success: true, isRemoteSynced: false, error: 'Supabase not configured' };
    }

    try {
      const isNumeric = /^\d+$/.test(distId);
      const query = isNumeric
        ? sb.from('distributors').delete().eq('id', Number(distId))
        : sb.from('distributors').delete().eq('code', target?.code || distId);
      const { error } = await query;
      if (error) {
        console.error('Supabase distributor delete failed:', error);
        return { success: false, error: error.message, isRemoteSynced: false };
      }
      return { success: true, isRemoteSynced: true };
    } catch (err: any) {
      return { success: false, error: err.message, isRemoteSynced: false };
    }
  };

  const addCustomer = async (
    cust: Omit<Customer, 'id' | 'outstandingBalanceBDT'>
  ): Promise<{ success: boolean; id: string; error?: string; isRemoteSynced: boolean }> => {
    const tempId = `cust-${Date.now().toString().slice(-4)}`;
    const newCust: Customer = {
      ...cust,
      id: tempId,
      outstandingBalanceBDT: 0,
    };
    setCustomers((prev) => [newCust, ...prev]);
    addAuditLog('CUSTOMER_CREATED', 'Customer Management', `Added customer ${newCust.name} (${newCust.channel})`);

    const sb = getSupabase();
    if (!sb) {
      return {
        success: true,
        id: tempId,
        isRemoteSynced: false,
        error: 'Supabase is not configured. Saved in local session only.',
      };
    }

    try {
      let assignedDistIdNum: number | null = null;
      if (newCust.assignedDistributorId) {
        if (/^\d+$/.test(newCust.assignedDistributorId)) {
          assignedDistIdNum = Number(newCust.assignedDistributorId);
        } else {
          const foundDist = distributors.find(
            (d) => d.id === newCust.assignedDistributorId || d.code === newCust.assignedDistributorId
          );
          if (foundDist && /^\d+$/.test(foundDist.id)) {
            assignedDistIdNum = Number(foundDist.id);
          }
        }
      }

      const payload: any = {
        code: newCust.code || `CUST-${Date.now()}`,
        name: newCust.name,
        owner_name: newCust.ownerName || null,
        phone: newCust.phone,
        email: newCust.email || null,
        channel: newCust.channel || 'Distributor Sales',
        customer_type: newCust.customerType || 'Retailer',
        pricing_tier: newCust.pricingTier || 'Dealer / Retailer Channel',
        assigned_distributor_id: assignedDistIdNum,
        assigned_distributor_name: newCust.assignedDistributorName || null,
        district: newCust.district || 'Dhaka',
        territory: newCust.marketHierarchy || newCust.territory || 'Mirpur',
        address: newCust.address || null,
        credit_limit_bdt: Number(newCust.creditLimitBDT) || 0,
        outstanding_balance_bdt: 0,
        status: newCust.status || 'Active',
      };

      let currentPayload = { ...payload };
      let insertRes = await sb.from('customers').insert(currentPayload).select();

      let stripRetries = 0;
      while (
        insertRes.error &&
        (insertRes.error.code === '42703' ||
          insertRes.error.code === 'PGRST204' ||
          insertRes.error.message?.includes('column')) &&
        stripRetries < 5
      ) {
        stripRetries++;
        const match =
          insertRes.error.message?.match(/column "([^"]+)"/i) ||
          insertRes.error.message?.match(/'([^']+)' column/i);
        if (match && match[1] && currentPayload[match[1]] !== undefined) {
          console.warn(`Stripping missing column "${match[1]}" from customer insert and retrying...`);
          delete currentPayload[match[1]];
          insertRes = await sb.from('customers').insert(currentPayload).select();
        } else {
          break;
        }
      }

      if (insertRes.error) {
        console.error('Supabase customer insert failed:', insertRes.error);
        return { success: false, id: tempId, error: insertRes.error.message, isRemoteSynced: false };
      }

      if (insertRes.data && insertRes.data.length > 0) {
        const createdRow = insertRes.data[0];
        const realId = String(createdRow.id);
        setCustomers((prev) =>
          prev.map((c) => (c.id === tempId ? { ...c, id: realId } : c))
        );
        return { success: true, id: realId, isRemoteSynced: true };
      }

      return { success: true, id: tempId, isRemoteSynced: true };
    } catch (err: any) {
      console.error('Exception inserting customer into Supabase:', err);
      return { success: false, id: tempId, error: err.message, isRemoteSynced: false };
    }
  };

  const updateCustomer = async (
    customerId: string,
    updates: Partial<Customer>
  ): Promise<{ success: boolean; error?: string; isRemoteSynced: boolean }> => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, ...updates } : c))
    );
    addAuditLog('CUSTOMER_UPDATED', 'Customer Management', `Updated customer profile ${customerId}`);

    const sb = getSupabase();
    if (!sb) {
      return { success: true, isRemoteSynced: false, error: 'Saved in local session only.' };
    }

    try {
      const target = customers.find((c) => c.id === customerId);
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.ownerName !== undefined) payload.owner_name = updates.ownerName || null;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.email !== undefined) payload.email = updates.email || null;
      if (updates.channel !== undefined) payload.channel = updates.channel;
      if (updates.customerType !== undefined) payload.customer_type = updates.customerType;
      if (updates.pricingTier !== undefined) payload.pricing_tier = updates.pricingTier;
      if (updates.assignedDistributorId !== undefined) {
        const dId = updates.assignedDistributorId;
        payload.assigned_distributor_id = dId && /^\d+$/.test(dId) ? Number(dId) : null;
      }
      if (updates.assignedDistributorName !== undefined) {
        payload.assigned_distributor_name = updates.assignedDistributorName || null;
      }
      if (updates.district !== undefined) payload.district = updates.district;
      if (updates.marketHierarchy !== undefined || updates.territory !== undefined) {
        payload.territory = updates.marketHierarchy || updates.territory || null;
      }
      if (updates.address !== undefined) payload.address = updates.address || null;
      if (updates.creditLimitBDT !== undefined) payload.credit_limit_bdt = Number(updates.creditLimitBDT);
      if (updates.status !== undefined) payload.status = updates.status;

      let currentPayload = { ...payload };
      const isNumeric = /^\d+$/.test(customerId);
      let query = isNumeric
        ? sb.from('customers').update(currentPayload).eq('id', Number(customerId))
        : sb.from('customers').update(currentPayload).eq('code', target?.code || customerId);

      let updateRes = await query;
      let stripRetries = 0;
      while (
        updateRes.error &&
        (updateRes.error.code === '42703' ||
          updateRes.error.code === 'PGRST204' ||
          updateRes.error.message?.includes('column')) &&
        stripRetries < 5
      ) {
        stripRetries++;
        const match =
          updateRes.error.message?.match(/column "([^"]+)"/i) ||
          updateRes.error.message?.match(/'([^']+)' column/i);
        if (match && match[1] && currentPayload[match[1]] !== undefined) {
          delete currentPayload[match[1]];
          const retryQuery = isNumeric
            ? sb.from('customers').update(currentPayload).eq('id', Number(customerId))
            : sb.from('customers').update(currentPayload).eq('code', target?.code || customerId);
          updateRes = await retryQuery;
        } else {
          break;
        }
      }

      if (updateRes.error) {
        console.error('Supabase customer update failed:', updateRes.error);
        return { success: false, error: updateRes.error.message, isRemoteSynced: false };
      }
      return { success: true, isRemoteSynced: true };
    } catch (err: any) {
      console.error('Exception updating customer in Supabase:', err);
      return { success: false, error: err.message, isRemoteSynced: false };
    }
  };

  const deleteCustomer = async (
    customerId: string
  ): Promise<{ success: boolean; error?: string; isRemoteSynced: boolean }> => {
    const target = customers.find((c) => c.id === customerId);
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    addAuditLog('CUSTOMER_DELETED', 'Customer Management', `Deleted customer ${target?.name || customerId}`);

    const sb = getSupabase();
    if (!sb) {
      return { success: true, isRemoteSynced: false, error: 'Local session only.' };
    }

    try {
      const isNumeric = /^\d+$/.test(customerId);
      const query = isNumeric
        ? sb.from('customers').delete().eq('id', Number(customerId))
        : sb.from('customers').delete().eq('code', target?.code || customerId);

      const { error } = await query;
      if (error) {
        console.error('Supabase customer delete failed:', error);
        return { success: false, error: error.message, isRemoteSynced: false };
      }
      return { success: true, isRemoteSynced: true };
    } catch (err: any) {
      return { success: false, error: err.message, isRemoteSynced: false };
    }
  };

  const updateCustomerPricingTier = (customerId: string, tier: PricingTier) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, pricingTier: tier } : c))
    );
    addAuditLog('CUSTOMER_PRICING_TIER_UPDATED', 'Pricing Engine', `Updated pricing channel tier for customer ID ${customerId} to ${tier}`);
  };

  const addCustomerCategory = (categoryData: Omit<CustomerCategory, 'id'>) => {
    const id = `cust-cat-${Date.now()}`;
    const newCategory: CustomerCategory = {
      ...categoryData,
      id,
      customerCount: 0,
      distributorCount: 0,
      productPriceCount: 0,
      createdAt: new Date().toISOString().substring(0, 10),
    };
    setCustomerCategories((prev) => [...prev, newCategory]);
    addAuditLog(
      'CUSTOMER_CATEGORY_CREATED',
      'Pricing Engine',
      `Created customer category ${newCategory.name} (${newCategory.code})`
    );
    const sb = getSupabase();
    if (sb) {
      sb.from('customer_categories')
        .insert({
          code: newCategory.code,
          name: newCategory.name,
          description: newCategory.description,
          target_audience: newCategory.targetAudience,
          discount_percentage: newCategory.discountPercentage,
          price_markup_percentage: newCategory.priceMarkupPercentage,
          status: newCategory.status,
          customer_count: 0,
          distributor_count: 0,
          product_price_count: 0,
        })
        .then(({ error }) => {
          if (error) {
            console.error('Supabase customer_categories insert failed:', error);
            setCustomerCategories((prev) => prev.filter((c) => c.id !== id));
          }
        });
    }
    return id;
  };

  const updateCustomerCategory = (categoryId: string, updates: Partial<CustomerCategory>) => {
    setCustomerCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, ...updates } : c))
    );
    // If name updated, sync customerCategoryName in customers and distributors
    if (updates.name) {
      setCustomers((prev) =>
        prev.map((cust) =>
          cust.customerCategoryId === categoryId
            ? { ...cust, customerCategoryName: updates.name }
            : cust
        )
      );
      setDistributors((prev) =>
        prev.map((dist) =>
          dist.customerCategoryId === categoryId
            ? { ...dist, customerCategoryName: updates.name }
            : dist
        )
      );
    }
    addAuditLog(
      'CUSTOMER_CATEGORY_UPDATED',
      'Pricing Engine',
      `Updated customer category ID ${categoryId}`
    );
    const sb = getSupabase();
    if (sb) {
      const target = customerCategories.find((c) => c.id === categoryId);
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.code !== undefined) payload.code = updates.code;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.targetAudience !== undefined) payload.target_audience = updates.targetAudience;
      if (updates.discountPercentage !== undefined) payload.discount_percentage = updates.discountPercentage;
      if (updates.priceMarkupPercentage !== undefined) payload.price_markup_percentage = updates.priceMarkupPercentage;
      if (updates.status !== undefined) payload.status = updates.status;
      const q = !isNaN(Number(categoryId))
        ? sb.from('customer_categories').update(payload).eq('id', Number(categoryId))
        : sb.from('customer_categories').update(payload).eq('code', target?.code || categoryId);
      q.then();
    }
  };

  const deleteCustomerCategory = (categoryId: string) => {
    const target = customerCategories.find((c) => c.id === categoryId);
    setCustomerCategories((prev) => prev.filter((c) => c.id !== categoryId));
    // Clear associations
    setCustomers((prev) =>
      prev.map((cust) =>
        cust.customerCategoryId === categoryId
          ? { ...cust, customerCategoryId: undefined, customerCategoryName: undefined }
          : cust
      )
    );
    setDistributors((prev) =>
      prev.map((dist) =>
        dist.customerCategoryId === categoryId
          ? { ...dist, customerCategoryId: undefined, customerCategoryName: undefined }
          : dist
      )
    );
    // Remove categoryPrices from products
    setProducts((prev) =>
      prev.map((p) => {
        if (p.categoryPrices && p.categoryPrices[categoryId]) {
          const { [categoryId]: _, ...rest } = p.categoryPrices;
          return { ...p, categoryPrices: rest };
        }
        return p;
      })
    );
    addAuditLog(
      'CUSTOMER_CATEGORY_DELETED',
      'Pricing Engine',
      `Deleted customer category ${target?.name || categoryId}`
    );
    const sb = getSupabase();
    if (sb) {
      const q = !isNaN(Number(categoryId))
        ? sb.from('customer_categories').delete().eq('id', Number(categoryId))
        : sb.from('customer_categories').delete().eq('code', target?.code || categoryId);
      q.then();
    }
  };

  const setProductCategoryPrice = (productId: string, customerCategoryId: string, priceBDT: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const categoryPrices = { ...(p.categoryPrices || {}), [customerCategoryId]: priceBDT };
          return { ...p, categoryPrices };
        }
        return p;
      })
    );
    const prod = products.find((p) => p.id === productId);
    const cat = customerCategories.find((c) => c.id === customerCategoryId);
    addAuditLog(
      'PRODUCT_CATEGORY_PRICE_SET',
      'Pricing Engine',
      `Set price for ${prod?.name || productId} in category ${cat?.name || customerCategoryId}: ৳ ${priceBDT.toLocaleString()}`
    );
  };

  const removeProductCategoryPrice = (productId: string, customerCategoryId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId && p.categoryPrices) {
          const { [customerCategoryId]: _, ...rest } = p.categoryPrices;
          return { ...p, categoryPrices: rest };
        }
        return p;
      })
    );
    addAuditLog(
      'PRODUCT_CATEGORY_PRICE_REMOVED',
      'Pricing Engine',
      `Removed product price for category ${customerCategoryId} on product ${productId}`
    );
  };

  const setCustomerCustomProductPrice = (customerId: string, productId: string, priceBDT: number) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const customProductPrices = { ...(c.customProductPrices || {}), [productId]: priceBDT };
          return { ...c, customProductPrices };
        }
        return c;
      })
    );
    const prod = products.find((p) => p.id === productId);
    const cust = customers.find((c) => c.id === customerId);
    addAuditLog(
      'CUSTOMER_SPECIAL_PRICE_CONFIGURED',
      'Pricing Engine',
      `Configured special contracted price for ${cust?.name || customerId} on ${prod?.name || productId}: ৳ ${priceBDT.toLocaleString()}`
    );
  };

  const removeCustomerCustomProductPrice = (customerId: string, productId: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId && c.customProductPrices) {
          const { [productId]: _, ...rest } = c.customProductPrices;
          return { ...c, customProductPrices: rest };
        }
        return c;
      })
    );
    addAuditLog('CUSTOMER_SPECIAL_PRICE_REMOVED', 'Pricing Engine', `Removed custom price override for customer ${customerId} on product ${productId}`);
  };

  const updateProductChannelPricing = (
    productId: string,
    prices: {
      distributorPriceBDT: number;
      dealerPriceBDT: number;
      corporatePriceBDT: number;
      projectPriceBDT: number;
      retailPriceBDT: number;
    }
  ) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...prices, customerPriceBDT: prices.retailPriceBDT } : p))
    );
    addAuditLog('PRODUCT_CHANNEL_PRICES_UPDATED', 'Pricing Engine', `Updated channel price tiers for product ID ${productId}`);
  };

  const addCRMLead = async (lead: Omit<CRMLeadAgreement, 'id'>) => {
    const id = `CRM-${Date.now().toString().slice(-5)}`;
    const newDeal: CRMLeadAgreement = {
      ...lead,
      id,
      clientName: (lead.clientName || lead.companyName || 'Corporate Lead').trim(),
      companyName: (lead.companyName || lead.clientName || 'Corporate Lead').trim(),
      phone: (lead.phone || '+880 1700-000000').trim(),
    };
    setCrmAgreements((prev) => {
      const next = [newDeal, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('ensec_crm_agreements', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
    addAuditLog(
      'CRM_DEAL_CREATED',
      'CRM & Agreements',
      `Created corporate lead agreement: ${newDeal.clientName} (Est. ${newDeal.estimatedValueBDT.toLocaleString()} BDT)`
    );

    let isRemoteSynced = false;
    let syncError: string | undefined = undefined;

    const sb = getSupabase();
    if (sb) {
      try {
        const payload = {
          deal_code: id,
          client_name: (newDeal.clientName || newDeal.companyName || 'Corporate Lead').trim(),
          company_name: (newDeal.companyName || newDeal.clientName || 'Corporate Lead').trim(),
          contact_person: (newDeal as any).contactPerson || null,
          phone: (newDeal.phone || '+880 1700-000000').trim(),
          email: (newDeal as any).email || null,
          channel: (newDeal as any).channel || 'Direct Corporate',
          stage: newDeal.stage || 'Lead',
          expected_volume_units: Number(newDeal.expectedVolumeUnits) || 100,
          estimated_value_bdt: Number(newDeal.estimatedValueBDT || newDeal.dealValueBDT) || 0,
          deal_value_bdt: Number(newDeal.dealValueBDT || newDeal.estimatedValueBDT) || 0,
          contract_term_months: Number(newDeal.contractTermMonths) || 12,
          salesperson_id: (newDeal as any).salespersonId || null,
          salesperson_name: newDeal.salespersonName || currentUser.name || 'Tanvir Hossain',
          last_contact_date: newDeal.lastContactDate || new Date().toISOString().substring(0, 10),
          communication_notes: newDeal.communicationNotes || [],
          status: 'Active',
        };
        const { error } = await sb.from('crm_agreements').upsert(payload, { onConflict: 'deal_code' });
        if (error) {
          syncError = error.message;
          console.warn('Supabase addCRMLead error:', error.message);
        } else {
          isRemoteSynced = true;
          await refreshCRMAgreements();
        }
      } catch (err: any) {
        syncError = err?.message;
        console.error('Supabase addCRMLead exception:', err);
      }
    }

    return { success: true, id, isRemoteSynced, error: syncError };
  };

  const bulkAddCRMLeads = async (leads: Omit<CRMLeadAgreement, 'id'>[]) => {
    const timestamp = Date.now().toString().slice(-5);
    const newDeals: CRMLeadAgreement[] = leads.map((lead, idx) => ({
      ...lead,
      id: `CRM-${timestamp}-${idx + 1}`,
      clientName: (lead.clientName || lead.companyName || `Lead ${idx + 1}`).trim(),
      companyName: (lead.companyName || lead.clientName || `Lead ${idx + 1}`).trim(),
      phone: (lead.phone || '+880 1700-000000').trim(),
    }));
    setCrmAgreements((prev) => {
      const next = [...newDeals, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('ensec_crm_agreements', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
    addAuditLog(
      'CRM_BULK_UPLOAD',
      'CRM & Agreements',
      `Bulk imported ${newDeals.length} corporate CRM lead agreements`
    );

    let isRemoteSynced = false;
    let syncError: string | undefined = undefined;

    const sb = getSupabase();
    if (sb) {
      try {
        const payload = newDeals.map((d) => ({
          deal_code: d.id,
          client_name: (d.clientName || d.companyName || 'Corporate Lead').trim(),
          company_name: (d.companyName || d.clientName || 'Corporate Lead').trim(),
          contact_person: (d as any).contactPerson || null,
          phone: (d.phone || '+880 1700-000000').trim(),
          email: (d as any).email || null,
          channel: (d as any).channel || 'Direct Corporate',
          stage: d.stage || 'Lead',
          expected_volume_units: Number(d.expectedVolumeUnits) || 100,
          estimated_value_bdt: Number(d.estimatedValueBDT || d.dealValueBDT) || 0,
          deal_value_bdt: Number(d.dealValueBDT || d.estimatedValueBDT) || 0,
          contract_term_months: Number(d.contractTermMonths) || 12,
          salesperson_id: (d as any).salespersonId || null,
          salesperson_name: d.salespersonName || currentUser.name || 'Tanvir Hossain',
          last_contact_date: d.lastContactDate || new Date().toISOString().substring(0, 10),
          communication_notes: d.communicationNotes || [],
          status: 'Active',
        }));

        const { error } = await sb.from('crm_agreements').upsert(payload, { onConflict: 'deal_code' });
        if (error) {
          syncError = error.message;
          console.warn('Supabase bulkAddCRMLeads error:', error.message);
        } else {
          isRemoteSynced = true;
          await refreshCRMAgreements();
        }
      } catch (err: any) {
        syncError = err?.message;
        console.error('Supabase bulkAddCRMLeads exception:', err);
      }
    }

    return { success: true, count: newDeals.length, isRemoteSynced, error: syncError };
  };

  const syncAllCRMLeadsToSupabase = async () => {
    const sb = getSupabase();
    if (!sb) {
      return { success: false, count: 0, error: 'Supabase client is not configured' };
    }
    try {
      const payload = crmAgreements.map((d) => ({
        deal_code: d.id,
        client_name: (d.clientName || d.companyName || 'Corporate Lead').trim(),
        company_name: (d.companyName || d.clientName || 'Corporate Lead').trim(),
        contact_person: (d as any).contactPerson || null,
        phone: (d.phone || '+880 1700-000000').trim(),
        email: (d as any).email || null,
        channel: (d as any).channel || 'Direct Corporate',
        stage: d.stage || 'Lead',
        expected_volume_units: Number(d.expectedVolumeUnits) || 100,
        estimated_value_bdt: Number(d.estimatedValueBDT || d.dealValueBDT) || 0,
        deal_value_bdt: Number(d.dealValueBDT || d.estimatedValueBDT) || 0,
        contract_term_months: Number(d.contractTermMonths) || 12,
        salesperson_id: (d as any).salespersonId || null,
        salesperson_name: d.salespersonName || currentUser.name || 'Tanvir Hossain',
        last_contact_date: d.lastContactDate || new Date().toISOString().substring(0, 10),
        communication_notes: d.communicationNotes || [],
        status: 'Active',
      }));

      const { error } = await sb.from('crm_agreements').upsert(payload, { onConflict: 'deal_code' });
      if (error) {
        return { success: false, count: 0, error: error.message };
      }
      await refreshCRMAgreements();
      return { success: true, count: payload.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err?.message || 'Sync failed' };
    }
  };

  const addCRMCommunicationNote = async (dealId: string, noteText: string) => {
    const trimmed = (noteText || '').trim();
    if (!trimmed) {
      return { success: false, error: 'Note text cannot be empty' };
    }

    const noteObj = {
      date: new Date().toISOString().substring(0, 10),
      author: currentUser.name || 'Admin',
      note: trimmed,
    };

    const dealCodeStr = String(dealId || '').trim();
    const currentDeal = crmAgreements.find(
      (d) =>
        d.id === dealCodeStr ||
        d.id?.toLowerCase() === dealCodeStr.toLowerCase() ||
        String((d as any).deal_code || '').toLowerCase() === dealCodeStr.toLowerCase()
    );

    const updatedNotes = currentDeal?.communicationNotes
      ? [...currentDeal.communicationNotes, noteObj]
      : [noteObj];

    const updatedDeal: CRMLeadAgreement = currentDeal
      ? {
          ...currentDeal,
          lastContactDate: noteObj.date,
          communicationNotes: updatedNotes,
        }
      : {
          id: dealCodeStr,
          clientName: 'Corporate Lead',
          companyName: dealCodeStr,
          phone: '+880 1700-000000',
          stage: 'Lead',
          expectedVolumeUnits: 100,
          estimatedValueBDT: 0,
          dealValueBDT: 0,
          contractTermMonths: 12,
          salespersonName: currentUser.name || 'Tanvir Hossain',
          lastContactDate: noteObj.date,
          communicationNotes: updatedNotes,
        };

    // 1. Instantly update React state & localStorage
    setCrmAgreements((prev) => {
      const matchIdx = prev.findIndex(
        (d) =>
          d.id === dealCodeStr ||
          d.id?.toLowerCase() === dealCodeStr.toLowerCase() ||
          String((d as any).deal_code || '').toLowerCase() === dealCodeStr.toLowerCase()
      );
      const next = matchIdx >= 0
        ? prev.map((d, idx) => (idx === matchIdx ? updatedDeal : d))
        : [updatedDeal, ...prev];

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('ensec_crm_agreements', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });

    addAuditLog(
      'CRM_NOTE_ADDED',
      'CRM & Agreements',
      `Added interaction note for agreement ${dealCodeStr}: "${trimmed.slice(0, 40)}"`
    );

    // 2. Persist to Supabase
    let isRemoteSynced = false;
    let syncError: string | undefined = undefined;

    const sb = getSupabase();
    if (sb) {
      try {
        // Attempt A: Case-insensitive match on deal_code
        const { data: updatedRows, error: updateErr } = await sb
          .from('crm_agreements')
          .update({
            last_contact_date: noteObj.date,
            communication_notes: updatedNotes,
            updated_at: new Date().toISOString(),
          })
          .ilike('deal_code', dealCodeStr)
          .select();

        if (!updateErr && updatedRows && updatedRows.length > 0) {
          isRemoteSynced = true;
        } else {
          // Attempt B: Match by numeric primary key ID if dealId ends in numbers
          const numericId = dealCodeStr.replace(/^crm-?/i, '');
          if (/^\d+$/.test(numericId)) {
            const { data: numRows, error: numErr } = await sb
              .from('crm_agreements')
              .update({
                last_contact_date: noteObj.date,
                communication_notes: updatedNotes,
                updated_at: new Date().toISOString(),
              })
              .eq('id', Number(numericId))
              .select();

            if (!numErr && numRows && numRows.length > 0) {
              isRemoteSynced = true;
            }
          }

          // Attempt C: If row does not exist in Supabase yet, upsert it so it is permanently created
          if (!isRemoteSynced) {
            const payload = {
              deal_code: updatedDeal.id,
              client_name: (updatedDeal.clientName || updatedDeal.companyName || 'Corporate Lead').trim(),
              company_name: (updatedDeal.companyName || updatedDeal.clientName || 'Corporate Lead').trim(),
              contact_person: (updatedDeal as any).contactPerson || null,
              phone: (updatedDeal.phone || '+880 1700-000000').trim(),
              email: (updatedDeal as any).email || null,
              channel: (updatedDeal as any).channel || 'Direct Corporate',
              stage: updatedDeal.stage || 'Lead',
              expected_volume_units: Number(updatedDeal.expectedVolumeUnits) || 100,
              estimated_value_bdt: Number(updatedDeal.estimatedValueBDT || updatedDeal.dealValueBDT) || 0,
              deal_value_bdt: Number(updatedDeal.dealValueBDT || updatedDeal.estimatedValueBDT) || 0,
              contract_term_months: Number(updatedDeal.contractTermMonths) || 12,
              salesperson_name: updatedDeal.salespersonName || currentUser.name || 'Tanvir Hossain',
              last_contact_date: noteObj.date,
              communication_notes: updatedNotes,
              status: 'Active',
            };
            const { error: upsertErr } = await sb.from('crm_agreements').upsert(payload, { onConflict: 'deal_code' });
            if (!upsertErr) {
              isRemoteSynced = true;
            } else {
              syncError = upsertErr.message;
              console.warn('Supabase note upsert notice:', upsertErr.message);
            }
          }
        }
      } catch (e: any) {
        syncError = e?.message || 'Database update failed';
        console.warn('Supabase note update notice:', e);
      }
    }

    return { success: true, isRemoteSynced, error: syncError, updatedNotes };
  };

  const updateCRMDealStage = async (dealId: string, stage: CRMLeadAgreement['stage']) => {
    const noteObj = {
      date: new Date().toISOString().substring(0, 10),
      author: currentUser.name || 'Admin',
      note: `Status updated to ${stage}`,
    };

    const dealCodeStr = String(dealId || '').trim();
    const currentDeal = crmAgreements.find(
      (d) =>
        d.id === dealCodeStr ||
        d.id?.toLowerCase() === dealCodeStr.toLowerCase() ||
        String((d as any).deal_code || '').toLowerCase() === dealCodeStr.toLowerCase()
    );

    const updatedNotes = currentDeal?.communicationNotes
      ? [...currentDeal.communicationNotes, noteObj]
      : [noteObj];

    const updatedDeal: CRMLeadAgreement = currentDeal
      ? {
          ...currentDeal,
          stage,
          lastContactDate: noteObj.date,
          communicationNotes: updatedNotes,
        }
      : {
          id: dealCodeStr,
          clientName: 'Corporate Lead',
          companyName: dealCodeStr,
          phone: '+880 1700-000000',
          stage,
          expectedVolumeUnits: 100,
          estimatedValueBDT: 0,
          dealValueBDT: 0,
          contractTermMonths: 12,
          salespersonName: currentUser.name || 'Tanvir Hossain',
          lastContactDate: noteObj.date,
          communicationNotes: updatedNotes,
        };

    setCrmAgreements((prev) => {
      const matchIdx = prev.findIndex(
        (d) =>
          d.id === dealCodeStr ||
          d.id?.toLowerCase() === dealCodeStr.toLowerCase() ||
          String((d as any).deal_code || '').toLowerCase() === dealCodeStr.toLowerCase()
      );
      const next = matchIdx >= 0
        ? prev.map((d, idx) => (idx === matchIdx ? updatedDeal : d))
        : [updatedDeal, ...prev];

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('ensec_crm_agreements', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });

    addAuditLog('CRM_STAGE_UPDATED', 'CRM & Agreements', `Updated deal stage for agreement ${dealCodeStr} to ${stage}`);

    const sb = getSupabase();
    if (sb) {
      try {
        const { data: matchedDeals, error: updateErr } = await sb
          .from('crm_agreements')
          .update({
            stage,
            last_contact_date: noteObj.date,
            communication_notes: updatedNotes,
            updated_at: new Date().toISOString(),
          })
          .ilike('deal_code', dealCodeStr)
          .select();

        if (updateErr || !matchedDeals || matchedDeals.length === 0) {
          const numericId = dealCodeStr.replace(/^crm-?/i, '');
          if (/^\d+$/.test(numericId)) {
            await sb
              .from('crm_agreements')
              .update({
                stage,
                last_contact_date: noteObj.date,
                communication_notes: updatedNotes,
                updated_at: new Date().toISOString(),
              })
              .eq('id', Number(numericId));
          }
        }
      } catch (e) {
        console.warn('Supabase stage update notice:', e);
      }
    }
    return { success: true };
  };

  const deleteCRMDeal = async (dealId: string) => {
    const dealCodeStr = String(dealId || '').trim();
    const target = crmAgreements.find(
      (d) =>
        d.id === dealCodeStr ||
        d.id?.toLowerCase() === dealCodeStr.toLowerCase() ||
        String((d as any).deal_code || '').toLowerCase() === dealCodeStr.toLowerCase()
    );
    setCrmAgreements((prev) => {
      const next = prev.filter(
        (d) =>
          d.id !== dealCodeStr &&
          d.id?.toLowerCase() !== dealCodeStr.toLowerCase() &&
          String((d as any).deal_code || '').toLowerCase() !== dealCodeStr.toLowerCase()
      );
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('ensec_crm_agreements', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
    addAuditLog('CRM_DEAL_DELETED', 'CRM & Agreements', `Deleted agreement deal: ${target?.clientName || dealCodeStr}`);

    const sb = getSupabase();
    if (sb) {
      try {
        const { data: delData } = await sb.from('crm_agreements').delete().ilike('deal_code', dealCodeStr).select();
        if (!delData || delData.length === 0) {
          const numericId = dealCodeStr.replace(/^crm-?/i, '');
          if (/^\d+$/.test(numericId)) {
            await sb.from('crm_agreements').delete().eq('id', Number(numericId));
          }
        }
      } catch (e) {
        console.warn('Supabase delete deal notice:', e);
      }
    }
    return { success: true };
  };

  // Stage 8: Field Force & GPS
  const logCustomerVisit = (visit: Omit<VisitLog, 'id'>) => {
    const id = `v-${Date.now().toString().slice(-4)}`;
    const newVisit: VisitLog = {
      ...visit,
      id,
    };
    setVisitLogs((prev) => [newVisit, ...prev]);

    // Update rep's today visit counts
    setFieldForceReps((reps) =>
      reps.map((r) => {
        if (r.id === visit.repId) {
          return {
            ...r,
            todayVisitsCount: r.todayVisitsCount + 1,
            productiveVisitsCount: visit.isProductive ? r.productiveVisitsCount + 1 : r.productiveVisitsCount,
          };
        }
        return r;
      })
    );
    addAuditLog('VISIT_LOGGED', 'Field Force', `${visit.repName} completed visit to ${visit.customerName} (${visit.isProductive ? 'Productive' : 'Non-productive'})`);
  };

  const addFieldForceRep = (repData: Omit<FieldForceRep, 'id'>): string => {
    const id = `ff-${Date.now().toString().slice(-4)}`;
    const newRep: FieldForceRep = {
      ...repData,
      id,
      monthlyTargetBDT: repData.monthlyTargetBDT || 3000000,
      monthlyAchievedBDT: repData.monthlyAchievedBDT || 0,
      todayVisitsCount: repData.todayVisitsCount || 0,
      productiveVisitsCount: repData.productiveVisitsCount || 0,
      basicSalaryBDT: repData.basicSalaryBDT || 30000,
      conveyanceBDT: repData.conveyanceBDT || 6000,
      taDaBDT: repData.taDaBDT || 5000,
      mobileAllowanceBDT: repData.mobileAllowanceBDT || 1500,
      currentLocation: repData.currentLocation || {
        latitude: 23.8103,
        longitude: 90.4125,
        address: `${repData.territory || repData.area || 'Dhaka'}, Bangladesh`,
        lastUpdated: 'Just registered',
        speedKmH: 0,
        batteryLevel: 95,
        isOnline: true,
      },
    };
    setFieldForceReps((prev) => [newRep, ...prev]);
    addAuditLog('FIELD_FORCE_CREATED', 'Field Force Master', `Registered new field force officer: ${newRep.name} (${newRep.code})`);
    const sb = getSupabase();
    if (sb) {
      sb.from('field_force_reps')
        .insert({
          code: newRep.code,
          name: newRep.name,
          native_name: newRep.nativeName,
          pin: newRep.pin,
          phone: newRep.phone,
          designation: newRep.designation,
          field_force_type: newRep.fieldForceType,
          department: newRep.department,
          departments: newRep.departments || [],
          region: newRep.region,
          area: newRep.area,
          territory: newRep.territory,
          market_hierarchy: newRep.marketHierarchy,
          distributor_name: newRep.distributorName,
          monthly_target_bdt: newRep.monthlyTargetBDT,
          monthly_achieved_bdt: newRep.monthlyAchievedBDT,
          basic_salary_bdt: newRep.basicSalaryBDT,
          conveyance_bdt: newRep.conveyanceBDT,
          ta_da_bdt: newRep.taDaBDT,
          mobile_allowance_bdt: newRep.mobileAllowanceBDT,
          current_location: newRep.currentLocation,
          is_active: newRep.isActive !== false,
        })
        .then(({ error }) => {
          if (error) {
            console.error('Supabase field_force_reps insert failed:', error);
            setFieldForceReps((prev) => prev.filter((r) => r.id !== id));
          }
        });
    }
    return id;
  };

  const updateFieldForceRep = (repId: string, updates: Partial<FieldForceRep>) => {
    setFieldForceReps((prev) =>
      prev.map((r) => (r.id === repId ? { ...r, ...updates } : r))
    );
    addAuditLog('FIELD_FORCE_UPDATED', 'Field Force Master', `Updated field force profile for ID ${repId}`);
    const sb = getSupabase();
    if (sb) {
      const target = fieldForceReps.find((r) => r.id === repId);
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.nativeName !== undefined) payload.native_name = updates.nativeName;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.designation !== undefined) payload.designation = updates.designation;
      if (updates.department !== undefined) payload.department = updates.department;
      if (updates.departments !== undefined) payload.departments = updates.departments;
      if (updates.region !== undefined) payload.region = updates.region;
      if (updates.area !== undefined) payload.area = updates.area;
      if (updates.territory !== undefined) payload.territory = updates.territory;
      if (updates.monthlyTargetBDT !== undefined) payload.monthly_target_bdt = updates.monthlyTargetBDT;
      if (updates.monthlyAchievedBDT !== undefined) payload.monthly_achieved_bdt = updates.monthlyAchievedBDT;
      if (updates.isActive !== undefined) payload.is_active = updates.isActive;
      const q = !isNaN(Number(repId))
        ? sb.from('field_force_reps').update(payload).eq('id', Number(repId))
        : sb.from('field_force_reps').update(payload).eq('code', target?.code || repId);
      q.then();
    }
  };

  const deleteFieldForceRep = (repId: string) => {
    const target = fieldForceReps.find((r) => r.id === repId);
    setFieldForceReps((prev) => prev.filter((r) => r.id !== repId));
    addAuditLog('FIELD_FORCE_DELETED', 'Field Force Master', `Deleted field force officer: ${target?.name || repId}`);
    const sb = getSupabase();
    if (sb) {
      const q = !isNaN(Number(repId))
        ? sb.from('field_force_reps').delete().eq('id', Number(repId))
        : sb.from('field_force_reps').delete().eq('code', target?.code || repId);
      q.then();
    }
  };

  const updateRepLocation = (repId: string, lat: number, lng: number, address: string) => {
    setFieldForceReps((reps) =>
      reps.map((r) => {
        if (r.id === repId) {
          return {
            ...r,
            currentLocation: {
              ...(r.currentLocation || {}),
              latitude: lat,
              longitude: lng,
              address,
              lastUpdated: 'Just now',
            },
          };
        }
        return r;
      })
    );
  };

  // Stage 9 & 10: Offers & Sales Orders
  const addOffer = (offer: Omit<OfferPromotion, 'id'>) => {
    const id = `off-${Date.now().toString().slice(-4)}`;
    const newOffer: OfferPromotion = {
      ...offer,
      id,
    };
    setOffers((prev) => [newOffer, ...prev]);
    addAuditLog('OFFER_CREATED', 'Offer Engine', `Created promotional campaign: ${newOffer.title} (${newOffer.code})`);
    const sb = getSupabase();
    if (sb) {
      sb.from('offers_promotions')
        .insert({
          code: newOffer.code,
          title: newOffer.title,
          discount_title: newOffer.discountTitle || newOffer.title,
          discount_native_title: newOffer.discountNativeTitle,
          start_date: newOffer.startDate || newOffer.validFrom || new Date().toISOString().slice(0, 10),
          end_date: newOffer.endDate || newOffer.validTo || new Date().toISOString().slice(0, 10),
          discount_for: newOffer.discountFor || 'All',
          department: newOffer.department,
          discount_on: newOffer.discountOn || 'LineItem',
          eligible_for: newOffer.eligibleFor || 'Product',
          priority: newOffer.priority || 1,
          when_condition: newOffer.when || 'Quantity',
          greater_than_or_equal_to: newOffer.greaterThanOrEqualTo || 1,
          condition_value: newOffer.value || 1,
          provide_benefit: newOffer.provide || 'PercentageDiscount',
          discount_amount: newOffer.discount || 0,
          discount_percentage: newOffer.discountPercentage || 0,
          flat_discount_bdt: newOffer.flatDiscountBDT || 0,
          free_product_qty: newOffer.freeProductQty || 0,
          free_product_id: newOffer.freeProductId,
          free_product_name: newOffer.freeProductName,
          allow_discount_for: newOffer.allowDiscountFor || 'FullQuantity',
          apply_in_multiples: newOffer.applyInMultiples !== false,
          discount_limitation: newOffer.discountLimitation || 'Unlimited',
          limit_times: newOffer.limitTimes || 0,
          is_active: newOffer.isActive !== false,
        })
        .then(({ error }) => {
          if (error) {
            console.error('Supabase offers_promotions insert failed:', error);
            setOffers((prev) => prev.filter((o) => o.id !== id));
          }
        });
    }
  };

  const toggleOfferStatus = (offerId: string) => {
    setOffers((prev) =>
      prev.map((o) => {
        if (o.id === offerId) {
          const nextActive = !o.isActive;
          const sb = getSupabase();
          if (sb) {
            const q = !isNaN(Number(offerId))
              ? sb.from('offers_promotions').update({ is_active: nextActive }).eq('id', Number(offerId))
              : sb.from('offers_promotions').update({ is_active: nextActive }).eq('code', o.code || offerId);
            q.then();
          }
          return { ...o, isActive: nextActive };
        }
        return o;
      })
    );
  };

  const updateOffer = (offerId: string, updates: Partial<OfferPromotion>) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, ...updates } : o))
    );
    addAuditLog('OFFER_UPDATED', 'Offer Engine', `Updated promotional offer ${offerId}`);
    const sb = getSupabase();
    if (sb) {
      const target = offers.find((o) => o.id === offerId);
      const payload: any = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.discountTitle !== undefined) payload.discount_title = updates.discountTitle;
      if (updates.discountNativeTitle !== undefined) payload.discount_native_title = updates.discountNativeTitle;
      if (updates.startDate !== undefined) payload.start_date = updates.startDate;
      if (updates.endDate !== undefined) payload.end_date = updates.endDate;
      if (updates.discountFor !== undefined) payload.discount_for = updates.discountFor;
      if (updates.department !== undefined) payload.department = updates.department;
      if (updates.discountOn !== undefined) payload.discount_on = updates.discountOn;
      if (updates.eligibleFor !== undefined) payload.eligible_for = updates.eligibleFor;
      if (updates.priority !== undefined) payload.priority = updates.priority;
      if (updates.greaterThanOrEqualTo !== undefined) payload.greater_than_or_equal_to = updates.greaterThanOrEqualTo;
      if (updates.value !== undefined) payload.condition_value = updates.value;
      if (updates.discount !== undefined) payload.discount_amount = updates.discount;
      if (updates.discountPercentage !== undefined) payload.discount_percentage = updates.discountPercentage;
      if (updates.flatDiscountBDT !== undefined) payload.flat_discount_bdt = updates.flatDiscountBDT;
      if (updates.freeProductQty !== undefined) payload.free_product_qty = updates.freeProductQty;
      if (updates.isActive !== undefined) payload.is_active = updates.isActive;
      const q = !isNaN(Number(offerId))
        ? sb.from('offers_promotions').update(payload).eq('id', Number(offerId))
        : sb.from('offers_promotions').update(payload).eq('code', target?.code || offerId);
      q.then();
    }
  };

  const deleteOffer = (offerId: string) => {
    const target = offers.find((o) => o.id === offerId);
    setOffers((prev) => prev.filter((o) => o.id !== offerId));
    addAuditLog('OFFER_DELETED', 'Offer Engine', `Deleted promotional offer ${offerId}`);
    const sb = getSupabase();
    if (sb) {
      const q = !isNaN(Number(offerId))
        ? sb.from('offers_promotions').delete().eq('id', Number(offerId))
        : sb.from('offers_promotions').delete().eq('code', target?.code || offerId);
      q.then();
    }
  };

  const updateSalesOrder = (orderId: string, updates: Partial<SalesOrder>) => {
    setSalesOrders((prev) =>
      prev.map((so) => (so.id === orderId || so.orderNumber === orderId ? { ...so, ...updates } : so))
    );
  };

  const createSalesOrder = (order: Omit<SalesOrder, 'id' | 'orderNumber' | 'status'>): string => {
    const id = `so-${Date.now().toString().slice(-6)}`;
    const randomSuffix = Math.floor(10 + Math.random() * 90).toString();
    const orderNumber = (order as any).orderNumber || `SO-DHK-2026-${Math.floor(100 + Math.random() * 900)}`;

    // Auto-generate official Challan and document numbers matching sample
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const autoChallanNo = (order as any).challanNumber || `BD-ES-${year}-${month}-${randomSuffix}`;
    const autoBillNo = (order as any).billNumber || `${year}${month}${day}-${randomSuffix}`;
    const autoDoNo = (order as any).doNumber || `012/${year}-${randomSuffix}`;
    const autoPoNo = (order as any).poNumber || randomSuffix;

    // Ensure serial numbers are populated for items
    const itemsWithSerials = (order.items || []).map((item, itIdx) => {
      if (item.serialNumbers && item.serialNumbers.length > 0) {
        return item;
      }
      const count = item.quantity || 1;
      const base = itIdx === 0 ? 17158202615 : 171772026316;
      return {
        ...item,
        serialNumbers: Array.from({ length: count }, (_, i) => String(base + i * 5)),
      };
    });

    const newOrder: SalesOrder = {
      ...order,
      id,
      orderNumber,
      status: 'Submitted',
      challanNumber: undefined,
      billNumber: autoBillNo,
      doNumber: undefined,
      poNumber: autoPoNo,
      deliveryStatus: 'Pending Dispatch',
      items: itemsWithSerials,
      doAccepted: false,
      serialsUpdated: false,
    };
    setSalesOrders((prev) => [newOrder, ...prev]);
    addAuditLog('SALES_ORDER_PLACED', 'Sales & Distribution', `Sales Order ${orderNumber} created for ${newOrder.customerName}. Pending Accounts Rate Verification & Approval. Net: BDT ${newOrder.netAmountBDT.toLocaleString()}`);

    // Persist to Supabase database
    const sb = getSupabase();
    if (sb) {
      // Find numeric IDs if available
      let custIdNum: number | null = null;
      if (order.customerId && /^\d+$/.test(String(order.customerId))) {
        custIdNum = Number(order.customerId);
      } else {
        const matchedCust = customers.find((c) => c.id === order.customerId || c.name === order.customerName);
        if (matchedCust && /^\d+$/.test(String(matchedCust.id))) {
          custIdNum = Number(matchedCust.id);
        }
      }

      let whIdNum: number | null = null;
      if (order.warehouseId && /^\d+$/.test(String(order.warehouseId))) {
        whIdNum = Number(order.warehouseId);
      } else {
        const matchedWh = warehouses.find((w) => w.id === order.warehouseId || w.name === order.warehouseName);
        if (matchedWh && /^\d+$/.test(String(matchedWh.id))) {
          whIdNum = Number(matchedWh.id);
        }
      }

      const payload = {
        order_number: orderNumber,
        customer_id: custIdNum,
        customer_name: order.customerName || 'Direct Customer',
        salesperson_id: order.salespersonId ? String(order.salespersonId) : 'u-1',
        salesperson_name: order.salespersonName || 'Direct Sales',
        warehouse_id: whIdNum,
        warehouse_name: order.warehouseName || 'Main Warehouse',
        order_date: order.date || new Date().toISOString().slice(0, 10),
        gross_amount_bdt: Number(order.subTotalBDT) || 0,
        discount_amount_bdt: Number(order.discountBDT ?? (order as any).discountAmount ?? 0) || 0,
        tax_vat_bdt: Number(order.taxVatBDT) || 0,
        net_amount_bdt: Number(order.netAmountBDT) || 0,
        paid_amount_bdt: Number(order.paidAmountBDT) || 0,
        due_amount_bdt: Number(order.dueAmountBDT ?? (order.netAmountBDT - (order.paidAmountBDT || 0))) || 0,
        status: 'Submitted',
        items_json: itemsWithSerials,
        applied_offer_code: order.appliedOfferCode || null,
        notes: order.notes || null,
      };

      sb.from('sales_orders')
        .insert(payload)
        .select()
        .then(
          ({ data, error }: any) => {
            if (error) {
              console.error('Failed to save sales order to Supabase:', error);
            } else if (data && data[0]) {
              const confirmedId = String(data[0].id);
              setSalesOrders((prev) =>
                prev.map((so) => (so.id === id || so.orderNumber === orderNumber ? { ...so, id: confirmedId } : so))
              );
            }
          },
          (err: any) => {
            console.error('Error inserting sales order into Supabase:', err);
          }
        );
    }

    return id;
  };

  const approveSalesOrder = (orderId: string, updatedOrderData?: Partial<SalesOrder>) => {
    const targetSo = salesOrders.find((so) => so.id === orderId || so.orderNumber === orderId);
    const suffix = (targetSo?.orderNumber || orderId).replace(/\D/g, '').slice(-2) || '88';
    const autoDo = targetSo?.doNumber || `012/2026-${suffix}`;

    setSalesOrders((prev) =>
      prev.map((so) => {
        if (so.id === orderId || so.orderNumber === orderId) {
          return {
            ...so,
            doNumber: so.doNumber || autoDo,
            doGeneratedAt: so.doGeneratedAt || new Date().toISOString(),
            doAccepted: false,
            // CRITICAL: At this stage, NO Challan should be generated
            challanNumber: undefined,
            deliveryStatus: 'Pending Dispatch',
            ...(updatedOrderData || {}),
            status: 'DO Generated',
          };
        }
        return so;
      })
    );

    const logDesc = updatedOrderData?.items
      ? `Order ${targetSo?.orderNumber || orderId} reviewed and approved by Accounts. Factory Delivery Order (D.O. #${autoDo}) generated. Pending Factory DO Review & Acceptance.`
      : `Order ${targetSo?.orderNumber || orderId} approved by Accounts. Factory Delivery Order (D.O. #${autoDo}) generated. Pending Factory DO Review & Acceptance.`;
    addAuditLog('ORDER_APPROVED', 'Accounts & Commercial', logDesc);

    const sb = getSupabase();
    if (sb) {
      const isNumeric = /^\d+$/.test(orderId);
      const updatePayload: any = {
        status: 'DO Generated',
      };
      if (updatedOrderData?.items) {
        updatePayload.items_json = updatedOrderData.items;
      }
      if (updatedOrderData?.subTotalBDT !== undefined) {
        updatePayload.gross_amount_bdt = updatedOrderData.subTotalBDT;
      }
      if (updatedOrderData?.discountBDT !== undefined) {
        updatePayload.discount_amount_bdt = updatedOrderData.discountBDT;
      }
      if (updatedOrderData?.taxVatBDT !== undefined) {
        updatePayload.tax_vat_bdt = updatedOrderData.taxVatBDT;
      }
      if (updatedOrderData?.netAmountBDT !== undefined) {
        updatePayload.net_amount_bdt = updatedOrderData.netAmountBDT;
      }
      if (updatedOrderData?.dueAmountBDT !== undefined) {
        updatePayload.due_amount_bdt = updatedOrderData.dueAmountBDT;
      }
      if (updatedOrderData?.notes !== undefined) {
        updatePayload.notes = updatedOrderData.notes;
      }

      const query = isNumeric
        ? sb.from('sales_orders').update(updatePayload).eq('id', Number(orderId))
        : sb.from('sales_orders').update(updatePayload).eq('order_number', targetSo?.orderNumber || orderId);
      query.then(({ error }: any) => {
        if (error) console.error('Failed to update sales order approval in Supabase:', error);
      });
    }
  };

  const acceptDeliveryOrder = (
    orderId: string,
    acceptanceDetails?: { acceptedBy?: string; notes?: string; acceptanceNotes?: string }
  ) => {
    const targetSo = salesOrders.find((so) => so.id === orderId || so.orderNumber === orderId);
    const acceptedBy = acceptanceDetails?.acceptedBy || 'Engr. Abu Jubair Khan (Factory In-Charge)';
    const acceptedAt = new Date().toISOString();
    const notes = acceptanceDetails?.notes || acceptanceDetails?.acceptanceNotes || '';

    setSalesOrders((prev) =>
      prev.map((so) => {
        if (so.id === orderId || so.orderNumber === orderId) {
          return {
            ...so,
            doAccepted: true,
            doAcceptedBy: acceptedBy,
            doAcceptedAt: acceptedAt,
            doAcceptedNotes: notes,
            status: 'DO Accepted',
          };
        }
        return so;
      })
    );

    addAuditLog(
      'DO_ACCEPTED',
      'Factory Production & Dispatch',
      `Delivery Order #${targetSo?.doNumber || 'D.O.'} for order ${targetSo?.orderNumber || orderId} reviewed and accepted by factory (${acceptedBy}). Awaiting battery serial verification.`
    );

    const sb = getSupabase();
    if (sb) {
      const isNumeric = /^\d+$/.test(orderId);
      const query = isNumeric
        ? sb.from('sales_orders').update({ status: 'DO Accepted' }).eq('id', Number(orderId))
        : sb.from('sales_orders').update({ status: 'DO Accepted' }).eq('order_number', targetSo?.orderNumber || orderId);
      query.then(({ error }: any) => {
        if (error) console.error('Failed to update DO acceptance in Supabase:', error);
      });
    }
  };

  const generateChallanWithSerials = (
    orderId: string,
    updatedItems: SalesOrderItem[],
    details?: { updatedBy?: string; verifierName?: string; challanNumber?: string }
  ): string => {
    const targetSo = salesOrders.find((so) => so.id === orderId || so.orderNumber === orderId);
    const suffix = (targetSo?.orderNumber || orderId).replace(/\D/g, '').slice(-2) || '88';
    const autoChallan = details?.challanNumber || targetSo?.challanNumber || `BD-ES-2026-12-${suffix}`;
    const autoBill = targetSo?.billNumber || `20260012-${suffix}`;
    const updatedBy = details?.verifierName || details?.updatedBy || 'Engr. Abu Jubair Khan (Factory In-Charge)';

    setSalesOrders((prev) =>
      prev.map((so) => {
        if (so.id === orderId || so.orderNumber === orderId) {
          return {
            ...so,
            items: updatedItems,
            serialsUpdated: true,
            serialsUpdatedAt: new Date().toISOString(),
            serialsUpdatedBy: updatedBy,
            challanNumber: autoChallan,
            billNumber: so.billNumber || autoBill,
            challanGeneratedAt: new Date().toISOString(),
            status: 'Challan Generated',
          };
        }
        return so;
      })
    );

    addAuditLog(
      'CHALLAN_GENERATED',
      'Factory Dispatch',
      `Battery serial numbers verified for order ${targetSo?.orderNumber || orderId}. Official Factory Challan #${autoChallan} generated automatically. Ready for Dispatch & Invoice.`
    );

    const sb = getSupabase();
    if (sb) {
      const isNumeric = /^\d+$/.test(orderId);
      const query = isNumeric
        ? sb.from('sales_orders').update({
            status: 'Challan Generated',
            items_json: updatedItems,
          }).eq('id', Number(orderId))
        : sb.from('sales_orders').update({
            status: 'Challan Generated',
            items_json: updatedItems,
          }).eq('order_number', targetSo?.orderNumber || orderId);
      query.then(({ error }: any) => {
        if (error) console.error('Failed to update Challan generation in Supabase:', error);
      });
    }

    return autoChallan;
  };

  const dispatchAndInvoiceSalesOrder = (orderId: string) => {
    setSalesOrders((prev) =>
      prev.map((so) => {
        if (
          (so.id === orderId || so.orderNumber === orderId) &&
          so.status !== 'Invoiced' &&
          so.status !== 'Dispatched & Invoiced' &&
          so.status !== 'Delivered'
        ) {
          // 1. Deduct stock from selected warehouse
          const totalQty = so.items.reduce((sum, item) => sum + item.quantity, 0);
          setWarehouses((whs) =>
            whs.map((w) => {
              const isMatch =
                w.id === so.warehouseId ||
                (so.warehouseId && w.id.replace('wh-', '') === so.warehouseId.replace('wh-', '')) ||
                (w.name && so.warehouseName && w.name.toLowerCase() === so.warehouseName.toLowerCase()) ||
                whs.length === 1;
              return isMatch
                ? { ...w, currentStockUnits: Math.max(0, (w.currentStockUnits || 0) - totalQty) }
                : w;
            })
          );

          // 2. Post stock ledger entries
          so.items.forEach((item) => {
            const newLedger: StockLedgerEntry = {
              id: `sl-${Date.now()}-${item.productId}`,
              date: new Date().toISOString().substring(0, 10),
              warehouseId: so.warehouseId,
              warehouseName: so.warehouseName,
              productId: item.productId,
              productName: item.productName,
              batchNumber: item.batchNumber || 'BATCH-DISPATCH',
              transactionType: 'Sales Invoice',
              referenceNo: so.orderNumber,
              qtyIn: 0,
              qtyOut: item.quantity,
              balanceQty: 0,
              unitCostBDT: item.unitPriceBDT * 0.7,
              totalCostBDT: item.quantity * item.unitPriceBDT * 0.7,
            };
            setStockLedger((sl) => [newLedger, ...sl]);
          });

          // 3. Update customer / distributor receivables
          if (so.channel === 'Distributor Sales' && so.distributorId) {
            setDistributors((dists) =>
              dists.map((d) => (d.id === so.distributorId ? { ...d, currentOutstandingBDT: d.currentOutstandingBDT + so.dueAmountBDT } : d))
            );
          } else {
            setCustomers((custs) =>
              custs.map((c) => (c.id === so.customerId ? { ...c, outstandingBalanceBDT: c.outstandingBalanceBDT + so.dueAmountBDT } : c))
            );
          }

          // 4. If paid upfront, record cash book entry
          if (so.paidAmountBDT > 0) {
            const lastCash = cashBook[cashBook.length - 1];
            const prevBal = lastCash ? lastCash.runningBalanceBDT : 10000000;
            const cashEntry: CashBookEntry = {
              id: `cb-${Date.now()}`,
              date: new Date().toISOString().substring(0, 10),
              voucherNo: `CB-REC-${Date.now().toString().slice(-4)}`,
              accountType: 'Head Office Cash',
              transactionCategory: so.channel === 'Distributor Sales' ? 'Distributor Payment' : 'Customer Payment',
              description: `Payment received against invoice ${so.orderNumber} (${so.customerName})`,
              reference: so.orderNumber,
              cashInBDT: so.paidAmountBDT,
              cashOutBDT: 0,
              runningBalanceBDT: prevBal + so.paidAmountBDT,
            };
            setCashBook((prev) => [...prev, cashEntry]);
          }

          const challanLabel = so.challanNumber || `BD-ES-2026-12-${so.orderNumber.slice(-2)}`;
          addAuditLog(
            'INVOICE_POSTED',
            'Factory & Commercial',
            `Factory dispatched & invoiced order ${so.orderNumber} with Challan #${challanLabel}. Inventory deducted by ${totalQty} units. Awaiting Salesman customer delivery handover.`
          );

          const sb = getSupabase();
          if (sb) {
            const isNumeric = /^\d+$/.test(orderId);
            const query = isNumeric
              ? sb.from('sales_orders').update({ status: 'Dispatched & Invoiced' }).eq('id', Number(orderId))
              : sb.from('sales_orders').update({ status: 'Dispatched & Invoiced' }).eq('order_number', so.orderNumber || orderId);
            query.then(({ error }) => {
              if (error) console.error('Failed to sync invoice status to Supabase:', error);
            });
          }

          return {
            ...so,
            status: 'Dispatched & Invoiced',
            deliveryStatus: 'In Transit',
            challanNumber: so.challanNumber || challanLabel,
          };
        }
        return so;
      })
    );
  };

  const confirmCustomerReceipt = (
    orderId: string,
    details: {
      receiverName: string;
      receiverPhone: string;
      receivedDate: string;
      receiverDesignation?: string;
      handoverNotes: string;
      deliveryStatus: 'Full' | 'Partial';
      signatureConfirmed: boolean;
      salespersonName: string;
    }
  ) => {
    setSalesOrders((prev) =>
      prev.map((so) => {
        if (so.id === orderId || so.orderNumber === orderId) {
          const updated: SalesOrder = {
            ...so,
            status: 'Delivered',
            receivedByCustomer: true,
            customerReceivedAt: details.receivedDate,
            customerReceiverName: details.receiverName,
            customerReceiverPhone: details.receiverPhone,
            customerReceiverNotes: details.handoverNotes,
            customerReceiptSignature: details.signatureConfirmed
              ? 'Customer Seal & Signature Verified on Physical Challan'
              : 'Verbal / Digital Acknowledged',
            deliveryStatus: 'Received by Customer',
            deliveryHandoverBy: details.salespersonName || so.salespersonName,
          };
          return updated;
        }
        return so;
      })
    );

    addAuditLog(
      'ORDER_DELIVERED',
      'Field Force & Sales',
      `Salesman (${details.salespersonName}) confirmed customer receipt for Order ${orderId}. Received by ${details.receiverName} (${details.receiverPhone}). Status: Delivered.`
    );

    const sb = getSupabase();
    if (sb) {
      const isNumeric = /^\d+$/.test(orderId);
      const query = isNumeric
        ? sb.from('sales_orders').update({ status: 'Delivered' }).eq('id', Number(orderId))
        : sb.from('sales_orders').update({ status: 'Delivered' }).eq('order_number', orderId);
      query.then(({ error }) => {
        if (error) console.error('Failed to sync delivery confirmation to Supabase:', error);
      });
    }
  };

  const recordOrderPayment = (
    orderId: string,
    paidAmount: number,
    accountType: CashBookEntry['accountType'],
    reference: string
  ) => {
    let updatedPaid = 0;
    let updatedDue = 0;
    let targetOrderNumber = '';

    setSalesOrders((prev) =>
      prev.map((so) => {
        if (so.id === orderId) {
          updatedPaid = so.paidAmountBDT + paidAmount;
          updatedDue = Math.max(0, so.netAmountBDT - updatedPaid);
          targetOrderNumber = so.orderNumber;

          // Update distributor / customer outstanding
          if (so.channel === 'Distributor Sales' && so.distributorId) {
            setDistributors((dists) =>
              dists.map((d) => (d.id === so.distributorId ? { ...d, currentOutstandingBDT: Math.max(0, d.currentOutstandingBDT - paidAmount) } : d))
            );
          } else {
            setCustomers((custs) =>
              custs.map((c) => (c.id === so.customerId ? { ...c, outstandingBalanceBDT: Math.max(0, c.outstandingBalanceBDT - paidAmount) } : c))
            );
          }

          // Post to Cash Book
          const lastCash = cashBook[cashBook.length - 1];
          const prevBal = lastCash ? lastCash.runningBalanceBDT : 10000000;
          const cashEntry: CashBookEntry = {
            id: `cb-${Date.now()}`,
            date: new Date().toISOString().substring(0, 10),
            voucherNo: `CB-RCT-${Date.now().toString().slice(-4)}`,
            accountType,
            transactionCategory: so.channel === 'Distributor Sales' ? 'Distributor Payment' : 'Customer Payment',
            description: `Collection against ${so.orderNumber} (${so.customerName}) - Ref: ${reference}`,
            reference,
            cashInBDT: paidAmount,
            cashOutBDT: 0,
            runningBalanceBDT: prevBal + paidAmount,
          };
          setCashBook((cb) => [...cb, cashEntry]);

          addAuditLog('PAYMENT_COLLECTED', 'Finance & Cash Book', `Collected BDT ${paidAmount.toLocaleString()} against order ${so.orderNumber} via ${accountType}`);

          const sb = getSupabase();
          if (sb) {
            const isNumeric = /^\d+$/.test(orderId);
            const query = isNumeric
              ? sb.from('sales_orders').update({ paid_amount_bdt: updatedPaid, due_amount_bdt: updatedDue }).eq('id', Number(orderId))
              : sb.from('sales_orders').update({ paid_amount_bdt: updatedPaid, due_amount_bdt: updatedDue }).eq('order_number', targetOrderNumber || orderId);
            query.then(({ error }) => {
              if (error) console.error('Failed to sync payment to Supabase:', error);
            });
          }

          return { ...so, paidAmountBDT: updatedPaid, dueAmountBDT: updatedDue };
        }
        return so;
      })
    );
  };

  // Requisitions & Factory Indent Workflow
  const addRequisition = (reqData: Omit<Requisition, 'id' | 'requisitionNo' | 'createdAt'>): string => {
    const id = `req-${Date.now().toString().slice(-4)}`;
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const codePrefix = reqData.distributorName ? 'REQ-DB' : 'REQ-CUST';
    const requisitionNo = `${codePrefix}${Math.floor(100 + Math.random() * 900)}-${dateStr}${randomSuffix}`;
    const newReq: Requisition = {
      ...reqData,
      id,
      requisitionNo,
      createdAt: new Date().toISOString(),
    };
    setRequisitions((prev) => [newReq, ...prev]);
    addAuditLog(
      'REQUISITION_CREATED',
      'Requisition & Indent',
      `Field force created requisition ${newReq.requisitionNo} for ${newReq.distributorName || newReq.customerName} (Net: BDT ${newReq.netTotal.toLocaleString()})`
    );
    return id;
  };

  const updateRequisition = (reqId: string, updates: Partial<Requisition>) => {
    setRequisitions((prev) =>
      prev.map((r) => (r.id === reqId || r.requisitionNo === reqId ? { ...r, ...updates } : r))
    );
    addAuditLog('REQUISITION_UPDATED', 'Requisition & Indent', `Updated requisition ${reqId}`);
  };

  const deleteRequisition = (reqId: string) => {
    const target = requisitions.find((r) => r.id === reqId || r.requisitionNo === reqId);
    setRequisitions((prev) => prev.filter((r) => r.id !== reqId && r.requisitionNo !== reqId));
    addAuditLog('REQUISITION_DELETED', 'Requisition & Indent', `Deleted requisition ${target?.requisitionNo || reqId}`);
  };

  const approveRequisitionByFactory = (reqId: string, factoryNotes?: string, adjustedItems?: RequisitionItem[]) => {
    setRequisitions((prev) =>
      prev.map((r) => {
        if (r.id === reqId || r.requisitionNo === reqId) {
          const items = adjustedItems || r.items;
          const subtotal = items.reduce((sum, item) => sum + (item.approvedPcs ?? item.requestedPcs) * item.price, 0);
          const netTotal = subtotal;
          return {
            ...r,
            status: 'Approved',
            items,
            subtotal,
            netTotal,
            factoryNotes: factoryNotes || r.factoryNotes || 'Approved by Kushtia Plant Planning Operations',
            factoryReviewedBy: currentUser.name || 'Factory Head',
            factoryReviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          };
        }
        return r;
      })
    );
    addAuditLog('REQUISITION_APPROVED', 'Manufacturing Plant', `Factory approved indent requisition ${reqId}`);
  };

  const rejectRequisitionByFactory = (reqId: string, reason?: string) => {
    setRequisitions((prev) =>
      prev.map((r) => {
        if (r.id === reqId || r.requisitionNo === reqId) {
          return {
            ...r,
            status: 'Rejected',
            factoryNotes: reason || 'Rejected by Factory due to stock/capacity limitations',
            factoryReviewedBy: currentUser.name || 'Factory Head',
            factoryReviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          };
        }
        return r;
      })
    );
    addAuditLog('REQUISITION_REJECTED', 'Manufacturing Plant', `Factory rejected requisition ${reqId}`);
  };

  const issueRequisitionByAccounts = (reqId: string, challanNo?: string, issueNotes?: string) => {
    const generatedChallan = challanNo || `CH-KUS-${Date.now().toString().slice(-6)}`;
    setRequisitions((prev) =>
      prev.map((r) => {
        if (r.id === reqId || r.requisitionNo === reqId) {
          return {
            ...r,
            status: 'Issued',
            challanNo: generatedChallan,
            issueNotes: issueNotes || 'Issued and dispatched from central depot / Kushtia warehouse.',
            issuedBy: currentUser.name || 'Accounts & Dispatch Officer',
            issuedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          };
        }
        return r;
      })
    );
    addAuditLog('REQUISITION_ISSUED', 'Finance & Dispatch', `Issued delivery challan ${generatedChallan} for requisition ${reqId}`);
  };

  const markRequisitionReceived = (reqId: string, receivedNotes?: string) => {
    setRequisitions((prev) =>
      prev.map((r) => {
        if (r.id === reqId || r.requisitionNo === reqId) {
          return {
            ...r,
            status: 'Received',
            receivedNotes: receivedNotes || 'Physical goods received in sound condition.',
            receivedBy: currentUser.name || 'Distributor / Customer Authorized Person',
            receivedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          };
        }
        return r;
      })
    );
    addAuditLog('REQUISITION_RECEIVED', 'Logistics & Receiving', `Confirmed goods delivery receipt for requisition ${reqId}`);
  };

  // Payments Collection Master
  const addPayment = (
    paymentData: Omit<Payment, 'id' | 'tranNo' | 'creationDate' | 'createdAt' | 'approvedAmount' | 'status'>
  ): string => {
    const id = `pay-${Date.now().toString().slice(-6)}`;
    const tranNo = `TRN-${Date.now()}`;
    const now = new Date();
    const creationDate = now.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const newPayment: Payment = {
      ...paymentData,
      id,
      tranNo,
      creationDate,
      approvedAmount: 0,
      status: 'Created',
      createdAt: now.toISOString(),
    };
    setPayments((prev) => [newPayment, ...prev]);
    addAuditLog(
      'PAYMENT_CREATED',
      'Payments Collection',
      `Payment created ${tranNo} for ${newPayment.outAccountName} amount BDT ${newPayment.paymentAmount.toLocaleString()}`
    );
    return id;
  };

  const updatePayment = (paymentId: string, updates: Partial<Payment>) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId || p.tranNo === paymentId ? { ...p, ...updates } : p))
    );
    addAuditLog('PAYMENT_UPDATED', 'Payments Collection', `Updated payment entry ${paymentId}`);
  };

  const approvePayment = (paymentId: string, approvedAmount?: number, approvedNotes?: string) => {
    let targetPayment: Payment | null = null;
    let finalAmount = 0;

    setPayments((prev) =>
      prev.map((p) => {
        if (p.id === paymentId || p.tranNo === paymentId) {
          finalAmount = approvedAmount !== undefined ? approvedAmount : p.paymentAmount;
          targetPayment = {
            ...p,
            status: 'Approved',
            approvedAmount: finalAmount,
            approvedBy: currentUser.name || 'Accounts Head',
            approvedDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
            description: approvedNotes ? `${p.description || ''} | Note: ${approvedNotes}` : p.description,
          };
          return targetPayment;
        }
        return p;
      })
    );

    if (targetPayment) {
      const p: Payment = targetPayment;
      // 1. Update matching sales order / invoice if specified
      if (p.invoiceNo) {
        setSalesOrders((prev) =>
          prev.map((so) => {
            if (so.orderNumber === p.invoiceNo || (so as any).invoiceNo === p.invoiceNo || so.id === p.invoiceNo) {
              const newPaid = so.paidAmountBDT + finalAmount;
              const newDue = Math.max(0, so.netAmountBDT - newPaid);
              return {
                ...so,
                paidAmountBDT: newPaid,
                dueAmountBDT: newDue,
              };
            }
            return so;
          })
        );
      }

      // 2. Update distributor outstanding balance
      if (p.distributorId || p.outAccountName) {
        setDistributors((prev) =>
          prev.map((d) => {
            if (d.id === p.distributorId || d.name === p.outAccountName) {
              return {
                ...d,
                currentOutstandingBDT: Math.max(0, d.currentOutstandingBDT - finalAmount),
              };
            }
            return d;
          })
        );
      }

      // 3. Post Cash Book receipt voucher
      const voucherNo = `CB-PAY-${Date.now().toString().slice(-6)}`;
      const lastCash = cashBook[cashBook.length - 1];
      const prevBal = lastCash ? lastCash.runningBalanceBDT : 0;
      const newEntry: CashBookEntry = {
        id: `cb-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        voucherNo,
        accountType: (p.bankName as any) || 'Head Office Cash',
        transactionCategory: 'Distributor Payment',
        description: `Collection voucher ${p.tranNo} received against Invoice ${p.invoiceNo || 'On Account'} from ${p.outAccountName}`,
        reference: p.chequeNoReceiptNo || p.tranNo,
        cashInBDT: finalAmount,
        cashOutBDT: 0,
        runningBalanceBDT: prevBal + finalAmount,
      };
      setCashBook((prev) => [...prev, newEntry]);

      addAuditLog(
        'PAYMENT_APPROVED',
        'Payments Collection',
        `Approved payment ${p.tranNo} for ৳ ${finalAmount.toLocaleString()} from ${p.outAccountName} against Invoice ${p.invoiceNo || 'N/A'}`
      );
    }
  };

  const rejectPayment = (paymentId: string, reason?: string) => {
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id === paymentId || p.tranNo === paymentId) {
          return {
            ...p,
            status: 'Rejected',
            rejectionReason: reason || 'Rejected by Accounts',
          };
        }
        return p;
      })
    );
    addAuditLog('PAYMENT_REJECTED', 'Payments Collection', `Rejected payment entry ${paymentId} (${reason || 'No reason provided'})`);
  };

  const deletePayment = (paymentId: string) => {
    const target = payments.find((p) => p.id === paymentId || p.tranNo === paymentId);
    setPayments((prev) => prev.filter((p) => p.id !== paymentId && p.tranNo !== paymentId));
    addAuditLog('PAYMENT_DELETED', 'Payments Collection', `Deleted payment record ${target?.tranNo || paymentId}`);
  };

  const clearPaymentsCache = () => {
    setPayments([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('ensec_payments');
        sessionStorage.removeItem('ensec_payments');
        localStorage.removeItem('ensec_payments_sample');
        sessionStorage.removeItem('ensec_payments_sample');
      } catch (e) {}
    }
    addAuditLog('PAYMENTS_CLEARED', 'Payments Collection', 'Cleared payment records and local session memory.');
  };

  // Stage: TADA Management
  const addTADA = (entryData: Omit<TADAEntry, 'id' | 'createdAt' | 'lastModified'>): string => {
    const id = `tada-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const lastModified = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const newEntry: TADAEntry = {
      ...entryData,
      id,
      lastModified,
      createdAt: now.toISOString(),
    };
    setTadaList((prev) => [newEntry, ...prev]);
    addAuditLog('TADA_CLAIM_SUBMITTED', 'TADA Management', `Submitted TADA claim for ${newEntry.ffName} amount BDT ${newEntry.amount}`);
    return id;
  };

  const updateTADA = (id: string, updates: Partial<TADAEntry>) => {
    const now = new Date();
    const lastModified = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    setTadaList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, lastModified } : t))
    );
    addAuditLog('TADA_CLAIM_UPDATED', 'TADA Management', `Updated TADA claim ${id}`);
  };

  const approveTADA = (id: string, approverName?: string) => {
    const now = new Date();
    const approvedAt = now.toISOString().replace('T', ' ').slice(0, 16);
    const lastModified = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const finalApprover = approverName || currentUser.name || 'Management Approver';

    setTadaList((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'Approved',
              approverName: finalApprover,
              approvedAt,
              lastModified,
            }
          : t
      )
    );
    addAuditLog('TADA_APPROVED', 'TADA Management', `Approved TADA claim ${id} by ${finalApprover}`);
  };

  const batchApproveTADA = (ids: string[], approverName?: string) => {
    const now = new Date();
    const approvedAt = now.toISOString().replace('T', ' ').slice(0, 16);
    const lastModified = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const finalApprover = approverName || currentUser.name || 'Management Approver';

    setTadaList((prev) =>
      prev.map((t) =>
        ids.includes(t.id)
          ? {
              ...t,
              status: 'Approved',
              approverName: finalApprover,
              approvedAt,
              lastModified,
            }
          : t
      )
    );
    addAuditLog('TADA_BATCH_APPROVED', 'TADA Management', `Batch approved ${ids.length} TADA claims by ${finalApprover}`);
  };

  const rejectTADA = (id: string, reason?: string) => {
    const now = new Date();
    const lastModified = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    setTadaList((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'Rejected',
              remarks: reason ? `${t.remarks || ''} (Rejected: ${reason})` : t.remarks,
              lastModified,
            }
          : t
      )
    );
    addAuditLog('TADA_REJECTED', 'TADA Management', `Rejected TADA claim ${id} (${reason || 'No reason provided'})`);
  };

  const deleteTADA = (id: string) => {
    setTadaList((prev) => prev.filter((t) => t.id !== id));
    addAuditLog('TADA_DELETED', 'TADA Management', `Deleted TADA claim ${id}`);
  };

  const updateFieldForceTADAApprover = (repId: string, approverId: string, approverName: string) => {
    setFieldForceReps((prev) =>
      prev.map((r) =>
        r.id === repId || r.code === repId
          ? { ...r, tadaApproverId: approverId, tadaApproverName: approverName }
          : r
      )
    );
    addAuditLog('TADA_APPROVER_TAGGED', 'Field Force Management', `Super Admin tagged ${approverName} as TADA Approver for ${repId}`);
  };

  // Stage 11: Finance & Cash Book
  const addCashBookEntry = (entry: Omit<CashBookEntry, 'id' | 'runningBalanceBDT'>) => {
    const lastCash = cashBook[cashBook.length - 1];
    const prevBal = lastCash ? lastCash.runningBalanceBDT : 0;
    const netDelta = entry.cashInBDT - entry.cashOutBDT;
    const newEntry: CashBookEntry = {
      ...entry,
      id: `cb-${Date.now()}`,
      runningBalanceBDT: prevBal + netDelta,
    };
    setCashBook((prev) => [...prev, newEntry]);
    addAuditLog('CASH_VOUCHER_POSTED', 'Finance & Cash Book', `Voucher ${newEntry.voucherNo} posted to ${newEntry.accountType} (In: ${newEntry.cashInBDT}, Out: ${newEntry.cashOutBDT})`);
  };

  // Stage 12: Payroll & Salary Automation
  const generateMonthlyPayroll = (monthYear: string) => {
    const newRecords: PayrollRecord[] = fieldForceReps.map((rep) => {
      const basic = rep.basicSalaryBDT;
      const houseRent = basic * 0.5;
      const medical = basic * 0.1;
      const conveyance = rep.conveyanceBDT;
      const mobile = rep.mobileAllowanceBDT;
      const tada = rep.taDaBDT;

      // Incentive tied to target achievement
      const achPercent = rep.monthlyTargetBDT > 0 ? (rep.monthlyAchievedBDT / rep.monthlyTargetBDT) * 100 : 0;
      let incentive = 0;
      if (achPercent >= 100) incentive = basic * 0.4;
      else if (achPercent >= 85) incentive = basic * 0.25;
      else if (achPercent >= 70) incentive = basic * 0.1;

      // Automated Tax deduction (progressive slab estimation)
      const gross = basic + houseRent + medical + conveyance + mobile + tada + incentive;
      let tax = 0;
      if (gross > 60000) tax = gross * 0.05;
      const pf = basic * 0.1;
      const net = gross - tax - pf;

      return {
        id: `pay-${monthYear}-${rep.id}`,
        monthYear,
        employeeId: rep.id,
        employeeName: rep.name,
        designation: rep.designation,
        basicSalaryBDT: basic,
        houseRentBDT: houseRent,
        medicalAllowanceBDT: medical,
        conveyanceAllowanceBDT: conveyance,
        mobileAllowanceBDT: mobile,
        taDaBDT: tada,
        targetBDT: rep.monthlyTargetBDT,
        achievementBDT: rep.monthlyAchievedBDT,
        achievementPercent: Number(achPercent.toFixed(1)),
        salesIncentiveBDT: Math.round(incentive),
        taxDeductionBDT: Math.round(tax),
        providentFundBDT: Math.round(pf),
        netPayableBDT: Math.round(net),
        status: 'Draft',
      };
    });

    setPayrollRecords((prev) => {
      const filtered = prev.filter((p) => p.monthYear !== monthYear);
      return [...newRecords, ...filtered];
    });

    addAuditLog('PAYROLL_GENERATED', 'HR & Payroll', `Generated automated payroll calculations for ${monthYear} (${newRecords.length} staff)`);
  };

  const disbursePayroll = (payrollId: string) => {
    setPayrollRecords((prev) =>
      prev.map((p) => {
        if (p.id === payrollId && p.status !== 'Paid') {
          // Deduct from City Bank PLC in Cash Book
          const lastCash = cashBook[cashBook.length - 1];
          const prevBal = lastCash ? lastCash.runningBalanceBDT : 10000000;
          const cashEntry: CashBookEntry = {
            id: `cb-${Date.now()}`,
            date: new Date().toISOString().substring(0, 10),
            voucherNo: `CB-SAL-${Date.now().toString().slice(-4)}`,
            accountType: 'City Bank PLC',
            transactionCategory: 'Salary Payment',
            description: `Salary & Incentive disbursement to ${p.employeeName} (${p.designation}) for ${p.monthYear}`,
            reference: `PAY-${p.monthYear}-${p.employeeId}`,
            cashInBDT: 0,
            cashOutBDT: p.netPayableBDT,
            runningBalanceBDT: prevBal - p.netPayableBDT,
          };
          setCashBook((cb) => [...cb, cashEntry]);
          addAuditLog('PAYROLL_DISBURSED', 'HR & Payroll', `Disbursed net salary BDT ${p.netPayableBDT.toLocaleString()} to ${p.employeeName}`);
          return { ...p, status: 'Paid', paymentDate: new Date().toISOString().substring(0, 10) };
        }
        return p;
      })
    );
  };

  // User Management & Permissions (RBAC)
  const addUser = (userData: Omit<User, 'id'>): string => {
    const id = `u-${Date.now().toString().slice(-5)}`;
    const permissions = userData.permissions || getDefaultPermissionsForRole(userData.role);
    const newUser: User = {
      ...userData,
      id,
      permissions,
      status: userData.status || 'Active',
    };
    setUsers((prev) => [...prev, newUser]);

    // If salesman, automatically add to fieldForceReps if not already there
    if (newUser.isSalesman || newUser.role === 'Field Force' || newUser.role === 'Territory Sales Officer') {
      const code = newUser.salesmanCode || `REP-${Math.floor(100 + Math.random() * 900)}`;
      const repExists = fieldForceReps.some((r) => r.id === id || r.name.toLowerCase() === newUser.name.toLowerCase());
      if (!repExists) {
        const newRep: FieldForceRep = {
          id,
          code,
          name: newUser.name,
          phone: newUser.phone,
          designation: newUser.designation,
          region: newUser.region || 'Dhaka Division',
          area: newUser.area || 'Dhaka North',
          territory: newUser.territory || 'Assigned Territory',
          monthlyTargetBDT: newUser.monthlySalesTargetBDT || 2000000,
          monthlyAchievedBDT: 0,
          currentLocation: {
            latitude: 23.7925 + (Math.random() - 0.5) * 0.05,
            longitude: 90.4078 + (Math.random() - 0.5) * 0.05,
            address: `${newUser.territory || 'Dhaka'} Market Territory`,
            lastUpdated: 'Just now',
            speedKmH: 0,
            batteryLevel: 95,
            isOnline: true,
          },
          todayVisitsCount: 0,
          productiveVisitsCount: 0,
          basicSalaryBDT: 28000,
          conveyanceBDT: 5000,
          taDaBDT: 6500,
          mobileAllowanceBDT: 2500,
        };
        setFieldForceReps((prev) => [...prev, newRep]);
      }
    }

    addAuditLog('USER_CREATED', 'User Management', `Created new user ${newUser.name} with role ${newUser.role}`);

    // Sync newly created user to Supabase if configured
    const sb = getSupabase();
    if (sb) {
      const userPayload: any = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password || 'ensec2026',
        phone: newUser.phone || null,
        role: newUser.role,
        designation: newUser.designation || null,
        department: newUser.department || 'Operations',
        status: newUser.status || 'Active',
        uid: newUser.userId || id,
        permissions: newUser.permissions || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      (async () => {
        try {
          for (let attempt = 0; attempt < 8; attempt++) {
            const { error: insErr } = await sb
              .from('users')
              .upsert(userPayload, { onConflict: 'email' });
            if (!insErr) break;
            const colMatch =
              insErr.message.match(/column ["']?([a-zA-Z0-9_]+)["']? of relation ["']?users["']? does not exist/i) ||
              insErr.message.match(/Could not find the ['"]?([a-zA-Z0-9_]+)['"]? column/i);
            if (colMatch && colMatch[1] && colMatch[1] !== 'email') {
              delete userPayload[colMatch[1]];
              continue;
            }
            break;
          }
        } catch (e) {
          console.warn('Supabase addUser sync notice:', e);
        }
      })();
    }

    return id;
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, ...updates };
          if (currentUser.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
    addAuditLog('USER_UPDATED', 'User Management', `Updated profile details for user ID ${userId}`);

    // Sync profile updates to Supabase if configured
    const sb = getSupabase();
    if (sb) {
      const target = users.find((u) => u.id === userId);
      const email = target?.email || (updates as any).email;
      if (email) {
        const supaUpdates: any = {
          updated_at: new Date().toISOString(),
        };
        if (updates.name) supaUpdates.name = updates.name;
        if (updates.phone !== undefined) supaUpdates.phone = updates.phone;
        if (updates.role) supaUpdates.role = updates.role;
        if (updates.designation !== undefined) supaUpdates.designation = updates.designation;
        if (updates.department !== undefined) supaUpdates.department = updates.department;
        if (updates.status) supaUpdates.status = updates.status;
        if (updates.permissions) supaUpdates.permissions = updates.permissions;
        if (updates.password) supaUpdates.password = updates.password;

        (async () => {
          try {
            for (let attempt = 0; attempt < 8; attempt++) {
              const { error: updErr } = await sb
                .from('users')
                .update(supaUpdates)
                .ilike('email', email);
              if (!updErr) break;
              const colMatch =
                updErr.message.match(/column ["']?([a-zA-Z0-9_]+)["']? of relation ["']?users["']? does not exist/i) ||
                updErr.message.match(/Could not find the ['"]?([a-zA-Z0-9_]+)['"]? column/i);
              if (colMatch && colMatch[1]) {
                delete supaUpdates[colMatch[1]];
                continue;
              }
              break;
            }
          } catch (e) {
            console.warn('Supabase updateUser sync notice:', e);
          }
        })();
      }
    }
  };

  const updateUserPassword = async (
    userId: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string; sqlFix?: string; warning?: string }> => {
    const cleanPassword = newPassword?.trim();
    if (!cleanPassword || cleanPassword.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }

    // 1. Locate the target user synchronously
    const targetUser = users.find(
      (u) =>
        u.id === userId ||
        u.userId === userId ||
        (u.email && u.email.toLowerCase() === userId.toLowerCase())
    );

    const userName = targetUser?.name || userId;
    const userEmail = targetUser?.email?.trim().toLowerCase();

    // 2. Update local state immediately
    setUsers((prev) =>
      prev.map((u) => {
        if (
          u.id === userId ||
          u.userId === userId ||
          (userEmail && u.email?.toLowerCase() === userEmail)
        ) {
          const updated = { ...u, password: cleanPassword };
          if (currentUser.id === u.id || (userEmail && currentUser.email?.toLowerCase() === userEmail)) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    addAuditLog(
      'PASSWORD_CHANGED',
      'Security & Access Control',
      `Password successfully changed for user ${userName} (${targetUser?.userId || userEmail || userId})`
    );

    // 3. Supabase Database Persistence
    const sb = getSupabase();
    if (!sb) {
      return {
        success: true,
        warning: 'Supabase credentials are not configured. Saved in local storage.',
      };
    }

    try {
      // Step A: Locate existing row in public.users table by email or uid
      let existingSbUser: any = null;
      if (userEmail) {
        const { data: foundByEmail, error: findEmailErr } = await sb
          .from('users')
          .select('id, email, name')
          .ilike('email', userEmail)
          .limit(1);

        if (findEmailErr) {
          const findMsg = (findEmailErr.message || '').toLowerCase();
          if (findEmailErr.code === '42P01' || findMsg.includes('does not exist') || findMsg.includes('relation')) {
            return {
              success: false,
              error: 'Table "users" does not exist in your Supabase project. Please execute the SQL schema in Supabase SQL Editor.',
              sqlFix: 'CREATE TABLE IF NOT EXISTS public.users (id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT DEFAULT \'ensec2026\', role TEXT DEFAULT \'Field Force\', status TEXT DEFAULT \'Active\');',
            };
          }
          if (findEmailErr.code === '42501' || findMsg.includes('policy') || findMsg.includes('security')) {
            return {
              success: false,
              error: `Supabase RLS is blocking access to table "users" (${findEmailErr.message}). Run: CREATE POLICY "Allow public access" ON public.users FOR ALL USING (true) WITH CHECK (true);`,
              sqlFix: 'CREATE POLICY "Allow public access" ON public.users FOR ALL USING (true) WITH CHECK (true);',
            };
          }
        } else if (foundByEmail && foundByEmail.length > 0) {
          existingSbUser = foundByEmail[0];
        }
      }

      if (!existingSbUser && (targetUser?.userId || targetUser?.id)) {
        const { data: foundByUid } = await sb
          .from('users')
          .select('id, email, name')
          .eq('uid', targetUser?.userId || targetUser?.id)
          .limit(1);
        if (foundByUid && foundByUid.length > 0) {
          existingSbUser = foundByUid[0];
        }
      }

      // Step B: If row already exists in public.users, UPDATE it
      if (existingSbUser) {
        let updatePayload: any = {
          password: cleanPassword,
          updated_at: new Date().toISOString(),
        };

        let updateSuccess = false;
        let lastUpdateErr: any = null;

        for (let attempt = 0; attempt < 5; attempt++) {
          const query = existingSbUser.id
            ? sb.from('users').update(updatePayload).eq('id', existingSbUser.id)
            : sb.from('users').update(updatePayload).ilike('email', userEmail!);

          const { data: updData, error: updErr } = await query.select();

          if (!updErr) {
            updateSuccess = true;
            break;
          }

          lastUpdateErr = updErr;
          const errMsg = (updErr.message || '').toLowerCase();

          // Column password missing
          if (updErr.code === '42703' && errMsg.includes('password')) {
            return {
              success: false,
              error: `Supabase table "users" is missing the "password" column. Please run this in your Supabase SQL Editor: ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'ensec2026';`,
              sqlFix: 'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT DEFAULT \'ensec2026\';',
            };
          }

          // Strip updated_at if not present
          if (updErr.code === '42703' && errMsg.includes('updated_at')) {
            delete updatePayload.updated_at;
            continue;
          }

          // RLS error
          if (updErr.code === '42501' || errMsg.includes('policy')) {
            return {
              success: false,
              error: `Supabase RLS is blocking updates to table "users" (${updErr.message}). Add a permissive RLS policy.`,
              sqlFix: 'CREATE POLICY "Allow public access" ON public.users FOR ALL USING (true) WITH CHECK (true);',
            };
          }

          break;
        }

        if (!updateSuccess && lastUpdateErr) {
          return {
            success: false,
            error: `Failed to update password in Supabase: ${lastUpdateErr.message}`,
          };
        }

        await refreshUsers();
        return { success: true };
      }

      // Step C: If user row does NOT exist yet in public.users, INSERT / UPSERT them with password!
      const insertPayload: any = {
        name: targetUser?.name || userName || 'Ensec Staff',
        email: userEmail || `${(targetUser?.userId || userId).toLowerCase()}@ensecbd.com`,
        password: cleanPassword,
        phone: targetUser?.phone || null,
        role: targetUser?.role || 'Field Force',
        designation: targetUser?.designation || null,
        department: targetUser?.department || 'Operations',
        status: targetUser?.status || 'Active',
        uid: targetUser?.userId || targetUser?.id || userId,
        permissions: targetUser?.permissions || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      let insertSuccess = false;
      let lastInsertErr: any = null;

      for (let attempt = 0; attempt < 8; attempt++) {
        const { data: insData, error: insErr } = await sb
          .from('users')
          .upsert(insertPayload, { onConflict: 'email' })
          .select();

        if (!insErr) {
          insertSuccess = true;
          break;
        }

        lastInsertErr = insErr;
        const msg = (insErr.message || '').toLowerCase();

        // If password column missing:
        if (insErr.code === '42703' && msg.includes('password')) {
          return {
            success: false,
            error: `Supabase table "users" is missing the "password" column. Please run this in your Supabase SQL Editor: ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'ensec2026';`,
            sqlFix: 'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT DEFAULT \'ensec2026\';',
          };
        }

        // If other optional column missing, strip and retry
        const colMatch =
          insErr.message.match(/column ["']?([a-zA-Z0-9_]+)["']? of relation ["']?users["']? does not exist/i) ||
          insErr.message.match(/Could not find the ['"]?([a-zA-Z0-9_]+)['"]? column/i);
        if (colMatch && colMatch[1] && colMatch[1] !== 'password' && colMatch[1] !== 'email') {
          delete insertPayload[colMatch[1]];
          continue;
        }

        // RLS error
        if (insErr.code === '42501' || msg.includes('policy')) {
          return {
            success: false,
            error: `Supabase RLS is blocking inserts to table "users" (${insErr.message}). Add a permissive RLS policy.`,
            sqlFix: 'CREATE POLICY "Allow public access" ON public.users FOR ALL USING (true) WITH CHECK (true);',
          };
        }

        break;
      }

      if (!insertSuccess && lastInsertErr) {
        return {
          success: false,
          error: `Supabase failed to save user into users table: ${lastInsertErr.message}`,
        };
      }

      await refreshUsers();
      return { success: true };
    } catch (err: any) {
      console.error('Exception updating user password in Supabase:', err);
      return {
        success: false,
        error: err.message || 'Unexpected exception updating password in Supabase.',
      };
    }
  };

  const syncAllUsersToSupabase = async (): Promise<{ success: boolean; count: number; error?: string; sqlFix?: string }> => {
    const sb = getSupabase();
    if (!sb) {
      return { success: false, count: 0, error: 'Supabase credentials are not connected.' };
    }
    let successCount = 0;
    for (const u of users) {
      const res = await updateUserPassword(u.id, u.password || 'ensec2026');
      if (res.success) {
        successCount++;
      } else if (res.sqlFix) {
        return { success: false, count: successCount, error: res.error, sqlFix: res.sqlFix };
      }
    }
    await refreshUsers();
    return { success: true, count: successCount };
  };

  const updateUserPermissions = (userId: string, permissions: UserPermissions) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, permissions };
          if (currentUser.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
    const targetUser = users.find((u) => u.id === userId);
    addAuditLog(
      'PERMISSIONS_UPDATED',
      'User Management',
      `Super Admin updated page and feature permissions for ${targetUser?.name || userId}`
    );
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    addAuditLog('USER_DELETED', 'User Management', `Removed user account ID ${userId}`);
  };

  const currentUserHasPermission = (moduleId: string): boolean => {
    return hasModulePermission(currentUser, moduleId);
  };

  const currentUserHasFeature = (featureKey: keyof FeaturePermissions): boolean => {
    return hasFeaturePermission(currentUser, featureKey);
  };

  // --- WARRANTY & SERVICE MANAGEMENT METHODS ---
  const addWarrantyTicket = (ticketData: Omit<WarrantyTicket, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const id = `ticket-${Date.now().toString().slice(-6)}`;
    const ticketSeq = (warrantyTickets.length + 1).toString().padStart(5, '0');
    const ticketNumber = ticketData.ticketNumber || `ENS-WAR-2026-${ticketSeq}`;
    const now = new Date().toISOString();
    const newTicket: WarrantyTicket = {
      ...ticketData,
      id,
      ticketNumber,
      createdAt: now,
      updatedAt: now,
    };
    setWarrantyTickets((prev) => [newTicket, ...prev]);
    addAuditLog(
      'WARRANTY_TICKET_CREATED',
      'Warranty & Service',
      `Registered complaint #${ticketNumber} for customer ${newTicket.customerName} (${newTicket.ownershipType} - ${newTicket.batteryBrand} ${newTicket.serialNumber})`
    );
    return id;
  };

  const updateWarrantyTicket = (ticketId: string, updates: Partial<WarrantyTicket>) => {
    const now = new Date().toISOString();
    setWarrantyTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, ...updates, updatedAt: now } : t))
    );
    addAuditLog(
      'WARRANTY_TICKET_UPDATED',
      'Warranty & Service',
      `Updated service ticket ID ${ticketId} details & workflow stage`
    );
  };

  const deleteWarrantyTicket = (ticketId: string) => {
    setWarrantyTickets((prev) => prev.filter((t) => t.id !== ticketId));
    addAuditLog('WARRANTY_TICKET_DELETED', 'Warranty & Service', `Removed ticket ID ${ticketId}`);
  };

  const addBatteryReceiving = (record: Omit<BatteryReceivingRecord, 'id'>): string => {
    const id = `rec-${Date.now().toString().slice(-6)}`;
    const newRecord: BatteryReceivingRecord = { ...record, id };
    setBatteryReceivings((prev) => [newRecord, ...prev]);
    if (record.ticketId) {
      updateWarrantyTicket(record.ticketId, {
        isReceivedAtFactory: true,
        receivingId: id,
        receivedDate: record.receivingDate,
        receivingReceiptNumber: record.receivingReceiptNumber,
        status: 'Battery Received',
      });
    }
    addAuditLog(
      'BATTERY_RECEIVED_FACTORY',
      'Warranty & Service',
      `Factory received battery ${record.batteryBrand} (${record.serialNumber}) via ${record.deliveryMethod}. Receipt: ${record.receivingReceiptNumber}`
    );
    return id;
  };

  const addTechnicalInspection = (inspection: Omit<TechnicalInspection, 'id'>): string => {
    const id = `insp-${Date.now().toString().slice(-6)}`;
    const newInsp: TechnicalInspection = { ...inspection, id };
    setTechnicalInspections((prev) => [newInsp, ...prev]);
    if (inspection.ticketId) {
      updateWarrantyTicket(inspection.ticketId, {
        inspectionId: id,
        inspectedBy: inspection.technicianName,
        inspectionDate: inspection.inspectionDate,
        isSafetyHold: inspection.isSafetyHold,
        safetyHoldReason: inspection.safetyHoldReason,
        status: inspection.isSafetyHold ? 'Safety Hold' : 'Technical Inspection',
      });
    }
    addAuditLog(
      'TECHNICAL_INSPECTION_LOGGED',
      'Warranty & Service',
      `Logged technical inspection for ${inspection.ticketNumber} (${inspection.serialNumber}). Safety hold: ${inspection.isSafetyHold ? 'YES' : 'NO'}`
    );
    return id;
  };

  const updateTechnicalInspection = (id: string, updates: Partial<TechnicalInspection>) => {
    setTechnicalInspections((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
    );
  };

  const addServiceJobCard = (jobCard: Omit<ServiceJobCard, 'id' | 'creationDate'>): string => {
    const id = `jc-${Date.now().toString().slice(-6)}`;
    const creationDate = new Date().toISOString().slice(0, 10);
    const newJobCard: ServiceJobCard = { ...jobCard, id, creationDate };
    setServiceJobCards((prev) => [newJobCard, ...prev]);
    if (jobCard.ticketId) {
      updateWarrantyTicket(jobCard.ticketId, {
        jobCardId: id,
        jobCardNumber: jobCard.jobCardNumber,
        status: 'In Repair',
        warrantyDecision: jobCard.warrantyDecision,
      });
    }
    addAuditLog(
      'JOB_CARD_CREATED',
      'Warranty & Service',
      `Created Job Card ${jobCard.jobCardNumber} assigned to ${jobCard.assignedTechnician} (Priority: ${jobCard.repairPriority})`
    );
    return id;
  };

  const updateServiceJobCard = (jobCardId: string, updates: Partial<ServiceJobCard>) => {
    setServiceJobCards((prev) =>
      prev.map((jc) => (jc.id === jobCardId ? { ...jc, ...updates } : jc))
    );
    if (updates.status) {
      const card = serviceJobCards.find((j) => j.id === jobCardId);
      if (card && card.ticketId) {
        if (updates.status === 'Repair Completed') {
          updateWarrantyTicket(card.ticketId, { status: 'Quality Control Pending' });
        } else if (updates.status === 'Quality Control Passed') {
          updateWarrantyTicket(card.ticketId, { status: 'Ready for Dispatch' });
        } else if (updates.status === 'Delivered') {
          updateWarrantyTicket(card.ticketId, { status: 'Delivered' });
        }
      }
    }
    addAuditLog(
      'JOB_CARD_UPDATED',
      'Warranty & Service',
      `Updated Job Card ID ${jobCardId} status to ${updates.status || 'modified'}`
    );
  };

  const addSparePartsConsumption = (part: Omit<SparePartReplacement, 'id'>): string => {
    const id = `part-${Date.now().toString().slice(-6)}`;
    const newPart: SparePartReplacement = { ...part, id };
    setSparePartsConsumptions((prev) => [newPart, ...prev]);

    setRawMaterials((prev) =>
      prev.map((rm) => {
        if (rm.code === part.partCode || rm.name === part.partName) {
          const updatedStock = Math.max(0, rm.stockKushtia - part.replacementQty);
          return { ...rm, stockKushtia: updatedStock };
        }
        return rm;
      })
    );

    addAuditLog(
      'SPARE_PART_CONSUMED',
      'Warranty & Service',
      `Issued ${part.replacementQty} ${part.unit} of ${part.partName} (${part.partCode}) for ${part.jobCardNumber}. Coverage: ${part.warrantyCoverageStatus}`
    );
    return id;
  };

  const addServiceEstimation = (est: Omit<RepairEstimation, 'id'>): string => {
    const id = `est-${Date.now().toString().slice(-6)}`;
    const newEst: RepairEstimation = { ...est, id };
    setServiceEstimations((prev) => [newEst, ...prev]);
    if (est.ticketId) {
      updateWarrantyTicket(est.ticketId, {
        estimatedCostBDT: est.totalEstimatedAmountBDT,
        status: 'Quotation Pending Approval',
      });
    }
    addAuditLog(
      'REPAIR_ESTIMATION_CREATED',
      'Warranty & Service',
      `Prepared Quotation ${est.estimationNumber} for ${est.customerName} - Total: BDT ${est.totalEstimatedAmountBDT}`
    );
    return id;
  };

  const updateServiceEstimation = (id: string, updates: Partial<RepairEstimation>) => {
    setServiceEstimations((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
    if (updates.customerApprovalStatus === 'Approved by Customer') {
      const est = serviceEstimations.find((e) => e.id === id);
      if (est && est.ticketId) {
        updateWarrantyTicket(est.ticketId, { status: 'Paid Repair Approved' });
      }
    }
  };

  const addServiceInvoice = (inv: Omit<ServiceInvoice, 'id'>): string => {
    const id = `inv-${Date.now().toString().slice(-6)}`;
    const newInv: ServiceInvoice = { ...inv, id };
    setServiceInvoices((prev) => [newInv, ...prev]);
    if (inv.ticketId) {
      updateWarrantyTicket(inv.ticketId, {
        invoiceId: id,
        invoiceNumber: inv.invoiceNumber,
        invoiceTotalBDT: inv.totalInvoiceAmountBDT,
        amountPaidBDT: inv.amountPaidBDT,
        paymentStatus: inv.paymentStatus,
      });
    }
    addAuditLog(
      'SERVICE_INVOICE_GENERATED',
      'Warranty & Service',
      `Generated Service Invoice ${inv.invoiceNumber} for ${inv.customerName}. Customer payable: BDT ${inv.totalInvoiceAmountBDT}, Warranty absorbed: BDT ${inv.warrantyCoveredCostBDT}`
    );
    return id;
  };

  const updateServiceInvoice = (id: string, updates: Partial<ServiceInvoice>) => {
    setServiceInvoices((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
    );
  };

  const addServicePayment = (payment: Omit<ServicePayment, 'id'>): string => {
    const id = `pay-${Date.now().toString().slice(-6)}`;
    const newPayment: ServicePayment = { ...payment, id };
    setServicePayments((prev) => [newPayment, ...prev]);

    setServiceInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === payment.invoiceId || inv.invoiceNumber === payment.invoiceNumber) {
          const newPaid = inv.amountPaidBDT + payment.amountBDT;
          const newOutstanding = Math.max(0, inv.totalInvoiceAmountBDT - newPaid);
          const newStatus = newOutstanding <= 0 ? 'Paid' : newPaid > 0 ? 'Partially Paid' : 'Unpaid';
          return {
            ...inv,
            amountPaidBDT: newPaid,
            outstandingAmountBDT: newOutstanding,
            paymentStatus: newStatus,
          };
        }
        return inv;
      })
    );

    addCashBookEntry({
      date: payment.paymentDate.slice(0, 10),
      voucherNo: payment.receiptNumber,
      accountType: payment.paymentMethod === 'Cash' ? 'Factory Cash' : 'Eastern Bank PLC',
      transactionCategory: 'Customer Payment',
      description: `Service receipt from ${payment.customerName} for ${payment.ticketNumber} via ${payment.paymentMethod}`,
      reference: payment.receiptNumber,
      cashInBDT: payment.amountBDT,
      cashOutBDT: 0,
    });

    addAuditLog(
      'SERVICE_PAYMENT_COLLECTED',
      'Warranty & Service',
      `Collected payment BDT ${payment.amountBDT} for ${payment.ticketNumber} via ${payment.paymentMethod}. Receipt: ${payment.receiptNumber}`
    );
    return id;
  };

  const addQualityControlRecord = (qc: Omit<QualityControlRecord, 'id'>): string => {
    const id = `qc-${Date.now().toString().slice(-6)}`;
    const newQC: QualityControlRecord = { ...qc, id };
    setQualityControlRecords((prev) => [newQC, ...prev]);
    if (qc.result === 'QC Passed') {
      if (qc.jobCardId) {
        updateServiceJobCard(qc.jobCardId, { status: 'Quality Control Passed' });
      }
      const ticket = warrantyTickets.find((t) => t.ticketNumber === qc.ticketNumber);
      if (ticket) {
        updateWarrantyTicket(ticket.id, { qcStatus: 'Passed', status: 'Ready for Dispatch' });
      }
    } else if (qc.result === 'QC Failed') {
      if (qc.jobCardId) {
        updateServiceJobCard(qc.jobCardId, { status: 'Quality Control Failed' });
      }
      const ticket = warrantyTickets.find((t) => t.ticketNumber === qc.ticketNumber);
      if (ticket) {
        updateWarrantyTicket(ticket.id, { qcStatus: 'Failed', status: 'In Repair' });
      }
    }
    addAuditLog(
      'QUALITY_CONTROL_RECORDED',
      'Warranty & Service',
      `Recorded QC inspection #${qc.qcNumber} by ${qc.qcInspector}. Result: ${qc.result}`
    );
    return id;
  };

  const addBatteryDispatch = (dsp: Omit<BatteryDeliveryDispatch, 'id'>): string => {
    const id = `dsp-${Date.now().toString().slice(-6)}`;
    const newDsp: BatteryDeliveryDispatch = { ...dsp, id };
    setBatteryDispatches((prev) => [newDsp, ...prev]);
    if (dsp.ticketId) {
      updateWarrantyTicket(dsp.ticketId, {
        status: 'Delivered',
        dispatchId: id,
        dispatchDate: dsp.deliveryDate,
        deliveredBy: dsp.deliveredBy,
      });
    }
    if (dsp.jobCardId) {
      updateServiceJobCard(dsp.jobCardId, { status: 'Delivered' });
    }
    addAuditLog(
      'BATTERY_DISPATCHED',
      'Warranty & Service',
      `Battery ${dsp.batteryBrand} (${dsp.serialNumber}) dispatched to ${dsp.customerName} via ${dsp.deliveryMethod}. Gate pass: ${dsp.gatePassNumber}`
    );
    return id;
  };

  const addWarrantyPolicy = (policy: Omit<WarrantyPolicy, 'id'>): string => {
    const id = `pol-${Date.now().toString().slice(-6)}`;
    const newPol: WarrantyPolicy = { ...policy, id };
    setWarrantyPolicies((prev) => [...prev, newPol]);
    addAuditLog(
      'WARRANTY_POLICY_CREATED',
      'Warranty & Service',
      `Configured new warranty policy ${newPol.policyName} (${newPol.durationMonths} months)`
    );
    return id;
  };

  const updateWarrantyPolicy = (id: string, updates: Partial<WarrantyPolicy>) => {
    setWarrantyPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    addAuditLog('WARRANTY_POLICY_UPDATED', 'Warranty & Service', `Updated policy ID ${id}`);
  };

  const updateServiceSettings = (settings: Partial<ServiceSettings>) => {
    setServiceSettings((prev) => ({ ...prev, ...settings }));
    addAuditLog('SERVICE_SETTINGS_UPDATED', 'Warranty & Service', `Updated after-sales service configurations`);
  };

  // ============================================================================
  // --- INSTALLMENT & RECEIVABLES MANAGEMENT METHODS ---
  // ============================================================================

  const createInstallmentPlan = async (
    planData: Omit<InstallmentPlan, 'id' | 'createdAt' | 'updatedAt'>,
    customSchedules?: InstallmentSchedule[]
  ): Promise<{ success: boolean; id: string; error?: string }> => {
    try {
      const year = new Date().getFullYear();
      const planSeq = (installmentPlans.length + 1).toString().padStart(4, '0');
      const planId = `INS-${year}-${planSeq}`;
      const agreementNo = planData.agreementNo || `ENS-AGR-${planSeq}`;
      const today = new Date().toISOString().slice(0, 10);

      let generatedSchedules: InstallmentSchedule[] = [];

      if (customSchedules && customSchedules.length > 0) {
        generatedSchedules = customSchedules.map((s, idx) => ({
          ...s,
          id: s.id || `SCH-${planSeq}-${(idx + 1).toString().padStart(2, '0')}`,
          planId,
          agreementNo,
        }));
      } else {
        // Automatically generate schedules based on duration and firstDueDate
        const count = planData.durationMonths || 12;
        const monthlyAmt = planData.monthlyInstallmentBDT || Math.round(planData.financedAmountBDT / count);
        const monthlyInterest = planData.totalInterestBDT > 0 ? Math.round(planData.totalInterestBDT / count) : 0;
        const monthlyPrincipal = monthlyAmt - monthlyInterest;

        const firstDue = new Date(planData.firstDueDate || today);

        for (let i = 1; i <= count; i++) {
          const dueDateObj = new Date(firstDue);
          dueDateObj.setMonth(dueDateObj.getMonth() + (i - 1));
          const dueDateStr = dueDateObj.toISOString().slice(0, 10);

          generatedSchedules.push({
            id: `SCH-${planSeq}-${i.toString().padStart(2, '0')}`,
            planId,
            agreementNo,
            installmentNumber: i,
            dueDate: dueDateStr,
            dueAmountBDT: monthlyAmt,
            principalAmountBDT: monthlyPrincipal,
            interestAmountBDT: monthlyInterest,
            paidAmountBDT: 0,
            remainingAmountBDT: monthlyAmt,
            status: 'Upcoming',
            overdueDays: 0,
            lateFeeBDT: 0,
          });
        }
      }

      const newPlan: InstallmentPlan = {
        ...planData,
        id: planId,
        agreementNo,
        totalPaidBDT: 0,
        totalOutstandingBDT: planData.financedAmountBDT,
        paidInstallmentsCount: 0,
        remainingInstallmentsCount: generatedSchedules.length,
        overdueInstallmentsCount: 0,
        overdueAmountBDT: 0,
        status: 'Active',
        createdAt: today,
        updatedAt: today,
      };

      setInstallmentPlans((prev) => [newPlan, ...prev]);
      setInstallmentSchedules((prev) => [...generatedSchedules, ...prev]);

      // If down payment was received, record in Cash Book
      if (newPlan.downPaymentBDT > 0) {
        const lastCash = cashBook[cashBook.length - 1];
        const prevBal = lastCash ? lastCash.runningBalanceBDT : 10000000;
        const downPaymentVoucher: CashBookEntry = {
          id: `cash-dp-${Date.now()}`,
          date: today,
          voucherNo: `VOUCH-DP-${planSeq}`,
          accountType: 'Eastern Bank PLC (Current A/C)',
          transactionCategory: 'Installment Down Payment',
          description: `Down payment received for Agreement ${agreementNo} (${newPlan.customerName} - ${newPlan.productName})`,
          reference: agreementNo,
          cashInBDT: newPlan.downPaymentBDT,
          cashOutBDT: 0,
          runningBalanceBDT: prevBal + newPlan.downPaymentBDT,
        };
        setCashBook((prev) => [...prev, downPaymentVoucher]);
      }

      // Add Audit Log
      addAuditLog(
        'INSTALLMENT_PLAN_CREATED',
        'Installment & Receivables',
        `Created agreement ${agreementNo} for customer ${newPlan.customerName}. Financed: ৳${newPlan.financedAmountBDT.toLocaleString()}, Duration: ${newPlan.durationMonths} months.`
      );

      // Create Initial Notification
      const initialNotif: InstallmentNotification = {
        id: `notif-${Date.now()}`,
        title: `New Agreement Activated: ${agreementNo}`,
        message: `${newPlan.customerName} - ${newPlan.productName} (৳${newPlan.financedAmountBDT.toLocaleString()} financed for ${newPlan.durationMonths}m)`,
        type: 'upcoming_due',
        priority: 'low',
        referenceId: planId,
        isRead: false,
        createdAt: `${today} ${new Date().toTimeString().slice(0, 8)}`,
      };
      setInstallmentNotifications((prev) => [initialNotif, ...prev]);

      // Supabase remote sync if online
      const sb = getSupabase();
      if (sb) {
        try {
          await sb.from('installment_plans').insert({
            id: newPlan.id,
            agreement_no: newPlan.agreementNo,
            customer_id: newPlan.customerId,
            customer_name: newPlan.customerName,
            customer_phone: newPlan.customerPhone,
            customer_district: newPlan.customerDistrict,
            distributor_id: newPlan.distributorId,
            distributor_name: newPlan.distributorName,
            sales_order_id: newPlan.salesOrderId,
            invoice_reference: newPlan.invoiceReference,
            product_id: newPlan.productId,
            product_name: newPlan.productName,
            product_model: newPlan.productModel,
            quantity: newPlan.quantity,
            total_product_price_bdt: newPlan.totalProductPriceBDT,
            down_payment_bdt: newPlan.downPaymentBDT,
            financed_amount_bdt: newPlan.financedAmountBDT,
            duration_months: newPlan.durationMonths,
            interest_rate_percent: newPlan.interestRatePercent,
            total_interest_bdt: newPlan.totalInterestBDT,
            total_payable_bdt: newPlan.totalPayableBDT,
            monthly_installment_bdt: newPlan.monthlyInstallmentBDT,
            start_date: newPlan.startDate,
            first_due_date: newPlan.firstDueDate,
            payment_frequency: newPlan.paymentFrequency,
            status: newPlan.status,
            total_paid_bdt: newPlan.totalPaidBDT,
            total_outstanding_bdt: newPlan.totalOutstandingBDT,
            paid_installments_count: newPlan.paidInstallmentsCount,
            remaining_installments_count: newPlan.remainingInstallmentsCount,
            overdue_installments_count: newPlan.overdueInstallmentsCount,
            overdue_amount_bdt: newPlan.overdueAmountBDT,
            guarantor_name: newPlan.guarantorName,
            guarantor_phone: newPlan.guarantorPhone,
            remarks: newPlan.remarks,
          });

          const schedulesPayload = generatedSchedules.map((s) => ({
            id: s.id,
            plan_id: s.planId,
            agreement_no: s.agreementNo,
            installment_number: s.installmentNumber,
            due_date: s.dueDate,
            due_amount_bdt: s.dueAmountBDT,
            principal_amount_bdt: s.principalAmountBDT,
            interest_amount_bdt: s.interestAmountBDT,
            paid_amount_bdt: s.paidAmountBDT,
            remaining_amount_bdt: s.remainingAmountBDT,
            status: s.status,
            overdue_days: s.overdueDays,
          }));

          await sb.from('installment_schedules').insert(schedulesPayload);
        } catch (sbErr) {
          console.warn('Supabase remote installment plan sync notice:', sbErr);
        }
      }

      return { success: true, id: planId };
    } catch (err: any) {
      return { success: false, id: '', error: err?.message || 'Failed to create plan' };
    }
  };

  const recordInstallmentPayment = async (
    paymentData: Omit<InstallmentPayment, 'id' | 'createdAt' | 'allocations' | 'paymentReceiptNo'> & { paymentReceiptNo?: string }
  ): Promise<{ success: boolean; id: string; error?: string; receiptNo: string }> => {
    try {
      const plan = installmentPlans.find((p) => p.id === paymentData.planId);
      if (!plan) {
        return { success: false, id: '', receiptNo: '', error: 'Installment plan not found' };
      }

      // Check duplicate payment reference
      const isDuplicate = installmentPayments.some(
        (p) =>
          p.planId === paymentData.planId &&
          p.transactionReference.trim().toLowerCase() === paymentData.transactionReference.trim().toLowerCase() &&
          p.amountBDT === paymentData.amountBDT
      );
      if (isDuplicate) {
        return {
          success: false,
          id: '',
          receiptNo: '',
          error: `Payment entry rejected: Duplicate transaction reference "${paymentData.transactionReference}" already exists.`,
        };
      }

      const today = new Date().toISOString().slice(0, 10);
      const paymentId = `PAY-INS-${Date.now().toString().slice(-6)}`;
      const receiptSeq = (installmentPayments.length + 101).toString();
      const paymentReceiptNo = `RCP-2026-${receiptSeq}`;

      // Run FIFO allocation on plan's unpaid schedules
      const planSchedules = installmentSchedules.filter((s) => s.planId === paymentData.planId);
      const unpaid = planSchedules.filter((s) => s.status !== 'Paid');

      const { allocations, updatedSchedules } = allocatePaymentFIFO(
        unpaid,
        paymentData.amountBDT,
        paymentId
      );

      const newPayment: InstallmentPayment = {
        ...paymentData,
        id: paymentId,
        paymentReceiptNo,
        allocations,
        createdAt: new Date().toISOString(),
      };

      // Merge updated schedules back into full list
      const scheduleMap = new Map(updatedSchedules.map((s) => [s.id, s]));
      const newAllSchedules = installmentSchedules.map((s) => (scheduleMap.has(s.id) ? scheduleMap.get(s.id)! : s));

      // Recompute plan status and aggregates
      const updatedPlanSchedules = newAllSchedules.filter((s) => s.planId === plan.id);
      const totalPaid = updatedPlanSchedules.reduce((sum, s) => sum + s.paidAmountBDT, 0);
      const totalOutstanding = updatedPlanSchedules.reduce((sum, s) => sum + s.remainingAmountBDT, 0);
      const paidCount = updatedPlanSchedules.filter((s) => s.status === 'Paid').length;
      const remainingCount = updatedPlanSchedules.filter((s) => s.status !== 'Paid').length;
      const overdueSchedules = updatedPlanSchedules.filter((s) => s.status === 'Overdue');
      const overdueCount = overdueSchedules.length;
      const overdueAmt = overdueSchedules.reduce((sum, s) => sum + s.remainingAmountBDT, 0);

      let newPlanStatus = plan.status;
      if (totalOutstanding <= 0) {
        newPlanStatus = 'Settled';
      } else if (overdueCount > 0) {
        newPlanStatus = 'Overdue';
      } else {
        newPlanStatus = 'Active';
      }

      const updatedPlan: InstallmentPlan = {
        ...plan,
        totalPaidBDT: totalPaid,
        totalOutstandingBDT: totalOutstanding,
        paidInstallmentsCount: paidCount,
        remainingInstallmentsCount: remainingCount,
        overdueInstallmentsCount: overdueCount,
        overdueAmountBDT: overdueAmt,
        status: newPlanStatus,
        updatedAt: today,
      };

      setInstallmentPayments((prev) => [newPayment, ...prev]);
      setInstallmentSchedules(newAllSchedules);
      setInstallmentPlans((prev) => prev.map((p) => (p.id === plan.id ? updatedPlan : p)));

      // 1. Post to Cash Book & General Ledger
      const lastCash = cashBook[cashBook.length - 1];
      const prevBal = lastCash ? lastCash.runningBalanceBDT : 10000000;
      const cashEntry: CashBookEntry = {
        id: `cash-ins-${Date.now()}`,
        date: paymentData.paymentDate || today,
        voucherNo: paymentReceiptNo,
        accountType: paymentData.bankAccountName || 'Eastern Bank PLC (Current A/C)',
        transactionCategory: 'Installment Collection',
        description: `Installment collection for Agreement ${plan.agreementNo} (${plan.customerName}) via ${paymentData.paymentMethod} - Ref: ${paymentData.transactionReference}`,
        reference: paymentReceiptNo,
        cashInBDT: paymentData.amountBDT,
        cashOutBDT: 0,
        runningBalanceBDT: prevBal + paymentData.amountBDT,
      };
      setCashBook((prev) => [...prev, cashEntry]);

      // 2. Audit Log
      addAuditLog(
        'INSTALLMENT_PAYMENT_COLLECTED',
        'Installment & Receivables',
        `Collected ৳${paymentData.amountBDT.toLocaleString()} for Agreement ${plan.agreementNo} (${plan.customerName}) - Receipt #${paymentReceiptNo}`
      );

      // 3. Automated SMS: Payment Confirmation
      const confirmRule = smsAutomationRules.find((r) => r.ruleCode === 'RULE_PAYMENT_CONFIRM');
      if (confirmRule && confirmRule.enabled) {
        const template = smsTemplates.find((t) => t.templateCode === 'PAYMENT_CONFIRMATION') || smsTemplates[4];
        if (template) {
          const compiled = compileTemplate(template.body, {
            CustomerName: plan.customerName,
            PaidAmount: paymentData.amountBDT,
            AgreementNo: plan.agreementNo,
            OutstandingAmount: totalOutstanding,
            ReceiptNo: paymentReceiptNo,
          });

          const smsResult = await sendSMSViaGateway({
            recipientPhone: plan.customerPhone,
            recipientName: plan.customerName,
            message: compiled,
            templateCode: template.templateCode,
            ruleId: confirmRule.id,
            planId: plan.id,
            agreementNo: plan.agreementNo,
            gatewaySettings: smsGatewaySettings,
          });

          setSmsLogs((prev) => [smsResult.log, ...prev]);
        }
      }

      // 4. In-App Notification
      const paymentNotif: InstallmentNotification = {
        id: `notif-${Date.now()}`,
        title: `Payment Received: ৳${paymentData.amountBDT.toLocaleString()}`,
        message: `${plan.customerName} (Agreement ${plan.agreementNo}) via ${paymentData.paymentMethod}. Remaining: ৳${totalOutstanding.toLocaleString()}`,
        type: 'payment_received',
        priority: 'medium',
        referenceId: plan.id,
        isRead: false,
        createdAt: `${today} ${new Date().toTimeString().slice(0, 8)}`,
      };
      setInstallmentNotifications((prev) => [paymentNotif, ...prev]);

      // 5. Remote Supabase sync if online
      const sb = getSupabase();
      if (sb) {
        try {
          await sb.from('installment_payments').insert({
            id: newPayment.id,
            payment_receipt_no: newPayment.paymentReceiptNo,
            plan_id: newPayment.planId,
            agreement_no: newPayment.agreementNo,
            customer_id: newPayment.customerId,
            customer_name: newPayment.customerName,
            amount_bdt: newPayment.amountBDT,
            payment_type: newPayment.paymentType,
            payment_method: newPayment.paymentMethod,
            bank_account_id: newPayment.bankAccountId,
            bank_account_name: newPayment.bankAccountName,
            transaction_reference: newPayment.transactionReference,
            payment_date: newPayment.paymentDate,
            received_by_id: newPayment.receivedById,
            received_by_name: newPayment.receivedByName,
            notes: newPayment.notes,
          });

          for (const s of updatedSchedules) {
            await sb.from('installment_schedules').update({
              paid_amount_bdt: s.paidAmountBDT,
              remaining_amount_bdt: s.remainingAmountBDT,
              status: s.status,
              payment_date: s.paymentDate,
              overdue_days: s.overdueDays,
            }).eq('id', s.id);
          }

          await sb.from('installment_plans').update({
            total_paid_bdt: updatedPlan.totalPaidBDT,
            total_outstanding_bdt: updatedPlan.totalOutstandingBDT,
            paid_installments_count: updatedPlan.paidInstallmentsCount,
            remaining_installments_count: updatedPlan.remainingInstallmentsCount,
            overdue_installments_count: updatedPlan.overdueInstallmentsCount,
            overdue_amount_bdt: updatedPlan.overdueAmountBDT,
            status: updatedPlan.status,
          }).eq('id', updatedPlan.id);
        } catch (sbErr) {
          console.warn('Supabase remote payment sync notice:', sbErr);
        }
      }

      return { success: true, id: paymentId, receiptNo: paymentReceiptNo };
    } catch (err: any) {
      return { success: false, id: '', receiptNo: '', error: err?.message || 'Payment collection error' };
    }
  };

  const recordEarlySettlement = async (
    planId: string,
    settlementData: {
      rebatePercent: number;
      paymentMethod: any;
      bankAccountId?: string;
      bankAccountName?: string;
      transactionRef: string;
      notes?: string;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const plan = installmentPlans.find((p) => p.id === planId);
      if (!plan) return { success: false, error: 'Plan not found' };

      const planSchedules = installmentSchedules.filter((s) => s.planId === planId);
      const calc = calculateEarlySettlement(plan, planSchedules, settlementData.rebatePercent);
      const today = new Date().toISOString().slice(0, 10);
      const receiptNo = `STL-${Date.now().toString().slice(-5)}`;

      // Mark all unpaid schedules as paid
      const updatedSchedules = installmentSchedules.map((s) => {
        if (s.planId === planId && s.status !== 'Paid') {
          return {
            ...s,
            paidAmountBDT: s.dueAmountBDT,
            remainingAmountBDT: 0,
            status: 'Paid' as const,
            paymentDate: today,
            overdueDays: 0,
          };
        }
        return s;
      });

      const updatedPlan: InstallmentPlan = {
        ...plan,
        status: 'Settled',
        totalPaidBDT: plan.totalProductPriceBDT,
        totalOutstandingBDT: 0,
        paidInstallmentsCount: planSchedules.length,
        remainingInstallmentsCount: 0,
        overdueInstallmentsCount: 0,
        overdueAmountBDT: 0,
        remarks: `${plan.remarks || ''} [Early Settlement completed with ${settlementData.rebatePercent}% rebate of ৳${calc.rebateAmountBDT.toLocaleString()} on ${today}]`.trim(),
        updatedAt: today,
      };

      setInstallmentSchedules(updatedSchedules);
      setInstallmentPlans((prev) => prev.map((p) => (p.id === planId ? updatedPlan : p)));

      // Post Settlement Cash Inflow to Cash Book
      const lastCash = cashBook[cashBook.length - 1];
      const prevBal = lastCash ? lastCash.runningBalanceBDT : 10000000;
      const cashEntry: CashBookEntry = {
        id: `cash-stl-${Date.now()}`,
        date: today,
        voucherNo: receiptNo,
        accountType: settlementData.bankAccountName || 'Eastern Bank PLC (Current A/C)',
        transactionCategory: 'Installment Collection',
        description: `Early Settlement for Agreement ${plan.agreementNo} (${plan.customerName}) - Net: ৳${calc.settlementNetPayableBDT.toLocaleString()} (Rebate: ৳${calc.rebateAmountBDT.toLocaleString()})`,
        reference: receiptNo,
        cashInBDT: calc.settlementNetPayableBDT,
        cashOutBDT: 0,
        runningBalanceBDT: prevBal + calc.settlementNetPayableBDT,
      };
      setCashBook((prev) => [...prev, cashEntry]);

      addAuditLog(
        'INSTALLMENT_EARLY_SETTLEMENT',
        'Installment & Receivables',
        `Completed early settlement for Agreement ${plan.agreementNo}. Net received: ৳${calc.settlementNetPayableBDT.toLocaleString()}, Rebate discount: ৳${calc.rebateAmountBDT.toLocaleString()}`
      );

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed early settlement' };
    }
  };

  const addCollectionFollowUp = async (
    followUpData: Omit<CollectionFollowUp, 'id' | 'createdAt'>
  ): Promise<{ success: boolean; id: string }> => {
    const id = `FLP-${Date.now().toString().slice(-6)}`;
    const newFollowUp: CollectionFollowUp = {
      ...followUpData,
      id,
      createdAt: new Date().toISOString(),
    };

    setCollectionFollowUps((prev) => [newFollowUp, ...prev]);

    // Update assignment target date and status if committed
    if (newFollowUp.committedPaymentDate) {
      setCollectionAssignments((prev) =>
        prev.map((a) =>
          a.planId === newFollowUp.planId
            ? {
                ...a,
                targetDate: newFollowUp.committedPaymentDate!,
                priority: 'High',
              }
            : a
        )
      );
    }

    addAuditLog(
      'COLLECTION_FOLLOWUP_LOGGED',
      'Collection Management',
      `Logged ${newFollowUp.activityType} for ${newFollowUp.customerName} (${newFollowUp.agreementNo}). Next follow-up: ${newFollowUp.nextFollowUpDate || 'None'}`
    );

    return { success: true, id };
  };

  const updateCollectionAssignment = (assignmentId: string, updates: Partial<CollectionAssignment>) => {
    setCollectionAssignments((prev) =>
      prev.map((a) => (a.id === assignmentId ? { ...a, ...updates } : a))
    );
    addAuditLog('COLLECTION_ASSIGNMENT_UPDATED', 'Collection Management', `Updated assignment ID ${assignmentId}`);
  };

  const createCollectionAssignment = (assignment: Omit<CollectionAssignment, 'id'>): string => {
    const id = `ASN-${Date.now().toString().slice(-5)}`;
    const newAssign: CollectionAssignment = { ...assignment, id };
    setCollectionAssignments((prev) => [newAssign, ...prev]);
    addAuditLog('COLLECTION_ASSIGNMENT_CREATED', 'Collection Management', `Assigned ${newAssign.customerName} to ${newAssign.assignedToName}`);
    return id;
  };

  const updateSMSTemplate = (templateId: string, updates: Partial<SMSTemplate>) => {
    setSmsTemplates((prev) =>
      prev.map((t) => (t.id === templateId ? { ...t, ...updates, updatedAt: new Date().toISOString().slice(0, 10) } : t))
    );
    addAuditLog('SMS_TEMPLATE_UPDATED', 'SMS & Notification', `Updated SMS template ${templateId}`);
  };

  const toggleSMSAutomationRule = (ruleId: string) => {
    setSmsAutomationRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
    addAuditLog('SMS_RULE_TOGGLED', 'SMS & Notification', `Toggled rule ID ${ruleId}`);
  };

  const updateSMSGatewaySettings = (settings: Partial<SMSGatewaySettings>) => {
    setSmsGatewaySettings((prev) => ({
      ...prev,
      ...settings,
      isConfigured: Boolean(settings.apiKey ? settings.apiKey.trim().length > 0 : prev.apiKey.trim().length > 0),
    }));
    addAuditLog('SMS_GATEWAY_CONFIGURED', 'SMS & Notification', `Updated SMS gateway credentials and endpoint`);
  };

  const testSMSGateway = async (phone: string, message: string): Promise<{ success: boolean; message: string }> => {
    const result = await sendSMSViaGateway({
      recipientPhone: phone,
      recipientName: 'Test Recipient',
      message,
      gatewaySettings: smsGatewaySettings,
    });

    setSmsLogs((prev) => [result.log, ...prev]);

    setSmsGatewaySettings((prev) => ({
      ...prev,
      lastTestedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      testStatus: result.success ? 'Success' : 'Failed',
    }));

    return {
      success: result.success,
      message: result.gatewayResponse,
    };
  };

  const runAutomationCheckNow = async (): Promise<AutomationExecutionReport> => {
    const result = await runAutomatedInstallmentCheck({
      plans: installmentPlans,
      schedules: installmentSchedules,
      rules: smsAutomationRules,
      templates: smsTemplates,
      gatewaySettings: smsGatewaySettings,
      escalationRules: collectionEscalationRules,
      assignments: collectionAssignments,
      existingLogs: smsLogs,
    });

    setInstallmentPlans(result.updatedPlans);
    setInstallmentSchedules(result.updatedSchedules);
    if (result.newLogs.length > 0) {
      setSmsLogs((prev) => [...result.newLogs, ...prev]);
    }
    if (result.newNotifications.length > 0) {
      setInstallmentNotifications((prev) => [...result.newNotifications, ...prev]);
    }
    setCollectionAssignments(result.updatedAssignments);

    addAuditLog(
      'INSTALLMENT_AUTOMATION_EXECUTED',
      'System Automation',
      `Executed scheduled check: ${result.report.schedulesUpdated} schedules refreshed, ${result.report.smsSentCount} SMS dispatched.`
    );

    return result.report;
  };

  const markNotificationAsRead = (id: string) => {
    setInstallmentNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setInstallmentNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteInstallmentPlan = (planId: string) => {
    setInstallmentPlans((prev) => prev.filter((p) => p.id !== planId));
    setInstallmentSchedules((prev) => prev.filter((s) => s.planId !== planId));
    setCollectionAssignments((prev) => prev.filter((a) => a.planId !== planId));
    addAuditLog('INSTALLMENT_PLAN_DELETED', 'Installment & Receivables', `Deleted plan ID ${planId}`);
  };

  const clearInstallmentData = () => {
    setInstallmentPlans([]);
    setInstallmentSchedules([]);
    setInstallmentPayments([]);
    setCollectionAssignments([]);
    setCollectionFollowUps([]);
    setSmsLogs([]);
    setInstallmentNotifications([]);

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('ensec_installment_plans');
        localStorage.removeItem('ensec_installment_schedules');
        localStorage.removeItem('ensec_installment_payments');
        localStorage.removeItem('ensec_collection_assignments');
        localStorage.removeItem('ensec_collection_followups');
        localStorage.removeItem('ensec_sms_logs');
        localStorage.removeItem('ensec_installment_notifications');
        try {
          sessionStorage.removeItem('ensec_installment_plans');
          sessionStorage.removeItem('ensec_installment_schedules');
          sessionStorage.removeItem('ensec_installment_payments');
        } catch {}
        localStorage.setItem('ensec_installment_test_purged_v2', 'true');
      } catch (e) {
        console.warn('Error clearing installment storage:', e);
      }
    }
    addAuditLog(
      'INSTALLMENT_DATA_CLEARED',
      'Installment & Receivables',
      'Cleared test and local session memory data from Installment Management'
    );
  };

  // ==========================================
  // CENTRAL PAYROLL MANAGEMENT FUNCTIONS
  // ==========================================

  const addSalaryStructure = (structure: Omit<EmployeeSalaryStructure, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const id = `sal-str-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString().slice(0, 10);
    const newStr: EmployeeSalaryStructure = {
      ...structure,
      id,
      createdAt: now,
      updatedAt: now,
      history: [
        {
          effectiveDate: structure.effectiveFrom,
          grossSalaryBDT: structure.grossSalaryBDT,
          basicSalaryBDT: structure.basicSalaryBDT,
          reason: 'Initial Structure Creation',
          changedBy: currentUser?.name || 'HR Admin',
          changedAt: now,
        },
      ],
    };
    setSalaryStructures((prev) => [newStr, ...prev.filter((s) => s.employeeId !== structure.employeeId)]);
    addAuditLog(
      'SALARY_STRUCTURE_SET',
      'HR & Payroll',
      `Configured salary structure for employee ${structure.employeeName} (${structure.employeeCode}) - Gross: ৳${structure.grossSalaryBDT.toLocaleString()}`
    );
    return id;
  };

  const updateSalaryStructure = (id: string, updates: Partial<EmployeeSalaryStructure>, reason?: string) => {
    const now = new Date().toISOString().slice(0, 10);
    setSalaryStructures((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const history = [...(s.history || [])];
          if (updates.grossSalaryBDT && updates.grossSalaryBDT !== s.grossSalaryBDT) {
            history.push({
              effectiveDate: updates.effectiveFrom || now,
              grossSalaryBDT: updates.grossSalaryBDT,
              basicSalaryBDT: updates.basicSalaryBDT || s.basicSalaryBDT,
              reason: reason || 'Salary Revision / Increment',
              changedBy: currentUser?.name || 'HR Admin',
              changedAt: now,
            });
          }
          return { ...s, ...updates, updatedAt: now, history };
        }
        return s;
      })
    );
    addAuditLog('SALARY_STRUCTURE_UPDATED', 'HR & Payroll', `Updated salary structure ID ${id}`);
  };

  const getEmployeeSalaryStructure = (employeeId: string): EmployeeSalaryStructure | undefined => {
    return salaryStructures.find((s) => s.employeeId === employeeId);
  };

  const markAttendance = (record: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const id = `att-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const newRecord: AttendanceRecord = {
      ...record,
      id,
      createdAt: now,
      updatedAt: now,
    };
    setAttendanceRecords((prev) => [newRecord, ...prev.filter((a) => !(a.employeeId === record.employeeId && a.date === record.date))]);
    return id;
  };

  const bulkMarkAttendance = (records: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    const now = new Date().toISOString();
    const newItems: AttendanceRecord[] = records.map((r, idx) => ({
      ...r,
      id: `att-${Date.now()}-${idx}`,
      createdAt: now,
      updatedAt: now,
    }));
    setAttendanceRecords((prev) => {
      const keys = new Set(newItems.map((i) => `${i.employeeId}_${i.date}`));
      return [...newItems, ...prev.filter((p) => !keys.has(`${p.employeeId}_${p.date}`))];
    });
    addAuditLog('ATTENDANCE_BULK_LOGGED', 'HR & Payroll', `Marked attendance for ${records.length} employees`);
  };

  const getEmployeeAttendanceSummary = (employeeId: string, monthYear: string) => {
    const [year, month] = monthYear.split('-').map(Number);
    const recs = attendanceRecords.filter((a) => a.employeeId === employeeId && a.date.startsWith(monthYear));
    const totalDays = new Date(year, month, 0).getDate();
    let present = 0;
    let absent = 0;
    let late = 0;
    let leave = 0;
    let holiday = 0;
    let halfDay = 0;
    let overtimeHours = 0;

    recs.forEach((r) => {
      if (r.status === 'Present') present++;
      else if (r.status === 'Absent') absent++;
      else if (r.status === 'Late') {
        late++;
        present++;
      } else if (r.status === 'Leave') leave++;
      else if (r.status === 'Holiday') holiday++;
      else if (r.status === 'Half-Day') {
        halfDay++;
        present += 0.5;
      }
      overtimeHours += r.overtimeHours || 0;
    });

    return {
      totalDays,
      presentDays: present,
      absentDays: absent,
      lateDays: late,
      leaveDays: leave,
      holidays: holiday,
      halfDays: halfDay,
      totalOvertimeHours: overtimeHours,
    };
  };

  const applyLeave = (leave: Omit<LeaveRecord, 'id' | 'appliedAt' | 'status'>): string => {
    const id = `leave-${Date.now().toString().slice(-6)}`;
    const newLeave: LeaveRecord = {
      ...leave,
      id,
      appliedAt: new Date().toISOString(),
      status: 'Pending',
    };
    setLeaveRecords((prev) => [newLeave, ...prev]);
    addAuditLog(
      'LEAVE_APPLIED',
      'HR & Payroll',
      `${leave.employeeName} applied for ${leave.leaveType} (${leave.daysCount} days: ${leave.startDate} to ${leave.endDate})`
    );
    return id;
  };

  const approveLeave = (id: string, approvedBy: string) => {
    setLeaveRecords((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'Approved', approvedBy, approvedAt: new Date().toISOString() } : l))
    );
    addAuditLog('LEAVE_APPROVED', 'HR & Payroll', `Approved leave ID ${id} by ${approvedBy}`);
  };

  const rejectLeave = (id: string, reason: string) => {
    setLeaveRecords((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'Rejected', rejectionReason: reason } : l))
    );
    addAuditLog('LEAVE_REJECTED', 'HR & Payroll', `Rejected leave ID ${id} (Reason: ${reason})`);
  };

  const getEmployeeLeaveBalance = (employeeId: string, year: number) => {
    const yearStr = `${year}`;
    const taken = leaveRecords.filter(
      (l) => l.employeeId === employeeId && l.status === 'Approved' && l.startDate.startsWith(yearStr)
    );
    const annualTaken = taken.filter((l) => l.leaveType === 'Annual Leave').reduce((s, l) => s + l.daysCount, 0);
    const casualTaken = taken.filter((l) => l.leaveType === 'Casual Leave').reduce((s, l) => s + l.daysCount, 0);
    const sickTaken = taken.filter((l) => l.leaveType === 'Sick Leave').reduce((s, l) => s + l.daysCount, 0);
    const maternityTaken = taken.filter((l) => l.leaveType === 'Maternity Leave').reduce((s, l) => s + l.daysCount, 0);
    const unpaidTaken = taken.filter((l) => l.leaveType === 'Unpaid Leave').reduce((s, l) => s + l.daysCount, 0);
    const q = payrollSettings?.leaveQuotas || DEFAULT_PAYROLL_SETTINGS.leaveQuotas || {
      annualLeave: 14,
      casualLeave: 10,
      sickLeave: 14,
      maternityLeave: 112,
    };
    return {
      annual: { quota: q.annualLeave, taken: annualTaken, remaining: Math.max(0, q.annualLeave - annualTaken) },
      casual: { quota: q.casualLeave, taken: casualTaken, remaining: Math.max(0, q.casualLeave - casualTaken) },
      sick: { quota: q.sickLeave, taken: sickTaken, remaining: Math.max(0, q.sickLeave - sickTaken) },
      maternity: { quota: q.maternityLeave, taken: maternityTaken, remaining: Math.max(0, q.maternityLeave - maternityTaken) },
      unpaid: { quota: 0, taken: unpaidTaken, remaining: 0 },
    };
  };

  const applyAdvanceLoan = (
    loanData: Omit<AdvanceLoanRecord, 'id' | 'appliedDate' | 'status' | 'repaidAmountBDT' | 'remainingAmountBDT' | 'schedule'>
  ): string => {
    const id = `loan-${Date.now().toString().slice(-6)}`;
    const monthlyInstallment = Math.round(loanData.principalAmountBDT / loanData.repaymentTenureMonths);
    const [startYear, startMonth] = loanData.deductionStartMonthYear.split('-').map(Number);

    const schedule: LoanInstallmentSchedule[] = [];
    for (let i = 0; i < loanData.repaymentTenureMonths; i++) {
      const date = new Date(startYear, startMonth - 1 + i, 1);
      const mStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      schedule.push({
        installmentNumber: i + 1,
        monthYear: mStr,
        amountBDT:
          i === loanData.repaymentTenureMonths - 1
            ? loanData.principalAmountBDT - monthlyInstallment * (loanData.repaymentTenureMonths - 1)
            : monthlyInstallment,
        status: 'Scheduled',
      });
    }

    const newRecord: AdvanceLoanRecord = {
      ...loanData,
      id,
      appliedDate: new Date().toISOString().slice(0, 10),
      status: 'Pending',
      monthlyDeductionBDT: monthlyInstallment,
      repaidAmountBDT: 0,
      remainingAmountBDT: loanData.principalAmountBDT,
      schedule,
    };

    setAdvanceLoans((prev) => [newRecord, ...prev]);
    addAuditLog(
      'LOAN_APPLIED',
      'HR & Payroll',
      `${loanData.loanType} of ৳${loanData.principalAmountBDT.toLocaleString()} applied by ${loanData.employeeName} (${loanData.repaymentTenureMonths} months tenure @ ৳${monthlyInstallment.toLocaleString()}/mo)`
    );
    return id;
  };

  const approveAdvanceLoan = (id: string, approvedBy: string) => {
    setAdvanceLoans((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'Approved', approvedBy, approvalDate: new Date().toISOString().slice(0, 10) } : l))
    );
    addAuditLog('LOAN_APPROVED', 'HR & Payroll', `Approved loan ID ${id} by ${approvedBy}`);
  };

  const recordLoanInstallmentDeduction = (loanId: string, installmentNumber: number, payrollRunId: string) => {
    setAdvanceLoans((prev) =>
      prev.map((l) => {
        if (l.id === loanId) {
          let deductedAmt = 0;
          const newSchedule = l.schedule.map((s) => {
            if (s.installmentNumber === installmentNumber && s.status !== 'Deducted') {
              deductedAmt = s.amountBDT;
              return {
                ...s,
                status: 'Deducted' as const,
                deductedInPayrollId: payrollRunId,
                paidDate: new Date().toISOString().slice(0, 10),
              };
            }
            return s;
          });
          const newRepaid = l.repaidAmountBDT + deductedAmt;
          const newRemaining = Math.max(0, l.principalAmountBDT - newRepaid);
          const isFullyPaid = newRemaining === 0;
          return {
            ...l,
            repaidAmountBDT: newRepaid,
            remainingAmountBDT: newRemaining,
            status: isFullyPaid ? 'Closed' : l.status,
            schedule: newSchedule,
          };
        }
        return l;
      })
    );
  };

  const earlySettleAdvanceLoan = (id: string, paymentMethod: string, notes?: string) => {
    setAdvanceLoans((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const today = new Date().toISOString().slice(0, 10);
          const settlementAmount = l.remainingAmountBDT;
          const updatedSchedule = l.schedule.map((s) => ({
            ...s,
            status: s.status === 'Scheduled' ? ('Deducted' as const) : s.status,
            paidDate: s.paidDate || today,
          }));

          // Post cash book inflow
          const lastCash = cashBook[cashBook.length - 1];
          const prevBal = lastCash ? lastCash.runningBalanceBDT : 10000000;
          const cashEntry: CashBookEntry = {
            id: `cash-ln-${Date.now()}`,
            date: today,
            voucherNo: `CB-LN-${Date.now().toString().slice(-4)}`,
            accountType: (paymentMethod as any) || 'City Bank PLC',
            transactionCategory: 'Other Receipt',
            description: `Early loan settlement: ${l.loanType} for ${l.employeeName} (${l.employeeCode})`,
            reference: `LOAN-${l.id}`,
            cashInBDT: settlementAmount,
            cashOutBDT: 0,
            runningBalanceBDT: prevBal + settlementAmount,
          };
          setCashBook((cb) => [...cb, cashEntry]);

          return {
            ...l,
            repaidAmountBDT: l.principalAmountBDT,
            remainingAmountBDT: 0,
            status: 'Settled',
            remarks: `${l.remarks || ''} [Early settled ৳${settlementAmount.toLocaleString()} via ${paymentMethod} on ${today} ${notes || ''}]`.trim(),
            schedule: updatedSchedule,
          };
        }
        return l;
      })
    );
    addAuditLog('LOAN_EARLY_SETTLED', 'HR & Payroll', `Early settled loan ${id}`);
  };

  const addOvertimeRecord = (ot: Omit<OvertimeRecord, 'id' | 'status'>): string => {
    const id = `ot-${Date.now().toString().slice(-6)}`;
    const newOt: OvertimeRecord = { ...ot, id, status: 'Pending' };
    setOvertimeRecords((prev) => [newOt, ...prev]);
    addAuditLog('OVERTIME_LOGGED', 'HR & Payroll', `Overtime logged for ${ot.employeeName}: ${ot.hours} hrs @ ৳${ot.ratePerHourBDT}/hr`);
    return id;
  };

  const approveOvertimeRecord = (id: string, approvedBy: string) => {
    setOvertimeRecords((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'Approved', approvedBy } : o))
    );
    addAuditLog('OVERTIME_APPROVED', 'HR & Payroll', `Approved overtime ${id} by ${approvedBy}`);
  };

  const rejectOvertimeRecord = (id: string, reason: string) => {
    setOvertimeRecords((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'Rejected' } : o))
    );
    addAuditLog('OVERTIME_REJECTED', 'HR & Payroll', `Rejected overtime ${id}`);
  };

  const addBonusRecord = (bonus: Omit<BonusRecord, 'id' | 'status'>): string => {
    const id = `bns-${Date.now().toString().slice(-6)}`;
    const newBonus: BonusRecord = { ...bonus, id, status: 'Pending' };
    setBonusRecords((prev) => [newBonus, ...prev]);
    addAuditLog('BONUS_LOGGED', 'HR & Payroll', `Added ${bonus.bonusType} for ${bonus.employeeName}: ৳${bonus.amountBDT.toLocaleString()}`);
    return id;
  };

  const approveBonusRecord = (id: string, approvedBy: string) => {
    setBonusRecords((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'Approved', approvedBy } : b))
    );
    addAuditLog('BONUS_APPROVED', 'HR & Payroll', `Approved bonus ${id} by ${approvedBy}`);
  };

  const generateMonthlySalaryRun = (monthYear: string, department?: string, employeeCategory?: EmployeeCategory): string => {
    const [year, month] = monthYear.split('-').map(Number);
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    const workingDaysStandard = payrollSettings.standardWorkingDaysPerMonth || 26;

    // Filter target active employees
    let eligibleStaff = fieldForceReps.filter((r) => r.isActive !== false);
    if (department && department !== 'All') {
      eligibleStaff = eligibleStaff.filter((r) => r.department === department);
    }
    if (employeeCategory && (employeeCategory as any) !== 'All') {
      eligibleStaff = eligibleStaff.filter((r) => r.employeeCategory === employeeCategory);
    }

    const runId = `run-${monthYear}-${Date.now().toString().slice(-4)}`;

    const items: MonthlySalarySheetItem[] = eligibleStaff.map((emp) => {
      // 1. Get or synthesize salary structure
      const str = salaryStructures.find((s) => s.employeeId === emp.id);
      const basic = str ? str.basicSalaryBDT : emp.basicSalaryBDT || 30000;
      const houseRent = str ? str.houseRentBDT : basic * 0.5;
      const medical = str ? str.medicalAllowanceBDT : basic * 0.1;
      const conveyance = str ? str.conveyanceAllowanceBDT : emp.conveyanceBDT || 0;
      const mobile = str ? str.mobileAllowanceBDT : emp.mobileAllowanceBDT || 0;
      const special = str ? str.specialAllowanceBDT : 0;
      const otherAllow = str ? str.otherAllowancesBDT : 0;
      const grossBase = basic + houseRent + medical + conveyance + mobile + special + otherAllow;

      // 2. Attendance summary
      const att = getEmployeeAttendanceSummary(emp.id, monthYear);
      const daysWorked = att.presentDays > 0 ? att.presentDays : workingDaysStandard;
      const daysAbsent = att.absentDays;

      // Unexcused absence deduction: (Basic / 30) * absentDays
      const perDayRate = Math.round(basic / totalDaysInMonth);
      const attendanceDeduction = daysAbsent > 0 ? perDayRate * daysAbsent : 0;

      // 3. Overtime
      const empOvertimes = overtimeRecords.filter(
        (o) => o.employeeId === emp.id && o.monthYear === monthYear && o.status === 'Approved'
      );
      const otHours = empOvertimes.reduce((s, o) => s + o.hours, 0);
      const otAmount = empOvertimes.reduce((s, o) => s + o.totalAmountBDT, 0);

      // 4. Bonuses & Incentives
      const empBonuses = bonusRecords.filter(
        (b) => b.employeeId === emp.id && b.monthYear === monthYear && b.status === 'Approved'
      );
      const bonusAmount = empBonuses.reduce((s, b) => s + b.amountBDT, 0);

      // Sales commission incentive tied to sales achievement if field force
      let performanceIncentive = 0;
      if (emp.monthlyTargetBDT && emp.monthlyTargetBDT > 0 && emp.monthlyAchievedBDT) {
        const achPct = (emp.monthlyAchievedBDT / emp.monthlyTargetBDT) * 100;
        if (achPct >= 100) performanceIncentive = Math.round(basic * 0.35);
        else if (achPct >= 80) performanceIncentive = Math.round(basic * 0.2);
      }

      // 5. Active Loans / Advance deduction scheduled for this month
      const activeLoans = advanceLoans.filter(
        (l) => l.employeeId === emp.id && (l.status === 'Approved' || l.status === 'Active') && (l.remainingAmountBDT || l.remainingBalanceBDT || 0) > 0
      );
      let loanDeduction = 0;
      activeLoans.forEach((l) => {
        const sched = l.schedule.find((s) => s.monthYear === monthYear && (s.status === 'Scheduled' || s.status === 'Pending'));
        if (sched) {
          loanDeduction += (sched.amountBDT || sched.installmentAmountBDT || 0);
        } else {
          // If no explicit monthly schedule matches, deduct default installment capped at remaining
          const monDed = l.monthlyDeductionBDT || l.monthlyInstallmentBDT || 0;
          const rem = l.remainingAmountBDT || l.remainingBalanceBDT || 0;
          loanDeduction += Math.min(monDed, rem);
        }
      });

      // 6. Tax & PF
      const totalEarningsGross = grossBase + otAmount + bonusAmount + performanceIncentive;
      let taxDeduction = 0;
      if (payrollSettings?.deductionRules?.incomeTaxEnabled && totalEarningsGross > 40000) {
        taxDeduction = Math.round(totalEarningsGross * 0.05);
      }
      let pfDeduction = 0;
      if (payrollSettings?.deductionRules?.providentFundEnabled) {
        pfDeduction = Math.round((basic * (payrollSettings?.deductionRules?.pfEmployeeContributionPercent || 10)) / 100);
      }

      const totalDeductions = attendanceDeduction + loanDeduction + taxDeduction + pfDeduction;
      const netSalary = Math.max(0, totalEarningsGross - totalDeductions);

      return {
        id: `item-${monthYear}-${emp.id}`,
        payrollRunId: runId,
        fieldForceId: emp.id,
        employeeId: emp.id,
        employeeCode: emp.code,
        employeeName: emp.name,
        department: emp.department || 'Operations',
        designation: emp.designation,
        employeeCategory: (emp.employeeCategory || 'Office Employee') as EmployeeCategory,
        monthYear,
        bankAccountNo: emp.bankAccountNumber,
        bankName: emp.bankName,
        totalWorkingDays: totalDaysInMonth,
        presentDays: daysWorked,
        absentDays: daysAbsent,
        leaveDays: att.leaveDays,
        holidays: att.holidays,
        basicSalaryBDT: basic,
        houseRentBDT: houseRent,
        medicalAllowanceBDT: medical,
        conveyanceAllowanceBDT: conveyance,
        mobileAllowanceBDT: mobile,
        specialAllowanceBDT: special,
        otherAllowancesBDT: otherAllow,
        grossSalaryBDT: grossBase,
        overtimeHours: otHours,
        overtimeAmountBDT: otAmount,
        festivalBonusBDT: empBonuses.filter((b) => b.bonusType === 'Festival Bonus').reduce((s, b) => s + b.amountBDT, 0),
        performanceBonusBDT:
          empBonuses.filter((b) => b.bonusType === 'Performance Bonus').reduce((s, b) => s + b.amountBDT, 0) +
          performanceIncentive,
        salesIncentiveBDT: empBonuses.filter((b) => b.bonusType === 'Sales Incentive').reduce((s, b) => s + b.amountBDT, 0),
        totalGrossEarningsBDT: totalEarningsGross,
        attendanceDeductionBDT: attendanceDeduction,
        advanceLoanDeductionBDT: loanDeduction,
        providentFundDeductionBDT: pfDeduction,
        taxDeductionBDT: taxDeduction,
        otherDeductionsBDT: 0,
        totalDeductionsBDT: totalDeductions,
        netSalaryBDT: netSalary,
        paymentStatus: 'Unpaid',
      };
    });

    const newRun: MonthlyPayrollRun = {
      id: runId,
      monthYear,
      status: 'Draft',
      processedAt: new Date().toISOString(),
      processedBy: currentUser?.name || 'HR Executive',
      totalEmployees: items.length,
      totalGrossBDT: items.reduce((s, i) => s + (i.totalGrossEarningsBDT || 0), 0),
      totalNetBDT: items.reduce((s, i) => s + (i.netSalaryBDT || 0), 0),
      totalDeductionsBDT: items.reduce((s, i) => s + (i.totalDeductionsBDT || 0), 0),
      totalOvertimeBDT: items.reduce((s, i) => s + (i.overtimeAmountBDT || 0), 0),
      totalBonusBDT: items.reduce((s, i) => s + ((i.festivalBonusBDT || 0) + (i.performanceBonusBDT || 0) + (i.salesIncentiveBDT || 0)), 0),
      totalLoanDeductionsBDT: items.reduce((s, i) => s + (i.advanceLoanDeductionBDT || 0), 0),
      totalPFDeductionsBDT: items.reduce((s, i) => s + (i.providentFundDeductionBDT || 0), 0),
      totalTaxDeductionsBDT: items.reduce((s, i) => s + (i.taxDeductionBDT || 0), 0),
      items,
    };

    setMonthlyPayrollRuns((prev) => [newRun, ...prev.filter((r) => r.monthYear !== monthYear)]);
    addAuditLog(
      'PAYROLL_GENERATED',
      'HR & Payroll',
      `Processed monthly salary calculations for ${monthYear} (${items.length} employees) - Gross: ৳${newRun.totalGrossBDT.toLocaleString()}, Net: ৳${newRun.totalNetBDT.toLocaleString()}`
    );
    return runId;
  };

  const finalizeMonthlyPayrollRun = (runId: string, finalizedBy: string) => {
    let targetRun: MonthlyPayrollRun | undefined;

    setMonthlyPayrollRuns((prev) =>
      prev.map((r) => {
        if (r.id === runId) {
          targetRun = {
            ...r,
            status: 'Finalized',
            finalizedAt: new Date().toISOString(),
            finalizedBy,
          };
          return targetRun;
        }
        return r;
      })
    );

    if (targetRun) {
      const run = targetRun;

      // Update loans installments that were deducted in this run
      run.items.forEach((item) => {
        if (item.advanceLoanDeductionBDT > 0) {
          setAdvanceLoans((loans) =>
            loans.map((loan) => {
              if (
                loan.employeeId === item.employeeId &&
                (loan.status === 'Approved' || loan.status === 'Active') &&
                loan.remainingAmountBDT > 0
              ) {
                const schedIndex = loan.schedule.findIndex(
                  (s) => s.monthYear === run.monthYear && s.status === 'Scheduled'
                );
                const deductedAmt = schedIndex !== -1 ? loan.schedule[schedIndex].amountBDT : item.advanceLoanDeductionBDT;
                const newRepaid = loan.repaidAmountBDT + deductedAmt;
                const newRemaining = Math.max(0, loan.principalAmountBDT - newRepaid);

                const newSched = loan.schedule.map((s, idx) =>
                  idx === schedIndex || (schedIndex === -1 && idx === 0 && s.status === 'Scheduled')
                    ? {
                        ...s,
                        status: 'Deducted' as const,
                        deductedInPayrollId: runId,
                        paidDate: new Date().toISOString().slice(0, 10),
                      }
                    : s
                );

                return {
                  ...loan,
                  repaidAmountBDT: newRepaid,
                  remainingAmountBDT: newRemaining,
                  status: newRemaining === 0 ? ('Closed' as const) : ('Active' as const),
                  schedule: newSched,
                };
              }
              return loan;
            })
          );
        }
      });

      // Post double-entry journal entry record in audit logs
      addAuditLog(
        'PAYROLL_FINALIZED',
        'Finance & Accounts',
        `Finalized Payroll for ${run.monthYear} by ${finalizedBy}. Double-Entry Journal: Dr. Salaries Expense ৳${run.totalGrossBDT.toLocaleString()} | Cr. Salaries Payable ৳${run.totalNetBDT.toLocaleString()} | Cr. Loan Deductions ৳${run.totalLoanDeductionsBDT.toLocaleString()} | Cr. Tax/PF Withholding ৳${(run.totalTaxDeductionsBDT + run.totalPFDeductionsBDT).toLocaleString()}`
      );
    }
  };

  const deleteMonthlyPayrollRun = (runId: string) => {
    setMonthlyPayrollRuns((prev) => prev.filter((r) => r.id !== runId));
    addAuditLog('PAYROLL_DELETED', 'HR & Payroll', `Deleted payroll run ID ${runId}`);
  };

  const recordSalaryPayment = (
    runId: string,
    employeeId: string,
    paymentDetails: {
      paymentDate: string;
      paymentMethod: 'Bank Transfer' | 'Cash' | 'bKash' | 'Nagad';
      bankAccountName?: string;
      transactionReference?: string;
      amountBDT: number;
      disbursedBy: string;
      notes?: string;
    }
  ) => {
    let paidItem: MonthlySalarySheetItem | undefined;
    let targetMonth = '';

    setMonthlyPayrollRuns((prev) =>
      prev.map((r) => {
        if (r.id === runId) {
          targetMonth = r.monthYear;
          const updatedItems = r.items.map((it) => {
            if (it.employeeId === employeeId) {
              paidItem = {
                ...it,
                paymentStatus: 'Paid' as const,
                paymentMethod: paymentDetails.paymentMethod,
                paymentDate: paymentDetails.paymentDate,
                transactionRef: paymentDetails.transactionReference,
              };
              return paidItem;
            }
            return it;
          });

          const allPaid = updatedItems.every((i) => i.paymentStatus === 'Paid');
          return {
            ...r,
            status: allPaid ? ('Paid' as const) : r.status,
            items: updatedItems,
          };
        }
        return r;
      })
    );

    if (paidItem) {
      const it = paidItem;
      const paymentRecord: SalaryPaymentRecord = {
        id: `pmt-${Date.now().toString().slice(-6)}`,
        payrollRunId: runId,
        monthYear: targetMonth,
        employeeId: it.employeeId,
        employeeCode: it.employeeCode,
        employeeName: it.employeeName,
        paymentDate: paymentDetails.paymentDate,
        amountBDT: paymentDetails.amountBDT,
        paymentMethod: paymentDetails.paymentMethod,
        bankAccountName: paymentDetails.bankAccountName || (paymentDetails.paymentMethod === 'Cash' ? 'Cash in Hand' : 'City Bank PLC'),
        transactionReference: paymentDetails.transactionReference || `SAL-${targetMonth}-${it.employeeCode}`,
        disbursedBy: paymentDetails.disbursedBy,
        remarks: paymentDetails.notes,
        status: 'Completed',
      };
      setSalaryPaymentRecords((prev) => [paymentRecord, ...prev]);

      // Deduct from Cash Book
      const lastCash = cashBook[cashBook.length - 1];
      const prevBal = lastCash ? lastCash.runningBalanceBDT : 10000000;
      const cashEntry: CashBookEntry = {
        id: `cb-${Date.now()}`,
        date: paymentDetails.paymentDate,
        voucherNo: `CB-SAL-${Date.now().toString().slice(-4)}`,
        accountType: (paymentDetails.paymentMethod === 'Cash' ? 'Cash in Hand' : 'City Bank PLC') as any,
        transactionCategory: 'Salary Payment',
        description: `Disbursed Salary for ${it.employeeName} (${it.employeeCode}) - Month: ${targetMonth} (${paymentDetails.paymentMethod})`,
        reference: paymentRecord.transactionReference,
        cashInBDT: 0,
        cashOutBDT: paymentDetails.amountBDT,
        runningBalanceBDT: prevBal - paymentDetails.amountBDT,
      };
      setCashBook((cb) => [...cb, cashEntry]);

      addAuditLog(
        'SALARY_DISBURSED',
        'HR & Payroll',
        `Disbursed net salary ৳${paymentDetails.amountBDT.toLocaleString()} to ${it.employeeName} via ${paymentDetails.paymentMethod}`
      );
    }
  };

  const updatePayrollSettings = (newSettings: Partial<PayrollSettings>) => {
    setPayrollSettings((prev) => {
      const baseOvertime = prev?.overtimeConfig || DEFAULT_PAYROLL_SETTINGS.overtimeConfig || { hourlyRateMultiplier: 1.5 };
      const baseLeave = prev?.leaveQuotas || DEFAULT_PAYROLL_SETTINGS.leaveQuotas || { annualLeave: 14, casualLeave: 10, sickLeave: 14, maternityLeave: 112 };
      return {
        ...prev,
        ...newSettings,
        overtimeConfig: {
          hourlyRateMultiplier: newSettings.overtimeConfig?.hourlyRateMultiplier ?? baseOvertime.hourlyRateMultiplier,
        },
        leaveQuotas: {
          annualLeave: newSettings.leaveQuotas?.annualLeave ?? baseLeave.annualLeave,
          casualLeave: newSettings.leaveQuotas?.casualLeave ?? baseLeave.casualLeave,
          sickLeave: newSettings.leaveQuotas?.sickLeave ?? baseLeave.sickLeave,
          maternityLeave: newSettings.leaveQuotas?.maternityLeave ?? baseLeave.maternityLeave,
        },
        deductionRules: {
          ...(prev?.deductionRules || DEFAULT_PAYROLL_SETTINGS.deductionRules || {}),
          ...(newSettings.deductionRules || {}),
        },
        salaryComponents: {
          ...(prev?.salaryComponents || DEFAULT_PAYROLL_SETTINGS.salaryComponents || {}),
          ...(newSettings.salaryComponents || {}),
        },
      };
    });
    addAuditLog('PAYROLL_SETTINGS_UPDATED', 'HR & Payroll', 'Updated corporate payroll configuration & rules');
  };

  return (
    <ERPContext.Provider
      value={{
        theme,
        toggleTheme,
        currentUser,
        setCurrentUser,
        isAuthenticated,
        login,
        logout,
        users,
        addUser,
        updateUser,
        updateUserPassword,
        updateUserPermissions,
        deleteUser,
        refreshUsers,
        clearUsersLocalData,
        syncAllUsersToSupabase,
        currentUserHasPermission,
        currentUserHasFeature,
        orgHierarchy,
        setOrgHierarchy,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        rawMaterials,
        addRawMaterial,
        bulkAddRawMaterials,
        updateRawMaterial,
        deleteRawMaterial,
        refreshRawMaterials,
        rawMaterialCategories,
        addRawMaterialCategory,
        updateRawMaterialCategory,
        deleteRawMaterialCategory,
        toggleRawMaterialCategoryStatus,
        refreshRawMaterialCategories,
        rawMaterialClassifications,
        addRawMaterialClassification,
        updateRawMaterialClassification,
        deleteRawMaterialClassification,
        toggleRawMaterialClassificationStatus,
        refreshRawMaterialClassifications,
        importOrders,
        addImportOrder,
        updateImportOrderStatus,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        refreshProducts,
        syncAllProductsToSupabase,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        refreshProductCategories,
        syncAllCategoriesToSupabase,
        brands,
        addBrand,
        updateBrand,
        deleteBrand,
        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        banks,
        addBank,
        updateBank,
        deleteBank,
        uoms,
        addUOM,
        updateUOM,
        deleteUOM,
        productionOrders,
        refreshProductionOrders,
        createProductionOrder,
        completeProductionOrder,
        updateProductBOM,
        // Ensec v29 Upgraded Modules
        inventoryBatches,
        inventoryMovements,
        rawMaterialReceipts,
        materialIssues,
        productionConsumptions,
        boms,
        productionCosts,
        finishedGoodsProductionReceipts,
        addRawMaterialReceipt,
        issueMaterialsForProduction,
        calculateProductionCost,
        saveProductionCost,
        receiveFinishedGoodsFromProduction,
        updateBOMDefinition,
        refreshBOMs,
        getFifoBatchesForMaterial,
        findBatchByBarcode,
        formatCurrency,

        // Manufacturing Expense Management & Cost Allocation Engine
        expenseEntries,
        costAllocations,
        addExpenseEntry,
        updateExpenseEntry,
        approveExpenseEntry,
        deleteExpenseEntry,
        allocateExpenseToBatch,
        deleteCostAllocation,
        getProductionCostBreakdown,
        getManufacturingCostKPIs,

        optimumStatement,
        addOptimumSettlementPayment,
        warehouses,
        addWarehouse,
        updateWarehouse,
        deleteWarehouse,
        toggleWarehouseStatus,
        refreshWarehouses,
        syncAllWarehousesToSupabase,
        stockTransfers,
        stockLedger,
        createStockTransfer,
        approveStockTransfer,
        receiveStockTransfer,
        refreshStockTransfers,
        adjustStock,
        cidStockReceipts,
        addCIDStockReceipt,
        updateCIDStockReceiptStatus,
        deleteCIDStockReceipt,
        refreshCIDStockReceipts,
        openingStockRecords,
        addOpeningStockRecord,
        bulkAddOpeningStockRecords,
        stockIssueRecords,
        addStockIssueRecord,
        primaryReturnRecords,
        addPrimaryReturnRecord,
        stockAdjustmentRecords,
        addStockAdjustmentRecord,
        distributors,
        updateDistributorCreditLimit,
        updateDistributor,
        addDistributor,
        deleteDistributor,
        refreshDistributors,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        refreshCustomers,
        customerCategories,
        addCustomerCategory,
        updateCustomerCategory,
        deleteCustomerCategory,
        setProductCategoryPrice,
        removeProductCategoryPrice,
        updateCustomerPricingTier,
        setCustomerCustomProductPrice,
        removeCustomerCustomProductPrice,
        updateProductChannelPricing,
        crmAgreements,
        addCRMLead,
        bulkAddCRMLeads,
        addCRMCommunicationNote,
        updateCRMDealStage,
        deleteCRMDeal,
        refreshCRMAgreements,
        clearCRMAgreementsCache,
        syncAllCRMLeadsToSupabase,
        fieldForceReps,
        addFieldForceRep,
        updateFieldForceRep,
        deleteFieldForceRep,
        visitLogs,
        logCustomerVisit,
        updateRepLocation,
        offers,
        addOffer,
        updateOffer,
        deleteOffer,
        toggleOfferStatus,
        salesOrders,
        clearSalesOrders,
        refreshSalesOrders,
        createSalesOrder,
        updateSalesOrder,
        approveSalesOrder,
        acceptDeliveryOrder,
        generateChallanWithSerials,
        dispatchAndInvoiceSalesOrder,
        confirmCustomerReceipt,
        recordOrderPayment,
        requisitions,
        addRequisition,
        updateRequisition,
        deleteRequisition,
        approveRequisitionByFactory,
        rejectRequisitionByFactory,
        issueRequisitionByAccounts,
        markRequisitionReceived,
        payments,
        addPayment,
        updatePayment,
        approvePayment,
        rejectPayment,
        deletePayment,
        clearPaymentsCache,
        tadaList,
        addTADA,
        updateTADA,
        approveTADA,
        batchApproveTADA,
        rejectTADA,
        deleteTADA,
        updateFieldForceTADAApprover,
        cashBook,
        addCashBookEntry,
        payrollRecords,
        generateMonthlyPayroll,
        disbursePayroll,
        auditLogs,
        addAuditLog,
        showArchitectureModal,
        setShowArchitectureModal,
        // Warranty & Battery Service Module
        warrantyTickets,
        addWarrantyTicket,
        updateWarrantyTicket,
        deleteWarrantyTicket,
        batteryReceivings,
        addBatteryReceiving,
        technicalInspections,
        addTechnicalInspection,
        updateTechnicalInspection,
        serviceJobCards,
        addServiceJobCard,
        updateServiceJobCard,
        sparePartsConsumptions,
        addSparePartsConsumption,
        serviceEstimations,
        addServiceEstimation,
        updateServiceEstimation,
        serviceInvoices,
        addServiceInvoice,
        updateServiceInvoice,
        servicePayments,
        addServicePayment,
        qualityControlRecords,
        addQualityControlRecord,
        batteryDispatches,
        addBatteryDispatch,
        warrantyPolicies,
        addWarrantyPolicy,
        updateWarrantyPolicy,
        serviceSettings,
        updateServiceSettings,
        // Installment, Collection & SMS Engine
        installmentPlans,
        installmentSchedules,
        installmentPayments,
        collectionAssignments,
        collectionFollowUps,
        collectionEscalationRules,
        smsTemplates,
        smsAutomationRules,
        smsLogs,
        smsGatewaySettings,
        installmentNotifications,
        createInstallmentPlan,
        recordInstallmentPayment,
        recordEarlySettlement,
        addCollectionFollowUp,
        updateCollectionAssignment,
        createCollectionAssignment,
        updateSMSTemplate,
        toggleSMSAutomationRule,
        updateSMSGatewaySettings,
        testSMSGateway,
        runAutomationCheckNow,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteInstallmentPlan,
        clearInstallmentData,
        // Central Payroll Management
        salaryStructures,
        attendanceRecords,
        leaveRecords,
        advanceLoans,
        overtimeRecords,
        bonusRecords,
        monthlyPayrollRuns,
        salaryPaymentRecords,
        payrollSettings,
        addSalaryStructure,
        updateSalaryStructure,
        getEmployeeSalaryStructure,
        markAttendance,
        bulkMarkAttendance,
        getEmployeeAttendanceSummary,
        applyLeave,
        approveLeave,
        rejectLeave,
        getEmployeeLeaveBalance,
        applyAdvanceLoan,
        approveAdvanceLoan,
        recordLoanInstallmentDeduction,
        earlySettleAdvanceLoan,
        addOvertimeRecord,
        approveOvertimeRecord,
        rejectOvertimeRecord,
        addBonusRecord,
        approveBonusRecord,
        generateMonthlySalaryRun,
        finalizeMonthlyPayrollRun,
        deleteMonthlyPayrollRun,
        recordSalaryPayment,
        updatePayrollSettings,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
