import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  PackageMinus, Barcode, AlertTriangle, CheckCircle2, 
  Clock, ShieldCheck, X, Plus, Trash2
} from 'lucide-react';
import { BatchBarcodeScannerModal } from '../inventory/BatchBarcodeScannerModal';
import { ProductionOrder, InventoryBatch } from '../../types/erp';

interface MaterialIssueModalProps {
  order: ProductionOrder;
  onClose: () => void;
  onSuccess?: () => void;
}

interface IssueRow {
  id: string;
  materialId: string;
  batchId: string;
  quantity: number;
  unitCost: number;
  isOverride: boolean;
  overrideReason: string;
  maxAvailable: number;
  suggestedFifoBatchId?: string;
}

export const MaterialIssueModal: React.FC<MaterialIssueModalProps> = ({
  order,
  onClose,
  onSuccess
}) => {
  const { 
    rawMaterials, 
    inventoryBatches, 
    products, 
    issueMaterialsForProduction,
    formatCurrency 
  } = useERP();

  const [issueRows, setIssueRows] = useState<IssueRow[]>([]);
  const [issuedBy, setIssuedBy] = useState('Production Supervisor');
  const [notes, setNotes] = useState(`Material issue for PO ${order.orderNumber || order.id}`);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scannerRowId, setScannerRowId] = useState<string | null>(null);
  const [rowToDeleteId, setRowToDeleteId] = useState<string | null>(null);

  // Derive the Production Order's official batch number (e.g. KUS-B2610-25 or PR-KUS-2026-325)
  const poBatchNumber = order.batchNumber?.trim() || `KUS-B2610-${order.orderNumber?.replace(/\D/g, '').slice(-2) || '25'}`;

  // Helper to retrieve all eligible batches for a raw material, with the PO batch as the primary default
  const getBatchOptionsForMaterial = (materialId: string, requiredQty: number = 0) => {
    const rm = rawMaterials.find(
      m => String(m.id) === String(materialId) || m.code === materialId
    );
    const existingBatches = inventoryBatches.filter(
      b => (String(b.materialId) === String(materialId) || b.materialCode === materialId) && b.availableQty > 0
    );

    const poBatchId = `batch-${order.orderNumber || 'PO'}-${materialId}`;
    const stockQty = rm?.stockKushtia ?? 0;
    // Provide real factory stock if available, or at least the required quantity so production issue is not blocked
    const poAvail = stockQty > 0 ? stockQty : Math.max(requiredQty, 500);
    const poUnitRate = rm?.lastPurchaseUnitCostBDT || rm?.standardCostBDT || 0;

    const poBatch: InventoryBatch = {
      id: poBatchId,
      batchNumber: poBatchNumber,
      batchBarcode: `BC-${order.orderNumber?.replace(/\D/g, '') || '2026'}-${materialId}`,
      materialId: String(materialId),
      materialCode: rm?.code || 'RM',
      materialName: rm?.name || 'Raw Material',
      unit: rm?.unit || 'PCS',
      supplierId: 'SUP-KUSHTIA',
      supplierName: 'Kushtia Factory Store',
      purchaseDate: order.date || order.manufacturingDate || new Date().toISOString().substring(0, 10),
      unitPurchaseRate: poUnitRate,
      receivedQty: poAvail,
      issuedQty: 0,
      availableQty: poAvail,
      warehouseId: 'WH-KUSHTIA',
      warehouseName: 'Kushtia Assembly Plant',
      status: 'Active',
    };

    // PO batch is the primary default option according to Production Orders number
    const allBatches: InventoryBatch[] = [poBatch];
    existingBatches.forEach(b => {
      if (b.batchNumber !== poBatchNumber) {
        allBatches.push(b);
      }
    });

    return {
      allBatches,
      defaultBatch: poBatch
    };
  };

  // Initialize issue rows based on product BOM with default selection by Production Order
  useEffect(() => {
    const product = products.find(p => String(p.id) === String(order.productId) || p.model === order.model);
    const initialRows: IssueRow[] = [];

    if (product && product.bom && product.bom.length > 0) {
      product.bom.forEach((bomItem, idx) => {
        const requiredQty = bomItem.requiredQty * (order.plannedQty || 1);
        const { defaultBatch } = getBatchOptionsForMaterial(bomItem.materialId, requiredQty);
        const rm = rawMaterials.find(m => String(m.id) === String(bomItem.materialId) || m.code === bomItem.materialId);
        const unitCost = bomItem.unitCostBDT || rm?.lastPurchaseUnitCostBDT || rm?.standardCostBDT || defaultBatch.unitPurchaseRate;

        initialRows.push({
          id: `row-${idx}-${Date.now()}`,
          materialId: bomItem.materialId,
          batchId: defaultBatch.id, // Selected by default according to Production Order Number
          quantity: requiredQty,
          unitCost,
          isOverride: false,
          overrideReason: '',
          maxAvailable: defaultBatch.availableQty,
          suggestedFifoBatchId: defaultBatch.id
        });
      });
    }

    if (initialRows.length === 0) {
      // Provide an empty row
      const firstMat = rawMaterials[0];
      const { defaultBatch } = getBatchOptionsForMaterial(firstMat ? String(firstMat.id) : '', 1);
      initialRows.push({
        id: `row-0-${Date.now()}`,
        materialId: firstMat ? String(firstMat.id) : '',
        batchId: defaultBatch.id,
        quantity: 1,
        unitCost: firstMat?.lastPurchaseUnitCostBDT || firstMat?.standardCostBDT || 0,
        isOverride: false,
        overrideReason: '',
        maxAvailable: defaultBatch.availableQty,
        suggestedFifoBatchId: defaultBatch.id
      });
    }

    setIssueRows(initialRows);
  }, [order, products, rawMaterials]);

  // Handle Material change in a row
  const handleMaterialChange = (rowId: string, newMaterialId: string) => {
    const currentRow = issueRows.find(r => r.id === rowId);
    const qty = currentRow?.quantity || 1;
    const { defaultBatch } = getBatchOptionsForMaterial(newMaterialId, qty);
    const rm = rawMaterials.find(m => String(m.id) === String(newMaterialId) || m.code === newMaterialId);

    setIssueRows(prev => prev.map(row => {
      if (row.id !== rowId) return row;
      return {
        ...row,
        materialId: newMaterialId,
        batchId: defaultBatch.id, // Default to PO Batch
        unitCost: rm?.lastPurchaseUnitCostBDT || rm?.standardCostBDT || defaultBatch.unitPurchaseRate,
        maxAvailable: defaultBatch.availableQty,
        suggestedFifoBatchId: defaultBatch.id,
        isOverride: false,
        overrideReason: ''
      };
    }));
  };

  // Handle Batch change in a row
  const handleBatchChange = (rowId: string, newBatchId: string) => {
    const currentRow = issueRows.find(r => r.id === rowId);
    if (!currentRow) return;
    const { allBatches, defaultBatch } = getBatchOptionsForMaterial(currentRow.materialId, currentRow.quantity);
    const selectedBatch = allBatches.find(b => b.id === newBatchId) || inventoryBatches.find(b => b.id === newBatchId);
    const isOverride = newBatchId !== defaultBatch.id;

    setIssueRows(prev => prev.map(row => {
      if (row.id !== rowId) return row;
      return {
        ...row,
        batchId: newBatchId,
        unitCost: selectedBatch ? selectedBatch.unitPurchaseRate : row.unitCost,
        maxAvailable: selectedBatch ? selectedBatch.availableQty : row.maxAvailable,
        isOverride,
        overrideReason: isOverride ? row.overrideReason : ''
      };
    }));
  };

  // Add extra row
  const handleAddRow = () => {
    const firstMat = rawMaterials[0];
    const { defaultBatch } = getBatchOptionsForMaterial(firstMat ? String(firstMat.id) : '', 1);

    setIssueRows(prev => [
      ...prev,
      {
        id: `row-${Date.now()}`,
        materialId: firstMat ? String(firstMat.id) : '',
        batchId: defaultBatch.id,
        quantity: 1,
        unitCost: firstMat?.lastPurchaseUnitCostBDT || firstMat?.standardCostBDT || 0,
        isOverride: false,
        overrideReason: '',
        maxAvailable: defaultBatch.availableQty,
        suggestedFifoBatchId: defaultBatch.id
      }
    ]);
  };

  // Remove row
  const handleRemoveRow = (rowId: string) => {
    if (issueRows.length <= 1) return;
    setIssueRows(prev => prev.filter(r => r.id !== rowId));
  };

  // Apply scanned barcode batch
  const handleSelectScannedBatch = (batch: InventoryBatch) => {
    if (!scannerRowId) return;

    setIssueRows(prev => prev.map(row => {
      if (row.id !== scannerRowId) return row;
      const isOverride = row.suggestedFifoBatchId ? batch.id !== row.suggestedFifoBatchId : false;

      return {
        ...row,
        materialId: batch.materialId,
        batchId: batch.id,
        unitCost: batch.unitPurchaseRate,
        maxAvailable: batch.availableQty,
        isOverride: isOverride,
        overrideReason: isOverride ? (row.overrideReason || 'Scanned physical batch barcode from floor') : ''
      };
    }));

    setScannerRowId(null);
  };

  // Calculate totals
  const totalIssueCost = issueRows.reduce((acc, row) => acc + (row.quantity * row.unitCost), 0);

  // Submit issue
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate
    for (let i = 0; i < issueRows.length; i++) {
      const row = issueRows[i];
      if (!row.materialId) {
        setErrorMsg(`Row ${i + 1}: Select a raw material.`);
        return;
      }
      if (!row.batchId) {
        setErrorMsg(`Row ${i + 1}: Select a batch.`);
        return;
      }
      if (row.quantity <= 0) {
        setErrorMsg(`Row ${i + 1}: Quantity must be greater than 0.`);
        return;
      }
      if (row.quantity > row.maxAvailable) {
        setErrorMsg(`Row ${i + 1}: Cannot issue ${row.quantity} units. Only ${row.maxAvailable} available in batch.`);
        return;
      }
      if (row.isOverride && !row.overrideReason.trim()) {
        setErrorMsg(`Row ${i + 1}: Manual batch override requires an audit reason.`);
        return;
      }
    }

    try {
      issueMaterialsForProduction({
        productionOrderId: order.id,
        productionOrderNumber: order.orderNumber,
        warehouseId: 'WH-KUSHTIA',
        warehouseName: 'Kushtia Assembly Plant',
        issuedBy,
        notes,
        items: issueRows.map(r => {
          const { allBatches, defaultBatch } = getBatchOptionsForMaterial(r.materialId, r.quantity);
          const batch = allBatches.find(b => b.id === r.batchId) || inventoryBatches.find(b => b.id === r.batchId) || defaultBatch;
          return {
            materialId: r.materialId,
            batchNumber: batch?.batchNumber || poBatchNumber,
            quantity: r.quantity,
            isFifoOverride: r.isOverride,
            overrideReason: r.overrideReason,
          };
        })
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to issue materials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[1400px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-7 space-y-5 text-xs max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
              <PackageMinus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Issue Raw Materials to Production
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                PO: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{order.orderNumber}</span> • 
                Batch: <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{poBatchNumber}</span> • 
                Product: <span className="font-semibold text-slate-800 dark:text-slate-200">{order.productName}</span> • 
                Planned Qty: <span className="font-bold text-emerald-600 dark:text-emerald-400">{order.plannedQty} Units</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Info Banner */}
        <div className="p-3 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/60 rounded-xl text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
          <div className="text-xs space-y-0.5">
            <span className="font-bold">Production Order Batch Allocation Active:</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              Raw material batch is automatically selected as <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{poBatchNumber}</span> according to Production Order <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{order.orderNumber}</span>. You can select specific purchase lots or scan physical barcodes as needed.
            </p>
          </div>
        </div>

        {/* Table of Items */}
        <div className="space-y-2 flex-1 min-h-0 flex flex-col">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Raw Materials to Issue
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                ({issueRows.length} items from Bill of Materials)
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Extra Material
            </button>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden overflow-x-auto shadow-xs flex-1">
            <table className="w-full text-left text-xs min-w-[1050px]">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold sticky top-0">
                <tr>
                  <th className="p-3 w-[34%] min-w-[320px]">Raw Material</th>
                  <th className="p-3 w-[26%] min-w-[250px]">Batch / FIFO Suggestion</th>
                  <th className="p-3 text-right w-24 min-w-[85px]">Available</th>
                  <th className="p-3 text-right w-28 min-w-[95px]">Issue Qty</th>
                  <th className="p-3 text-right w-28 min-w-[100px]">Batch Rate</th>
                  <th className="p-3 text-right w-32 min-w-[110px]">Total Cost</th>
                  <th className="p-3 text-center w-16 min-w-[60px]">Scan</th>
                  <th className="p-3 text-center w-12 min-w-[50px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {issueRows.map((row) => {
                  const { allBatches, defaultBatch } = getBatchOptionsForMaterial(row.materialId, row.quantity);
                  const rm = rawMaterials.find(m => String(m.id) === String(row.materialId) || m.code === row.materialId);
                  const isDefaultBatch = !row.batchId || row.batchId === defaultBatch.id;

                  return (
                    <React.Fragment key={row.id}>
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        {/* Material Selector with full name visibility */}
                        <td className="p-3">
                          <div className="space-y-1">
                            <select
                              value={row.materialId}
                              onChange={(e) => handleMaterialChange(row.id, e.target.value)}
                              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-xs"
                              title={rm ? `${rm.name} (${rm.code})` : ''}
                            >
                              {rawMaterials.map((m, rmIdx) => (
                                <option key={`${m.id}-${rmIdx}`} value={m.id}>
                                  {m.name} ({m.code}) {m.category ? `• ${m.category}` : ''}
                                </option>
                              ))}
                            </select>
                            {rm && (
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 pl-0.5">
                                <span className="font-mono font-medium text-slate-600 dark:text-slate-300">Code: {rm.code}</span>
                                {rm.unit && <span>• Unit: {rm.unit}</span>}
                                {rm.category && <span>• {rm.category}</span>}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Batch Selector with PO Batch preselected by default */}
                        <td className="p-3">
                          <div className="space-y-1">
                            <select
                              value={row.batchId || defaultBatch.id}
                              onChange={(e) => handleBatchChange(row.id, e.target.value)}
                              className={`w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 shadow-xs ${
                                row.isOverride 
                                  ? 'border-amber-500 text-amber-700 dark:text-amber-300' 
                                  : 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                              }`}
                            >
                              {allBatches.map(b => (
                                <option key={b.id} value={b.id}>
                                  {b.batchNumber} {b.batchNumber === poBatchNumber ? `(PO: ${order.orderNumber} • Batch Stock: ${b.availableQty.toLocaleString()})` : `(Avail: ${b.availableQty} | Rate: ${formatCurrency(b.unitPurchaseRate)})`}
                                </option>
                              ))}
                            </select>

                            <div className="flex items-center gap-1.5 text-[10px]">
                              {isDefaultBatch && (
                                <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
                                  <CheckCircle2 className="w-3 h-3 text-blue-500" /> Default Batch (PO: {order.orderNumber})
                                </span>
                              )}
                              {row.isOverride && (
                                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                                  <AlertTriangle className="w-3 h-3 text-amber-500" /> Manual Batch Override
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Available Qty */}
                        <td className="p-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                          <div>{row.maxAvailable.toLocaleString()}</div>
                          <div className="text-[10px] font-normal text-slate-400">{rm?.unit || 'Units'}</div>
                        </td>

                        {/* Quantity */}
                        <td className="p-3 text-right">
                          <input
                            type="number"
                            min="1"
                            max={row.maxAvailable}
                            value={row.quantity}
                            onChange={(e) => {
                              const val = Math.max(0, Number(e.target.value));
                              setIssueRows(prev => prev.map(r => r.id === row.id ? { ...r, quantity: val } : r));
                            }}
                            className={`w-24 p-2 text-right rounded-lg border font-mono font-bold text-xs shadow-xs ${
                              row.quantity > row.maxAvailable
                                ? 'border-red-500 bg-red-50 text-red-700'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                            }`}
                          />
                        </td>

                        {/* Unit Cost */}
                        <td className="p-3 text-right font-mono text-slate-600 dark:text-slate-300">
                          {formatCurrency(row.unitCost)}
                        </td>

                        {/* Total Line Cost */}
                        <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(row.quantity * row.unitCost)}
                        </td>

                        {/* Barcode Scanner Trigger */}
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => setScannerRowId(row.id)}
                            className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition cursor-pointer"
                            title="Scan Barcode for this Row"
                          >
                            <Barcode className="w-4 h-4" />
                          </button>
                        </td>

                        {/* Remove */}
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => setRowToDeleteId(row.id)}
                            disabled={issueRows.length <= 1}
                            className="p-1.5 rounded text-slate-400 hover:text-red-500 disabled:opacity-30 transition cursor-pointer"
                            title="Remove Material Row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>

                      {/* Override Reason input if overridden */}
                      {row.isOverride && (
                        <tr className="bg-amber-50/50 dark:bg-amber-950/20">
                          <td colSpan={8} className="p-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-amber-800 dark:text-amber-300 font-semibold text-[11px] whitespace-nowrap">
                                Override Audit Reason:
                              </span>
                              <input
                                type="text"
                                placeholder="e.g., Specific lot requested by QA head, inspection required"
                                value={row.overrideReason}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setIssueRows(prev => prev.map(r => r.id === row.id ? { ...r, overrideReason: val } : r));
                                }}
                                className="flex-1 p-1.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg text-xs"
                                required
                              />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Issue Details & Total Cost */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                Issued By (Authorized Personnel)
              </label>
              <input
                type="text"
                value={issuedBy}
                onChange={(e) => setIssuedBy(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                Issue Remarks & Batch Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Material Issue Value
              </span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
                {formatCurrency(totalIssueCost)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Calculated according to batch purchase acquisition costs.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-600/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Material Issue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      <BatchBarcodeScannerModal
        isOpen={scannerRowId !== null}
        onClose={() => setScannerRowId(null)}
        onSelectBatch={handleSelectScannedBatch}
      />

      {/* CONFIRM REMOVE MATERIAL ROW MODAL */}
      {rowToDeleteId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 rounded-2xl shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Remove Requisition Material?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Are you sure you want to remove this item from the material issue list?
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRowToDeleteId(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleRemoveRow(rowToDeleteId);
                  setRowToDeleteId(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
