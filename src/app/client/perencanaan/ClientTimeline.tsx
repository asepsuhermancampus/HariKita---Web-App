"use client";

import React, { useMemo, useState, useTransition } from "react";
import { CalendarClock, Check, Plus, RotateCcw, Trash2 } from "lucide-react";
import { DashCard, DashTable, DashBadge, type DashColumn } from "@/components/dashboard";
import {
  togglePlannerTask,
  deletePlannerTask,
  addPlannerTask,
  resetTimelineToDefault,
} from "@/server/actions/wedding-planner";

interface Task {
  id: string; stage: number; taskText: string; pic: string | null;
  priority: string; note: string | null; isDone: boolean; isCustom: boolean;
}

export const STAGE_LABEL: Record<number, string> = {
  1: "1 Thn Sebelum", 2: "6 Bln Sebelum", 3: "3 Bln Sebelum", 4: "1 Bln Sebelum",
  5: "2 Mgg Sebelum", 6: "H-3 Hari", 7: "Hari H",
};

export function ClientTimeline({ tasks, timelinePct }: { tasks: Task[]; timelinePct: number }) {
  const [filterStage, setFilterStage] = useState<number>(0);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () => (filterStage === 0 ? tasks : tasks.filter((t) => t.stage === filterStage)),
    [tasks, filterStage]
  );
  const doneCount = tasks.filter((t) => t.isDone).length;

  const columns: DashColumn[] = [
    { key: "done", header: "Status", className: "w-14 text-center" },
    { key: "stage", header: "Tahapan" },
    { key: "task", header: "Tugas & Milestone" },
    { key: "pic", header: "PIC", className: "hidden sm:table-cell" },
    { key: "prio", header: "Prioritas", className: "hidden md:table-cell" },
    { key: "act", header: "", className: "w-12" },
  ];

  const onToggle = (id: string, isDone: boolean) =>
    startTransition(() => {
      void togglePlannerTask(id, isDone);
    });

  const onDelete = (id: string) => startTransition(() => void deletePlannerTask(id));
  const onReset = () => {
    if (confirm("Kembalikan timeline ke pengaturan awal?"))
      startTransition(() => void resetTimelineToDefault());
  };

  return (
    <div className="flex flex-col gap-5">
      <DashCard>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterStage(0)}
            className={`min-h-11 rounded-full px-4 py-2 font-manrope text-xs font-semibold transition-colors ${
              filterStage === 0 ? "bg-hk-charcoal text-white" : "border border-hk-champagne/60 text-hk-charcoal"
            }`}
          >
            Semua Tahap
          </button>
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStage(s)}
              className={`min-h-11 rounded-full px-4 py-2 font-manrope text-xs font-semibold transition-colors ${
                filterStage === s ? "bg-hk-charcoal text-white" : "border border-hk-champagne/60 text-hk-charcoal"
              }`}
            >
              Tahap {s}
            </button>
          ))}
          <span className="ml-auto flex items-center gap-2 font-manrope text-xs text-hk-charcoal/70">
            <CalendarClock className="h-4 w-4 text-hk-taupe" />
            {doneCount}/{tasks.length} selesai • {timelinePct}%
          </span>
          <button
            onClick={onReset}
            className="min-h-11 rounded-full border border-hk-champagne/60 px-4 py-2 font-manrope text-xs text-hk-charcoal"
          >
            <RotateCcw className="mr-1 inline h-3.5 w-3.5" /> Reset
          </button>
        </div>
      </DashCard>

      <DashCard>
        <DashTable
          columns={columns}
          rows={filtered}
          empty={<div className="py-8 text-center font-manrope text-sm text-hk-taupe">Belum ada tugas.</div>}
          renderRow={(t) => [
            <input
              key="d"
              type="checkbox"
              checked={t.isDone}
              disabled={isPending}
              onChange={(e) => onToggle(t.id, e.target.checked)}
              className="h-5 w-5 cursor-pointer rounded border-hk-champagne text-hk-taupe"
              aria-label={`Tandai ${t.taskText}`}
            />,
            <span key="s" className="font-manrope text-xs font-semibold text-hk-taupe">
              {t.stage === 0 ? "Custom" : `Tahap ${t.stage}: ${STAGE_LABEL[t.stage] ?? ""}`}
            </span>,
            <span key="t" className={t.isDone ? "text-sm text-hk-charcoal/50 line-through" : "text-sm font-medium text-hk-charcoal"}>
              {t.taskText}
              {t.note && <span className="block text-[11px] text-hk-taupe">{t.note}</span>}
            </span>,
            <span key="p" className="font-manrope text-xs text-hk-charcoal/70">{t.pic ?? "-"}</span>,
            <DashBadge key="pr" tone={t.priority === "Tinggi" ? "error" : "neutral"}>{t.priority}</DashBadge>,
            <button
              key="a"
              onClick={() => onDelete(t.id)}
              disabled={isPending}
              aria-label="Hapus tugas"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>,
          ]}
        />
      </DashCard>

      <AddTaskForm onAdd={(fd) => startTransition(() => void addPlannerTask(fd))} pending={isPending} />
    </div>
  );
}

function AddTaskForm({ onAdd, pending }: { onAdd: (fd: FormData) => void; pending: boolean }) {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-full bg-hk-taupe px-5 text-xs font-semibold text-white hover:bg-hk-charcoal"
      >
        <Plus className="h-3.5 w-3.5 text-hk-champagne" /> Tambah Tugas Sendiri
      </button>
    );

  return (
    <DashCard
      title="Tambah Tugas Sendiri"
      action={
        <button onClick={() => setOpen(false)} className="font-manrope text-xs text-hk-taupe">
          Tutup
        </button>
      }
    >
      <form action={onAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input name="taskText" required placeholder="Nama tugas" className="rounded-xl border border-hk-champagne/60 px-3 py-2.5 text-sm" />
        <select name="stage" className="rounded-xl border border-hk-champagne/60 px-3 py-2.5 text-sm" defaultValue={1}>
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <option key={s} value={s}>Tahap {s}: {STAGE_LABEL[s]}</option>
          ))}
        </select>
        <input name="pic" placeholder="PIC (opsional)" className="rounded-xl border border-hk-champagne/60 px-3 py-2.5 text-sm" />
        <select name="priority" className="rounded-xl border border-hk-champagne/60 px-3 py-2.5 text-sm" defaultValue="Sedang">
          <option value="Sedang">Sedang</option>
          <option value="Tinggi">Tinggi</option>
        </select>
        <input name="note" placeholder="Catatan (opsional)" className="rounded-xl border border-hk-champagne/60 px-3 py-2.5 text-sm sm:col-span-2" />
        <button type="submit" disabled={pending} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-hk-charcoal px-5 text-xs font-semibold text-white sm:col-span-2">
          <Check className="h-3.5 w-3.5 text-hk-champagne" /> Simpan Tugas
        </button>
      </form>
    </DashCard>
  );
}
