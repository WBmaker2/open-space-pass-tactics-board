# 빈 공간 패스 전술판 — 교육용 웹앱 초기 감사

Method: degraded single-context (이 세션에 `spawn_agent`가 노출되지 않아 Assessment A/B를 단일 컨텍스트에서 순차 수행)

- 감사일: 2026-08-30
- 대상: `src/app/App.tsx` 및 입구 → 미션 → 피드백 → 결과 흐름
- 관련 기준: `$impeccable` `critique`/`audit`, `$redesign-existing-projects`, `PRODUCT.md`
- 적용 규칙 파일: 저장소의 `AGENTS.md`, `EDUCATION_DESIGN.md`, `design-system/MASTER.md`는 없음. 사용자 제공 규칙과 기존 README/구현 계획을 적용.
- VoiceOver: 실행·검증하지 않음

## 기준선 증거

### 자동 검사

- `node /Users/kimhongnyeon/.codex/skills/impeccable/scripts/detect.mjs --json src` — exit 0, 결과 `[]`.
- `npm run lint` — exit 0.
- `npm run typecheck` — exit 0.
- `npm run test:run` — exit 0, 10개 파일/106개 테스트 통과.
- `npm run test:a11y` — exit 0, 1개 파일/3개 테스트 통과.
- `npm run test:release` — exit 0, 1개 파일/4개 테스트 통과.
- `npm run check:lines` — exit 0, 모든 TS·TSX·CSS가 500줄 미만.
- `npm run build` — exit 0, Vite production build 완료.

자동 검사는 구현 기능이 깨졌다는 증거를 찾지 못했지만, 시각적 위계·인지 부담·반응형 여백의 품질을 보증하지는 않습니다.

### 브라우저 확인

- 사용 경로: `http://127.0.0.1:5173/`에서 입구, `학습 시작하기`, 미션 1 관찰, 예측, 잘못된 패스 선택과 피드백까지 실제 조작.
- 1280px 입구/관찰 화면과 375px 입구/관찰 화면을 캡처했습니다.
  - `output/playwright/initial-live.png`
  - `output/playwright/initial-live-mobile.png`
  - `output/playwright/initial-workbench-desktop.png`
  - `output/playwright/initial-workbench-mobile.png`
- 브라우저 콘솔: 오류 0건, 경고 0건.
- 동적 네트워크 요청: 0건.
- 관찰 결과: 1280px에서는 960px 컨테이너 안에 입구·카드가 안정적으로 배치되지만 학습 화면 오른쪽 작업 패널에 큰 빈 면적이 생깁니다. 375px에서는 콘텐츠가 세로로 쌓이지만 학습 중 헤더 도구가 두 줄로 분리되고, 좌표·선수 ID가 시각적 설명보다 먼저 읽힙니다.
- 현재 단계 제목으로 포커스를 옮기고 스크롤하는 동작은 확인했습니다. 포커스가 고정 헤더와 충돌하지 않도록 새 레이아웃에서 다시 확인해야 합니다.

### 자산 사용처 목록

| 원본 | 사용처 | 역할 | 초기 판정 |
|---|---|---|---|
| `src/assets/generated/bright-gym-tactics-board.webp` | `src/features/pass-tactics/EntranceScreen.tsx` | 입구 장식 이미지 | 일반 장식, 현재 구도·품질은 충분해 교체하지 않는 후보 |
| `src/features/pass-tactics/TacticsBoard.tsx`의 SVG | 입구 제외 모든 전술판 | 좌표·선수·패스 상태를 전달하는 정보 자산 | 사실/판정 정보이므로 생성 이미지로 교체하지 않음 |
| CSS `url()`·`srcset`·preload | 없음 | - | 추가 처리 없음 |

## Design Health Score

| # | Nielsen heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 3/4 | 진행 단계와 피드백은 있으나 선택 전/후의 핵심 상태가 작업 카드의 빈 공간 속에서 약해짐 |
| 2 | Match System / Real World | 3/4 | 경기판 은유와 한국어 지시는 자연스럽지만 `c1r2`, `A1 → A2`가 어린이에게 기술적임 |
| 3 | User Control and Freedom | 3/4 | 뒤로 가기·처음부터·Escape은 있으나 단계 안에서 선택을 되돌리는 명시적 안내가 약함 |
| 4 | Consistency and Standards | 3/4 | 버튼·라디오·피드백 패턴은 일관되지만 카드/필/헤더가 같은 시각 무게를 가짐 |
| 5 | Error Prevention | 3/4 | 미선택 다음 버튼 비활성화와 고정 판정은 좋지만 현재 할 일과 필수 조작 순서가 한눈에 덜 드러남 |
| 6 | Recognition Rather Than Recall | 2/4 | 범례와 단계 필은 있으나 보드의 패스 길과 선택지 사이 연결을 학생이 다시 해석해야 함 |
| 7 | Flexibility and Efficiency | 3/4 | 키보드·터치·마우스 경로와 다시 고르기가 있으나 짧은 빠른 경로/단계 완료 표시는 없음 |
| 8 | Aesthetic and Minimalist Design | 2/4 | 기본 흰 카드·그림자·필의 반복, 입구 설명의 길이, 관찰 패널의 빈 면적이 핵심을 희석함 |
| 9 | Error Recovery | 3/4 | 오답 근거와 한 번의 수정 기회가 있지만 피드백과 다음 버튼이 세로로 멀어짐 |
| 10 | Help and Documentation | 3/4 | 입구·범례·단계 안내는 있으나 좌표 용어를 실제 판단에 쓰는 방법이 즉시 연결되지 않음 |
| **Total** |  | **28/40** | **Good — 기초 기능은 견고하지만 전체 위계·인지 부담 개선이 필요** |

## Design specificity verdict

### LLM/manual assessment

제품 메커니즘은 고정된 공간 근거와 패스 길 판정으로 분명하지만, 현재 시각 언어는 다른 체크리스트형 학습 도구에도 그대로 옮길 수 있습니다. 전술판이 가장 중요한 증거인데 입구에서는 장식 이미지가 주인공이고, 학습 화면에서는 패널 안에 작게 들어가며, 결과에서는 두 보드가 반복됩니다. “작은 작전 데스크에서 한 번에 한 판단을 기록한다”는 제품 고유 경험이 구조에 충분히 드러나지 않습니다.

### Deterministic scan

`detect.mjs --json src` 결과는 `[]`였습니다. 반복적인 AI UI 패턴을 기계적으로 확정할 수 있는 결과는 없었습니다. 다만 detector clean은 시각적 차별성·인지 부담이 좋다는 뜻은 아니므로 아래 수동 이슈를 유지합니다.

## 잘 작동하는 점

1. **판정 경계가 명확합니다.** UI가 수비 위치를 임의로 계산하지 않고 검수된 `passEvaluator`·상태 전이를 사용해 교육 콘텐츠가 흔들리지 않습니다.
2. **학습자 행동 계약이 실제로 작동합니다.** 보드 토큰을 버튼처럼 선택할 수 있고, `Enter`/`Space`, 라디오·체크박스, 뒤로 가기, Escape 모달을 자동 테스트로 보호합니다.
3. **정직한 범위 고지가 있습니다.** 점수·승패·학생 식별자·저장·음성 기능·외부 요청을 만들지 않고, 연습용 모형이라는 한계를 안내합니다.

## 우선순위 이슈

### [P1] 전술판보다 카드 껍데기가 먼저 보임

- 위치: `src/features/pass-tactics/EntranceScreen.tsx`, `TacticsWorkbench.tsx`, `src/styles/app.css`, `src/styles/board.css`
- 영향: 학생이 “지금 무엇을 관찰해야 하는지”보다 카드 경계·범례·필을 먼저 훑습니다. 데스크톱에서는 오른쪽 작업 패널의 빈 면적이 핵심 질문을 약하게 만들고, 모바일에서는 보드와 작업이 길게 분리됩니다.
- 수정: 전술판을 화면의 주 증거로 확대·강조하고, 작전 카드에는 현재 단계의 한 질문·선택·확인만 남깁니다. 관찰 단계에서는 설명/범례를 보조 계층으로 낮추고 다음 버튼을 카드 하단에 고정합니다.
- 제안 명령: `$impeccable layout`, `$impeccable distill`

### [P1] 학생용 언어와 내부 좌표/ID가 섞임

- 위치: `src/features/pass-tactics/StepPanels.tsx:24-30, 185-195, 429-437`, `TacticsBoard.tsx:75-95`
- 영향: `A1 → A2 (c1r2 → c5r1)`와 `c열r행`은 판정·테스트에는 유용하지만 초등 3~6학년의 첫 판단을 막을 수 있습니다. 보드가 보여 주는 방향과 “위쪽 받는 선수/아래쪽 받는 선수”를 학생이 번역해야 합니다.
- 수정: 접근성 이름과 보조 설명에는 기존 ID를 보존하되, 화면 본문은 “위쪽 받는 선수”, “아래쪽 받는 선수”, “오른쪽 위 한 칸”처럼 콘텐츠에서 안전하게 파생한 자연어를 앞세웁니다. 좌표는 접을 수 있는 도움말/보조 라벨로 낮춥니다.
- 제안 명령: `$impeccable clarify`

### [P1] 첫 행동과 다음 행동의 시각적 위계가 약함

- 위치: `App.tsx:27-45`, `ProgressSteps.tsx`, `ActionButton.tsx`, `StepPanels.tsx`
- 영향: 헤더의 글자/모션/처음부터/업데이트 도구와 단계 필이 모두 같은 수준으로 보여 현재 CTA를 찾는 시간이 늘어납니다. 업데이트 내역은 필요하지만 학습 행동을 방해하지 않아야 합니다.
- 수정: 헤더는 제품명·보조 도구·세션 종료를 분리하고, 작업 카드에 “이번 단계의 목표”와 하나의 primary CTA를 명확히 둡니다. `gi-pulse`는 기존 계약대로 `패스 길 확인`·`다음 지원 시험`에만 유지합니다.
- 제안 명령: `$impeccable onboard`, `$impeccable distill`

### [P1] 모바일에서 헤더·포커스·긴 결과의 흐름이 불안정함

- 위치: `App.tsx:16-21`, `src/styles/app.css`, `src/features/report/LearningReport.tsx`
- 영향: 375px에서 학습 중 헤더 도구가 두 줄로 분리되고, 단계 제목으로 스크롤한 뒤 사용자가 상단 맥락을 잃기 쉽습니다. 결과는 미션별 시작/마친 보드가 반복되어 핵심 근거가 아래로 밀립니다.
- 수정: 모바일 헤더에 보조 도구를 접을 수 있는 보조 영역으로 배치하고, 포커스 스크롤에 `scroll-margin-top`을 적용합니다. 결과는 요약 근거를 먼저 보여 주고 보드는 필요할 때 읽는 보조 시각으로 정리합니다.
- 제안 명령: `$impeccable adapt`, `$impeccable layout`

### [P2] 상태·피드백의 색과 반복 문장이 충분히 구조화되지 않음

- 위치: `src/features/pass-tactics/FeedbackPanel.tsx`, `src/styles/board.css`, `src/styles/tokens.css`
- 영향: 성공/생각/정보 패널이 색상과 동일한 카드 문법에 의존해 오답의 회복 경로가 즉시 눈에 들어오지 않습니다. 현재도 텍스트는 있으나, 선택 → 근거 → 확인 → 다음의 순서가 시각적으로 분절됩니다.
- 수정: 상태 아이콘 대신 CSS/SVG 형태와 명시적 상태 라벨을 함께 사용하고, 피드백 안에 “왜 / 이제 할 일”을 구분합니다. 모든 버튼에 맥박을 추가하지 않고 필수 다음 행동만 강조합니다.
- 제안 명령: `$impeccable clarify`, `$impeccable polish`

### [P2] 입구 장식과 실제 학습 메커니즘의 연결이 약함

- 위치: `src/features/pass-tactics/EntranceScreen.tsx`, `src/assets/generated/bright-gym-tactics-board.webp`
- 영향: 이미지는 밝은 체육관 분위기를 전달하지만 패스 길·빈 공간·지원이라는 앱의 고유 메커니즘을 보여 주지 않습니다. 장식 자체는 품질이 충분해 자동 교체할 근거는 없습니다.
- 수정: 원본을 유지하고 이미지 위/옆의 짧은 캡션과 SVG 미리보기로 학습 메커니즘을 연결합니다. 새 생성 이미지는 필요성이 확인될 때만 일반 장식으로 검토합니다.
- 제안 명령: `$impeccable delight`

## 인지 부담

- 실패 항목: **단일 초점**, **그룹화**, **시각 위계**, **한 번에 하나**, **회상 부담**, **점진적 공개**.
- 판단: 중간~높음. 한 화면에 단계 필, 범례, 좌표, 패스 선택, 근거 선택, 상태 안내, 뒤로/다음이 동시에 있어 학생이 “무엇을 지금 해야 하는가”를 재구성해야 합니다.
- 개선 기준: 현재 행동은 1개, 근거 선택은 한 그룹, 보조 좌표는 접힘/보조 계층, 피드백은 원인과 다음 행동 2블록으로 제한합니다.

## Persona red flags

### Jordan — 처음 쓰는 학생

- 입구의 목적은 이해하지만 `A1 → A2 (c1r2 → c5r1)`를 읽고 실제로 무엇을 찾아야 하는지 다시 해석해야 합니다.
- 관찰 단계의 범례가 한 번에 네 항목이고 좌표 설명이 길어, 첫 5초의 행동보다 설명을 읽는 시간이 커집니다.
- 예측 오답 후 “다시 볼까요?”와 다음 단계 버튼이 분리되어 회복 경로가 덜 명확합니다.

### Sam — 키보드·저시력 사용자

- 자동 axe와 키보드 테스트는 통과하지만, SVG 좌표 텍스트와 토큰의 의미는 보조 텍스트에 의존합니다.
- 단계 전환 시 제목 포커스는 좋지만 모바일/헤더와 겹치지 않는 `scroll-margin-top`을 수용 기준으로 추가해야 합니다.
- `aria-pressed`와 라디오 상태는 있으나, “현재 선택한 길이 열림/막힘”을 보드와 패널에서 동일 문장으로 연결하면 상태 인지가 더 쉬워집니다.

### Casey — 중단이 잦은 모바일 사용자

- 375px에서 헤더 도구가 두 줄로 갈라지고, 주요 CTA가 보드 아래로 길게 내려갑니다.
- 저장하지 않는 제품 원칙은 의도적이지만, 중단 후 돌아오면 다시 시작해야 한다는 사실을 입구와 결과에서 더 짧게 명시해야 합니다.
- 보드·작업 카드·피드백이 모두 카드로 분리되어 화면을 많이 스크롤해야 합니다.

## 긍정 유지 / 구현 시 유의

- `$ui-ux-pro-max` 기준의 44px 터치 목표, 16px 본문, 4/8px 간격 리듬, 색상만으로 상태를 전달하지 않는 원칙을 유지합니다.
- 앱은 라이트 모드만 유지합니다.
- 학생 대상 VoiceOver·TTS·내레이션·녹음은 추가하지 않습니다.
- 현재 콘텐츠의 `reviewStatus: pending`은 사실 확인이 끝났다는 의미로 바꾸지 않습니다.

## 초기 감사 수용 기준으로 승격할 P0/P1

- P0: 없음. 현재 자동·수동 기준선에서 흐름을 막는 차단 문제는 확인하지 못했습니다.
- P1: 전술판/작전 카드 위계 재구성, 학생용 언어와 내부 ID 분리, 모바일 헤더·포커스·결과 흐름 개선.

## Run Notes

- target slug: `src/app/App.tsx` (수동 경로; critique-storage persistence는 별도 실행하지 않음)
- ignore list: `.impeccable/critique/ignore.md` 없음
- assessment independence: 단일 컨텍스트 degraded; Assessment A 수동 검토와 Assessment B detector/browser 근거를 순서대로 수행
- CLI detector: 실행 완료, `[]`
- browser visibility: Playwright MCP로 localhost 입구/학습 화면 확인
- overlay injection: 실행하지 않음. 사용자에게 `[Human]` 오버레이가 있다고 주장하지 않음.
- live-server cleanup: 자체 dev server `npm run dev`는 현재 검증 세션에서 실행 중이며, 최종 검증 후 종료 예정
- temp-file cleanup: Playwright CLI 임시 캐시는 `/private/tmp`에 남아 있을 수 있으며, 브라우저 MCP의 캡처 파일은 프로젝트의 `output/playwright/`에 보존
- fallback signal: 로컬 Playwright CLI는 npm cache 및 macOS Chromium `MachPortRendezvous` 권한 오류로 실패하여 Playwright MCP로 대체
- Questions skipped: 전체 리디자인 범위와 구현 진행이 사용자 요청으로 이미 확정되어 별도 방향 질문을 생략

## 최종 감사 · 2026-08-30

### 최종 판단

초기 문제였던 “전술판보다 카드 껍데기가 먼저 보이는 화면”을 전술판 중심의
작전 데스크로 바꿨습니다. 입구는 목적·학습 순서·첫 행동을 분리하고, 학습 화면은
왼쪽 판과 오른쪽 한 단계 작업을 같은 수평선에서 시작하며, 기록 화면은 여섯
미션의 판 변화와 근거를 반복 가능한 형식으로 보여 줍니다.

정적 Impeccable detector 최종 결과는 `[]`입니다. 브라우저 MCP에서 다음을
확인했습니다.

- 1280px: 전술판이 작업 패널보다 넓고, 관찰 단계에 “공 아이콘이 있는 선수를…”이라는 실제 행동 문장이 보입니다.
- 375px: 전술판 → 범례 → 현재 할 일 순서로 쌓이고, 결과 화면의 “미션별 작전 기록” 제목이 한 줄로 유지됩니다.
- 320px: `scrollWidth == clientWidth`이고 SVG 선수/빈 칸 조작 영역은 약 46px입니다.
- 전체 흐름: 여섯 미션을 시작→선택→피드백→다음 단계로 반복해 `전술 기록`과 6개 기록 카드에 도달했습니다.
- 토글: `모션 줄이기`에서 필수 버튼의 `animationName`은 `none`, 외곽선은 `3px`입니다.
- 콘솔/동적 네트워크: 브라우저 MCP 기준 오류 0건, 동적 요청 0건입니다. 정적 요청은 로컬 JS/CSS/이미지 로드입니다.

### 최종 점검표

| 항목 | 상태 | 근거 |
| --- | --- | --- |
| 제품 사실·판정 로직 보존 | 완료 | `sessionReducer`, `missions`, privacy 테스트 보존 |
| 전술판 위계·모바일 순서 | 완료 | `TacticsWorkbench.tsx`, `board.css`, 1280/375/320px 캡처 |
| 키보드 진입·단계 포커스 | 완료 | 입구 Tab 4회 후 Enter로 시작, 단계 제목 포커스, 기존 키보드 테스트 |
| `gi-pulse` 범위 | 완료 | `StepPanels.tsx`의 두 필수 버튼만 사용, reduced-motion 대체 확인 |
| 자산 안전 | 완료 | 기존 WebP 유지, 새 이미지 0개, 별도 자산 기록 작성 |
| 자동 품질 | 완료 | lint/typecheck/106 tests/a11y 3/visual+release 11/line check/build/diff check |
| 공식 E2E 명령 | CI 완료 / 로컬 보류 | CI [33295157428](https://github.com/WBmaker2/open-space-pass-tactics-board/actions/runs/33295157428)에서 12개 E2E flaky 0건; 로컬은 다른 프로젝트의 4173 포트 점유로 `preview-pages.mjs` 시작 불가 |
| VoiceOver·교과·보조공학 사람 검수 | 보류 | 이번 범위에서 실행하지 않음; `reviewStatus: pending` 유지 |

### 최종 산출물

- [최종 리디자인 계획](education-webapp-redesign-plan.md)
- [제품 사실 문서](../PRODUCT.md)
- [디자인 시스템](../design-system/MASTER.md)
- [초기·최종 감사](education-webapp-redesign-audit.md)
- [자산 기록](education-webapp-redesign-assets.md)
- [최종 결과 보고서](education-webapp-redesign-report.md)
