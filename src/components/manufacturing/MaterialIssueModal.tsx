import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  PackageMinus, Barcode, AlertTriangle, CheckCircle2, 
  Clock, ShieldCheck, X, Plus, Trash2, ArrowRight
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
    getFifoBatchesForMaterial, 
    issueMaterialsForProduction,
    formatCurrency 
  } = useERP();

  const [issueRows, setIssueRows] = useState<IssueRow[]>([]);
  const [issuedBy, setIssuedBy] = useState('Production Supervisor');
  const [notes, setNotes] = useState(`Material issue for PO ${order.orderNumber}`);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scannerRowId, setScannerRowId] = useState<string | null>(null);
  const [rowToDeleteId, setRowToDeleteId] = useState<string | null>(null);

  // Initialize issue rows based on product BOM
  useEffect(() => {
    const product = products.find(p => p.id === order.productId);
    const initialRows: IssueRow[] = [];

    if (product && product.bom) {
      product.bom.forEach((bomItem, idx) => {
        const requiredQty = bomItem.requiredQty * (order.plannedQty || 1);
        const fifoBatches = getFifoBatchesForMaterial(bomItem.materialId);
        const oldestBatch = fifoBatches.find(b => b.availableQty > 0);

        initialRows.push({
          id: `row-${idx}-${Date.now()}`,
          materialId: bomItem.materialId,
          batchId: oldestBatch ? oldestBatch.id : '',
          quantity: requiredQty,
          unitCost: oldestBatch ? oldestBatch.unitPurchaseRate : bomItem.unitCostBDT,
          isOverride: false,
          overrideReason: '',
          maxAvailable: oldestBatch ? oldestBatch.availableQty : 0,
          suggestedFifoBatchId: oldestBatch ? oldestBatch.id : undefined
        });
      });
    }

    if (initialRows.length === 0) {
      // Provide an empty row
      initialRows.push({
        id: `row-0-${Date.now()}`,
        materialId: rawMaterials[0]?.id || '',
        batchId: '',
        quantity: 1,
        unitCost: 0,
        isOverride: false,
        overrideReason: '',
        maxAvailable: 0
      });
    }

    setIssueRows(initialRows);
  }, [order, products, rawMaterials, getFifoBatchesForMaterial]);

  // Handle Material change in a row
  const handleMaterialChange = (rowId: string, newMaterialId: string) => {
    const fifoBatches = getFifoBatchesForMaterial(newMaterialId);
    const oldestBatch = fifoBatches.find(b => b.availableQty > 0);

    setIssueRows(prev => prev.map(row => {
      if (row.id !== rowId) return row;
      return {
        ...row,
        materialId: newMaterialId,
        batchId: oldestBatch ? oldestBatch.id : '',
        unitCost: oldestBatch ? oldestBatch.unitPurchaseRate : 0,
        maxAvailable: oldestBatch ? oldestBatch.availableQty : 0,
        suggestedFifoBatchId: oldestBatch ? oldestBatch.id : undefined,
        isOverride: false,
        overrideReason: ''
      };
    }));
  };

  // Handle Batch change in a row
  const handleBatchChange = (rowId: string, newBatchId: string) => {
    setIssueRows(prev => prev.map(row => {
      if (row.id !== rowId) return row;
      const batch = inventoryBatches.find(b => b.id === newBatchId);
      const isOverride = row.suggestedFifoBatchId ? newBatchId !== row.suggestedFifoBatchId : false;

      return {
        ...row,
        batchId: newBatchId,
        unitCost: batch ? batch.unitPurchaseRate : 0,
        maxAvailable: batch ? batch.availableQty : 0,
        isOverride: isOverride,
        overrideReason: isOverride ? row.overrideReason : ''
      };
    }));
  };

  // Add row
  const handleAddRow = () => {
    const firstMat = rawMaterials[0];
    const fifoBatches = firstMat ? getFifoBatchesForMaterial(firstMat.id) : [];
    const oldest = fifoBatches.find(b => b.availableQty > 0);

    setIssueRows(prev => [
      ...prev,
      {
        id: `row-${Date.now()}`,
        materialId: firstMat ? firstMat.id : '',
        batchId: oldest ? oldest.id : '',
        quantity: 1,
        unitCost: oldest ? oldest.unitPurchaseRate : 0,
        isOverride: false,
        overrideReason: '',
        maxAvailable: oldest ? oldest.availableQty : 0,
        suggestedFifoBatchId: oldest ? oldest.id : undefined
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
        setErrorMsg(`Row ${i + 1}: Select an inventory batch with available stock.`);
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
          const batch = inventoryBatches.find(b => b.id === r.batchId);
          return {
            materialId: r.materialId,
            batchNumber: batch?.batchNumber || r.batchId,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5 text-xs max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
              <PackageMinus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Issue Raw Materials to Production
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                PO: <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{order.orderNumber}</span> • 
                Product: <span className="font-semibold">{order.productName}</span> • 
                Planned Qty: <span className="font-bold">{order.plannedQty} Units</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <span className="font-semibold">FIFO Material Allocation Active:</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              Oldest purchase batches are automatically selected to ensure accurate cost calculation and inventory rotation. Any batch override requires an audit reason.
            </p>
          </div>
        </div>

        {/* Table of Items */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Raw Materials to Issue
            </span>
            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Extra Material
            </button>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
                <tr>
                  <th className="p-2.5">Raw Material</th>
                  <th className="p-2.5">Batch / FIFO Suggestion</th>
                  <th className="p-2.5 text-right">Available</th>
                  <th className="p-2.5 text-right w-24">Issue Qty</th>
                  <th className="p-2.5 text-right">Batch Rate</th>
                  <th className="p-2.5 text-right">Cost</th>
                  <th className="p-2.5 text-center w-16">Scan</th>
                  <th className="p-2.5 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {issueRows.map((row) => {
                  const availableBatches = inventoryBatches.filter(
                    b => b.materialId === row.materialId && b.availableQty > 0
                  );
                  const isFIFO = row.batchId === row.suggestedFifoBatchId;

                  return (
                    <React.Fragment key={row.id}>
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        {/* Material Selector */}
                        <td className="p-2.5">
                          <select
                            value={row.materialId}
                            onChange={(e) => handleMaterialChange(row.id, e.target.value)}
                            className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          >
                            {rawMaterials.map((rm, rmIdx) => (
                              <option key={`${rm.id}-${rmIdx}`} value={rm.id}>
                                {rm.name} ({rm.code})
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Batch Selector */}
                        <td className="p-2.5">
                          <div className="space-y-1">
                            <select
                              value={row.batchId}
                              onChange={(e) => handleBatchChange(row.id, e.target.value)}
                              className={`w-full p-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs font-mono ${
                                row.isOverride 
                                  ? 'border-amber-500 text-amber-700 dark:text-amber-300' 
                                  : 'border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <option value="">-- Select Batch --</option>
                              {availableBatches.map(b => (
                                <option key={b.id} value={b.id}>
                                  {b.batchNumber} (Avail: {b.availableQty} | Rate: {formatCurrency(b.unitPurchaseRate)})
                                </option>
                              ))}
                            </select>

                            <div className="flex items-center gap-1.5 text-[10px]">
                              {isFIFO && row.batchId && (
                                <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                                  <Clock className="w-3 h-3" /> Oldest Batch (FIFO Recommended)
                                </span>
                              )}
                              {row.isOverride && (
                                <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold">
                                  <AlertTriangle className="w-3 h-3" /> Manual Batch Override
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Available Qty */}
                        <td className="p-2.5 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {row.maxAvailable}
                        </td>

                        {/* Quantity */}
                        <td className="p-2.5 text-right">
                          <input
                            type="number"
                            min="1"
                            max={row.maxAvailable}
                            value={row.quantity}
                            onChange={(e) => {
                              const val = Math.max(0, Number(e.target.value));
                              setIssueRows(prev => prev.map(r => r.id === row.id ? { ...r, quantity: val } : r));
                            }}
                            className={`w-20 p-1.5 text-right rounded-lg border font-mono font-bold text-xs ${
                              row.quantity > row.maxAvailable
                                ? 'border-red-500 bg-red-50 text-red-700'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                            }`}
                          />
                        </td>

                        {/* Unit Cost */}
                        <td className="p-2.5 text-right font-mono text-slate-600 dark:text-slate-300">
                          {formatCurrency(row.unitCost)}
                        </td>

                        {/* Total Line Cost */}
                        <td className="p-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(row.quantity * row.unitCost)}
                        </td>

                        {/* Barcode Scanner Trigger */}
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => setScannerRowId(row.id)}
                            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition"
                            title="Scan Barcode for this Row"
                          >
                            <Barcode className="w-4 h-4" />
                          </button>
                        </td>

                        {/* Remove */}
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => setRowToDeleteId(row.id)}
                            disabled={issueRows.length <= 1}
                            className="p-1 rounded text-slate-400 hover:text-red-500 disabled:opacity-30 transition cursor-pointer"
                            title="Remove Material Row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>

                      {/* Override Reason input if overridden */}
                      {row.isOverride && (
                        <tr className="bg-amber-50/50 dark:bg-amber-950/20">
                          <td colSpan={8} className="p-2 px-4">
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
                                className="flex-1 p-1 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded text-xs"
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
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
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
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
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
                Based on actual purchase batch acquisition costs.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-600/20 transition flex items-center gap-1.5"
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
                  Without confirmation this item will not be deleted from the material issue list.
                </p>
              </div>
            </div>

            {(() => {
              const targetRow = issueRows.find(r => r.id === rowToDeleteId);
              const rm = rawMaterials.find(m => m.id === targetRow?.materialId);
              return (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 space-y-2 border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Material:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {rm ? rm.name : 'Selected Material'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quantity:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {targetRow?.quantity} {rm?.unit || 'Units'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Order:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-mono">
                      {order.batchNumber || order.orderNumber}
                    </span>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRowToDeleteId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleRemoveRow(rowToDeleteId);
                  setRowToDeleteId(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
