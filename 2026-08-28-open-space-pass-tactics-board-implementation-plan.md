# Open Space Pass Tactics Board Implementation Plan

> **상태:** 구현 전 계획 승인 대기. 이 문서는 실행 가능한 구현 순서만 정의하며 코드, 패키지 설치, Git 초기화, 커밋, 푸시, 배포, HVC 등록을 수행하지 않는다.

| 항목 | 내용 |
|---|---|
| 작성일 | 2026-08-28 |
| 프로젝트 | 빈 공간 패스 전술판 |
| 대상 | 초등 3~6학년 |
| 교과 | 체육 |
| 권장 활동 시간 | 15~25분 |
| 미래 프로젝트 루트 | /Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board |
| 계획 문서 | /Volumes/ External Drive 256G/Dev2/codex/vibecoding-lab/docs/superpowers/plans/2026-08-28-open-space-pass-tactics-board-implementation-plan.md |
| 구현 여부 | 구현하지 않음 |
| 배포 여부 | 배포하지 않음 |

**Goal:** 학생이 고정된 가상 경기판에서 수비가 막지 않은 패스 길과 패스 뒤 지원 위치를 찾고, 속도나 승패가 아니라 공간 근거로 선택을 설명하는 정적 체육 전술 학습 앱을 만든다.

**Architecture:** Vite + React + TypeScript 정적 SPA에서 검수된 고정 미션 데이터, 순수 판정 함수, useReducer 세션 상태, 단계별 화면을 분리한다. 학생 응답은 현재 탭 메모리에만 두고 서버, 로그인, 외부 AI, 분석 SDK, 광고, 쿠키, localStorage, sessionStorage를 사용하지 않는다.

**Tech Stack:** Vite, React, TypeScript, CSS, Vitest, React Testing Library, user-event, vitest-axe, Playwright, axe-core, 정적 SVG와 이미지 생성 모델로 제작한 로컬 자산.

**Visual Thesis:** 밝은 체육관 전술판에 선수 역할을 도형·번호·문자로 함께 표시한다. 실제 팀 유니폼과 학생 외모를 사용하지 않고 공, 패스 길, 빈 공간만 시각적 중심으로 둔다.

---

## 1. 계획 경계와 승인 게이트

- 이 문서 작성은 구현 승인이나 출시 승인이 아니다.
- 구현 시작 전 교과 내용, 어린이용 문구, 고정 미션의 정답·복수 정답·판단 보류 규칙을 교사 또는 교과 검수자가 승인한다.
- 이미지가 필요한 화면은 구현 단계에서 이미지 생성 모델로 맥락에 맞는 자산을 만들고 **docs/image-rights-ledger.md**에 프롬프트, 생성일, 파일명, 사용 위치를 기록한다.
- 학생용 VoiceOver, 음성 내레이션, TTS, 녹음은 범위에서 제외한다. 키보드, 의미 있는 HTML, 포커스, 자동 접근성 검사는 유지하되 VoiceOver 수동 검증은 계획과 완료 기준에서 제외한다.
- 구현 오케스트레이터가 gpt-5.6-sol 또는 gpt-5.6-terra이면 실제 코딩 담당 하위 에이전트는 gpt-5.6-luna를 사용한다. 사용할 수 없을 때만 5.3 Codex Spark를 사용한다.
- 푸시, GitHub Pages, HVC 등록은 로컬 검증 완료 뒤 사용자의 별도 출시 승인으로만 진행한다.

## 2. 학습 계약과 비중복성

### 2.1 학습 계약

- 학생은 공을 가진 사람, 받을 사람, 수비 위치, 패스 길을 구분한다.
- 학생은 수비가 패스 길을 막는지 고정된 보드 근거로 확인한다.
- 학생은 패스 전에 받을 사람이 빈 공간으로 움직이는 이유를 설명한다.
- 학생은 둘 이상의 안전한 선택이 있는 장면에서 거리·지원·다음 움직임 근거를 비교한다.
- 결과는 점수, 속도, 등급, 순위 대신 최초 판단, 사용한 근거, 수정 결과를 보여 준다.
- 정답 하나를 강요할 수 없는 미션은 검수된 복수 해법 또는 판단 보류를 정식 결과로 인정한다.

### 2.2 기존 앱과의 구별

| 가까운 기존 영역 | 이 앱이 구현하는 핵심 행동 | 명시적으로 제외하는 행동 |
|---|---|---|
| CPR 리듬 트레이너 | 팀 게임의 공간과 패스 선택 | 신체 압박 속도와 응급처치 리듬 |
| 우리학교 테트리스 | 가상 경기판에서 사람 사이 패스 길 판단 | 블록 이동·회전과 점수 경쟁 |
| 교실 자리·시설 입지 앱 | 수비 변화에 따른 순간적 지원 공간 | 고정 좌석 또는 공공시설 접근성 최적화 |

## 3. 학습 흐름 시각화

~~~mermaid
flowchart LR
    A[입구] --> B[경기판 관찰]
    B --> C[패스 전 예측]
    C --> D[받을 사람 이동]
    D --> E[열린 패스 길 선택]
    E --> F[수비 이동 공개]
    F --> G[다음 지원 수정]
    G --> H[전술 기록]
~~~

- 단계가 바뀌면 **mainHeadingRef**에 프로그래밍 방식으로 초점을 옮기고 새 단계의 시작점으로 스크롤한다.
- 뒤로 가기는 직전 단계의 응답을 보존한다. 처음부터 다시 하기는 확인 대화상자 뒤 세션 메모리를 완전히 비운다.
- 새로고침하면 응답이 사라짐을 입구와 결과 화면에 어린이용 문장으로 알린다.

## 4. 고정 미션 사양

| 미션 ID | 장면 | 학생이 하는 일 | 성공 증거 |
|---|---|---|---|
| pass-lane-01 | 3대1 안내 경기판 | 막히지 않은 한 패스 선택 | 승인된 openLaneIds 중 하나와 수비 근거 연결 |
| pass-defender-02 | 수비가 중앙 길을 막음 | 중앙과 측면 길 비교 | blockedByPlayerId를 화면에서 찾음 |
| pass-move-03 | 받을 사람이 수비 뒤에 있음 | 패스 전에 한 칸 이동 | 지원 선수가 approvedSupportCells 중 하나로 이동 |
| pass-two-options-04 | 두 측면 길이 모두 열림 | 복수 선택의 장단점 비교 | 두 openLaneIds를 모두 유효로 인정 |
| pass-after-05 | 패스가 끝난 뒤 공 위치 변경 | 원래 패서의 지원 위치 선택 | 다음 open lane을 만드는 한 칸 이동 |
| pass-plan-06 | 4대2 두 단계 장면 | 이동→패스→지원 순서 계획 | 검수된 두 sequenceIds 중 하나와 공간 근거 완성 |

- 정확히 6개 미션을 제공한다. 런타임 무작위 생성은 하지 않는다.
- 미션 ID, 선택지 ID, 판정 ID는 코드·테스트·문서에서 동일한 문자열을 사용한다.
- 모든 미션은 **sourceNote**, **reviewStatus**, **misconceptionGuard**를 가지며 누락 시 빌드를 실패시킨다.
- 학생 이름, 실제 학급 사건, 위치, 사진, 생년월일을 입력하거나 저장하지 않는다.

### 4.1 구현 고정 경기판 fixture

- 셀 ID는 `c{column}r{row}`로 쓰며 왼쪽 위가 `c0r0`이다. lane의 열림·막힘은 아래 승인 데이터로만 판정하고 좌표에서 물리적 시야를 추론하지 않는다.
- `pass-lane-01`: A1(ball)=c1r2, A2=c5r1, A3=c5r3, D1=c3r3. `lane-a1-a2`는 open, `lane-a1-a3`은 D1이 막는다. 승인 선택은 `lane-a1-a2`다.
- `pass-defender-02`: A1(ball)=c1r2, A2=c5r2, A3=c5r0, D1=c3r2. `lane-center`는 D1이 막고 `lane-side`는 open이다. 학생은 D1과 `lane-side`를 함께 근거로 고른다.
- `pass-move-03`: A1(ball)=c1r2, A2=c4r2, D1=c3r2. 시작 `lane-a1-a2`는 blocked이며 A2의 승인 셀 `c4r1` 또는 `c4r3`으로 이동한 뒤 `lane-a1-a2-up/down`이 open이 된다.
- `pass-two-options-04`: A1(ball)=c1r2, A2=c5r0, A3=c5r4, D1=c3r2. `lane-left-side`, `lane-right-side`를 모두 open으로 승인하고 어느 쪽도 거리만으로 오답 처리하지 않는다.
- `pass-after-05`: 패스 뒤 A2(ball)=c4r1, A1=c1r2, A3=c5r4, D1=c3r3이다. A1의 승인 지원 셀은 `c2r1`, `c2r3`이며 각각 `lane-a2-a1`, `lane-a2-a3`의 다음 선택을 만든다.
- `pass-plan-06`: 시작은 A1(ball)=c1r2, A2=c4r1, A3=c4r3, A4=c2r4, D1=c3r2, D2=c4r2다. `seq-left={A2→c5r1, A1→A2, A1→c2r2}`와 `seq-right={A3→c5r3, A1→A3, A1→c2r2}`만 승인한다.
- 각 fixture는 정확한 `blockedByPlayerIds`, `nextSupportCellIds`, 이전·이후 state ID를 가진다. 좌표가 겹치거나, ball 보유자가 둘이거나, 참조하지 않는 lane이 있으면 콘텐츠 검증을 실패시킨다.

## 5. 판정 계약

- 경기판은 7×5 이산 격자와 검수된 PassLane 목록을 사용하고 실제 물리·속도·충돌을 계산하지 않는다.
- availablePassIds는 현재 stateId에서 blockedByPlayerIds가 없는 lane만 반환한다.
- 지원 이동은 approvedSupportCells 또는 acceptedSequenceIds로 판정하며 실제 경기의 최적 전술이라고 단정하지 않는다.
- 두 길이 열려 있으면 거리만으로 한 길을 오답 처리하지 않고 다음 지원 근거를 함께 비교한다.
- 선수 선택·이동은 버튼과 격자 좌표 라디오 그룹으로 가능하며 드래그를 필수로 하지 않는다.

## 6. MVP 범위

**포함**

- 입구, 안내 미션 1개, 적용 미션 5개, 단계별 근거 선택, 수정 기회, 결과 기록, 다시 하기, 인쇄용 결과, 업데이트 내역.
- 마우스·터치·키보드 동등 조작, 320px 이상 반응형 화면, 200% 글자 확대, 고대비 포커스, 축소 모션.
- 모든 학습 자료와 자산을 동일 출처에서 제공하는 오프라인 친화 정적 앱.

**제외**

- 자유 입력 AI 채점, 생성형 AI 런타임 호출, 실시간 검색, 학생 계정, 서버 저장, 학급 순위, 타이머 압박, 광고, 분석.
- 실제 기기·신체·안전 결과를 보장하는 표현, 검수되지 않은 교과서 복제, 외부 이미지 핫링크.
- 다크 모드와 prefers-color-scheme 기반 테마 전환. 앱은 밝은 교실용 라이트 모드로 고정한다.
- VoiceOver 구현·검증, 학생용 음성 안내, TTS, 음성 녹음.

## 7. 핵심 타입과 순수 함수

### 7.1 TypeScript 계약

~~~ts
type MissionId = "pass-lane-01" | "pass-defender-02" | "pass-move-03" | "pass-two-options-04" | "pass-after-05" | "pass-plan-06";
type Team = "attack" | "defense";
interface GridCell { readonly column: 0 | 1 | 2 | 3 | 4 | 5 | 6; readonly row: 0 | 1 | 2 | 3 | 4; }
interface PlayerToken { readonly id: string; readonly team: Team; readonly roleLabel: string; readonly cell: GridCell; readonly hasBall: boolean; }
interface PassLane { readonly id: string; readonly fromPlayerId: string; readonly toPlayerId: string; readonly blockedByPlayerIds: readonly string[]; readonly nextSupportCellIds: readonly string[]; }
interface TacticsState { readonly id: string; readonly players: readonly PlayerToken[]; readonly lanes: readonly PassLane[]; }
interface PassMission { readonly id: MissionId; readonly states: readonly TacticsState[]; readonly openLaneIds: readonly string[]; readonly approvedSupportCellIds: readonly string[]; readonly acceptedSequenceIds: readonly string[]; readonly sourceNote: string; readonly reviewStatus: "pending" | "approved"; readonly misconceptionGuard: string; }
interface PassEvaluation { readonly accepted: boolean; readonly laneId: string | null; readonly blockedByPlayerIds: readonly string[]; readonly evidenceKeys: readonly string[]; }
type SessionStep = "INTRO" | "OBSERVE" | "PREDICT" | "MOVE" | "PASS" | "REVEAL" | "SUPPORT" | "REPORT";
~~~

### 7.2 단일 판정 경계

- **src/domain/passEvaluator.ts**만 정오·충족·판단 보류를 계산한다.
- 컴포넌트는 정답 배열을 직접 조회하지 않고 availablePassIds(), evaluateSupportMove(), evaluatePass(), evaluateSequence()의 결과만 렌더링한다.
- **src/content/validateContent.ts**는 6개 미션, ID 유일성, 참조 무결성, 최소 복수 해법, 어린이용 피드백, 검수 메타데이터를 검사한다.
- 잘못된 콘텐츠는 개발·빌드 시 예외로 중단하고, 학생 화면에서 임의로 추측해 복구하지 않는다.

## 8. 예상 파일 구조와 책임

~~~text
open-space-pass-tactics-board/
  .github/workflows/ci.yml
  .github/workflows/deploy-pages.yml
  package.json
  vite.config.ts
  vitest.config.ts
  playwright.config.ts
  eslint.config.js
  tsconfig.json
  index.html
  public/favicon.svg
  scripts/check-file-lines.mjs
  src/main.tsx
  src/app/App.tsx
  src/app/sessionReducer.ts
  src/app/sessionReducer.test.ts
  src/domain/types.ts
  src/domain/passEvaluator.ts
  src/domain/passEvaluator.test.ts
  src/content/missions.ts
  src/content/missions.test.ts
  src/content/validateContent.ts
  src/content/validateContent.test.ts
  src/features/pass-tactics/EntranceScreen.tsx
  src/features/pass-tactics/TacticsWorkbench.tsx
  src/features/pass-tactics/FeedbackPanel.tsx
  src/features/report/LearningReport.tsx
  src/features/report/print.css
  src/components/ActionButton.tsx
  src/components/ModalDialog.tsx
  src/components/ProgressSteps.tsx
  src/components/UpdateHistoryButton.tsx
  src/components/UpdateHistoryDialog.tsx
  src/accessibility/AccessibilityToolbar.tsx
  src/update/updateHistory.ts
  src/assets/generated/bright-gym-tactics-board.webp
  src/styles/tokens.css
  src/styles/app.css
  src/styles/motion.css
  src/test/setup.ts
  tests/a11y/app.a11y.test.tsx
  tests/privacy/runtime-boundary.test.ts
  tests/release/pages-assets.test.ts
  e2e/learner-flow.spec.ts
  e2e/keyboard.spec.ts
  e2e/mobile-reduced-motion.spec.ts
  docs/content-review.md
  docs/image-rights-ledger.md
  docs/qa/acceptance-checklist.md
~~~

- 기능 파일이 500줄에 가까워지면 미션 화면, 판정, 피드백, 보고서를 즉시 분리한다.
- TS, TSX, CSS 파일은 각각 500줄 미만이어야 하며 **npm run check:lines**가 위반 파일 경로를 출력하고 실패한다.
- 콘텐츠 데이터와 판정 코드는 서로 import할 수 있지만 UI 컴포넌트에서 콘텐츠 내부 정답 필드를 직접 읽지 않는다.

## 9. 화면과 상태 전이

1. **입구** — 이 앱이 실제 경기 능력이나 학생을 평가하지 않는 전술 모형임을 안내한다.
2. **경기판 관찰** — 공 소유자, 공격, 수비, 현재 빈 칸을 문자와 도형으로 확인한다.
3. **패스 예측** — 이동 전 열려 있다고 생각하는 패스 길을 고른다.
4. **지원 이동** — 받을 사람을 검수된 인접 칸 중 하나로 이동한다.
5. **패스 길** — 열린 길을 선택하고 수비가 막는 길은 막은 선수와 연결한다.
6. **수비 공개** — 수비가 한 칸 움직인 다음 계획을 유지하거나 수정한다.
7. **전술 기록** — 이동 전후 경기판과 선택 근거를 좌표·문장으로 보여 준다.

**SessionState 공통 규칙**

- step은 정의된 전이표를 통해서만 바뀐다.
- missionIndex 범위는 0부터 5까지다.
- 현재 미션 응답, 최초 판단, 근거, 수정 기록은 불변 업데이트한다.
- COMPLETE 이후에는 답을 바꾸지 못하고 다시 보기와 인쇄만 허용한다.
- 알 수 없는 action, 범위를 벗어난 missionIndex, 이전 revision 응답은 상태를 바꾸지 않는다.

## 10. 시각·접근성·자산 계획

- 기본 본문 16px 이상, 줄 간격 1.6 이상, 터치 목표 44×44 CSS px 이상을 유지한다.
- 색만으로 상태를 구분하지 않는다. 선택 상태는 체크 아이콘, 굵기, 테두리, **선택됨** 텍스트와 aria-pressed를 함께 사용한다.
- 필수 다음 행동인 **패스 길 확인**, **다음 지원 시험**에만 gi-pulse를 사용한다.
- prefers-reduced-motion: reduce에서는 이동과 맥박을 제거하고 3px 고정 외곽선과 **필수** 배지로 대체한다.
- 업데이트 내역은 헤더의 작은 버튼으로 모든 단계에서 열 수 있고 닫으면 원래 초점으로 돌아간다. 최초 항목은 **2026-08-28 — 구현 계획 확정**이며 실제 수정 때마다 최신 날짜를 앞에 추가한다.
- 320×568, 375×812, 768×1024, 1280×800에서 주요 행동이 긴 설명 아래 묻히지 않도록 현재 할 일과 CTA를 먼저 배치한다.
- 이미지를 숨기거나 로드하지 못해도 제목, 지시, 선택지, 판정, 보고서를 완주할 수 있어야 한다.

**생성 자산**

- **src/assets/generated/bright-gym-tactics-board.webp** — 실제 팀 로고나 선수 얼굴이 없는 밝은 체육관 입구 이미지.
- 경기판, 선수 토큰, 패스 길, 좌표는 정확한 키보드 탐색을 위해 React SVG로 구현한다.
- 공격·수비는 색뿐 아니라 원·삼각형, A·D 문자, 역할 라벨로 구분한다.

## 11. 오류·개인정보·안전 처리

- ErrorBoundary는 어린이용 **활동을 다시 불러오지 못했어요** 문장과 **처음부터 다시 하기**만 제공하며 기술 스택이나 원시 오류를 노출하지 않는다.
- window.fetch, XMLHttpRequest, WebSocket, EventSource, sendBeacon을 런타임 경계 테스트에서 차단·감시하고 외부 요청 0건을 요구한다.
- localStorage, sessionStorage, IndexedDB, document.cookie 쓰기를 금지한다.
- 인쇄 결과에는 이름 입력란, 식별자, 브라우저 메타데이터를 넣지 않는다.
- 교육 모형은 실제 세계 전체를 보장하지 않는다는 한계를 해당 피드백과 교사용 검수 문서에 명시한다.

## 12. TDD 구현 순서

### Task 0 — 계획 고정과 저장소 준비

**미래 파일:** README.md, package.json, 설정 파일, docs/content-review.md.

- [ ] 이 계획을 새 프로젝트 루트에 복사하고 SHA-256을 원본과 대조한다.
- [ ] package scripts를 dev, build, lint, typecheck, test:run, test:a11y, test:e2e, check:lines, verify로 고정한다.
- [ ] vite.config.ts는 개발 base를 /, production base를 /open-space-pass-tactics-board/로 고정하고 playwright.config.ts의 baseURL은 preview 서버와 같은 하위 경로를 사용한다.
- [ ] scripts/check-file-lines.mjs는 src와 tests의 TS·TSX·CSS 파일을 검사해 500줄 이상이면 파일 경로와 줄 수를 출력하고 종료 코드 1을 반환한다.
- [ ] Git 초기화·원격 생성은 구현 승인 뒤에만 한다.
- [ ] 미래 커밋: **chore: scaffold open-space-pass-tactics-board**

### Task 1 — 콘텐츠 스키마와 검수기

**RED:** src/content/missions.test.ts, src/content/validateContent.test.ts를 먼저 작성한다.

- [ ] 6개 미션, ID 유일성, 모든 참조, 검수 상태, 오개념 방지 문구가 없을 때 각각 실패하게 한다.
- [ ] 각 state의 선수 좌표가 겹치지 않고 공 소유자가 한 명이며 lane의 playerId와 support cell 참조가 모두 존재하는지 검사한다.
- [ ] 실패를 확인한 뒤 missions.ts와 validateContent.ts의 최소 구현을 작성한다.
- [ ] 미래 커밋: **feat: define reviewed pass-tactics missions**

### Task 2 — 순수 판정 함수

**RED:** src/domain/passEvaluator.test.ts에 정상·경계·복수 해법·판단 보류·잘못된 입력 사례를 먼저 작성한다.

- [ ] 열린 길 8건, 수비 차단 8건, 복수 유효 패스 4건, 잘못된 지원 칸 6건, 두 단계 허용 순서 4건을 고정한다.
- [ ] 컴포넌트 없이 순수 함수만으로 여섯 미션의 기대 결과를 재현한다.
- [ ] mutation 없이 readonly 입력을 처리하고 결과에 어린이용 evidenceKeys를 반환한다.
- [ ] 미래 커밋: **feat: add deterministic pass-tactics evaluator**

### Task 3 — 세션 reducer와 전이 잠금

**RED:** sessionReducer.test.ts에서 건너뛰기, 오래된 응답, 완료 뒤 수정, 재시작을 먼저 실패시킨다.

- [ ] 허용 전이만 통과시키고 필수 응답이 없으면 다음 단계로 가지 않는다.
- [ ] back은 응답을 보존하고 restartConfirmed는 초기 상태를 새 객체로 만든다.
- [ ] 새로고침 복구나 영구 저장은 구현하지 않는다.
- [ ] 미래 커밋: **feat: add guarded learning session**

### Task 4 — 앱 셸과 입구

**RED:** EntranceScreen과 App의 컴포넌트 테스트를 먼저 작성한다.

- [ ] 학습 목표, 6개 미션, 예상 시간, 저장하지 않음, 업데이트 내역을 화면에 표시한다.
- [ ] Enter와 Space로 시작하며 시작 후 mainHeadingRef에 초점이 이동한다.
- [ ] 작은 화면에서 핵심 시작 버튼이 첫 뷰포트의 주요 흐름 안에 보인다.
- [ ] 미래 커밋: **feat: build 빈 공간 패스 전술판 entrance**

### Task 5 — 핵심 학습 화면

**RED:** TacticsWorkbench.test.tsx에서 실제 학생 행동 순서를 먼저 작성한다.

- [ ] 경기판을 관찰하고 선수 이동·패스 선택·수비 공개·다음 지원까지 순서대로 수행하며 선택된 선수와 칸의 상태를 aria-pressed로 검증한다.
- [ ] 클릭, 터치, Tab/Shift+Tab, Enter/Space로 같은 결과를 만든다.
- [ ] 오답은 정답만 공개하지 않고 확인할 근거와 한 번의 수정 기회를 제공한다.
- [ ] 미래 커밋: **feat: implement pass-tactics learner flow**

### Task 6 — 결과 기록·인쇄·업데이트 내역

**RED:** LearningReport와 UpdateHistoryDialog 테스트를 먼저 작성한다.

- [ ] 최초 판단→근거→수정 결과를 미션별로 보여 주며 점수와 순위를 만들지 않는다.
- [ ] 인쇄 CSS는 A4 세로, 검정 텍스트, 흰 배경, 제어 버튼 숨김을 보장한다.
- [ ] 대화상자는 Escape와 닫기 버튼을 지원하고 닫은 뒤 호출 버튼으로 초점을 복원한다.
- [ ] 미래 커밋: **feat: add evidence report and update history**

### Task 7 — 시각 자산·라이트 모드·모션

**RED:** 자산 manifest와 모션 CSS 테스트를 먼저 작성한다.

- [ ] 이미지 생성 모델로 승인된 자산만 만들고 로컬 파일과 권리 장부의 1:1 대응을 검사한다.
- [ ] 이미지 속 글자·정답·색상만으로 전달되는 정보가 없도록 한다.
- [ ] gi-pulse 대상은 두 필수 버튼으로 제한하고 축소 모션에서 animation-name이 none인지 검사한다.
- [ ] 미래 커밋: **feat: add reviewed classroom visual system**

### Task 8 — 접근성·개인정보·E2E

**RED:** 아래 E2E와 경계 테스트를 먼저 작성한다.

- 3대1 안내 미션에서 열린 길을 고르고 근거를 확인한다.
- 중앙 길이 막힌 장면에서 막은 수비를 정확히 연결한다.
- 복수 유효 패스 미션을 두 경로로 각각 완료한다.
- 키보드만으로 선수·격자 칸·패스 길을 선택한다.
- 6개 미션 뒤 보고서에 승패·점수 없이 공간 근거가 표시된다.
- 320px에서 경기판 아래 도구 순서로 재배치되고 가로 넘침이 없다.
- 축소 모션에서 공 이동과 gi-pulse가 제거된다.
- 카메라·센서·위치·네트워크·저장소 요청이 없다.

- [ ] 자동 axe 검사에서 serious와 critical 위반 0건을 요구한다.
- [ ] Playwright는 Pages 하위 경로를 위해 page.goto('./')를 사용한다.
- [ ] 320px와 375px에서 document.documentElement.scrollWidth가 clientWidth를 넘지 않는다.
- [ ] VoiceOver 수동 검증은 실행하거나 완료로 보고하지 않는다.
- [ ] 미래 커밋: **test: verify learner flow and privacy boundary**

### Task 9 — 출시 준비와 HVC

- [ ] npm run verify가 모두 통과한 뒤에만 별도 출시 승인을 요청한다.
- [ ] 승인 후 WBmaker2/open-space-pass-tactics-board 저장소, main 브랜치, Pages build_type=workflow를 사용한다.
- [ ] GitHub Actions 성공 뒤 https://wbmaker2.github.io/open-space-pass-tactics-board/ 에서 제목, favicon, HTML 참조 자산, 콘솔 오류 0건, 실제 학습 흐름, 375px 화면을 확인한다.
- [ ] HVC 관리자 등록과 정적 갤러리 동기화는 공개 앱 확인 뒤 별도 단계로 수행한다.
- [ ] 최종 보고에는 배포 URL과 https://www.vibehong.shop/ 확인 링크를 클릭 가능하게 제공한다.
- [ ] 미래 커밋: **docs: record open-space-pass-tactics-board release evidence**

## 13. 검증 명령과 기대 결과

모든 명령은 미래 프로젝트 루트에서 실행한다.

    npm run lint
    npm run typecheck
    npm run test:run
    npm run test:a11y
    npm run check:lines
    npm run build
    npm run test:e2e
    npm run verify
    git diff --check

기대 결과:

- lint와 typecheck 오류 0건.
- 단위·컴포넌트 테스트 실패 0건, 6개 미션과 모든 음성·네트워크 금지 경계 포함.
- 자동 접근성 serious/critical 위반 0건.
- src와 tests의 TS, TSX, CSS 파일 500줄 이상 0개.
- dist/index.html과 해시 자산 생성, base URL이 /open-space-pass-tactics-board/로 빌드됨.
- 아래 명시한 E2E 시나리오 전부 통과.
- git diff --check 출력 없음.

## 14. 앱별 완료 기준

1. 실제 학생 이름, 팀, 경기 영상, 위치 정보 입력란이 없다.
2. 복수로 열린 패스 길을 모두 유효로 인정한다.
3. 경기판 판정은 검수된 lane 데이터로만 이루어지고 숨은 물리 공식이 없다.
4. 드래그 없이 모든 선수 이동과 패스 선택을 완료한다.
5. 결과가 운동 능력·전술 지능·승리 가능성을 평가한다고 표현하지 않는다.

## 15. 사람 검수와 증거 경계

- **자동화로 증명:** 타입, 순수 판정, 콘텐츠 무결성, 키보드 흐름, 축소 모션, 가로 넘침, 개인정보·네트워크 경계, 빌드 자산.
- **사람 검수 필요:** 교과 정확성, 어린이 문장 난이도, 생성 이미지의 맥락·편향·권리, 실제 태블릿 가독성.
- **추가 승인:** 체육 교사가 격자 모형의 용어, 패스 길, 지원 이동이 초등 수업에서 오해를 만들지 않는지 승인해야 한다.
- **명시적 제외:** VoiceOver 구현 및 검증.
- 자동화 통과를 인간 교과 검수, 출시 승인, 공개 배포, HVC 등록 완료로 표현하지 않는다.

## 16. 계획 자체 검토

- [x] TBD, TODO, placeholder, 임시 콘텐츠가 없다.
- [x] 여섯 미션 ID와 타입·테스트·화면 명칭이 일치한다.
- [x] 복수 정답과 판단 보류가 필요한 곳에서 단일 정답을 강요하지 않는다.
- [x] 모든 경로가 무로그인·무서버·무학생 개인정보 원칙을 지킨다.
- [x] 필수 버튼 두 개만 gi-pulse를 사용하고 축소 모션 대체가 있다.
- [x] 이미지 생성 자산과 프로그램 SVG의 역할이 분리되어 있다.
- [x] 구현, 테스트 실행, 커밋, 배포를 아직 수행하지 않았다고 기록한다.

## 17. 구현 인계

구현 승인 후 Task 0부터 순서대로 진행한다. 각 기능 Task는 **실패 테스트 작성 → 의도한 실패 확인 → 최소 구현 → 통과 확인 → 관련 파일만 커밋** 순서를 지킨다. 한 Task의 검증이 실패한 채 다음 Task로 넘어가지 않는다.
