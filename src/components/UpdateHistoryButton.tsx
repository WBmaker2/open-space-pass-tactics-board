import { useState } from "react";
import { UpdateHistoryDialog } from "./UpdateHistoryDialog";

/** 헤더의 작은 버튼. 모든 단계에서 열 수 있고 닫으면 원래 초점으로 돌아간다. */
export function UpdateHistoryButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="update-history-button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        업데이트 내역
      </button>
      {open ? <UpdateHistoryDialog onClose={() => setOpen(false)} /> : null}
    </>
  );
}
