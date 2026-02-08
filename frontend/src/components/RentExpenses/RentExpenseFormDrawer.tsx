import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { rentExpensesApi } from '../../services/api';
import CurrencyDisplay from '../CurrencyDisplay';
import type { RentExpense, RentExpenseCreate } from '../../types';

type RentFormMode = 'create' | 'edit';

interface RentExpenseFormDrawerProps {
  open: boolean;
  mode: RentFormMode;
  expense?: RentExpense | null;
  onClose: () => void;
  onSaved?: (expense: RentExpense) => void;
}

type RentExpenseFormData = {
  period: string;
  currency: 'IDR';
  sinking_fund_idr: number;
  service_charge_idr: number;
  ppn_service_charge_idr: number;
  electric_usage_idr: number;
  electric_ppn_idr: number;
  electric_area_bersama_idr: number;
  electric_pju_idr: number;
  electric_kwh: number | null;
  electric_tarif_per_kwh: number | null;
  water_usage_potable_idr: number;
  water_non_potable_idr: number;
  water_air_limbah_idr: number;
  water_ppn_air_limbah_idr: number;
  water_pemeliharaan_idr: number;
  water_area_bersama_idr: number;
  water_m3: number | null;
  water_tarif_per_m3: number | null;
  fitout_idr: number;
};

const getCurrentPeriod = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const nextPeriod = (period: string) => {
  const [yearRaw, monthRaw] = period.split('-');
  const yearNum = Number(yearRaw);
  const monthNum = Number(monthRaw);
  if (!yearNum || !monthNum) return getCurrentPeriod();
  let nextMonth = monthNum + 1;
  let nextYear = yearNum;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
};

const roundIdr = (value: number) => Math.round(value || 0);

const toNumber = (value: string) => (value === '' ? 0 : Number(value));
const toNullableNumber = (value: string) => (value === '' ? null : Number(value));
const safeNumber = (value: number | null | undefined) =>
  typeof value === 'number' && !Number.isNaN(value) ? value : 0;

const emptyForm = (): RentExpenseFormData => ({
  period: getCurrentPeriod(),
  currency: 'IDR',
  sinking_fund_idr: 0,
  service_charge_idr: 0,
  ppn_service_charge_idr: 0,
  electric_usage_idr: 0,
  electric_ppn_idr: 0,
  electric_area_bersama_idr: 0,
  electric_pju_idr: 0,
  electric_kwh: null,
  electric_tarif_per_kwh: null,
  water_usage_potable_idr: 0,
  water_non_potable_idr: 0,
  water_air_limbah_idr: 0,
  water_ppn_air_limbah_idr: 0,
  water_pemeliharaan_idr: 0,
  water_area_bersama_idr: 0,
  water_m3: null,
  water_tarif_per_m3: null,
  fitout_idr: 0,
});

const fromExpense = (expense: RentExpense): RentExpenseFormData => ({
  period: expense.period,
  currency: 'IDR',
  sinking_fund_idr: expense.sinking_fund_idr ?? 0,
  service_charge_idr: expense.service_charge_idr ?? 0,
  ppn_service_charge_idr: expense.ppn_service_charge_idr ?? 0,
  electric_usage_idr: expense.electric_usage_idr ?? 0,
  electric_ppn_idr: expense.electric_ppn_idr ?? 0,
  electric_area_bersama_idr: expense.electric_area_bersama_idr ?? 0,
  electric_pju_idr: expense.electric_pju_idr ?? 0,
  electric_kwh: expense.electric_kwh ?? null,
  electric_tarif_per_kwh: expense.electric_tarif_per_kwh ?? null,
  water_usage_potable_idr: expense.water_usage_potable_idr ?? 0,
  water_non_potable_idr: expense.water_non_potable_idr ?? 0,
  water_air_limbah_idr: expense.water_air_limbah_idr ?? 0,
  water_ppn_air_limbah_idr: expense.water_ppn_air_limbah_idr ?? 0,
  water_pemeliharaan_idr: expense.water_pemeliharaan_idr ?? 0,
  water_area_bersama_idr: expense.water_area_bersama_idr ?? 0,
  water_m3: expense.water_m3 ?? null,
  water_tarif_per_m3: expense.water_tarif_per_m3 ?? null,
  fitout_idr: expense.fitout_idr ?? 0,
});

const RentExpenseFormDrawer = ({ open, mode, expense, onClose, onSaved }: RentExpenseFormDrawerProps) => {
  const [formData, setFormData] = useState<RentExpenseFormData>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSummary, setShowSummary] = useState(true);
  const [showElectricity, setShowElectricity] = useState(true);
  const [showWater, setShowWater] = useState(true);
  const [electricUsageOverride, setElectricUsageOverride] = useState(false);
  const [waterUsageOverride, setWaterUsageOverride] = useState(false);
  const initKeyRef = useRef<string | null>(null);
  const queryClient = useQueryClient();

  const { data: rentHistory } = useQuery({
    queryKey: ['rentExpensesAll'],
    queryFn: () => rentExpensesApi.getAll(),
    enabled: open && mode === 'create',
  });

  const latestExpense = rentHistory && rentHistory.length > 0 ? rentHistory[0] : null;

  useEffect(() => {
    if (!open) {
      initKeyRef.current = null;
      return;
    }

    const key = mode === 'edit'
      ? `edit-${expense?.id ?? 'none'}`
      : `create-${latestExpense?.id ?? 'none'}`;

    if (initKeyRef.current === key) return;
    initKeyRef.current = key;

    if (mode === 'edit' && expense) {
      const next = fromExpense(expense);
      setFormData(next);
      const computedElectric = roundIdr(safeNumber(expense.electric_kwh) * safeNumber(expense.electric_tarif_per_kwh));
      const shouldElectricOverride = expense.electric_kwh === null || expense.electric_tarif_per_kwh === null
        || roundIdr(safeNumber(expense.electric_usage_idr)) !== computedElectric;
      const computedWater = roundIdr(safeNumber(expense.water_m3) * safeNumber(expense.water_tarif_per_m3));
      const shouldWaterOverride = expense.water_m3 === null || expense.water_tarif_per_m3 === null
        || roundIdr(safeNumber(expense.water_usage_potable_idr)) !== computedWater;
      setElectricUsageOverride(shouldElectricOverride);
      setWaterUsageOverride(shouldWaterOverride);
    } else if (mode === 'create') {
      if (latestExpense) {
        const next = fromExpense(latestExpense);
        next.period = nextPeriod(latestExpense.period);
        setFormData(next);
        const computedElectric = roundIdr(safeNumber(latestExpense.electric_kwh) * safeNumber(latestExpense.electric_tarif_per_kwh));
        const shouldElectricOverride = latestExpense.electric_kwh === null || latestExpense.electric_tarif_per_kwh === null
          || roundIdr(safeNumber(latestExpense.electric_usage_idr)) !== computedElectric;
        const computedWater = roundIdr(safeNumber(latestExpense.water_m3) * safeNumber(latestExpense.water_tarif_per_m3));
        const shouldWaterOverride = latestExpense.water_m3 === null || latestExpense.water_tarif_per_m3 === null
          || roundIdr(safeNumber(latestExpense.water_usage_potable_idr)) !== computedWater;
        setElectricUsageOverride(shouldElectricOverride);
        setWaterUsageOverride(shouldWaterOverride);
      } else {
        setFormData(emptyForm());
        setElectricUsageOverride(false);
        setWaterUsageOverride(false);
      }
    }
    setErrors({});
  }, [open, mode, expense, latestExpense]);

  const computedElectricUsage = useMemo(() => {
    return safeNumber(formData.electric_kwh) * safeNumber(formData.electric_tarif_per_kwh);
  }, [formData.electric_kwh, formData.electric_tarif_per_kwh]);

  const computedWaterUsage = useMemo(() => {
    return safeNumber(formData.water_m3) * safeNumber(formData.water_tarif_per_m3);
  }, [formData.water_m3, formData.water_tarif_per_m3]);

  const electricUsageValue = electricUsageOverride ? safeNumber(formData.electric_usage_idr) : computedElectricUsage;
  const waterUsageValue = waterUsageOverride ? safeNumber(formData.water_usage_potable_idr) : computedWaterUsage;

  const serviceChargeTotal = useMemo(() => {
    return roundIdr(formData.service_charge_idr) + roundIdr(formData.ppn_service_charge_idr);
  }, [formData.service_charge_idr, formData.ppn_service_charge_idr]);

  const electricTotal = useMemo(() => {
    return (
      roundIdr(electricUsageValue)
      + roundIdr(formData.electric_ppn_idr)
      + roundIdr(formData.electric_area_bersama_idr)
      + roundIdr(formData.electric_pju_idr)
    );
  }, [electricUsageValue, formData.electric_ppn_idr, formData.electric_area_bersama_idr, formData.electric_pju_idr]);

  const waterTotal = useMemo(() => {
    return (
      roundIdr(waterUsageValue)
      + roundIdr(formData.water_non_potable_idr)
      + roundIdr(formData.water_air_limbah_idr)
      + roundIdr(formData.water_ppn_air_limbah_idr)
      + roundIdr(formData.water_pemeliharaan_idr)
      + roundIdr(formData.water_area_bersama_idr)
    );
  }, [
    waterUsageValue,
    formData.water_non_potable_idr,
    formData.water_air_limbah_idr,
    formData.water_ppn_air_limbah_idr,
    formData.water_pemeliharaan_idr,
    formData.water_area_bersama_idr,
  ]);

  const grandTotal = useMemo(() => {
    return (
      roundIdr(formData.sinking_fund_idr)
      + serviceChargeTotal
      + electricTotal
      + waterTotal
      + roundIdr(formData.fitout_idr)
    );
  }, [formData.sinking_fund_idr, serviceChargeTotal, electricTotal, waterTotal, formData.fitout_idr]);

  const upsertMutation = useMutation({
    mutationFn: (payload: RentExpenseCreate) => rentExpensesApi.upsert(payload.period, payload),
    onSuccess: (saved) => {
      toast.success('Rent expense saved');
      queryClient.invalidateQueries({ queryKey: ['rentTrends'] });
      queryClient.invalidateQueries({ queryKey: ['rentExpense', saved.period] });
      queryClient.invalidateQueries({ queryKey: ['rentExpensesAll'] });
      onSaved?.(saved);
      onClose();
    },
    onError: (error: any) => {
      const detail = error?.response?.data?.detail;
      toast.error(detail || 'Failed to save rent expense');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (period: string) => rentExpensesApi.remove(period),
    onSuccess: (_, period) => {
      toast.success('Rent expense deleted');
      queryClient.invalidateQueries({ queryKey: ['rentTrends'] });
      queryClient.invalidateQueries({ queryKey: ['rentExpense', period] });
      queryClient.invalidateQueries({ queryKey: ['rentExpensesAll'] });
      onClose();
    },
    onError: (error: any) => {
      const detail = error?.response?.data?.detail;
      toast.error(detail || 'Failed to delete rent expense');
    },
  });

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.period || !/^\d{4}-\d{2}$/.test(formData.period)) {
      nextErrors.period = 'Period must be in YYYY-MM format';
    }

    const moneyFields: Array<[keyof RentExpenseFormData, string]> = [
      ['sinking_fund_idr', 'Sinking fund'],
      ['service_charge_idr', 'Service charge'],
      ['ppn_service_charge_idr', 'PPN service charge'],
      ['electric_usage_idr', 'Electric usage'],
      ['electric_ppn_idr', 'Electric PPN'],
      ['electric_area_bersama_idr', 'Electric area bersama'],
      ['electric_pju_idr', 'Electric PJU'],
      ['water_usage_potable_idr', 'Water usage potable'],
      ['water_non_potable_idr', 'Water usage non-potable'],
      ['water_air_limbah_idr', 'Air limbah'],
      ['water_ppn_air_limbah_idr', 'PPN air limbah'],
      ['water_pemeliharaan_idr', 'Water maintenance'],
      ['water_area_bersama_idr', 'Water area bersama'],
      ['fitout_idr', 'Fitout'],
    ];

    for (const [field, label] of moneyFields) {
      const value = safeNumber(formData[field] as number);
      if (value < 0) {
        nextErrors[field] = `${label} must be zero or greater`;
      }
    }

    if (electricUsageOverride && formData.electric_usage_idr === null) {
      nextErrors.electric_usage_idr = 'Electric usage cost is required when override is on';
    }
    if (waterUsageOverride && formData.water_usage_potable_idr === null) {
      nextErrors.water_usage_potable_idr = 'Water usage cost is required when override is on';
    }

    const nullableFields: Array<[keyof RentExpenseFormData, string]> = [
      ['electric_kwh', 'Electric kWh'],
      ['electric_tarif_per_kwh', 'Electric tariff'],
      ['water_m3', 'Water m³'],
      ['water_tarif_per_m3', 'Water tariff'],
    ];

    for (const [field, label] of nullableFields) {
      const value = formData[field];
      if (typeof value === 'number' && value < 0) {
        nextErrors[field] = `${label} must be zero or greater`;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: RentExpenseCreate = {
      period: formData.period,
      currency: 'IDR',
      sinking_fund_idr: roundIdr(formData.sinking_fund_idr),
      service_charge_idr: roundIdr(formData.service_charge_idr),
      ppn_service_charge_idr: roundIdr(formData.ppn_service_charge_idr),
      electric_m1_total_idr: electricTotal,
      water_m1_total_idr: waterTotal,
      fitout_idr: roundIdr(formData.fitout_idr),
      total_idr: grandTotal,
      electric_usage_idr: roundIdr(electricUsageValue),
      electric_ppn_idr: roundIdr(formData.electric_ppn_idr),
      electric_area_bersama_idr: roundIdr(formData.electric_area_bersama_idr),
      electric_pju_idr: roundIdr(formData.electric_pju_idr),
      electric_kwh: formData.electric_kwh,
      electric_tarif_per_kwh: formData.electric_tarif_per_kwh,
      water_usage_potable_idr: roundIdr(waterUsageValue),
      water_non_potable_idr: roundIdr(formData.water_non_potable_idr),
      water_air_limbah_idr: roundIdr(formData.water_air_limbah_idr),
      water_ppn_air_limbah_idr: roundIdr(formData.water_ppn_air_limbah_idr),
      water_pemeliharaan_idr: roundIdr(formData.water_pemeliharaan_idr),
      water_area_bersama_idr: roundIdr(formData.water_area_bersama_idr),
      water_m3: formData.water_m3,
      water_tarif_per_m3: formData.water_tarif_per_m3,
    };

    upsertMutation.mutate(payload);
  };

  const handleDelete = () => {
    if (!formData.period) return;
    if (!window.confirm(`Delete rent expense for ${formData.period}? This cannot be undone.`)) return;
    deleteMutation.mutate(formData.period);
  };

  const sourceLabel = mode === 'edit' && expense?.source && expense.source !== 'manual' ? 'Imported' : 'Manual';

  if (!open) return null;

  const hasCopySource = mode === 'create' && !!latestExpense;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative ml-auto h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col ledger-paper ledger-font-body">
        <div className="px-6 py-5 border-b border-warm-gray-200/80 flex items-start justify-between bg-white/80 backdrop-blur">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="ledger-font-display text-2xl text-warm-gray-800">Rent Ledger</h2>
              <span className="px-2 py-0.5 rounded-full text-xs uppercase tracking-[0.2em] text-warm-gray-600 border border-warm-gray-300/60">
                {formData.period || '—'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-warm-gray-700 bg-warm-gray-100 border border-warm-gray-200">
                {sourceLabel}
              </span>
            </div>
            <p className="text-sm text-warm-gray-500 mt-1">Enter monthly rent breakdown and utility usage.</p>
          </div>
          <button
            onClick={onClose}
            className="text-warm-gray-500 hover:text-warm-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-warm-gray-500">Period</label>
              <input
                type="month"
                value={formData.period}
                onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                disabled={mode === 'edit'}
                className="mt-2 w-full rounded-lg border border-warm-gray-300 bg-white/80 px-3 py-2 text-sm text-warm-gray-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:opacity-60"
              />
              {errors.period && <p className="text-xs text-red-600 mt-1">{errors.period}</p>}
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-warm-gray-500">Currency</label>
              <div className="mt-2 w-full rounded-lg border border-warm-gray-300 bg-warm-gray-50 px-3 py-2 text-sm text-warm-gray-700">
                IDR (locked)
              </div>
            </div>
          </div>

          <section className="rounded-2xl border border-warm-gray-200/80 bg-white/70 shadow-sm">
            <button
              type="button"
              onClick={() => setShowSummary(v => !v)}
              className="w-full px-4 py-3 flex items-center justify-between text-left"
            >
              <div>
                <p className="ledger-font-display text-lg text-warm-gray-800">Summary</p>
                <p className="text-xs text-warm-gray-500">Core monthly charges</p>
              </div>
              <span className="text-warm-gray-500 text-lg">{showSummary ? '−' : '+'}</span>
            </button>
            {showSummary && (
              <div className="px-4 pb-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="ledger-label">Sinking Fund</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.sinking_fund_idr}
                      onChange={(e) => setFormData(prev => ({ ...prev, sinking_fund_idr: toNumber(e.target.value) }))}
                      className="ledger-input"
                    />
                    {errors.sinking_fund_idr && <p className="ledger-error">{errors.sinking_fund_idr}</p>}
                  </div>
                  <div>
                    <label className="ledger-label">Fitout</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.fitout_idr}
                      onChange={(e) => setFormData(prev => ({ ...prev, fitout_idr: toNumber(e.target.value) }))}
                      className="ledger-input"
                    />
                    {errors.fitout_idr && <p className="ledger-error">{errors.fitout_idr}</p>}
                  </div>
                  <div>
                    <label className="ledger-label">Service Charge</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.service_charge_idr}
                      onChange={(e) => setFormData(prev => ({ ...prev, service_charge_idr: toNumber(e.target.value) }))}
                      className="ledger-input"
                    />
                    {errors.service_charge_idr && <p className="ledger-error">{errors.service_charge_idr}</p>}
                  </div>
                  <div>
                    <label className="ledger-label">PPN Service Charge</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.ppn_service_charge_idr}
                      onChange={(e) => setFormData(prev => ({ ...prev, ppn_service_charge_idr: toNumber(e.target.value) }))}
                      className="ledger-input"
                    />
                    {errors.ppn_service_charge_idr && <p className="ledger-error">{errors.ppn_service_charge_idr}</p>}
                  </div>
                </div>
                <div className="ledger-total-row">
                  <span className="ledger-label">Service Charge Subtotal</span>
                  <CurrencyDisplay amount={serviceChargeTotal} currency="IDR" className="ledger-font-mono text-warm-gray-800" size="sm" />
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-warm-gray-200/80 bg-white/70 shadow-sm">
            <button
              type="button"
              onClick={() => setShowElectricity(v => !v)}
              className="w-full px-4 py-3 flex items-center justify-between text-left"
            >
              <div>
                <p className="ledger-font-display text-lg text-warm-gray-800">Electricity</p>
                <p className="text-xs text-warm-gray-500">Usage and charges</p>
              </div>
              <span className="text-warm-gray-500 text-lg">{showElectricity ? '−' : '+'}</span>
            </button>
            {showElectricity && (
              <div className="px-4 pb-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="ledger-label">Usage (kWh)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.electric_kwh ?? ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, electric_kwh: toNullableNumber(e.target.value) }))}
                      className="ledger-input"
                    />
                    {errors.electric_kwh && <p className="ledger-error">{errors.electric_kwh}</p>}
                  </div>
                  <div>
                    <label className="ledger-label">Tariff per kWh</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.electric_tarif_per_kwh ?? ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, electric_tarif_per_kwh: toNullableNumber(e.target.value) }))}
                      className="ledger-input"
                    />
                    {errors.electric_tarif_per_kwh && <p className="ledger-error">{errors.electric_tarif_per_kwh}</p>}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="ledger-label">Usage Cost</label>
                    <button
                      type="button"
                      onClick={() => setElectricUsageOverride(v => !v)}
                      className="text-xs uppercase tracking-[0.2em] text-warm-gray-500 hover:text-warm-gray-700"
                    >
                      {electricUsageOverride ? 'Override on' : 'Auto'}
                    </button>
                  </div>
                  <input
                    type="number"
                    step="1"
                    value={electricUsageOverride ? formData.electric_usage_idr : roundIdr(computedElectricUsage)}
                    onChange={(e) => setFormData(prev => ({ ...prev, electric_usage_idr: toNumber(e.target.value) }))}
                    className="ledger-input"
                    readOnly={!electricUsageOverride}
                  />
                  {errors.electric_usage_idr && <p className="ledger-error">{errors.electric_usage_idr}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="ledger-label">PPN</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.electric_ppn_idr}
                      onChange={(e) => setFormData(prev => ({ ...prev, electric_ppn_idr: toNumber(e.target.value) }))}
                      className="ledger-input"
                    />
                    {errors.electric_ppn_idr && <p className="ledger-error">{errors.electric_ppn_idr}</p>}
                  </div>
                  <div>
                    <label className="ledger-label">Area Bersama</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.electric_area_bersama_idr}
                      onChange={(e) => setFormData(prev => ({ ...prev, electric_area_bersama_idr: toNumber(e.target.value) }))}
                      className="ledger-input"
                    />
                    {errors.electric_area_bersama_idr && <p className="ledger-error">{errors.electric_area_bersama_idr}</p>}
                  </div>
                  <div>
                    <label className="ledger-label">PJU</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.electric_pju_idr}
                      onChange={(e) => setFormData(prev => ({ ...prev, electric_pju_idr: toNumber(e.target.value) }))}
                      className="ledger-input"
                    />
                    {errors.electric_pju_idr && <p className="ledger-error">{errors.electric_pju_idr}</p>}
                  </div>
                </div>
                <div className="ledger-total-row">
                  <span className="ledger-label">Electricity Subtotal</span>
                  <CurrencyDisplay amount={electricTotal} currency="IDR" className="ledger-font-mono text-warm-gray-800" size="sm" />
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-warm-gray-200/80 bg-white/70 shadow-sm">
            <button
              type="button"
              onClick={() => setShowWater(v => !v)}
              className="w-full px-4 py-3 flex items-center justify-between text-left"
            >
              <div>
                <p className="ledger-font-display text-lg text-warm-gray-800">Water</p>
                <p className="text-xs text-warm-gray-500">Potable + non-potable</p>
              </div>
              <span className="text-warm-gray-500 text-lg">{showWater ? '−' : '+'}</span>
            </button>
            {showWater && (
              <div className="px-4 pb-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="ledger-label">Usage (m³)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.water_m3 ?? ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, water_m3: toNullableNumber(e.target.value) }))}
                      className="ledger-input"
                    />
                    {errors.water_m3 && <p className="ledger-error">{errors.water_m3}</p>}
                  </div>
                  <div>
                    <label className="ledger-label">Tariff per m³</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.water_tarif_per_m3 ?? ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, water_tarif_per_m3: toNullableNumber(e.target.value) }))}
                      className="ledger-input"
                    />
                    {errors.water_tarif_per_m3 && <p className="ledger-error">{errors.water_tarif_per_m3}</p>}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="ledger-label">Usage Cost (Potable)</label>
                    <button
                      type="button"
                      onClick={() => setWaterUsageOverride(v => !v)}
                      className="text-xs uppercase tracking-[0.2em] text-warm-gray-500 hover:text-warm-gray-700"
                    >
                      {waterUsageOverride ? 'Override on' : 'Auto'}
                    </button>
                  </div>
                  <input
                    type="number"
                    step="1"
                    value={waterUsageOverride ? formData.water_usage_potable_idr : roundIdr(computedWaterUsage)}
                    onChange={(e) => setFormData(prev => ({ ...prev, water_usage_potable_idr: toNumber(e.target.value) }))}
                    className="ledger-input"
                    readOnly={!waterUsageOverride}
                  />
                  {errors.water_usage_potable_idr && <p className="ledger-error">{errors.water_usage_potable_idr}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="ledger-label">Usage (Non-potable)</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.water_non_potable_idr}
                      onChange={(e) => setFormData(prev => ({ ...prev, water_non_potable_idr: toNumber(e.target.value) }))}
                      className="ledger-input"
                    />
                    {errors.water_non_potable_idr && <p className="ledger-error">{errors.water_non_potable_idr}</p>}
                  </div>
                  <div>
                    <label className="ledger-label">Air Limbah</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.water_air_limbah_idr}
                      onChange={(e) => setFormData(prev => ({ ...prev, water_air_limbah_idr: toNumber(e.target.value) }))}
                      className="ledger-input"
                    />
                    {errors.water_air_limbah_idr && <p className="ledger-error">{errors.water_air_limbah_idr}</p>}
                  </div>
                  <div>
                    <label className="ledger-label">PPN Air Limbah</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.water_ppn_air_limbah_idr}
                      onChange={(e) => setFormData(prev => ({ ...prev, water_ppn_air_limbah_idr: toNumber(e.target.value) }))}
                      className="ledger-input"
                    />
                    {errors.water_ppn_air_limbah_idr && <p className="ledger-error">{errors.water_ppn_air_limbah_idr}</p>}
                  </div>
                  <div>
                    <label className="ledger-label">Pemeliharaan</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.water_pemeliharaan_idr}
                      onChange={(e) => setFormData(prev => ({ ...prev, water_pemeliharaan_idr: toNumber(e.target.value) }))}
                      className="ledger-input"
                    />
                    {errors.water_pemeliharaan_idr && <p className="ledger-error">{errors.water_pemeliharaan_idr}</p>}
                  </div>
                  <div>
                    <label className="ledger-label">Area Bersama</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.water_area_bersama_idr}
                      onChange={(e) => setFormData(prev => ({ ...prev, water_area_bersama_idr: toNumber(e.target.value) }))}
                      className="ledger-input"
                    />
                    {errors.water_area_bersama_idr && <p className="ledger-error">{errors.water_area_bersama_idr}</p>}
                  </div>
                </div>
                <div className="ledger-total-row">
                  <span className="ledger-label">Water Subtotal</span>
                  <CurrencyDisplay amount={waterTotal} currency="IDR" className="ledger-font-mono text-warm-gray-800" size="sm" />
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-warm-gray-200/80 bg-white/80 px-4 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="ledger-font-display text-lg text-warm-gray-800">Grand Total</p>
                <p className="text-xs text-warm-gray-500">Auto-calculated on save</p>
              </div>
              <CurrencyDisplay amount={grandTotal} currency="IDR" className="ledger-font-mono text-warm-gray-900 text-lg" size="lg" />
            </div>
          </section>
        </form>

        <div className="border-t border-warm-gray-200/80 px-6 py-4 bg-white/90 flex items-center justify-between">
          {mode === 'edit' ? (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-semibold text-red-700 border border-red-200 rounded-lg hover:bg-red-50"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          ) : (
            <div className="text-xs text-warm-gray-500">
              {hasCopySource ? 'Copied from last period and advanced.' : 'Start with a blank ledger for this month.'}
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-warm-gray-600 border border-warm-gray-300 rounded-lg hover:bg-warm-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg shadow-modern hover:bg-primary-700"
              disabled={upsertMutation.isPending}
            >
              {upsertMutation.isPending ? 'Saving...' : 'Save Rent'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentExpenseFormDrawer;
