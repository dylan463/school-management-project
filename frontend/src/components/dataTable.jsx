/**
 * @typedef {Object} Column
 * @property {string} key          - Clé correspondant à une propriété de l'objet data
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
 *
 * @example
 * // Sélection multiple avec callback
 * <DataTable
 *   data={data}
 *   columns={columns}
 *   selectionMode="multiple"
 *   onSelectionChange={(selectedRows) => console.log(selectedRows)}
 * />
 *
 * // Sélection simple avec callback
 * <DataTable
 *   data={data}
 *   columns={columns}
 *   selectionMode="single"
 *   onSelectionChange={([row]) => console.log(row)}
 * />
 */

import { useState, useEffect, useRef } from "react";

export default function DataTable({
  data,
  columns,
  actions = [],
  selectionMode = false,
  onSelectionChange,
}) {
  const [openRowId, setOpenRowId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Notifie le parent à chaque changement de sélection
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
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-200">
        <TableHeader
          columns={columns}
          hasActions={actions.length > 0}
          selectionMode={selectionMode}
          allSelected={allSelected}
          someSelected={someSelected}
          onToggleAll={handleToggleAll}
        />
        <tbody>
          {data.map((row) => (
            <TableRow
              key={row.id}
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

  // État indeterminate sur la checkbox "tout cocher"
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  return (
    <thead>
      <tr className="bg-gray-100">
        {selectionMode === "multiple" && (
          <th className="border p-2 w-10">
            <input
              ref={checkboxRef}
              type="checkbox"
              checked={allSelected}
              onChange={(e) => onToggleAll(e.target.checked)}
            />
          </th>
        )}
        {selectionMode === "single" && <th className="border p-2 w-10" />}
        {columns.map((column) => (
          <th key={String(column.key)} className="border p-2">
            {column.header}
          </th>
        ))}
        {hasActions && <th className="border p-2 w-16">Actions</th>}
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
      className={`hover:bg-gray-50 ${selected ? "bg-blue-50" : ""}`}
      onClick={selectionMode ? onToggle : undefined}
      style={selectionMode ? { cursor: "pointer" } : undefined}
    >
      {selectionMode === "multiple" && (
        <td className="border p-2 text-center" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
          />
        </td>
      )}
      {selectionMode === "single" && (
        <td className="border p-2 text-center" onClick={(e) => e.stopPropagation()}>
          <input
            type="radio"
            checked={selected}
            onChange={onToggle}
          />
        </td>
      )}
      {columns.map((column) => (
        <TableCell
          key={String(column.key)}
          value={row[column.key]}
          render={column.render}
        />
      ))}
      {actions.length > 0 && (
        <td className="border p-2 text-center" onClick={(e) => e.stopPropagation()}>
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
    <td className="border p-2">{render ? render(value) : String(value)}</td>
  );
}

function ActionMenu({ actions, row, openRowId, setOpenRowId }) {
  const isOpen = openRowId === row.id;
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenRowId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setOpenRowId]);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setOpenRowId(isOpen ? null : row.id)}
        className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-sm"
      >
        ⋯
      </button>
      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 min-w-max rounded border border-gray-200 bg-white shadow-lg">
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
        </div>
      )}
    </div>
  );
}