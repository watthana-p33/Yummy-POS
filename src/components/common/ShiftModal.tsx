import React, { useState, useEffect } from 'react';
import { Dialog } from '@mui/material';
import { usePos } from '../../context/PosContext';
import { PosInput } from './PosInput';
import { Lock, Unlock, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ShiftModalProps {
  isOpen: boolean;
  mode: 'open' | 'close';
  onClose: () => void;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, mode, onClose }) => {
  const { currentShift, openShift, closeShift, themeMode, t } = usePos();
  const isDark = themeMode === 'dark';

  // Open Shift Form State
  const [startingCash, setStartingCash] = useState<string>('1000');
  const [openNotes, setOpenNotes] = useState<string>(t.shifts.defaultOpenNotes);

  // Close Shift Form State
  const expectedCashInDrawer = currentShift
    ? currentShift.startingCash + currentShift.totalSales
    : 0;

  const [endingCash, setEndingCash] = useState<string>('');
  const [closeNotes, setCloseNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      if (mode === 'close' && currentShift) {
        setEndingCash(String(expectedCashInDrawer));
        setCloseNotes('');
      } else if (mode === 'open') {
        setStartingCash('1000');
        setOpenNotes(t.shifts.defaultOpenNotes);
      }
    }
  }, [isOpen, mode, currentShift, expectedCashInDrawer, t]);

  if (!isOpen) return null;

  const handleOpenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cash = parseFloat(startingCash);
    if (isNaN(cash) || cash < 0) {
      setErrorMsg(t.shifts.errorStartingCash);
      return;
    }
    openShift(cash, openNotes);
    onClose();
  };

  const handleCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cash = parseFloat(endingCash);
    if (isNaN(cash) || cash < 0) {
      setErrorMsg(t.shifts.errorActualCash);
      return;
    }
    closeShift(cash, closeNotes);
    onClose();
  };

  const parsedEndingCash = parseFloat(endingCash) || 0;
  const cashDifference = parsedEndingCash - expectedCashInDrawer;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(10px)',
            backgroundColor: isDark ? 'rgba(5, 7, 12, 0.65)' : 'rgba(15, 23, 42, 0.35)',
          },
        },
        paper: {
          elevation: 0,
          sx: {
            borderRadius: '28px',
            overflow: 'hidden',
            backgroundColor: isDark ? '#151922' : '#ffffff',
            backgroundImage: 'none',
          },
        },
      }}
    >
      <div
        className={`w-full transition-colors duration-200 ${
          isDark ? 'text-white' : 'text-slate-800'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-6 border-b flex items-center justify-between backdrop-blur-md ${
            mode === 'open'
              ? isDark
                ? 'bg-primary-light/30 border-white/[0.06]'
                : 'bg-primary-light/50 border-primary-border/60'
              : isDark
                ? 'bg-[#3b2420]/40 border-white/[0.06]'
                : 'bg-[#faebe7]/60 border-[#f4c7be]/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-[0_4px_14px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.45)] ${
                mode === 'open' ? 'bg-primary' : 'bg-[#e58a74]'
              }`}
            >
              {mode === 'open' ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {mode === 'open' ? t.staff.openShiftBtn : t.staff.closeShiftBtn}
              </h2>
              <p
                className={`text-xs ${
                  mode === 'open'
                    ? isDark
                      ? 'text-[#7eb99d]'
                      : 'text-[#387258]'
                    : isDark
                    ? 'text-[#f4a28c]'
                    : 'text-[#c8634c]'
                }`}
              >
                {mode === 'open'
                  ? t.shifts.openModalDesc
                  : t.shifts.closeModalDesc}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-white/10'
                : 'text-slate-500 hover:text-slate-800 hover:bg-black/5'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'open' ? (
            /* OPEN SHIFT FORM */
            <form onSubmit={handleOpenSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {t.staff.startingCash} ({t.common.baht}) *
                </label>
                <PosInput
                  type="number"
                  value={startingCash}
                  onChange={(e) => setStartingCash(e.target.value)}
                  placeholder="1000"
                  required
                />
                <div className="flex gap-2 mt-2">
                  {['500', '1000', '2000'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setStartingCash(preset)}
                      className={`px-3 py-1 text-xs rounded-xl border transition cursor-pointer font-medium ${
                        startingCash === preset
                          ? 'bg-[#5b8a72] text-white border-[#5b8a72]'
                          : isDark
                          ? 'bg-[#232936] text-slate-300 border-[rgba(255,255,255,0.08)] hover:bg-[#2e3747]'
                          : 'bg-[#f5f4ef] text-slate-700 border-[#ebe7df] hover:bg-[#eae7df]'
                      }`}
                    >
                      ฿{Number(preset).toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {t.shifts.openNotes}
                </label>
                <PosInput
                  type="text"
                  value={openNotes}
                  onChange={(e) => setOpenNotes(e.target.value)}
                  placeholder={t.shifts.openNotesPlaceholder}
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-[#ebe7df] dark:border-[rgba(255,255,255,0.08)]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#5b8a72] hover:bg-[#4d7863] text-white transition cursor-pointer shadow-xs flex items-center gap-2 active:scale-95"
                >
                  <Unlock className="w-4 h-4" />
                  <span>{t.shifts.confirmOpenBtn}</span>
                </button>
              </div>
            </form>
          ) : (
            /* CLOSE SHIFT FORM */
            <form onSubmit={handleCloseSubmit} className="space-y-5">
              {currentShift && (
                <div
                  className={`p-4 rounded-2xl border space-y-2.5 ${
                    isDark
                      ? 'bg-[#232936] border-[rgba(255,255,255,0.06)]'
                      : 'bg-[#fbfbf9] border-[#ebe7df]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-[#ebe7df]/60 dark:border-[rgba(255,255,255,0.06)]">
                    <span className="text-slate-500 dark:text-slate-400">{t.shifts.shiftBy}:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {currentShift.cashierName}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">{t.shifts.startingCash}:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        ฿{currentShift.startingCash.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">{t.shifts.shiftSales}:</span>
                      <span className="font-bold text-[#387258] dark:text-[#7eb99d] text-sm">
                        ฿{currentShift.totalSales.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#ebe7df]/60 dark:border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {t.staff.expectedCash}:
                    </span>
                    <span className="text-base font-extrabold text-[#5b8a72] dark:text-[#7eb99d]">
                      ฿{expectedCashInDrawer.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.staff.actualCash} ({t.common.baht}) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setEndingCash(String(expectedCashInDrawer))}
                    className="text-[11px] font-semibold text-[#5b8a72] dark:text-[#7eb99d] hover:underline cursor-pointer"
                  >
                    {t.shifts.useExpectedCash}
                  </button>
                </div>
                <PosInput
                  type="number"
                  value={endingCash}
                  onChange={(e) => setEndingCash(e.target.value)}
                  placeholder={t.shifts.actualCashPlaceholder}
                  required
                />

                {endingCash !== '' && (
                  <div className="mt-2 text-xs font-semibold flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400">{t.shifts.cashDifference}:</span>
                    {cashDifference === 0 ? (
                      <span className="text-[#387258] dark:text-[#7eb99d] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t.shifts.cashBalanced}
                      </span>
                    ) : cashDifference > 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {t.shifts.cashOver} +฿{cashDifference.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-red-500 dark:text-red-400">
                        {t.shifts.cashShort} ฿{cashDifference.toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {t.shifts.closeNotes}
                </label>
                <PosInput
                  type="text"
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  placeholder={t.shifts.closeNotesPlaceholder}
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-[#ebe7df] dark:border-[rgba(255,255,255,0.08)]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#e58a74] hover:bg-[#d67963] text-white transition cursor-pointer shadow-xs flex items-center gap-2 active:scale-95"
                >
                  <Lock className="w-4 h-4" />
                  <span>{t.shifts.confirmCloseBtn}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Dialog>
  );
};
