# 빈 공간 패스 전술판 — 교육용 웹앱 전체 리디자인 계획

## 상태와 범위

- 작성일: 2026-08-30
- 대상: `/Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board`
- 요청: 기존 React/Vite 교육용 앱의 전체 UI 리디자인
- 실행 모드: `full` — 계획 기록 후 구현까지 진행
- 커밋·푸시·배포·HVC 등록: 별도 요청 전까지 수행하지 않음
- VoiceOver 구현·검증: 프로젝트 규칙에 따라 제외
- 기준 문서: 저장소에 `AGENTS.md`, `EDUCATION_DESIGN.md`, `design-system/MASTER.md`가 없어 새로 추측하지 않음. 사용자 제공 AGENTS 규칙, 기존 README와 2026-08-28 구현 계획, `PRODUCT.md`를 적용함.

## 사전 자원과 역할

| 역할 | 상태 | 실제 문서 | 확인 시점(UTC) |
|---|---|---|---|
| `$education-webapp-redesign` | available | `/Users/kimhongnyeon/.codex/skills/education-webapp-redesign/SKILL.md` | 2026-08-30 |
| `$impeccable` | available | `/Users/kimhongnyeon/.codex/skills/impeccable/SKILL.md` | 2026-08-30 |
| `$ui-ux-pro-max` | available | `/Users/kimhongnyeon/.codex/skills/ui-ux-pro-max/SKILL.md` | 2026-08-30 |
| `$redesign-existing-projects` | available | `/Users/kimhongnyeon/.codex/skills/redesign-existing-projects/SKILL.md` | 2026-08-30 |
| `$imagegen` | provided by Codex | `/Users/kimhongnyeon/.codex/skills/.system/imagegen/SKILL.md` | 2026-08-30 |

Stage 0의 고정 자원·커밋·SHA-256·라이선스 및 런타임 갱신 결과는 `work/education-webapp-redesign-stage0-report.md`에 기록했습니다. Stage 0은 코드·의존성을 수정하지 않았습니다.

## 현재 제품 계약과 보존 범위

### 반드시 보존

- 여섯 개 미션의 ID, 상태 ID, 패스 길 ID, 승인된 전이 및 `src/domain/passEvaluator.ts`의 판정 경계
- `useReducer` 기반의 허용 전이·revision 잠금, 뒤로 가기 시 응답 보존, 완료 뒤 답변 잠금
- 입구 → 미션 단계 → 결과 기록의 학습자 여정과 기존 한국어 학습 콘텐츠
- 서버·로그인·분석·광고·쿠키·브라우저 저장소·외부 요청 0건 경계
- 인쇄 결과에 학생 식별자를 넣지 않는 정책
- 라이트 모드, `gi-pulse`의 필수 행동 한정, 축소 모션 대체, 업데이트 내역

### 이번 범위에서 바꾸지 않음

- 새로운 미션·정답·교과 사실·판정 공식을 임의로 추가하지 않음
- 앱 프레임워크·패키지 매니저·스타일링 스택을 변경하지 않음
- 음성 기능, 학생 계정, 서버 저장, 타이머, 점수·등급·순위, 외부 이미지 핫링크를 추가하지 않음
- 사실성·출처가 중요한 경기 도식·로고·사진을 생성 이미지로 대체하지 않음

## 초기 조사 근거

- 프레임워크: Vite + React 18 + TypeScript, 패키지 매니저: npm
- 진입점: `src/main.tsx` → `src/app/App.tsx`
- 핵심 UI: `src/features/pass-tactics/EntranceScreen.tsx`, `TacticsWorkbench.tsx`, `TacticsBoard.tsx`, `StepPanels.tsx`, `FeedbackPanel.tsx`, `src/features/report/LearningReport.tsx`
- 공통 스타일: `src/styles/tokens.css`, `app.css`, `board.css`, `motion.css`
- 테스트: `npm run lint`, `npm run typecheck`, `npm run test:run`, `npm run test:a11y`, `npm run test:release`, `npm run check:lines`, `npm run test:e2e`, `npm run build`, 통합 `npm run verify`
- 기존 앱은 작동 가능한 기능과 테스트 계약을 갖추었으나, 시각적 위계가 기본 카드·필·동일한 그림자에 의존하고 작업 화면의 빈 공간·기술적 좌표 표기·중복 제목이 학습 흐름을 약화시킴
- 브라우저 초기 관찰: 1280px 입구는 `960px` 고정 카드 중심, 375px에서는 입구가 세로로 잘 쌓이지만 학습 화면 헤더 도구가 여러 줄로 분리되고, 데스크톱 학습 화면 관찰 단계는 오른쪽 작업 패널이 넓게 비어 있음
- 기존 생성 자산은 밝은 체육관 일러스트이며 입구 장식 역할로 보존 후보입니다. 정확한 판정 정보를 담는 전술판은 SVG로 유지합니다.

## 학습자 흐름과 상태 전이

```text
입구
  → 미션별 OBSERVE: 공 보유 선수 선택
  → PREDICT: 패스 길과 공간 근거 예측
  → MOVE(해당 미션): 받을 사람의 한 칸 이동
  → PASS: 열린 패스 길 확인, 필요 시 막은 수비 연결
  → REVEAL(해당 미션): 수비 이동 뒤 유지/수정
  → SUPPORT(해당 미션): 다음 패스 길을 만드는 지원 위치
  → 다음 미션
  → REPORT: 시작/마친 판, 처음 생각, 근거, 수정 결과, 인쇄
```

화면 설계는 각 단계에 `현재 단계`, `지금 할 일`, `선택 영역`, `검수/확인 버튼`, `다음 단계`를 같은 순서로 배치합니다. 선택 전에는 판정 상태를 미리 공개하지 않고, 선택 후에는 색상과 문장을 함께 제공하며, 단계가 바뀌면 제목에 포커스를 옮깁니다.

## 초기 감사 계획과 기록

초기 UI/UX 감사는 `$impeccable`의 `critique`/`audit` 기준을 따르되, 현재 세션에 `spawn_agent`가 노출되지 않아 단일 컨텍스트(degraded)로 수행합니다. 대상은 `src/app/App.tsx`와 실제 입구·학습·결과 흐름입니다.

감사 항목:

- 학습 목표·다음 행동·피드백·결과·다음 행동의 위계
- 어린이용 문구와 실제 검수 콘텐츠의 일치
- 320/375/768/1280px, 200% 확대, 키보드 포커스·스크롤
- 반복되는 카드·필·색상·버튼·그림자 규칙과 디자인 특이성
- `gi-pulse`, reduced motion, 오류 회복, 모달 탈출
- 이미지 사용처·렌더 크기·alt·일반 장식/사실성 자산 구분
- detector 결과와 브라우저 콘솔을 자동·수동 증거로 분리

초기 감사 산출물: `work/education-webapp-redesign-audit.md` (P0/P1은 아래 수용 기준으로 승격)

## 리디자인 방향(감사·디자인 시스템에서 확정)

초기 방향은 “전술판을 읽는 작은 작전 데스크”입니다. 기존의 일반 카드 목록을 그대로 꾸미지 않고, 경기판을 첫 화면의 주인공으로 세우며 작업 패널은 학생이 지금 할 한 가지 판단만 보여 주는 구조로 바꿉니다. 최종 색·서체·간격·반경·반응형 토큰은 `$ui-ux-pro-max --design-system` 결과와 초기 감사 후 `design-system/MASTER.md`에 확정합니다.

예상 화면 구조:

- 입구: 짧은 학습 약속 + 체육관 장식 자산 + 6개 미션을 학습 경로로 요약 + 하나의 시작 CTA
- 학습: 상단 진행 요약 + 2열 `전술판 / 작전 카드` 데스크톱, 모바일 `전술판 → 작전 카드 → 다음 단계` 세로 흐름
- 작전 카드: 단계 번호·질문·선택지·근거·피드백·행동 버튼 순서, 긴 설명은 보조 텍스트로 낮춤
- 결과: 여섯 미션을 시작 판/마친 판보다 근거와 변화가 먼저 읽히는 기록 목록으로 정리하고, 인쇄 CTA를 마지막 다음 행동으로 고정

## 예상 파일과 변경 책임

### 스타일/셸

- `src/styles/tokens.css`: 라이트 테마 색상·서체·간격·반경·고도·z-index 토큰
- `src/styles/app.css`: 앱 셸·입구·공통 버튼·반응형
- `src/styles/board.css`: SVG 경기판, 상태·선택·범례·학습 패널
- `src/styles/motion.css`: `gi-pulse`, 상태 전환, reduced-motion 대체
- `src/styles/overlays.css`, `src/styles/progress.css`: 모달·오류·단계 진행 표시
- `src/features/report/report.css`: 전술 기록의 보드·요약·인쇄 전 표면
- `index.html`: 제목·설명·favicon/메타는 사실을 유지하며 필요한 경우에만 갱신

### 컴포넌트

- `src/app/App.tsx`: 셸·헤더·재시작 모달·단계 포커스 계약
- `src/components/ActionButton.tsx`, `ProgressSteps.tsx`, `ModalDialog.tsx`, `UpdateHistory*`: 공통 상호작용·상태·업데이트 내역
- `src/features/pass-tactics/EntranceScreen.tsx`: 첫 행동 위계
- `src/features/pass-tactics/TacticsWorkbench.tsx`: 보드/작전 카드 레이아웃 및 기존 dispatch 보존
- `src/features/pass-tactics/TacticsBoard.tsx`: SVG 의미·선택 가능 상태·레이아웃을 보존하면서 모바일 44px hit area 보강
- `src/features/pass-tactics/StepPanels.tsx`, `FeedbackPanel.tsx`: 콘텐츠·판정 호출은 보존하고 시각·문장 배치 개선
- `src/features/report/LearningReport.tsx`, `report.css`, `print.css`: 결과 요약과 인쇄 흐름 개선
- `src/styles/overlays.css`, `progress.css`: 500줄 제한을 지키기 위한 모달·진행 표시 스타일 분리

### 문서/자산

- `design-system/MASTER.md`: 생성·검토된 전역 디자인 시스템
- `work/education-webapp-redesign-audit.md`: 초기 및 최종 감사
- `work/education-webapp-redesign-assets.md`: 원본/새 자산·역할·alt·권리·검토 상태
- `work/education-webapp-redesign-report.md`: 변경·검증·미해결·실행하지 않은 역할
- `docs/image-rights-ledger.md`: 생성 자산을 추가할 때 기존 형식을 유지해 갱신
- `src/update/updateHistory.ts`: 2026-08-30 리디자인 항목 추가

## 이미지 자산 판정 규칙

1. `public`, `src/assets`, CSS `url()`, JSX/TSX import·`srcset`·preload 사용처를 먼저 목록화합니다.
2. 입구의 체육관 이미지는 일반 장식 자산인지 확인하고, 낮은 품질·부적합한 구도일 때만 `$imagegen` 생성 후보를 검토합니다.
3. 전술판·좌표·수비·패스 길은 사실/판정 정보이므로 SVG·코드 자산을 유지합니다.
4. 생성 이미지는 텍스트·숫자·브랜드·실존 인물·검증되지 않은 사실을 포함하지 않고, 원본을 덮어쓰지 않는 버전 파일로 저장합니다.
5. 새 자산을 생성하면 `docs/image-rights-ledger.md`와 `work/education-webapp-redesign-assets.md`에 프롬프트·날짜·사용 위치·alt·검토 상태를 기록하고 빌드에서 실제 로드되는지 확인합니다.
6. 교체 필요가 없으면 원본 보존과 `not replaced` 사유를 기록합니다.

## 구현 순서(TDD와 안전 경계)

1. 계획·PRODUCT·초기 감사·Stage 0 보고서 확인
2. `$ui-ux-pro-max` 디자인 시스템 검색 및 `design-system/MASTER.md` 검토
3. UI 테스트 보강(입구/학습/결과): 새 시각 구조의 역할·텍스트·버튼 이름·진행·포커스·reduced-motion 계약을 먼저 작성
4. 토큰·앱 셸·공통 버튼/모달/진행 표시 스타일 구현
5. 입구 리디자인 구현 후 `lint`, `typecheck`, 관련 테스트
6. 전술판·작전 카드·단계 패널 리디자인 구현 후 관련 컴포넌트/E2E 테스트
7. 결과 기록·인쇄 스타일 구현 후 privacy/release 테스트
8. 자산 감사 후 교체가 필요할 때만 `$imagegen`으로 일반 장식 자산 생성·검토
9. 모든 TS/TSX/CSS 500줄 미만 확인 및 `npm run verify`
10. `$impeccable` 최종 검수와 브라우저 흐름(입구→결과), 320/375/768/1280px, 키보드, reduced motion, 라이트 모드, 콘솔·자산 로드 확인

## 수용 기준

### 학습과 상태

- 기존 여섯 미션이 같은 순서·판정·복수 해법으로 완주됩니다.
- 각 화면에서 핵심 CTA가 하나로 드러나며, 필수 단계 버튼은 `패스 길 확인`과 `다음 지원 시험`에만 `gi-pulse`를 사용합니다.
- 오답 시 정답을 즉시 노출하지 않고 근거·한 번의 수정 경로를 제공합니다.
- 결과에서 점수·등급·승패·학생 식별자를 노출하지 않고, 처음 생각·근거·수정 결과와 인쇄 행동을 제공합니다.

### 시각·반응형

- 첫 뷰포트에서 앱의 목적과 첫 행동이 이해됩니다.
- 320/375px에서 가로 스크롤이 없고 전술판과 현재 할 일이 세로로 읽힙니다.
- 768/1280px에서 전술판과 작전 카드가 균형 있게 배치되며 오른쪽 패널의 불필요한 빈 공간이 줄어듭니다.
- 본문 16px 이상, 충분한 대비, `:focus-visible`, 44px 이상 터치 목표, 200% 확대를 유지합니다.
- 라이트 모드가 일관되고 다크 모드 전환을 추가하지 않습니다.

### 자동·수동 검증

- `npm run lint`, `npm run typecheck`, `npm run test:run`, `npm run test:a11y`, `npm run test:release`, `npm run check:lines`, `npm run build`가 실제 스크립트 기준으로 통과합니다.
- `npm run test:e2e` 결과는 브라우저 환경 이슈가 있으면 자동 결과와 분리합니다.
- 키보드: 입구 시작, 선수 선택, 라디오/근거 체크, 확인, 다음/뒤로, 모달 Escape와 포커스 복귀를 확인합니다.
- 브라우저: 실제 학습자 흐름을 시작→활동→피드백→결과→인쇄 CTA까지 확인하고 콘솔 오류 0건·이미지 로드·가로 넘침을 기록합니다.
- `prefers-reduced-motion: reduce` 및 앱 토글에서 `gi-pulse`가 애니메이션 없이 3px 정적 강조로 바뀝니다.
- VoiceOver는 실행·검증하지 않으며, 사람이 별도로 승인해야 하는 교과·사실성·보조공학 평가는 `pending`으로 남깁니다.

## 롤백 방법

- 코드 변경 전의 파일 상태는 Git 기준으로 보존합니다. 새 문서·자산은 삭제하지 않고 검토 가능한 별도 파일로 남깁니다.
- 문제가 생기면 구현 변경 파일만 해당 커밋이 아니라 `git diff` 기준으로 되돌릴 수 있도록 작은 단위로 유지합니다. 파괴적 reset/checkout은 사용하지 않습니다.
- 생성 자산은 원본 파일을 덮어쓰지 않으므로 import 경로를 이전 파일로 되돌리면 즉시 복구됩니다.

## 진행 기록

- 2026-08-30: Stage 0 check 완료, 기존 규칙·README·기존 구현 계획·테스트·자산 확인
- 2026-08-30: `PRODUCT.md`와 본 리디자인 계획 작성
- 2026-08-30: 초기 감사와 브라우저 기준선 확인, `$ui-ux-pro-max` 결과를 프로젝트 디자인 시스템으로 조정
- 2026-08-30: 앱 셸·입구·전술판·단계 패널·피드백·기록 화면 리디자인 구현
- 2026-08-30: 자산은 교체하지 않고 보존 사유·alt·롤백을 기록
- 2026-08-30: 자동 검증과 1280/375/320px 브라우저 검증 완료. 공식 E2E는 다른 프로세스가 4173 포트를 점유해 실행 불가
- 2026-08-30: 사용자 승인 후 `9a55b89` 커밋·main 푸시·Pages 배포 완료
- 2026-08-30: CI에서 E2E flaky 원인을 수정한 `dfc4587`을 추가 푸시하고 12개 E2E 전체 통과 확인
