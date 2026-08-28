import type { GridCell } from "./types";

export const GRID_COLUMNS = 7;
export const GRID_ROWS = 5;

/** 셀 ID는 c{column}r{row}이며 왼쪽 위가 c0r0이다. */
export function cellIdOf(column: number, row: number): string {
  return `c${column}r${row}`;
}

export function cellId(cell: GridCell): string {
  return cellIdOf(cell.column, cell.row);
}

export function parseCellId(id: string): GridCell | null {
  const match = /^c([0-6])r([0-4])$/.exec(id);
  if (!match) return null;
  return { column: Number(match[1]) as GridCell["column"], row: Number(match[2]) as GridCell["row"] };
}

export function isInsideGrid(cell: GridCell): boolean {
  return cell.column >= 0 && cell.column < GRID_COLUMNS && cell.row >= 0 && cell.row < GRID_ROWS;
}

/** 왕복 거리(8방향 기준). 한 칸 이동 판정에 사용한다. */
export function cellDistance(a: GridCell, b: GridCell): number {
  return Math.max(Math.abs(a.column - b.column), Math.abs(a.row - b.row));
}
