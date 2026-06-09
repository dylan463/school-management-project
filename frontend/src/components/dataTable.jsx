/**
 * @typedef {Object} Column
 * @property {string} key          - Clé correspondant à une propriété de l'objet data
 * @property {string} [id]         - (optionnel) ID unique si plusieurs colonnes utilisent la même clé
 * @property {string} header       - Titre affiché dans l'en-tête de la colonne
 * @property {function} [render]   - (optionnel) Fonction custom pour afficher la cellule : (value) => ReactNode
 */

/**
 * @typedef {Object} Action
 * @property {string} label                       - Texte affiché dans le menu
 * @property {function} handler                   - Fonction appelée au clic : (row) => void
 * @property {function} [conditionRow]            - (optionnel) Condition basée sur la ligne : (row) => boolean
 * @property {boolean|function} [conditionGlobal] - (optionnel) Condition globale : boolean ou () => boolean
 */

/**
 * @typedef {"single" | "multiple" | false} SelectionMode
 * - "single"   : une seule ligne sélectionnable à la fois (radio)
 * - "multiple" : plusieurs lignes sélectionnables (checkbox + tout cocher)
 * - false      : pas de sélection (défaut)
 */

const dummy_data = [
  { name: "rakoto", age: 24 }
];
const dummy_columns = [
  { header: "Nom", key: "name" },
  { header: "age", key: "age" }
];

import { useState, useEffect, useRef } from "react";

export default function DataTable({
  dummy = false,
  data = [],
  columns = [],
  actions = [],
  selectionMode = true,
  onSelectionChange,
  maxHeight = "400px", // ← hauteur max du tableau scrollable (prop optionnelle)
}) {
  if (dummy) {
    data = dummy_data;
    columns = dummy_columns;
  }

  const [openRowId, setOpenRowId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    if (!onSelectionChange) return;
    const selectedRows = data.filter((row) => selectedIds.has(row.id));
    onSelectionChange(selectedRows);
  }, [selectedIds]);

  function handleToggleRow(id) {
    setSelectedIds((prev) => {
      if (selectionMode === "single") {
        return prev.has(id) ? new Set() : new Set([id]);
      }
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleToggleAll(checked) {
    setSelectedIds(checked ? new Set(data.map((r) => r.id)) : new Set());
  }

  const allSelected = data.length > 0 && selectedIds.size === data.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  return (
    // ↓ Ce div contrôle le scroll vertical ; overflow-x gère le scroll horizontal
    <div
      className="overflow-auto min-h-[400px]"
      style={{ maxHeight }}
    >
      <table className="min-w-full border-collapse">
        <TableHeader
          columns={columns}
          hasActions={actions.length > 0}
          selectionMode={selectionMode}
          allSelected={allSelected}
          someSelected={someSelected}
          onToggleAll={handleToggleAll}
        />
        <tbody>
          {data.map((row,index) => (
            <TableRow
              key={row.id || index}
              row={row}
              columns={columns}
              actions={actions}
              openRowId={openRowId}
              setOpenRowId={setOpenRowId}
              selectionMode={selectionMode}
              selected={selectedIds.has(row.id)}
              onToggle={() => handleToggleRow(row.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableHeader({
  columns,
  hasActions,
  selectionMode,
  allSelected,
  someSelected,
  onToggleAll,
}) {
  const checkboxRef = useRef(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  return (
    <thead>
      {/* ↓ sticky top-0 + z-10 : l'en-tête reste visible pendant le scroll */}
      <tr className="bg-[#f5f3f4] sticky top-0 z-10">
        {selectionMode === "multiple" && (
          <th className="p-2 w-10 text-left">
            <input
              ref={checkboxRef}
              type="checkbox"
              checked={allSelected}
              onChange={(e) => onToggleAll(e.target.checked)}
            />
          </th>
        )}
        {selectionMode === "single" && <th className="p-2 w-10" />}
        {columns.map((column, index) => (
          <th key={column.id || `${String(column.key)}-${index}`} className="p-2 text-left">
            {column.header}
          </th>
        ))}
        {hasActions && <th className="p-2 w-16">Actions</th>}
      </tr>
    </thead>
  );
}

function getAvailableActions(actions, row) {
  return actions.filter((action) => {
    const rowOk =
      typeof action.conditionRow === "function"
        ? action.conditionRow(row)
        : true;
    const globalValue =
      typeof action.conditionGlobal === "function"
        ? action.conditionGlobal()
        : action.conditionGlobal;
    const globalOk = globalValue === undefined ? true : Boolean(globalValue);
    return rowOk && globalOk;
  });
}

function TableRow({
  row,
  columns,
  actions,
  openRowId,
  setOpenRowId,
  selectionMode,
  selected,
  onToggle,
}) {
  const availableActions = getAvailableActions(actions, row);

  return (
    <tr
      className={`border-b-[1px] border-b border-b-gray-200 ${selected ? "bg-red-100 hover:bg-red-200" : "hover:bg-gray-50"}`}
      onClick={selectionMode ? onToggle : undefined}
      style={selectionMode ? { cursor: "pointer" } : undefined}
    >
      {selectionMode === "multiple" && (
        <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={selected} onChange={onToggle} className="accent-red-500" />
        </td>
      )}
      {selectionMode === "single" && (
        <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
          <input type="radio" checked={selected} onChange={onToggle} className="accent-red-500" />
        </td>
      )}
      {columns.map((column, index) => (
        <TableCell
          key={column.id || `${String(column.key)}-${index}`}
          value={row[column.key]}
          render={column.render}
        />
      ))}
      {actions.length > 0 && (
        <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
          {availableActions.length > 0 && (
            <ActionMenu
              actions={availableActions}
              row={row}
              openRowId={openRowId}
              setOpenRowId={setOpenRowId}
            />
          )}
        </td>
      )}
    </tr>
  );
}

function TableCell({ value, render }) {
  return (
    <td className="p-2">{render ? render(value) : String(value)}</td>
  );
}
import { createPortal } from "react-dom";



function ActionMenu({ actions, row, openRowId, setOpenRowId }) {
  const isOpen = openRowId === row.id;
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  // Calculer la position du menu par rapport au bouton
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e) {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setOpenRowId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setOpenRowId]);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setOpenRowId(isOpen ? null : row.id)}
        className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-sm"
      >
        ⋯
      </button>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          style={{
            position: "absolute",
            top: menuPos.top,
            left: menuPos.left,
            transform: "translateX(-100%)", // aligner à droite du bouton
            zIndex: 9999,
          }}
          className="min-w-max rounded border border-gray-200 bg-white shadow-lg"
        >
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => {
                action.handler(row);
                setOpenRowId(null);
              }}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 first:rounded-t last:rounded-b"
            >
              {action.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}