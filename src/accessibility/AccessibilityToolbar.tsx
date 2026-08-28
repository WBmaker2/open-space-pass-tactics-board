import { useState } from "react";

/** 교실에서 손쉽게 쓸 수 있는 글자 크기·모션 조절. 설정은 어디에도 저장되지 않는다. */
export function AccessibilityToolbar() {
  const [fontLarge, setFontLarge] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  function toggleFontLarge() {
    const next = !fontLarge;
    setFontLarge(next);
    document.documentElement.classList.toggle("font-large", next);
  }

  function toggleReduceMotion() {
    const next = !reduceMotion;
    setReduceMotion(next);
    document.documentElement.classList.toggle("reduce-motion", next);
  }

  return (
    <div className="accessibility-toolbar" role="group" aria-label="화면 도구">
      <button
        type="button"
        className="accessibility-toolbar__button"
        aria-pressed={fontLarge}
        onClick={toggleFontLarge}
      >
        글자 크게
      </button>
      <button
        type="button"
        className="accessibility-toolbar__button"
        aria-pressed={reduceMotion}
        onClick={toggleReduceMotion}
      >
        모션 줄이기
      </button>
    </div>
  );
}
