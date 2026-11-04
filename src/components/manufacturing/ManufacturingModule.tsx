import React, { useState } from 'react';
import {
  Cpu,
  PlusCircle,
  Layers,
  Wrench,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  FileSpreadsheet,
  Building,
  ArrowRight,
  ShieldAlert,
  Truck,
  FileText,
  Printer,
  Eye,
  Check,
  Upload,
  Download,
} from 'lucide-react';
import { DeliveryOrderModal } from '../sales/DeliveryOrderModal.tsx';
import { ChallanModal } from '../sales/ChallanModal.tsx';
import { SalesOrder } from '../../types/erp.ts';
import { useERP } from '../../context/ERPContext.tsx';
import { Product, ProductionOrder, BOMItem, ProductionCostRecord } from '../../types/erp.ts';
import { MaterialIssueModal } from './MaterialIssueModal.tsx';
import { ProductionCostSheetModal } from './ProductionCostSheetModal.tsx';
import { BOMManagementModal } from './BOMManagementModal.tsx';
import { BOMExportModal } from './BOMExportModal.tsx';
import { PackageMinus, Calculator, BarChart3, Receipt, Sliders } from 'lucide-react';
import { ExpenseManagementTab } from './ExpenseManagementTab.tsx';
import { ProductionCostAllocationTab } from './ProductionCostAllocationTab.tsx';
import { ProductionCostDashboardTab } from './ProductionCostDashboardTab.tsx';
import { ExpenseEntry } from '../../types/costing.ts';

export type ManufacturingTab = 'orders' | 'cost-dashboard' | 'expenses' | 'allocations' | 'delivery-orders' | 'bom';

interface ManufacturingModuleProps {
  initialTab?: ManufacturingTab;
}

export const ManufacturingModule: React.FC<ManufacturingModuleProps> = ({ initialTab = 'orders' }) => {
  const {
    products,
    productionOrders,
    rawMaterials,
    boms,
    createProductionOrder,
    completeProductionOrder,
    updateProductBOM,
    salesOrders,
    dispatchAndInvoiceSalesOrder,
    updateSalesOrder,
    receiveFinishedGoodsFromProduction,
  } = useERP();

  const [selectedDOForFactory, setSelectedDOForFactory] = useState<SalesOrder | null>(null);
  const [selectedChallanForFactory, setSelectedChallanForFactory] = useState<SalesOrder | null>(null);
  const [orderToDispatchConfirm, setOrderToDispatchConfirm] = useState<SalesOrder | null>(null);

  const [activeTab, setActiveTab] = useState<ManufacturingTab>(initialTab);
  const [selectedExpenseForAllocation, setSelectedExpenseForAllocation] = useState<ExpenseEntry | null>(null);
  const approvedDOOrders = (salesOrders || []).filter(
    (so) => so.status === 'Approved' || so.status === 'Dispatched' || so.status === 'Dispatched & Invoiced' || so.status === 'Invoiced'
  );
  const [showNewBatchModal, setShowNewBatchModal] = useState(false);
  const [editingBOMProduct, setEditingBOMProduct] = useState<Product | null>(null);
  const [openUploadDirectly, setOpenUploadDirectly] = useState(false);
  const [selectedOrderForIssue, setSelectedOrderForIssue] = useState<ProductionOrder | null>(null);
  const [selectedOrderForCostSheet, setSelectedOrderForCostSheet] = useState<ProductionOrder | null>(null);
  const [exportBOMState, setExportBOMState] = useState<{
    isOpen: boolean;
    productId?: string;
    version?: string;
  }>({ isOpen: false });

  // New Production Order State
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [plannedQty, setPlannedQty] = useState(50);
  const [optimumLaborCostBDT, setOptimumLaborCostBDT] = useState(150000);
  const [factoryOverheadBDT, setFactoryOverheadBDT] = useState(90000);
  const [wastagePercent, setWastagePercent] = useState(0.5);
  const [scrapKg, setScrapKg] = useState(8.5);
  const [technicianInCharge, setTechnicianInCharge] = useState('Mustafizur Rahman (Optimum Plant Head)');
  const [batchNotes, setBatchNotes] = useState('Standard QA impedance check and cell matching active.');

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Raw material cost estimate based on BOM * plannedQty
  const rawMaterialCostBDT = selectedProduct
    ? selectedProduct.bom.reduce((sum, item) => sum + item.requiredQty * item.unitCostBDT, 0) * plannedQty
    : 0;

  const conversionCostBDT = Number(optimumLaborCostBDT) + Number(factoryOverheadBDT);
  const totalProductionCostBDT = rawMaterialCostBDT + conversionCostBDT;
  const costPerUnitBDT = Math.round(totalProductionCostBDT / (plannedQty || 1));

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    createProductionOrder({
      date: new Date().toISOString().substring(0, 10),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      model: selectedProduct.model,
      plannedQty: Number(plannedQty),
      manufacturingDate: new Date().toISOString().substring(0, 10),
      status: 'In Production',
      rawMaterialCostBDT,
      optimumLaborCostBDT: Number(optimumLaborCostBDT),
      factoryOverheadBDT: Number(factoryOverheadBDT),
      conversionCostBDT,
      totalProductionCostBDT,
      costPerUnitBDT,
      wastagePercent: Number(wastagePercent),
      scrapKg: Number(scrapKg),
      technicianInCharge,
      notes: batchNotes,
    });

    setShowNewBatchModal(false);
  };

  // BOM Editing State
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);

  const startEditBOM = (prod: Product) => {
    setEditingBOMProduct(prod);
    setBomItems([...prod.bom]);
  };

  const handleUpdateBOMItemQty = (materialId: string, newQty: number) => {
    setBomItems((prev) =>
      prev.map((item) => (item.materialId === materialId ? { ...item, requiredQty: newQty } : item))
    );
  };

  const handleSaveBOM = () => {
    if (!editingBOMProduct) return;
    updateProductBOM(editingBOMProduct.id, bomItems);
    setEditingBOMProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Manufacturing & Assembly Plant
            </h1>
            
          </div>
          
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs gap-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Batches & Orders</span>
            </button>
            <button
              onClick={() => setActiveTab('cost-dashboard')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'cost-dashboard'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Costing Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'expenses'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Expense Posting</span>
            </button>
            <button
              onClick={() => setActiveTab('allocations')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'allocations'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Cost Allocation</span>
            </button>
            <button
              onClick={() => setActiveTab('delivery-orders')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'delivery-orders'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>D.O. Queue ({approvedDOOrders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('bom')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'bom'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>BOM Master</span>
            </button>
          </div>

          <button
            onClick={() => setShowNewBatchModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Launch Batch</span>
          </button>
        </div>
      </div>

      {activeTab === 'delivery-orders' ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-base text-slate-900 dark:text-white">
                  Factory Delivery Orders (D.O.) &amp; Challan Handover Queue
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Authorized Delivery Orders (D.O.) and official Challan copies for factory production release, battery serial number stamping, and transport dispatch.
                </p>
              </div>
            </div>
            <div className="text-xs font-semibold text-slate-500">
              Approved D.O. &amp; Challans: <span className="text-emerald-600 font-bold text-sm">{approvedDOOrders.length}</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Factory Delivery Orders (D.O.) &amp; Transport Challans
              </h3>
              <span className="text-[11px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Both D.O. &amp; Challan Copies Available
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Challan &amp; D/O No.</th>
                    <th className="p-3.5">Buyer / Customer Details</th>
                    <th className="p-3.5">Ordered Battery Models</th>
                    <th className="p-3.5 text-center">Total Qty</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Factory Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {approvedDOOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400">
                        <Truck className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                        <p className="font-semibold text-sm">No approved Delivery Orders in queue.</p>
                        <p className="text-xs mt-1 text-slate-400">
                          When Accounts approves a sales order, the auto-generated Challan will appear here for factory dispatch.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    approvedDOOrders.map((so) => {
                      const suffix = (so.orderNumber || so.id).replace(/\D/g, "").slice(-2).padStart(2, "0") || "88";
                      const doNum = so.doNumber || `012/2026-${suffix}`;
                      const challanNum = so.challanNumber || `BD-ES-2026-12-${suffix}`;
                      const totalUnits = (so.items || []).reduce((sum, item) => sum + item.quantity, 0);
                      const isDispatched = so.status === 'Dispatched' || so.status === 'Dispatched & Invoiced' || so.status === 'Invoiced' || so.status === 'Delivered';

                      return (
                        <tr key={so.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-[13px]">
                                {challanNum}
                              </span>
                              <span className="text-[9px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-1.5 py-0.2 rounded">
                                Challan
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              D/O: {doNum} • PO Ref: {so.orderNumber}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {so.customerName}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {so.channel || "Direct Customer"}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="space-y-1 max-w-sm">
                              {so.items.map((it, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-2 text-[11px] bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">
                                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                    {it.productName}
                                  </span>
                                  <span className="font-mono font-bold text-slate-600 dark:text-slate-300 shrink-0">
                                    {String(it.quantity).padStart(2, "0")} Pcs
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>

                          <td className="p-3.5 text-center font-mono font-black text-slate-900 dark:text-white text-xs">
                            {String(totalUnits).padStart(2, "0")} PCS
                          </td>

                          <td className="p-3.5 text-center">
                            {isDispatched ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                                Dispatched from Plant
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Approved &amp; Verified
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* OFFICIAL FACTORY DELIVERY ORDER (D.O.) COPY */}
                              <button
                                type="button"
                                onClick={() => setSelectedDOForFactory(so)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs cursor-pointer border border-emerald-300 dark:border-emerald-800 transition-all shadow-xs"
                                title="View official Factory Delivery Order (D.O.) copy for production release authorization"
                              >
                                <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>D.O.</span>
                              </button>

                              {/* AUTO-GENERATED FACTORY CHALLAN */}
                              <button
                                type="button"
                                onClick={() => setSelectedChallanForFactory(so)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold text-xs cursor-pointer border border-blue-200 dark:border-blue-800 transition-all shadow-xs"
                                title="View auto-generated factory Challan (Matches uploaded sample format)"
                              >
                                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                <span>Challan</span>
                              </button>

                              {/* Factory Dispatch & Invoice */}
                              {!isDispatched && (
                                <button
                                  type="button"
                                  onClick={() => setOrderToDispatchConfirm(so)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all"
                                  title="Dispatch order from factory & generate invoice"
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>Dispatch &amp; Invoice</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'orders' ? (
        <div className="space-y-6">
          {/* Plant KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 uppercase">Active Kushtia Batches</div>
              <div className="text-lg font-black text-purple-600 dark:text-purple-400 mt-1">
                {productionOrders.filter((p) => p.status === 'In Production').length} Active
              </div>
              
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 uppercase">Completed Lithium Batteries</div>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {productionOrders.reduce((sum, p) => sum + p.completedQty, 0)} Units
              </div>
              
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 uppercase">Total Optimum Conversion Fees</div>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-1 font-mono">
                ৳ {productionOrders.reduce((sum, p) => sum + p.conversionCostBDT, 0).toLocaleString()}
              </div>
             
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 uppercase">Average Scrap / Wastage</div>
              <div className="text-lg font-black text-blue-600 dark:text-blue-400 mt-1">
                0.58%
              </div>
              
            </div>
          </div>

          {/* Batches Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                  Factory Production Orders & Batches
                </h2>
                
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Order & Batch No</th>
                    <th className="p-3">Product Model</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Raw Material Cost</th>
                    <th className="p-3">Optimum Conversion</th>
                    <th className="p-3">Unit Cost BDT</th>
                    <th className="p-3">Wastage / Scrap</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {productionOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3">
                        <div className="font-mono font-bold text-blue-600 dark:text-blue-400">{order.orderNumber}</div>
                        <div className="font-mono text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                          Batch: {order.batchNumber}
                        </div>
                        <div className="text-[10px] text-slate-400">{order.date}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{order.productName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">Model: {order.model}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {order.completedQty} / {order.plannedQty} Units
                        </div>
                        <div className="text-[10px] text-slate-400">In Kushtia Plant</div>
                      </td>
                      <td className="p-3 font-mono">৳ {order.rawMaterialCostBDT.toLocaleString()}</td>
                      <td className="p-3 font-mono text-purple-600 dark:text-purple-400">
                        ৳ {order.conversionCostBDT.toLocaleString()}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                        ৳ {order.costPerUnitBDT.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <div className="text-slate-700 dark:text-slate-300">{order.wastagePercent}% waste</div>
                        <div className="text-[10px] text-slate-400">{order.scrapKg} kg scrap</div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            order.status === 'Completed' || order.status === 'Transferred'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {order.status === 'In Production' && (
                            <button
                              type="button"
                              onClick={() => setSelectedOrderForIssue(order)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-semibold text-[11px] border border-amber-300 dark:border-amber-800 transition shadow-xs cursor-pointer"
                              title="Issue raw materials from available batches using FIFO or authorized override"
                            >
                              <PackageMinus className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>Issue Raw Materials</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedOrderForCostSheet(order)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold text-[11px] border border-indigo-200 dark:border-indigo-800 transition shadow-xs cursor-pointer"
                            title="Calculate production cost using actual batch rates and send to Finished Goods Receive"
                          >
                            <Calculator className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>Cost Sheet</span>
                          </button>

                          {order.status === 'In Production' && (
                            <button
                              type="button"
                              onClick={() => completeProductionOrder(order.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors shadow-xs cursor-pointer"
                              title="Complete assembly: Records finished goods, updates conversion ledger"
                            >
                              Complete
                            </button>
                          )}

                          {(order.status === 'Completed' || order.status === 'Transferred') && (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1 font-semibold ml-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Completed</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'cost-dashboard' ? (
        <ProductionCostDashboardTab
          onOpenCostSheet={(orderId) => {
            const found = productionOrders.find((o) => o.id === orderId);
            if (found) setSelectedOrderForCostSheet(found);
          }}
          onNavigate={(tab) => {
            if (tab === 'expenses') setActiveTab('expenses');
            else if (tab === 'allocations') setActiveTab('allocations');
            else if (tab === 'orders') setActiveTab('orders');
          }}
        />
      ) : activeTab === 'expenses' ? (
        <ExpenseManagementTab
          onAllocateExpense={(entry) => {
            setSelectedExpenseForAllocation(entry);
            setActiveTab('allocations');
          }}
        />
      ) : activeTab === 'allocations' ? (
        <ProductionCostAllocationTab
          preselectedExpenseId={selectedExpenseForAllocation?.id}
          onOpenCostSheet={(batchNo) => {
            const found = productionOrders.find(
              (o) => o.batchNumber === batchNo || o.orderNumber === batchNo
            );
            if (found) setSelectedOrderForCostSheet(found);
          }}
        />
      ) : (
        /* Configurable Bill of Materials (BOM) View */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-500" />
                Finished Goods Bill of Materials (BOM) Master Directory
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select any battery model and click <strong>Configure BOM</strong> to inspect or edit the detailed component specifications, material batches, unit costs, and version history.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="text-xs text-slate-500 font-semibold hidden sm:block">
                Total Products: <span className="font-bold text-slate-900 dark:text-white">{products.length}</span>
              </div>
              <button
                type="button"
                onClick={() => setExportBOMState({ isOpen: true })}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white transition shadow-sm cursor-pointer"
                title="Export Bill of Materials (BOM) in CSV (Excel), printable PDF spec sheet, or JSON"
              >
                <Download className="w-4 h-4" />
                <span>Export BOM</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((prod) => {
              const bomDef = (boms || []).find(
                (b) =>
                  b.productId === prod.id ||
                  (prod.code && b.productCode === prod.code) ||
                  (prod.model && b.productModel === prod.model)
              );
              const activeItems = (bomDef?.items && bomDef.items.length > 0)
                ? bomDef.items
                : (prod.bom && prod.bom.length > 0)
                ? prod.bom
                : [];
              const totalBOMCost = activeItems.reduce(
                (sum, item) => sum + (Number(item.requiredQty) || 0) * (Number(item.unitCostBDT) || 0),
                0
              );
              const versionStr = bomDef?.version || '1.0';

              return (
                <div
                  key={prod.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                          {prod.code || 'FG-PROD'}
                        </span>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                          {prod.name}
                        </h3>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Model: <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">{prod.model}</span> • {prod.voltageV}V {prod.capacityAh}Ah ({prod.batteryType || 'LiFePO4'})
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                        activeItems.length > 0
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      }`}>
                        {activeItems.length > 0 ? `v${versionStr} Active` : 'No BOM'}
                      </span>
                    </div>

                    {/* Summary Statistics */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">Configured Components</div>
                        <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                          {activeItems.length} {activeItems.length === 1 ? 'Material' : 'Materials'}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">Est. Cost / Unit</div>
                        <div className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                          ৳ {totalBOMCost.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setExportBOMState({ isOpen: true, productId: prod.id, version: versionStr })}
                      className="p-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                      title={`Export BOM specification for ${prod.name}`}
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </button>
                    <button
                      onClick={() => {
                        setOpenUploadDirectly(true);
                        startEditBOM(prod);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
                      title="Upload raw materials to BOM"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload BOM</span>
                    </button>
                    <button
                      onClick={() => {
                        setOpenUploadDirectly(false);
                        startEditBOM(prod);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition shadow-xs cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Configure BOM</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Launch New Production Batch */}
      {showNewBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Schedule Factory Assembly Batch
                </h3>
              </div>
              <button
                onClick={() => setShowNewBatchModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Battery Model
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.model})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Planned Assembly Units
                    </label>
                    <input
                      type="number"
                      value={plannedQty}
                      onChange={(e) => setPlannedQty(Math.max(1, Number(e.target.value)))}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Optimum Assembly Labor Fee (BDT)
                    </label>
                    <input
                      type="number"
                      value={optimumLaborCostBDT}
                      onChange={(e) => setOptimumLaborCostBDT(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Kushtia Plant Overhead (BDT)
                    </label>
                    <input
                      type="number"
                      value={factoryOverheadBDT}
                      onChange={(e) => setFactoryOverheadBDT(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Expected Scrap / Wastage (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={wastagePercent}
                      onChange={(e) => setWastagePercent(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Quality Inspection & Batch Notes
                  </label>
                  <textarea
                    rows={2}
                    value={batchNotes}
                    onChange={(e) => setBatchNotes(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Cost Calculation Summary */}
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Total Raw Material Consumption Cost:</span>
                  <b>৳ {rawMaterialCostBDT.toLocaleString()}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Optimum Conversion & Overhead Fee:</span>
                  <b className="text-purple-600 dark:text-purple-400">৳ {conversionCostBDT.toLocaleString()}</b>
                </div>
                <div className="flex justify-between pt-1 border-t border-purple-200 dark:border-purple-700 text-sm">
                  <span className="font-bold">Total Batch Production Cost:</span>
                  <span className="font-black text-purple-700 dark:text-purple-300">
                    ৳ {totalProductionCostBDT.toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 pt-1">
                  Cost per finished battery: ৳ {costPerUnitBDT.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewBatchModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-xs"
                >
                  Confirm & Schedule Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit & Version BOM Master */}
      {editingBOMProduct && (
        <BOMManagementModal
          product={editingBOMProduct}
          initialOpenUpload={openUploadDirectly}
          onClose={() => {
            setEditingBOMProduct(null);
            setOpenUploadDirectly(false);
          }}
        />
      )}

      {/* Modal: Product and BOM Version-Wise Export */}
      {exportBOMState.isOpen && (
        <BOMExportModal
          initialProductId={exportBOMState.productId}
          initialVersion={exportBOMState.version}
          onClose={() => setExportBOMState({ isOpen: false })}
        />
      )}
      {selectedChallanForFactory && (
        <ChallanModal
          order={selectedChallanForFactory}
          onClose={() => setSelectedChallanForFactory(null)}
          onUpdateOrder={updateSalesOrder}
          onSwitchToDO={() => {
            const ord = selectedChallanForFactory;
            setSelectedChallanForFactory(null);
            setSelectedDOForFactory(ord);
          }}
          onDispatchAndInvoice={(orderId) => {
            dispatchAndInvoiceSalesOrder(orderId);
            setSelectedChallanForFactory(null);
          }}
        />
      )}

      {selectedDOForFactory && (
        <DeliveryOrderModal
          order={selectedDOForFactory}
          onClose={() => setSelectedDOForFactory(null)}
          onUpdateOrder={updateSalesOrder}
          onSwitchToChallan={() => {
            const ord = selectedDOForFactory;
            setSelectedDOForFactory(null);
            setSelectedChallanForFactory(ord);
          }}
        />
      )}

      {/* CONFIRMATION MODAL: FACTORY DISPATCH & INVOICE */}
      {orderToDispatchConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-800 dark:text-slate-100 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Confirm Factory Dispatch &amp; Invoice
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Are you sure you want to dispatch this order from the factory and post the commercial invoice?
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 space-y-2 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Number:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{orderToDispatchConfirm.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Buyer:</span>
                <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">{orderToDispatchConfirm.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Units:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {(orderToDispatchConfirm.items || []).reduce((sum, it) => sum + (it.quantity || 0), 0)} units
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Net Invoice Amount:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  BDT {orderToDispatchConfirm.netAmountBDT?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Factory Challan:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                  {orderToDispatchConfirm.challanNumber || 'Auto Pre-Generated'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <span>
                Confirming will deduct finished battery units from factory warehouse stock, issue the commercial invoice, and move the status to "Dispatched & Invoiced".
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDispatchConfirm(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = orderToDispatchConfirm;
                  setOrderToDispatchConfirm(null);
                  dispatchAndInvoiceSalesOrder(target.id);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white cursor-pointer shadow-sm transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Yes, Dispatch &amp; Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Material Issue with FIFO and Barcode Tracking */}
      {selectedOrderForIssue && (
        <MaterialIssueModal
          order={selectedOrderForIssue}
          onClose={() => setSelectedOrderForIssue(null)}
        />
      )}

      {/* Modal: Production Cost Sheet & Valuation Engine */}
      {selectedOrderForCostSheet && (
        <ProductionCostSheetModal
          order={selectedOrderForCostSheet}
          onClose={() => setSelectedOrderForCostSheet(null)}
          onReceiveFinishedGoods={(order, costRecord) => {
            receiveFinishedGoodsFromProduction({
              productionOrderId: order.id,
              productionOrderNumber: order.orderNumber,
              productId: order.productId,
              productName: order.productName,
              productModel: order.model,
              producedQty: order.plannedQty,
              acceptedQty: costRecord.goodFinishedQty,
              rejectedQty: costRecord.scrapUnits,
              totalProductionCost: costRecord.totalProductionCost,
              unitProductionCost: costRecord.unitProductionCost,
              productionBatchNumber: order.batchNumber,
              warehouseId: 'WH-KUSHTIA',
              warehouseName: 'Kushtia Assembly Plant',
              receivedBy: 'Plant QC & Stock Controller',
              notes: `Received from completed production order ${order.orderNumber}`
            });
          }}
        />
      )}
    </div>
  );
};

