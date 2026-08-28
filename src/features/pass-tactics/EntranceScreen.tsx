import type { RefObject } from "react";
import { ActionButton } from "../../components/ActionButton";
import { UpdateHistoryButton } from "../../components/UpdateHistoryButton";
import { missions } from "../../content/missions";

interface EntranceScreenProps {
  readonly onStart: () => void;
  readonly headingRef: RefObject<HTMLHeadingElement>;
}

export function EntranceScreen({ onStart, headingRef }: EntranceScreenProps) {
  return (
    <section className="entrance" aria-labelledby="entrance-heading">
      <h1 id="entrance-heading" ref={headingRef} tabIndex={-1}>
        빈 공간 패스 전술판
      </h1>
      <p className="entrance__goal">
        수비가 막지 않은 <strong>패스 길</strong>과 패스 뒤 <strong>지원 위치</strong>를 찾고, 선택을
        공간 근거로 설명하는 체육 전술 학습이에요.
      </p>

      <div className="entrance__panel">
        <h2>이렇게 배워요</h2>
        <ol className="entrance__missions">
          {missions.map((mission) => (
            <li key={mission.id}>{mission.flow.title}</li>
          ))}
        </ol>
        <dl className="entrance__meta">
          <div>
            <dt>대상</dt>
            <dd>초등 3~6학년 · 체육</dd>
          </div>
          <div>
            <dt>예상 시간</dt>
            <dd>15~25분</dd>
          </div>
        </dl>
      </div>

      <div className="entrance__notices">
        <p>이 앱은 여러분의 응답을 저장하지 않아요. 새로고침하면 응답이 사라져요.</p>
        <p>이 앱은 연습용 모형이에요. 실제 경기 실력을 평가하지 않아요.</p>
      </div>

      <div className="entrance__actions">
        <ActionButton variant="primary" className="entrance__start" onClick={onStart}>
          학습 시작하기
        </ActionButton>
        <UpdateHistoryButton />
      </div>
    </section>
  );
}
