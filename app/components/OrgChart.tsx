"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Pencil, Check, Plus, GripVertical, Trash2, Loader2 } from "lucide-react";
import type { Department } from "@/app/types/crm";

// ── ユーティリティ ─────────────────────────────────────────────────

function getDescendantIds(deptId: string, all: Department[]): string[] {
  const kids = all.filter((d) => d.parent_id === deptId);
  return kids.flatMap((k) => [k.id, ...getDescendantIds(k.id, all)]);
}

function getDepth(dept: Department, all: Department[]): number {
  let depth = 0;
  let cur: Department | undefined = dept;
  while (cur?.parent_id) {
    cur = all.find((d) => d.id === cur!.parent_id);
    depth++;
  }
  return Math.min(depth, 3);
}

// ── 深さ別スタイル ─────────────────────────────────────────────────
const DEPTH_BOX = [
  "border-[#0F1B2D] bg-[#0F1B2D]",
  "border-blue-500 bg-blue-500",
  "border-teal-500 bg-teal-50",
  "border-gray-300 bg-white",
];
const DEPTH_TEXT = ["text-white", "text-white", "text-teal-800", "text-gray-800"];
const DEPTH_SUB  = ["text-[#C8FF3E]/80", "text-blue-100", "text-teal-600", "text-gray-500"];
const DEPTH_BTN  = [
  "text-white/70 border-white/30 hover:bg-white/20",
  "text-white/70 border-white/30 hover:bg-white/20",
  "text-teal-700 border-teal-400/50 hover:bg-teal-100",
  "text-[#4A5A6E] border-[#E5E1D7] hover:bg-[#F6F4EE]",
];

// ── OrgBox ─────────────────────────────────────────────────────────

interface BoxProps {
  dept: Department;
  allDepts: Department[];
  onSelect?: (dept: Department) => void;
  selectedId?: string | null;
  editMode: boolean;
  draggingIdRef: React.RefObject<string | null>;
  overTargetId: string | null;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
}

function OrgBox(props: BoxProps) {
  const {
    dept, allDepts, onSelect, selectedId,
    editMode, draggingIdRef, overTargetId,
    onDragStart, onDragOver, onDrop, onDragEnd, onAddChild, onDelete,
  } = props;

  const children  = allDepts.filter((d) => dept.children.includes(d.id));
  const isRoot    = dept.parent_id === null;
  const isSelected = !editMode && selectedId === dept.id;
  const isDragging = draggingIdRef.current === dept.id;
  const isOver    = editMode && overTargetId === dept.id && draggingIdRef.current !== dept.id;
  const depth     = getDepth(dept, allDepts);

  let boxClass: string;
  if (isOver) {
    boxClass = "border-[#C8FF3E] bg-[#C8FF3E]/10 ring-2 ring-[#C8FF3E] shadow-lg";
  } else if (isSelected) {
    boxClass = "border-[#C8FF3E] bg-[#0F1B2D] shadow-md ring-2 ring-[#C8FF3E]/50";
  } else {
    boxClass = `${DEPTH_BOX[depth]} ${!editMode ? "hover:shadow-md cursor-pointer hover:opacity-90" : ""}`;
  }

  const textClass = isOver ? "text-[#0F1B2D]" : isSelected ? "text-[#C8FF3E]" : DEPTH_TEXT[depth];
  const subClass  = isOver ? "text-[#4A5A6E]" : DEPTH_SUB[depth];

  return (
    <div className="flex flex-col items-center">
      <div
        draggable={editMode && !isRoot}
        onDragStart={(e) => { e.stopPropagation(); if (!isRoot) onDragStart(dept.id); }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onDragOver(e, dept.id); }}
        onDrop={(e) => { e.stopPropagation(); onDrop(e, dept.id); }}
        onDragEnd={onDragEnd}
        onClick={() => !editMode && onSelect?.(dept)}
        className={`relative rounded-[14px] border-2 px-4 py-3 text-center transition-all min-w-[144px] max-w-[192px] shadow-sm select-none
          ${isDragging ? "opacity-25" : ""}
          ${editMode && !isRoot ? "cursor-grab active:cursor-grabbing" : ""}
          ${boxClass}`}
      >
        {/* 本部バッジ */}
        {isRoot && !editMode && (
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] bg-[#C8FF3E] text-[#0F1B2D] px-2 py-0.5 rounded-full font-black whitespace-nowrap">
            本部
          </span>
        )}

        {/* グリップアイコン */}
        {editMode && !isRoot && (
          <GripVertical
            size={12}
            className="absolute top-2 left-1.5 opacity-40"
            style={{ color: depth <= 1 ? "white" : "#6b7280" }}
          />
        )}

        {/* 部署名 */}
        <p className={`text-xs font-bold leading-snug mb-1 ${textClass}`}>{dept.name}</p>
        {/* 人数 */}
        <p className={`text-xs ${subClass}`}>{dept.head_count > 0 ? `${dept.head_count}名` : "—"}</p>

        {/* ペインポイントバッジ */}
        {!editMode && dept.pain_points.length > 0 && (
          <div className="w-2 h-2 rounded-full bg-amber-400 absolute top-2 right-2" title="ペインポイントあり" />
        )}

        {/* 編集モードのボタン */}
        {editMode && (
          <div className="mt-2 flex flex-col gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onAddChild(dept.id); }}
              className={`w-full flex items-center justify-center gap-1 text-xs py-1 rounded border border-dashed transition-colors ${DEPTH_BTN[depth]}`}
            >
              <Plus size={10} /> 子部署
            </button>
            {!isRoot && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(dept.id); }}
                className={`w-full flex items-center justify-center gap-1 text-xs py-1 rounded border border-dashed transition-colors ${
                  depth <= 1
                    ? "text-red-300 border-red-300/40 hover:bg-red-500/20"
                    : "text-red-400 border-red-300 hover:bg-red-50"
                }`}
              >
                <Trash2 size={10} /> 削除
              </button>
            )}
          </div>
        )}
      </div>

      {/* 子ノード接続 */}
      {children.length > 0 && (
        <div className="flex flex-col items-center">
          <div className="w-px h-5 bg-gray-300" />
          <div className="flex items-start gap-6">
            {children.map((child, idx) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="flex items-center w-full justify-center">
                  <div className={`h-px bg-gray-300 flex-1 ${idx === 0 ? "invisible" : ""}`} />
                  <div className="w-px h-3 bg-gray-300" />
                  <div className={`h-px bg-gray-300 flex-1 ${idx === children.length - 1 ? "invisible" : ""}`} />
                </div>
                <OrgBox {...props} dept={child} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── OrgChart メイン ────────────────────────────────────────────────

interface OrgChartProps {
  departments: Department[];
  onSelect?: (dept: Department) => void;
  selectedId?: string | null;
  onSave?: (current: Department[], deletedIds: string[]) => Promise<void>;
}

export default function OrgChart({ departments, onSelect, selectedId, onSave }: OrgChartProps) {
  const [localDepts, setLocalDepts] = useState<Department[]>(departments);
  const [editMode, setEditMode]     = useState(false);
  const [overTargetId, setOverTargetId] = useState<string | null>(null);
  const [addingChildOf, setAddingChildOf] = useState<string | null>(null);
  const [newDeptName, setNewDeptName]     = useState("");
  const [deletedIds, setDeletedIds]       = useState<string[]>([]);
  const [saving, setSaving]               = useState(false);
  const draggingIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!editMode) setLocalDepts(departments);
  }, [departments, editMode]);

  const roots = localDepts.filter((d) => d.parent_id === null);

  // ── DnD ─────────────────────────────────────────────────────────

  const handleDragStart = useCallback((id: string) => {
    draggingIdRef.current = id;
  }, []);

  const handleDragOver = useCallback((_e: React.DragEvent, targetId: string) => {
    setOverTargetId(targetId);
  }, []);

  const handleDragEnd = useCallback(() => {
    draggingIdRef.current = null;
    setOverTargetId(null);
  }, []);

  const handleDrop = useCallback((_e: React.DragEvent, targetId: string) => {
    const draggingId = draggingIdRef.current;
    draggingIdRef.current = null;
    setOverTargetId(null);
    if (!draggingId || draggingId === targetId) return;

    setLocalDepts((prev) => {
      if (getDescendantIds(draggingId, prev).includes(targetId)) return prev;
      return prev.map((d) => {
        if (d.id === draggingId) return { ...d, parent_id: targetId };
        if (d.id === targetId) {
          return d.children.includes(draggingId)
            ? d
            : { ...d, children: [...d.children, draggingId] };
        }
        if (d.children.includes(draggingId)) {
          return { ...d, children: d.children.filter((cid) => cid !== draggingId) };
        }
        return d;
      });
    });
  }, []);

  // ── 部署追加 ─────────────────────────────────────────────────────

  const handleAddChild = useCallback((parentId: string) => {
    setAddingChildOf(parentId);
    setNewDeptName("");
  }, []);

  const handleConfirmAdd = useCallback(() => {
    if (!newDeptName.trim() || !addingChildOf) return;
    const newId = crypto.randomUUID();
    const newDept: Department = {
      id: newId,
      company_id: "",
      name: newDeptName.trim(),
      parent_id: addingChildOf,
      head_count: 0,
      location: "",
      role: "",
      pain_points: [],
      children: [],
    };
    setLocalDepts((prev) => [
      ...prev.map((d) =>
        d.id === addingChildOf ? { ...d, children: [...d.children, newId] } : d
      ),
      newDept,
    ]);
    setAddingChildOf(null);
    setNewDeptName("");
  }, [newDeptName, addingChildOf]);

  // ── 部署削除（子孫を親に引き継ぎ） ────────────────────────────────

  const handleDelete = useCallback((deptId: string) => {
    setLocalDepts((prev) => {
      const dept = prev.find((d) => d.id === deptId);
      if (!dept) return prev;
      const newParentId = dept.parent_id;
      const childIds = prev.filter((d) => d.parent_id === deptId).map((d) => d.id);

      return prev
        .filter((d) => d.id !== deptId)
        .map((d) => {
          if (childIds.includes(d.id)) return { ...d, parent_id: newParentId };
          if (d.id === newParentId) {
            return {
              ...d,
              children: [
                ...d.children.filter((cid) => cid !== deptId),
                ...childIds,
              ],
            };
          }
          return { ...d, children: d.children.filter((cid) => cid !== deptId) };
        });
    });
    setDeletedIds((prev) => [...prev, deptId]);
  }, []);

  // ── 保存 ─────────────────────────────────────────────────────────

  async function handleSave() {
    if (!onSave) { setEditMode(false); return; }
    setSaving(true);
    try {
      await onSave(localDepts, deletedIds);
      setDeletedIds([]);
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  }

  if (localDepts.length === 0) {
    return <p className="text-sm text-[#4A5A6E] py-4 text-center">部署情報がありません</p>;
  }

  const boxProps = {
    allDepts: localDepts,
    onSelect,
    selectedId,
    editMode,
    draggingIdRef,
    overTargetId,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
    onDragEnd: handleDragEnd,
    onAddChild: handleAddChild,
    onDelete: handleDelete,
  };

  return (
    <div>
      {/* 編集トグル */}
      <div className="flex justify-end mb-3">
        <button
          onClick={() => {
            if (editMode) handleSave();
            else { setEditMode(true); setDeletedIds([]); }
          }}
          disabled={saving}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold transition-colors disabled:opacity-60 ${
            editMode
              ? "bg-[#0F1B2D] text-[#C8FF3E] hover:opacity-90"
              : "border border-[#E5E1D7] text-[#4A5A6E] hover:border-[#0F1B2D] hover:text-[#0F1B2D]"
          }`}
        >
          {saving ? (
            <><Loader2 size={12} className="animate-spin" /> 保存中...</>
          ) : editMode ? (
            <><Check size={12} /> 編集完了・保存</>
          ) : (
            <><Pencil size={12} /> 編集</>
          )}
        </button>
        {editMode && (
          <button
            onClick={() => { setEditMode(false); setLocalDepts(departments); setDeletedIds([]); }}
            className="ml-2 px-3 py-1.5 rounded-[10px] border border-[#E5E1D7] text-xs font-medium text-[#4A5A6E] hover:border-[#0F1B2D] transition-colors"
          >
            キャンセル
          </button>
        )}
      </div>

      {/* 編集ヒント */}
      {editMode && (
        <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-100 rounded-[10px] text-xs text-blue-600 flex items-center gap-2">
          <GripVertical size={12} className="shrink-0" />
          ノードをドラッグして親子関係を変更　·　「子部署」で部署を追加　·　「削除」で部署を削除（子部署は上位に移動）
        </div>
      )}

      {/* 子部署追加モーダル */}
      {addingChildOf && (
        <div
          className="fixed inset-0 bg-[#0F1B2D]/40 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={() => setAddingChildOf(null)}
        >
          <div
            className="bg-white rounded-[20px] border-2 border-[#0F1B2D] shadow-[0_24px_64px_rgba(15,27,45,0.2)] p-6 w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-black text-[#0F1B2D] mb-3">
              「{localDepts.find((d) => d.id === addingChildOf)?.name}」に子部署を追加
            </p>
            <input
              type="text"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirmAdd()}
              autoFocus
              placeholder="部署名を入力…"
              className="w-full border-[1.5px] border-[#E5E1D7] rounded-[12px] px-3.5 py-2.5 text-sm text-[#0F1B2D] focus:border-[#0F1B2D] focus:outline-none focus:ring-2 focus:ring-[#0F1B2D]/10 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setAddingChildOf(null)}
                className="flex-1 rounded-[12px] border border-[#E5E1D7] py-2 text-xs font-medium text-[#4A5A6E] hover:border-[#0F1B2D] transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmAdd}
                disabled={!newDeptName.trim()}
                className="flex-1 rounded-[12px] bg-[#0F1B2D] py-2 text-xs font-bold text-[#C8FF3E] hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 組織図本体 */}
      <div className="overflow-x-auto py-6 -mx-2 px-2">
        <div className="flex gap-10 min-w-max justify-center pb-2">
          {roots.map((dept) => (
            <OrgBox key={dept.id} dept={dept} {...boxProps} />
          ))}
        </div>
      </div>
    </div>
  );
}
