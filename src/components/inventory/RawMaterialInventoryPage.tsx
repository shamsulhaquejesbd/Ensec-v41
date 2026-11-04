import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  Layers, Search, Filter, Barcode, Printer, ArrowDownRight, 
  ArrowUpRight, RefreshCw, Calendar, Warehouse, Building2, 
  TrendingUp, Download, Eye, FileText, CheckCircle2, AlertCircle
} from 'lucide-react';
import { BarcodeDisplay } from './BarcodeDisplay';
import { BatchBarcodeScannerModal } from './BatchBarcodeScannerModal';
import { InventoryBatch, InventoryMovement } from '../../types/erp';

export const RawMaterialInventoryPage: React.FC = () => {
  const { 
    inventoryBatches, 
    inventoryMovements, 
    rawMaterials, 
    suppliers, 
    warehouses,
    formatCurrency 
  } = useERP();

  const [activeTab, setActiveTab] = useState<'batches' | 'movements'>('batches');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Barcode & print modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedBatchForLabel, setSelectedBatchForLabel] = useState<InventoryBatch | null>(null);

  // Filtered Batches
  const filteredBatches = useMemo(() => {
    return inventoryBatches.filter(b => {
      // Search
      const searchMatch = !searchTerm || 
        b.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.batchBarcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

      // Material
      const materialMatch = selectedMaterial === 'all' || b.materialId === selectedMaterial || b.materialCode === selectedMaterial;

      // Supplier
      const supplierMatch = selectedSupplier === 'all' || b.supplierId === selectedSupplier || b.supplierName === selectedSupplier;

      // Warehouse
      const warehouseMatch = selectedWarehouse === 'all' || b.warehouseId === selectedWarehouse || b.warehouseName === selectedWarehouse;

      // Status
      const statusMatch = selectedStatus === 'all' || b.status === selectedStatus;

      // Date range
      const purchaseDate = new Date(b.purchaseDate).getTime();
      const startMatch = !startDate || purchaseDate >= new Date(startDate).getTime();
      const endMatch = !endDate || purchaseDate <= new Date(endDate + 'T23:59:59').getTime();

      return searchMatch && materialMatch && supplierMatch && warehouseMatch && statusMatch && startMatch && endMatch;
    });
  }, [inventoryBatches, searchTerm, selectedMaterial, selectedSupplier, selectedWarehouse, selectedStatus, startDate, endDate]);

  // Filtered Movements
  const filteredMovements = useMemo(() => {
    return inventoryMovements.filter(m => {
      const refNo = m.referenceNo || m.referenceNumber || '';
      const wName = m.warehouseName || m.targetWarehouseName || '';
      const searchMatch = !searchTerm || 
        m.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        refNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.notes && m.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const materialMatch = selectedMaterial === 'all' || m.materialId === selectedMaterial || m.materialCode === selectedMaterial;
      const warehouseMatch = selectedWarehouse === 'all' || m.warehouseId === selectedWarehouse || wName === selectedWarehouse;

      const movementDate = new Date(m.timestamp || m.date).getTime();
      const startMatch = !startDate || movementDate >= new Date(startDate).getTime();
      const endMatch = !endDate || movementDate <= new Date(endDate + 'T23:59:59').getTime();

      return searchMatch && materialMatch && warehouseMatch && startMatch && endMatch;
    });
  }, [inventoryMovements, searchTerm, selectedMaterial, selectedWarehouse, startDate, endDate]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalBatches = filteredBatches.length;
    const totalAvailableQty = filteredBatches.reduce((acc, b) => acc + b.availableQty, 0);
    const totalStockValue = filteredBatches.reduce((acc, b) => acc + (b.availableQty * b.unitPurchaseRate), 0);
    const lowStockBatches = filteredBatches.filter(b => b.availableQty > 0 && b.availableQty <= 50).length;
    const depletedBatches = filteredBatches.filter(b => b.availableQty <= 0).length;

    return {
      totalBatches,
      totalAvailableQty,
      totalStockValue,
      lowStockBatches,
      depletedBatches
    };
  }, [filteredBatches]);

  // Export to CSV
  const handleExportCSV = () => {
    if (activeTab === 'batches') {
      const headers = ['Material Code', 'Material Name', 'Batch Number', 'Supplier', 'Purchase Date', 'Purchase Rate', 'Received Qty', 'Issued Qty', 'Available Qty', 'Stock Value', 'Warehouse', 'Status'];
      const rows = filteredBatches.map(b => [
        `"${b.materialCode}"`,
        `"${b.materialName}"`,
        `"${b.batchNumber}"`,
        `"${b.supplierName}"`,
        `"${b.purchaseDate}"`,
        b.unitPurchaseRate,
        b.receivedQty,
        b.issuedQty,
        b.availableQty,
        (b.availableQty * b.unitPurchaseRate).toFixed(2),
        `"${b.warehouseName}"`,
        `"${b.status}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `raw_material_batch_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['Date', 'Type', 'Material Code', 'Material Name', 'Batch Number', 'Qty', 'Unit Cost', 'Total Cost', 'Reference', 'Warehouse', 'Performed By', 'Balance After'];
      const rows = filteredMovements.map(m => [
        `"${new Date(m.timestamp || m.date).toLocaleString()}"`,
        `"${m.movementType}"`,
        `"${m.materialCode}"`,
        `"${m.materialName}"`,
        `"${m.batchNumber}"`,
        m.quantity,
        m.unitCost || m.unitCostBDT || 0,
        (m.totalCost || m.totalValueBDT || 0).toFixed(2),
        `"${m.referenceNo || m.referenceNumber || ''}"`,
        `"${m.warehouseName || m.targetWarehouseName || 'Kushtia Warehouse'}"`,
        `"${m.performedBy}"`,
        m.balanceAfter
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `raw_material_inventory_movements_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrintTable = () => {
    window.print();
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Raw Material Inventory</h1>
              <p className="text-sm text-slate-400">
                Batch-wise real-time stock valuation, FIFO tracking, and complete inventory movement history
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            <Barcode className="w-4 h-4" />
            Scan Barcode / Batch
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handlePrintTable}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Batches</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {metrics.totalBatches}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {metrics.depletedBatches} fully consumed batches
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Available Stock Qty</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {metrics.totalAvailableQty.toLocaleString()}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ready for production issue
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Valuation</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <span className="font-bold text-xs">BDT</span>
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {formatCurrency(metrics.totalStockValue)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Batch actual purchase rates
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Movement Records</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {inventoryMovements.length}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete audit trail logged
          </p>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('batches')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                activeTab === 'batches'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Batch-wise Stock ({filteredBatches.length})
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                activeTab === 'movements'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Movement History ({filteredMovements.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search code, name, batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Material
            </label>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Raw Materials</option>
              {rawMaterials.map((rm, rmIdx) => (
                <option key={`${rm.id}-${rmIdx}`} value={rm.id}>{rm.code} - {rm.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Supplier
            </label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Suppliers</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Warehouse
            </label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Warehouses</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content Table */}
      {activeTab === 'batches' ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase text-xs font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3.5">Material</th>
                  <th className="px-4 py-3.5">Batch Details</th>
                  <th className="px-4 py-3.5">Supplier & Date</th>
                  <th className="px-4 py-3.5 text-right">Purchase Rate</th>
                  <th className="px-4 py-3.5 text-right">Received</th>
                  <th className="px-4 py-3.5 text-right">Issued</th>
                  <th className="px-4 py-3.5 text-right">Available</th>
                  <th className="px-4 py-3.5 text-right">Stock Value</th>
                  <th className="px-4 py-3.5">Warehouse</th>
                  <th className="px-4 py-3.5 text-center">Barcode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                      No raw material inventory batches found matching the filters.
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map(batch => {
                    const isDepleted = batch.availableQty <= 0;
                    const stockValue = batch.availableQty * batch.unitPurchaseRate;

                    return (
                      <tr 
                        key={batch.id} 
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition ${
                          isDepleted ? 'opacity-60 bg-slate-50/30 dark:bg-slate-900/30' : ''
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {batch.materialName}
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                            {batch.materialCode}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded inline-block">
                            {batch.batchNumber}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {batch.batchBarcode}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                            {batch.supplierName}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {batch.purchaseDate}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-right font-mono font-medium text-slate-900 dark:text-white">
                          {formatCurrency(batch.unitPurchaseRate)}
                        </td>

                        <td className="px-4 py-3.5 text-right font-mono text-slate-600 dark:text-slate-300">
                          {batch.receivedQty.toLocaleString()} {batch.unit}
                        </td>

                        <td className="px-4 py-3.5 text-right font-mono text-amber-600 dark:text-amber-400">
                          {batch.issuedQty.toLocaleString()} {batch.unit}
                        </td>

                        <td className="px-4 py-3.5 text-right font-mono font-bold">
                          <span className={
                            isDepleted 
                              ? 'text-slate-400' 
                              : batch.availableQty <= 50 
                                ? 'text-amber-600 dark:text-amber-400' 
                                : 'text-emerald-600 dark:text-emerald-400'
                          }>
                            {batch.availableQty.toLocaleString()} {batch.unit}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(stockValue)}
                        </td>

                        <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                          <span className="flex items-center gap-1">
                            <Warehouse className="w-3.5 h-3.5 text-slate-400" />
                            {batch.warehouseName}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => setSelectedBatchForLabel(batch)}
                            title="Print Batch Barcode Sticker"
                            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition cursor-pointer"
                          >
                            <Barcode className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase text-xs font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Movement Type</th>
                  <th className="px-4 py-3.5">Material & Batch</th>
                  <th className="px-4 py-3.5 text-right">Quantity</th>
                  <th className="px-4 py-3.5 text-right">Unit Cost</th>
                  <th className="px-4 py-3.5 text-right">Total Cost</th>
                  <th className="px-4 py-3.5">Reference No</th>
                  <th className="px-4 py-3.5">Warehouse</th>
                  <th className="px-4 py-3.5">Performed By</th>
                  <th className="px-4 py-3.5 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                      No inventory movements found.
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map(m => {
                    const isInward = m.movementType === 'RECEIPT';
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition">
                        <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(m.timestamp || m.date).toLocaleString()}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isInward
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : m.movementType === 'ISSUE'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            {isInward ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            {m.movementType}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-900 dark:text-white text-xs">
                            {m.materialName} ({m.materialCode})
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            Batch: {m.batchNumber}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-right font-mono font-semibold">
                          <span className={isInward ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                            {isInward ? '+' : '-'}{m.quantity}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right font-mono text-xs text-slate-700 dark:text-slate-300">
                          {formatCurrency(m.unitCost || m.unitCostBDT || 0)}
                        </td>

                        <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(m.totalCost || m.totalValueBDT || 0)}
                        </td>

                        <td className="px-4 py-3.5 text-xs font-mono text-blue-600 dark:text-blue-400">
                          {m.referenceNo || m.referenceNumber || ''}
                        </td>

                        <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                          {m.warehouseName || m.targetWarehouseName || 'Kushtia Warehouse'}
                        </td>

                        <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                          {m.performedBy}
                        </td>

                        <td className="px-4 py-3.5 text-right font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                          {m.balanceAfter}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BatchBarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectBatch={(batch) => {
          setSelectedBatchForLabel(batch);
        }}
      />

      {/* Barcode Sticker Print Modal */}
      {selectedBatchForLabel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Barcode className="w-5 h-5 text-indigo-500" />
                Batch Barcode Label
              </h3>
              <button
                onClick={() => setSelectedBatchForLabel(null)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                &times;
              </button>
            </div>

            <BarcodeDisplay
              batch={selectedBatchForLabel}
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedBatchForLabel(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
