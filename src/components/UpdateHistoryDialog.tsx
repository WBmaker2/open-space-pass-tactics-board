import { updateHistory } from "../update/updateHistory";
import { ModalDialog } from "./ModalDialog";

interface UpdateHistoryDialogProps {
  readonly onClose: () => void;
}

export function UpdateHistoryDialog({ onClose }: UpdateHistoryDialogProps) {
  return (
    <ModalDialog title="업데이트 내역" onClose={onClose}>
      <ul className="update-history-list">
        {updateHistory.map((entry) => (
          <li key={`${entry.date}-${entry.note}`}>
            {entry.date} — {entry.note}
          </li>
        ))}
      </ul>
    </ModalDialog>
  );
}
