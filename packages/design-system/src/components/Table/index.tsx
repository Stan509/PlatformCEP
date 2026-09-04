import type { JSX, TableHTMLAttributes, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useI18n } from '@cep/i18n';

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  accessor: (row: T) => ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  className?: string;
}

export interface TableProps<T> extends Omit<TableHTMLAttributes<HTMLTableElement>, 'children'> {
  columns: TableColumn<T>[];
  data: T[];
  keyField: (row: T) => string;
  state?: 'default' | 'loading' | 'empty' | 'error';
  loadingText?: string;
  emptyText?: string;
  errorText?: string;
  dense?: boolean;
}

/**
 * Tableau CEP — filtrable/triable/paginé côté appelant, accessible,
 * colonnes critiques toujours visibles (spec §44). États : default / loading
 * / empty / error. Textes externalisés via i18n.
 */
export function Table<T>({
  columns,
  data,
  keyField,
  state = 'default',
  loadingText,
  emptyText,
  errorText,
  dense = false,
  className,
  ...rest
}: TableProps<T>): JSX.Element {
  const { t } = useI18n();
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const rows = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return data;
    const sorted = [...data].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [data, sortKey, sortDir, columns]);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const classes = ['cep-table-wrap', className ?? ''].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <table className={['cep-table', dense ? 'cep-table--dense' : ''].filter(Boolean).join(' ')} {...rest}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.className}
                aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
              >
                {col.sortable ? (
                  <button type="button" onClick={() => toggleSort(col.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'inherit', font: 'inherit' }}>
                    {col.header}
                    {sortKey === col.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {state === 'loading' ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: 24 }}>
                <span className="cep-spinner" aria-hidden="true" />
                {' '}
                {loadingText ?? t('common.loading')}
              </td>
            </tr>
          ) : state === 'empty' ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: 32, color: 'var(--cep-color-text-secondary)' }}>
                {emptyText ?? t('common.states.empty')}
              </td>
            </tr>
          ) : state === 'error' ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: 32, color: 'var(--cep-color-danger-text)' }}>
                {errorText ?? t('common.states.errorTitle')}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={keyField(row)}>
                {columns.map((col) => (
                  <td key={col.key} className={col.className}>
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
