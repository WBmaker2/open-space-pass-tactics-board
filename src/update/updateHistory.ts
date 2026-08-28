export interface UpdateHistoryEntry {
  readonly date: string;
  readonly note: string;
}

/** 최신 항목이 앞에 온다. 실제 수정 때마다 최신 날짜를 앞에 추가한다. */
export const updateHistory: readonly UpdateHistoryEntry[] = [
  { date: "2026-08-28", note: "구현 계획 확정" },
];
