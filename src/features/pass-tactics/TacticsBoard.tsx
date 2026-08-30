import { cellId as cellIdOf, parseCellId } from "../../domain/grid";
import type { PassLane, PlayerToken, TacticsState } from "../../domain/types";

const CELL = 64;
const MARGIN = 36;
const COLUMNS = 7;
const ROWS = 5;
const WIDTH = MARGIN * 2 + COLUMNS * CELL;
const HEIGHT = MARGIN * 2 + ROWS * CELL;

interface TacticsBoardProps {
  readonly state: TacticsState;
  /** 이 단계에서 누를 수 있는 선수(관찰·수비 찾기). 없으면 토큰은 표시 전용이다. */
  readonly selectablePlayerIds?: readonly string[];
  readonly selectedPlayerId?: string | null;
  readonly onPlayerSelect?: (playerId: string) => void;
  readonly targetCellIds?: readonly string[];
  readonly selectedCellId?: string | null;
  readonly onCellSelect?: (cellId: string) => void;
  /** 판정·공개 이후 단계에서 열림/막힘을 함께 그린다. 선택 전에는 상태를 보여 주지 않는다. */
  readonly showLaneStatus?: boolean;
}

function centerOf(column: number, row: number): { x: number; y: number } {
  return { x: MARGIN + column * CELL + CELL / 2, y: MARGIN + row * CELL + CELL / 2 };
}

export function TacticsBoard({
  state,
  selectablePlayerIds,
  selectedPlayerId,
  onPlayerSelect,
  targetCellIds,
  selectedCellId,
  onCellSelect,
  showLaneStatus = false,
}: TacticsBoardProps) {
  const playersById = new Map(state.players.map((player) => [player.id, player]));

  return (
    <svg
      className="tactics-board"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="group"
      aria-label="전술 경기판 7칸 곱하기 5칸"
    >
      <rect
        x={MARGIN}
        y={MARGIN}
        width={COLUMNS * CELL}
        height={ROWS * CELL}
        rx={10}
        className="board-bg"
      />
      {Array.from({ length: COLUMNS - 1 }, (_, index) => (
        <line
          key={`v-${index}`}
          x1={MARGIN + (index + 1) * CELL}
          y1={MARGIN}
          x2={MARGIN + (index + 1) * CELL}
          y2={MARGIN + ROWS * CELL}
          className="grid-line"
        />
      ))}
      {Array.from({ length: ROWS - 1 }, (_, index) => (
        <line
          key={`h-${index}`}
          x1={MARGIN}
          y1={MARGIN + (index + 1) * CELL}
          x2={MARGIN + COLUMNS * CELL}
          y2={MARGIN + (index + 1) * CELL}
          className="grid-line"
        />
      ))}
      {Array.from({ length: COLUMNS }, (_, index) => (
        <text
          key={`c-${index}`}
          x={MARGIN + index * CELL + CELL / 2}
          y={MARGIN - 10}
          textAnchor="middle"
          className="coord-label"
        >
          c{index}
        </text>
      ))}
      {Array.from({ length: ROWS }, (_, index) => (
        <text
          key={`r-${index}`}
          x={MARGIN - 22}
          y={MARGIN + index * CELL + CELL / 2 + 4}
          textAnchor="middle"
          className="coord-label"
        >
          r{index}
        </text>
      ))}

      {state.lanes.map((lane) => {
        const from = playersById.get(lane.fromPlayerId);
        const to = playersById.get(lane.toPlayerId);
        if (!from || !to) return null;
        return (
          <LaneLine key={lane.id} lane={lane} from={from} to={to} showStatus={showLaneStatus} />
        );
      })}

      {targetCellIds?.map((cellId) => (
        <TargetCell
          key={cellId}
          cellId={cellId}
          selected={selectedCellId === cellId}
          onSelect={onCellSelect}
        />
      ))}

      {state.players.map((player) => (
        <PlayerTokenShape
          key={player.id}
          player={player}
          selectable={selectablePlayerIds?.includes(player.id) ?? false}
          selected={selectedPlayerId === player.id}
          onSelect={onPlayerSelect}
        />
      ))}
    </svg>
  );
}

interface LaneLineProps {
  readonly lane: PassLane;
  readonly from: PlayerToken;
  readonly to: PlayerToken;
  readonly showStatus: boolean;
}

function LaneLine({ lane, from, to, showStatus }: LaneLineProps) {
  const a = centerOf(from.cell.column, from.cell.row);
  const b = centerOf(to.cell.column, to.cell.row);
  const open = lane.blockedByPlayerIds.length === 0;
  const className = !showStatus ? "lane" : open ? "lane lane--open" : "lane lane--blocked";
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;

  return (
    <g>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={className} />
      <title>{`${from.roleLabel}에서 ${to.roleLabel}로 가는 패스 길`}</title>
      {showStatus ? (
        <text
          x={midX}
          y={midY - 8}
          textAnchor="middle"
          className={open ? "lane__tag lane__tag--open" : "lane__tag lane__tag--blocked"}
        >
          {open ? "열림" : "막힘"}
        </text>
      ) : null}
    </g>
  );
}

interface TargetCellProps {
  readonly cellId: string;
  readonly selected: boolean;
  readonly onSelect?: (cellId: string) => void;
}

function TargetCell({ cellId, selected, onSelect }: TargetCellProps) {
  const cell = parseCellId(cellId);
  if (!cell || !onSelect) {
    return null;
  }
  const x = MARGIN + cell.column * CELL;
  const y = MARGIN + cell.row * CELL;

  return (
    <g
      role="button"
      tabIndex={0}
      aria-pressed={selected ? "true" : "false"}
      aria-label={`빈 칸 ${cellId}`}
      className="target-cell"
      onClick={() => onSelect(cellId)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(cellId);
        }
      }}
    >
      <rect
        x={x - 16}
        y={y - 16}
        width={CELL + 32}
        height={CELL + 32}
        className="target-cell__hit-area"
        aria-hidden="true"
      />
      <rect
        x={x + 5}
        y={y + 5}
        width={CELL - 10}
        height={CELL - 10}
        rx={9}
        className={selected ? "target-cell__rect is-selected" : "target-cell__rect"}
      />
      <text x={x + CELL / 2} y={y + CELL / 2 + 5} textAnchor="middle" className="target-cell__label">
        {cellId}
      </text>
    </g>
  );
}

interface PlayerTokenShapeProps {
  readonly player: PlayerToken;
  readonly selectable: boolean;
  readonly selected: boolean;
  readonly onSelect?: (playerId: string) => void;
}

function PlayerTokenShape({ player, selectable, selected, onSelect }: PlayerTokenShapeProps) {
  const { x, y } = centerOf(player.cell.column, player.cell.row);
  const tokenClass = (base: string) =>
    selected ? `${base} is-selected` : base;

  const shape =
    player.team === "attack" ? (
      <circle cx={x} cy={y} r={22} className={tokenClass("token token--attack")} />
    ) : (
      <polygon
        points={`${x},${y - 24} ${x + 23},${y + 17} ${x - 23},${y + 17}`}
        className={tokenClass("token token--defense")}
      />
    );

  const inner = (
    <>
      {shape}
      <text x={x} y={y + 5} textAnchor="middle" className="token__label">
        {player.roleLabel}
      </text>
      {player.hasBall ? (
        <g aria-hidden="true">
          <circle cx={x + 21} cy={y - 21} r={9} className="ball" />
          <path
            d={`M ${x + 21} ${y - 26} l 4.5 3.3 -1.7 5.3 h -5.6 l -1.7 -5.3 z`}
            className="ball__dot"
          />
        </g>
      ) : null}
    </>
  );

  if (!selectable || !onSelect) {
    return (
      <g className="token-group" aria-hidden="true">
        {inner}
      </g>
    );
  }

  return (
    <g
      role="button"
      tabIndex={0}
      aria-pressed={selected ? "true" : "false"}
      aria-label={playerLabel(player)}
      className="token-group token-group--interactive"
      onClick={() => onSelect(player.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(player.id);
        }
      }}
    >
      <circle cx={x} cy={y} r={48} className="token-hit-area" aria-hidden="true" />
      {inner}
    </g>
  );
}

function playerLabel(player: PlayerToken): string {
  const side = player.team === "attack" ? "선수" : "수비";
  return `${side} ${player.roleLabel}, ${cellIdOf(player.cell)}${player.hasBall ? ", 공 보유" : ""}`;
}
