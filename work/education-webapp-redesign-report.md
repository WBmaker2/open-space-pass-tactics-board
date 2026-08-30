# 교육용 웹앱 전체 리디자인 결과 보고서

## 작업 개요

- 작업일: 2026-08-30
- 대상: `open-space-pass-tactics-board` React/Vite 교육용 앱
- 목표: 기존 학습 규칙과 데이터 계약을 유지하면서, 학생이 `작전판 → 지금 할 일 → 선택 근거 → 다음 행동` 순서로 읽는 화면으로 전체 UI를 재구성
- 범위: 입구 화면, 미션 진행 화면, 전술판 조작 영역, 피드백, 학습 기록, 반응형/접근성 스타일
- 제외: 문제 로직·미션 데이터 변경, 서버/로그인/분석/저장 추가, 학생 음성 기능, VoiceOver 구현·검증, 커밋·푸시·배포·HVC 등록

## 최종 결과

앱의 시각적 언어를 `체육관 작전 노트`로 통일했습니다. 따뜻한 라이트 배경, 종이 같은 표면, 전술판의 녹색 계열, 공격/수비의 주황 대비를 사용하고, 단계별 작업 화면에서는 전술판과 선택 패널의 관계가 먼저 보이도록 재배치했습니다.

기존의 여섯 미션, 패스 가능성 판단, 지원 선수 선택, 재시도/피드백, 최종 `전술 기록` 흐름은 그대로 유지했습니다. 제품 계약상 없는 점수·승리·순위·장기 저장·네트워크 요청을 새로 만들지 않았습니다.

## 주요 변경 파일

- [`src/app/App.tsx`](</Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board/src/app/App.tsx>)
  - 스킵 링크, 명확한 메인 랜드마크, 단계 전환 시 포커스 이동/스크롤 유지
- [`src/features/pass-tactics/EntranceScreen.tsx`](</Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board/src/features/pass-tactics/EntranceScreen.tsx>)
  - 학습 목표·사용 시간·진행 구조를 한눈에 보여 주는 입구 데스크
  - 기존 생성 이미지 유지, 장식 이미지에는 빈 대체 텍스트 적용
- [`src/features/pass-tactics/TacticsWorkbench.tsx`](</Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board/src/features/pass-tactics/TacticsWorkbench.tsx>)
  - `지금 판 읽기` 헤더, 작업 지시, 판과 선택 근거 패널의 위계 정리
- [`src/features/pass-tactics/TacticsBoard.tsx`](</Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board/src/features/pass-tactics/TacticsBoard.tsx>)
  - 기존 SVG 사실 자산을 보존하면서 터치/포인터 hit area 확대
- [`src/features/pass-tactics/StepPanels.tsx`](</Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board/src/features/pass-tactics/StepPanels.tsx>)
  - 좌표 중심의 노출 문구를 역할 중심 선택 라벨로 정리하고, 관찰 단계의 다음 행동 안내 보강
- [`src/features/pass-tactics/FeedbackPanel.tsx`](</Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board/src/features/pass-tactics/FeedbackPanel.tsx>)
  - 피드백 제목/본문/상태 메시지의 의미 구조 정리
- [`src/features/report/LearningReport.tsx`](</Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board/src/features/report/LearningReport.tsx>)
  - 여섯 미션 기록을 학습 증거 카드로 재배치하고 인쇄 행동을 별도 영역으로 분리
- [`src/update/updateHistory.ts`](</Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board/src/update/updateHistory.ts>)
  - 2026-08-30 리디자인 내역 추가
- [`design-system/MASTER.md`](</Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board/design-system/MASTER.md>)
  - 프로젝트 전용 색상·간격·타이포그래피·반응형·접근성 기준 기록

스타일은 한 파일이 과도하게 커지지 않도록 [`src/styles/app.css`](</Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board/src/styles/app.css>), [`src/styles/board.css`](</Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board/src/styles/board.css>), [`src/styles/progress.css`](</Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board/src/styles/progress.css>), [`src/styles/overlays.css`](</Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board/src/styles/overlays.css>), [`src/features/report/report.css`](</Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board/src/features/report/report.css>)로 분리했습니다. 모든 TS/TSX/CSS 파일은 500줄 미만입니다.

## 교육 UX·접근성 반영

- 중요한 학습 단계 CTA 두 곳에만 `gi-pulse` 강조를 유지했습니다.
- `prefers-reduced-motion`과 앱의 모션 토글에서 애니메이션을 정지하고 포커스 윤곽을 유지합니다.
- 320px 폭에서도 가로 스크롤 없이 동작하며 SVG 조작 대상은 약 46px hit area로 보강했습니다.
- 375px에서는 입구/작업/기록 화면이 세로 흐름으로 전환되고, 1280px에서는 전술판과 작업 패널이 동시에 읽힙니다.
- 키보드 Tab으로 시작 CTA에 도달하고 Enter로 미션에 진입할 수 있으며, 단계 전환 후 제목으로 포커스를 이동합니다.
- 학생 대상 VoiceOver 음성 기능이나 TTS를 추가하지 않았고, 별도 VoiceOver 검증도 수행하지 않았습니다.

## 이미지·자산 결정

기존 [`src/assets/generated/bright-gym-tactics-board.webp`](</Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board/src/assets/generated/bright-gym-tactics-board.webp>)는 체육관 맥락을 설명하는 일반 장식 자산이며, 텍스트·브랜드·사실 판정 정보를 포함하지 않아 그대로 보존했습니다. 새 이미지가 필요한 범위가 아니므로 이미지 생성으로 기존 자산을 덮어쓰거나 불필요한 장식 자산을 추가하지 않았습니다. 세부 기록은 [`work/education-webapp-redesign-assets.md`](</Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board/work/education-webapp-redesign-assets.md>)에 있습니다.

## 검증 결과

| 검증 | 결과 |
| --- | --- |
| `npm run lint` | 통과 |
| `npm run typecheck` | 통과 |
| `npm run test:run` | 10개 파일, 106개 통과 |
| `npm run test:a11y` | 3개 통과 |
| `vitest run tests/visual tests/release` | visual 7개 + release 4개, 총 11개 통과 |
| `npm run check:lines` | 모든 TS/TSX/CSS 500줄 미만 |
| `npm run build` | Vite production build 통과 |
| `git diff --check` | 통과 |
| Impeccable 최종 detector | `[]` |
| 브라우저 콘솔 | 오류 0, 경고 0 |
| 동적 네트워크 요청 | 0개 |

브라우저에서는 로컬 MCP 브라우저로 1280px/375px/320px을 확인하고, 여섯 미션 전체를 완료해 `전술 기록`과 6개 기록 카드를 확인했습니다. 320px에서는 `scrollWidth === clientWidth`, 축소 모션에서는 `animationName: none`과 3px 포커스 윤곽을 확인했습니다.

공식 `npm run test:e2e`는 실행 시점에 다른 프로젝트가 `127.0.0.1:4173`을 점유해 `EADDRINUSE`로 시작하지 못했습니다. 점유 중인 프로세스는 범위 밖 프로세스라 종료하지 않았고, 별도 로컬 Playwright Chromium 실행도 macOS `MachPortRendezvous Permission denied`/`SIGTRAP` 환경 오류가 있어 반복하지 않았습니다. 따라서 공식 E2E 전체 통과로 표현하지 않고, MCP 브라우저 수동 흐름을 보완 증거로 기록합니다.

## 시각 확인 자료

- [입구 데스크톱 캡처](</Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board/output/playwright/redesign-entrance-desktop.png>)
- [전술 작업 데스크톱 캡처](</Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board/output/playwright/redesign-workbench-desktop-final.png>)
- [학습 기록 모바일 캡처](</Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board/output/playwright/redesign-report-mobile-final.png>)

## 기록·계획 문서

- [`PRODUCT.md`](</Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board/PRODUCT.md>) — 제품 사실과 범위
- [`work/education-webapp-redesign-plan.md`](</Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board/work/education-webapp-redesign-plan.md>) — 구현 계획과 진행 기록
- [`work/education-webapp-redesign-audit.md`](</Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board/work/education-webapp-redesign-audit.md>) — 초기/최종 UI 감사

이번 요청에는 커밋·푸시·공개 배포가 포함되지 않았으므로 공개 URL이나 HVC 등록 상태는 만들지 않았습니다. 실제 학급 사용 전에는 체육 교과 내용 검토, 교사/학생 수동 사용성 확인, 실제 Safari/보조공학 검토를 별도 게이트로 진행해야 합니다.
