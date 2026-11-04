/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Ensec ERP - Dedicated Production Cost Allocation Engine
 * Implements Section 3 of the Manufacturing Cost Accounting Specification.
 */

import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  Calculator, PlusCircle, ArrowRight, CheckCircle2, AlertCircle, 
  Trash2, Building, Cpu, Layers, DollarSign, Filter, Search
} from 'lucide-react';
import { ExpenseEntry, CostAllocationMethod, CostAllocationRecord } from '../../types/costing';

interface ProductionCostAllocationTabProps {
  initialSelectedExpense?: ExpenseEntry | null;
  preselectedExpenseId?: string;
  onOpenCostSheet?: (batchNo: string) => void;
}

export const ProductionCostAllocationTab: React.FC<ProductionCostAllocationTabProps> = ({
  initialSelectedExpense,
  preselectedExpenseId,
  onOpenCostSheet
}) => {
  const { 
    expenseEntries, 
    costAllocations, 
    allocateExpenseToBatch, 
    deleteCostAllocation, 
    productionOrders, 
    formatCurrency 
  } = useERP();

  // Allocation Form State
  const [selectedExpenseId, setSelectedExpenseId] = useState<string>(preselectedExpenseId || initialSelectedExpense?.id || '');
  const [targetOrderId, setTargetOrderId] = useState<string>(productionOrders[0]?.id || '');
  const [allocationMethod, setAllocationMethod] = useState<CostAllocationMethod>('Production Quantity Based');
  const [allocatedAmount, setAllocatedAmount] = useState<number | ''>('');
  const [basisValue, setBasisValue] = useState<number | ''>('');
  const [totalBasisValue, setTotalBasisValue] = useState<number | ''>('');
  const [allocationNotes, setAllocationNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [allocationToDelete, setAllocationToDelete] = useState<CostAllocationRecord | null>(null);

  // Selected Expense Object
  const selectedExpense = useMemo(() => {
    return expenseEntries.find((e) => e.id === selectedExpenseId) || null;
  }, [expenseEntries, selectedExpenseId]);

  // Target Production Order
  const targetOrder = useMemo(() => {
    return productionOrders.find((po) => po.id === targetOrderId) || null;
  }, [productionOrders, targetOrderId]);

  // Filter factory expenses with remaining unallocated balance
  const allocableFactoryExpenses = useMemo(() => {
    return expenseEntries.filter(
      (e) => e.mainCategory === 'Factory Expenses' && e.remainingUnallocated > 0
    );
  }, [expenseEntries]);

  // Auto-suggest allocation amount when method or basis changes
  const handleCalculateSuggested = () => {
    if (!selectedExpense) return;
    const remaining = selectedExpense.remainingUnallocated;

    if (allocationMethod === 'Manual Allocation') {
      setAllocatedAmount(remaining);
      return;
    }

    if (basisValue && totalBasisValue && Number(totalBasisValue) > 0) {
      const ratio = Number(basisValue) / Number(totalBasisValue);
      const suggested = Math.min(remaining, Math.round(selectedExpense.amount * ratio));
      setAllocatedAmount(suggested);
    } else if (targetOrder && allocationMethod === 'Production Quantity Based') {
      // Suggest pro-rata based on completed or planned qty
      const totalFactoryPlanned = productionOrders.reduce((s, po) => s + (po.plannedQty || 1), 0);
      const batchQty = targetOrder.plannedQty || 50;
      setBasisValue(batchQty);
      setTotalBasisValue(totalFactoryPlanned);
      const ratio = batchQty / totalFactoryPlanned;
      const suggested = Math.min(remaining, Math.round(selectedExpense.amount * ratio));
      setAllocatedAmount(suggested);
    }
  };

  // Perform Allocation
  const handleExecuteAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedExpense) {
      setErrorMessage('Please select an unallocated factory expense.');
      return;
    }

    if (!targetOrder) {
      setErrorMessage('Please select a target production batch.');
      return;
    }

    if (!allocatedAmount || Number(allocatedAmount) <= 0) {
      setErrorMessage('Please enter an allocated amount greater than zero.');
      return;
    }

    if (Number(allocatedAmount) > selectedExpense.remainingUnallocated) {
      setErrorMessage(
        `Cannot allocate ${formatCurrency(Number(allocatedAmount))}. Only ${formatCurrency(selectedExpense.remainingUnallocated)} remains unallocated for this voucher.`
      );
      return;
    }

    const res = allocateExpenseToBatch({
      expenseId: selectedExpense.id,
      productionOrderId: targetOrder.id,
      allocationMethod,
      allocatedAmount: Number(allocatedAmount),
      basisValue: basisValue ? Number(basisValue) : undefined,
      totalBasisValue: totalBasisValue ? Number(totalBasisValue) : undefined,
      notes: allocationNotes.trim() || undefined,
    });

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to allocate expense.');
      return;
    }

    setSuccessMessage(
      `Successfully allocated ${formatCurrency(Number(allocatedAmount))} to batch ${targetOrder.batchNumber || targetOrder.orderNumber}!`
    );
    setAllocatedAmount('');
    setAllocationNotes('');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Allocation Header Overview */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-base text-slate-900 dark:text-white">
              Production Overhead &amp; Expense Allocation Engine
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Systematically absorb monthly factory rent, industrial electricity, generator fuel, and machine maintenance across active production batches
            </p>
          </div>
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Unallocated Factory Expenses: <span className="text-amber-600 font-bold text-sm">{allocableFactoryExpenses.length} Vouchers</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Allocation Wizard Form */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>New Cost Allocation Entry</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Strict Absorption Control</span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-semibold text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleExecuteAllocation} className="space-y-4 text-xs">
            {/* 1. Select Factory Expense */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                1. Select Unallocated Factory Expense Voucher*
              </label>
              <select
                required
                value={selectedExpenseId}
                onChange={(e) => {
                  setSelectedExpenseId(e.target.value);
                  setAllocatedAmount('');
                }}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              >
                <option value="">-- Choose Factory Expense to Allocate --</option>
                {allocableFactoryExpenses.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.voucherNumber} • {exp.subcategory} (Unallocated: ৳ {exp.remainingUnallocated.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Expense Detail Card */}
            {selectedExpense && (
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 dark:text-blue-200 text-xs">
                    {selectedExpense.subcategory}
                  </span>
                  <span className="font-mono font-black text-blue-700 dark:text-blue-300 text-xs">
                    Total: {formatCurrency(selectedExpense.amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                  <span>Already Allocated: <b className="text-emerald-600">{formatCurrency(selectedExpense.allocatedAmount)}</b></span>
                  <span>Available: <b className="text-amber-600 font-bold">{formatCurrency(selectedExpense.remainingUnallocated)}</b></span>
                </div>
                <div className="text-[10px] text-slate-500 truncate" title={selectedExpense.description}>
                  {selectedExpense.description}
                </div>
              </div>
            )}

            {/* 2. Target Production Batch */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                2. Target Production Batch / Work Order*
              </label>
              <select
                required
                value={targetOrderId}
                onChange={(e) => setTargetOrderId(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold font-mono"
              >
                {productionOrders.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.batchNumber || po.orderNumber} • {po.productName} ({po.plannedQty} Units)
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Allocation Method */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                3. Cost Allocation Absorption Method*
              </label>
              <select
                required
                value={allocationMethod}
                onChange={(e) => setAllocationMethod(e.target.value as any)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              >
                <option value="Production Quantity Based">Production Quantity Based (Pro-rata)</option>
                <option value="Labour Hour Based">Labour Hour Based</option>
                <option value="Machine Hour Based">Machine Hour Based</option>
                <option value="Manual Allocation">Manual Direct Allocation</option>
              </select>
            </div>

            {/* Pro-rata Helper Inputs */}
            {allocationMethod !== 'Manual Allocation' && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Batch Basis Value ({allocationMethod.includes('Quantity') ? 'Units' : 'Hours'})
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={basisValue}
                    onChange={(e) => setBasisValue(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 100"
                    className="w-full p-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Total Plant Basis Value
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={totalBasisValue}
                    onChange={(e) => setTotalBasisValue(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 250"
                    className="w-full p-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div className="col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleCalculateSuggested}
                    className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    Calculate Pro-rata Amount
                  </button>
                </div>
              </div>
            )}

            {/* 4. Allocated Amount */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  4. Allocated Amount to This Batch (BDT)*
                </label>
                {selectedExpense && (
                  <button
                    type="button"
                    onClick={() => setAllocatedAmount(selectedExpense.remainingUnallocated)}
                    className="text-[10px] text-blue-600 hover:underline font-bold"
                  >
                    Allocate Full Remaining ({formatCurrency(selectedExpense.remainingUnallocated)})
                  </button>
                )}
              </div>
              <input
                type="number"
                required
                min={1}
                max={selectedExpense?.remainingUnallocated}
                value={allocatedAmount}
                onChange={(e) => setAllocatedAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 20000"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-black text-sm"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cost Allocation Notes &amp; Rationale
              </label>
              <input
                type="text"
                value={allocationNotes}
                onChange={(e) => setAllocationNotes(e.target.value)}
                placeholder="e.g. Monthly rent pro-rata allocation for 100 finished battery units"
                className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={!selectedExpense || selectedExpense.remainingUnallocated === 0}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Post Cost Allocation to Batch</span>
            </button>
          </form>
        </div>

        {/* Right: Allocation History & Audit Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Active Production Batch Allocations ({costAllocations.length})</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                Double-counting prevented
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 font-semibold">
                  <tr>
                    <th className="p-2.5">Batch No.</th>
                    <th className="p-2.5">Voucher &amp; Expense</th>
                    <th className="p-2.5">Method</th>
                    <th className="p-2.5 text-right">Allocated (BDT)</th>
                    <th className="p-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {costAllocations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No expense allocations recorded yet. Allocate factory expenses using the wizard on the left.
                      </td>
                    </tr>
                  ) : (
                    costAllocations.map((alloc) => (
                      <tr key={alloc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {alloc.productionBatchNumber}
                          <span className="block font-sans text-[10px] text-slate-400 font-normal truncate max-w-[120px]">
                            {alloc.productName}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 font-semibold block">
                            {alloc.expenseVoucherNo}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white text-[11px]">
                            {alloc.expenseSubcategory}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400 text-[11px]">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono">
                            {alloc.allocationMethod}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">{alloc.allocationDate}</span>
                        </td>
                        <td className="p-2.5 text-right font-mono font-black text-indigo-600 dark:text-indigo-400 text-xs">
                          {formatCurrency(alloc.allocatedAmount)}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => setAllocationToDelete(alloc)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition cursor-pointer"
                            title="Roll back allocation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRM DELETE ALLOCATION MODAL */}
      {allocationToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 rounded-2xl shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Confirm Roll Back Allocation?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Without confirmation this item will not be deleted. Are you sure you want to roll back this cost allocation?
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 space-y-2 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Batch Number:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{allocationToDelete.productionBatchNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Expense Voucher:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{allocationToDelete.expenseVoucherNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{allocationToDelete.expenseSubcategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Allocation Method:</span>
                <span className="text-slate-700 dark:text-slate-300">{allocationToDelete.allocationMethod}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-semibold">Allocated Amount:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                  {formatCurrency(allocationToDelete.allocatedAmount)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setAllocationToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCostAllocation(allocationToDelete.id);
                  setAllocationToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Roll Back</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
