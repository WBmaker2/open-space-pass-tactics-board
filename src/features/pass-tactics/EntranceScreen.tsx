import type { RefObject } from "react";
import { ActionButton } from "../../components/ActionButton";
import { UpdateHistoryButton } from "../../components/UpdateHistoryButton";
import { missions } from "../../content/missions";
import entranceArt from "../../assets/generated/bright-gym-tactics-board.webp";

interface EntranceScreenProps {
  readonly onStart: () => void;
  readonly headingRef: RefObject<HTMLHeadingElement>;
}

export function EntranceScreen({ onStart, headingRef }: EntranceScreenProps) {
  return (
    <section className="entrance" aria-labelledby="entrance-heading">
      <div className="entrance__hero">
        <div className="entrance__copy">
          <h1 id="entrance-heading" ref={headingRef} tabIndex={-1}>
            빈 공간 패스 전술판
          </h1>
          <p className="entrance__goal">
            수비가 막지 않은 <strong>패스 길</strong>과 패스 뒤 <strong>지원 위치</strong>를 찾고,
            선택을 공간 근거로 설명하는 체육 전술 학습이에요.
          </p>
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
          <div className="entrance__hero-actions">
            <ActionButton variant="primary" className="entrance__start" pulse onClick={onStart}>
              학습 시작하기
            </ActionButton>
          </div>
        </div>
        <figure className="entrance__visual">
          <img src={entranceArt} alt="" className="entrance__art" aria-hidden="true" />
          <figcaption>판을 보고, 빈 공간을 찾아요.</figcaption>
        </figure>
      </div>

      <section className="entrance__panel" aria-labelledby="entrance-path-heading">
        <div className="entrance__panel-heading">
          <div>
            <h2 id="entrance-path-heading">이렇게 배워요</h2>
            <p>한 장면씩 관찰하고, 고른 까닭을 남겨요.</p>
          </div>
          <span className="entrance__count">미션 6개</span>
        </div>
        <ol className="entrance__missions">
          {missions.map((mission, index) => (
            <li key={mission.id}>
              <span className="entrance__mission-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{mission.flow.title}</span>
            </li>
          ))}
        </ol>
      </section>

      <aside className="entrance__notices" aria-label="사용 안내">
        <p>
          <strong>기억해요</strong> 이 앱은 여러분의 응답을 저장하지 않아요. 새로고침하면 응답이
          사라져요.
        </p>
        <p>연습용 모형이므로 실제 경기 실력을 평가하지 않아요.</p>
      </aside>

      <div className="entrance__actions">
        <UpdateHistoryButton />
      </div>
    </section>
  );
}
