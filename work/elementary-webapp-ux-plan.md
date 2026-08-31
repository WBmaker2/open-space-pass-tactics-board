# 빈 공간 패스 전술판 — 초등 학습자 UX 점검·개선 계획

## 실행 정보

- 작성일: 2026-08-31
- 대상: `/Volumes/ External Drive 256G/Dev2/codex/open-space-pass-tactics-board`
- 요청: 기존 교육용 React/Vite 앱의 학습자 관점 점검과 근거 있는 개선
- 실행 모드: `full`
- 이번 범위: 기준선 브라우저 감사, simulated learner comprehension probe, 학생용 언어 감사, 시뮬레이션 필요성 판단, P0–P2 우선 개선, 회귀 검증
- 이번 범위 밖: 커밋·푸시·배포·HVC 등록, VoiceOver/TTS/음성 재생·녹음·내레이션, 학생 계정·식별자·저장소·네트워크, 신규 미션·판정 공식, 승인 없는 Canvas/WebGL·게임 엔진·신규 의존성

## 적용 규칙과 기준

- `PRODUCT.md`와 `design-system/MASTER.md`를 프로젝트 기준으로 사용합니다.
- 기존 `work/education-webapp-redesign-plan.md`, `work/education-webapp-redesign-audit.md`, `work/education-webapp-redesign-report.md`의 완료 증거를 기준선으로 재사용하되, 이번 브라우저 확인 없이는 현재 통과로 간주하지 않습니다.
- `elementary-webapp-ux-orchestrator`의 Stage 0, severity rules, 100-point acceptance gate, simulated learner panel, child-language rubric, child-UX rubric, simulation policy를 적용합니다.
- Playwright를 실제 렌더링·상태 전이·반응형·키보드 증거에 사용하고, Impeccable 원칙과 detector를 시각·구현 결함 보조 근거로 사용합니다.
- 목표 학습자: 초등 3–6학년. 주 패널은 초3–4 준호, 가드레일은 초5–6 서윤으로 두며 실제 학생 연구나 승인으로 표현하지 않습니다.

## 점검 순서

1. Stage 0 결과와 프로젝트 규칙·디자인 시스템·기존 리디자인 기록 확인
2. 소스 구조·콘텐츠·상태 전이·테스트 계약 확인
3. 입구 → 미션 1 → 자연스러운 오답·회복 → 여섯 미션 → 전술 기록의 실제 브라우저 흐름 확인
4. 320×800, 375×812, 768×900, 1280×900 및 키보드·reduced-motion 상태 점검
5. 학생용 문구 후보를 수집하고 상태별로 지시·선택·힌트·피드백·완료·다음 행동을 감사
6. 정적 DOM/SVG가 학습 목표에 충분한지 판단하고, 근거가 없는 인터랙티브 시뮬레이션은 추가하지 않음
7. P0/P1/P2 순으로 계획을 갱신하고, 계획에 포함된 개선만 구현
8. 동일 시작 상태·동일 행동 순서로 회귀 검증, 자동 게이트·브라우저 증거·미실행 항목을 분리 기록

## 보존 계약

- 여섯 미션의 ID·상태 ID·패스 길 ID·전이 ID와 `src/domain/passEvaluator.ts`의 판정 경계를 보존합니다.
- 관찰 → 예측 → 이동/패스 → 수비 변화 → 지원 → 전술 기록 흐름과 복수 해법을 보존합니다.
- 학생 응답은 현재 탭 메모리에만 두며 새로고침·뒤로가기 동작의 기존 의미를 바꾸지 않습니다.
- 점수·순위·승패·학생 식별자·실제 능력 평가·외부 요청·브라우저 저장·학생 음성 기능을 추가하지 않습니다.
- 전술판의 정보성 SVG와 기존 일반 장식 WebP는 정확성·권리 경계를 확인한 뒤 필요 없으면 보존합니다.
- 입구와 단계별 필수 CTA에만 `gi-pulse`를 사용하고, `prefers-reduced-motion`에서는 정적 강조를 사용합니다.

## 산출물과 수용 기준

- Stage 0: `work/elementary-webapp-ux-bootstrap.md`
- 감사: `work/elementary-webapp-ux-audit.md`
- 학생용 언어 장부: `work/elementary-webapp-ux-language-audit.md`
- 시뮬레이션 결정: `work/elementary-webapp-ux-simulation-decision.md`
- 구현 시 시뮬레이션 테스트 장부: `work/elementary-webapp-ux-simulation-test.md` 또는 `not-needed` 사유 기록
- 최종 보고: `work/elementary-webapp-ux-report.md`

개선 후 다음을 만족해야 합니다.

- 미해결 P0/P1 없음, 핵심 학습 경로 시작·완료·오답 회복 가능
- 핵심 상태별 학생용 문구가 실제 렌더링되고, 지시 재진술·결과 예측·용어 설명·회복 행동 probe가 기록됨
- 완료 화면에 학습 takeaway와 다음 학습 행동이 있음
- 320/375/768/1280px에서 가로 넘침·핵심 CTA 가림 없음
- 마우스 없이 핵심 경로 조작 가능, 포커스가 보이고 단계 전환 후 제목이 가려지지 않음
- 자동 품질 스크립트와 변경 관련 회귀 테스트가 통과하거나, 환경상 미실행을 정확히 기록함
- 개선과 무관한 기존 작업을 덮어쓰지 않으며 커밋·푸시·배포는 별도 요청까지 수행하지 않음

## 현재 상태

- 단계: 구현·회귀 검증 완료
- 기준선: P1 3건(입구 CTA, 피드백 후 다음 CTA, 근거 기록 누락)과 P2 표현·완료 회고 문제를 브라우저에서 확인
- 개선 결과: 시작 CTA를 첫 화면으로 이동, 답변 후 다음 행동 맞춤, 이동 근거 저장·보고서 집계, 어린이용 방향·역할 문장, 완료 takeaway를 반영
- 보존 결과: 판정 공식·미션 계약·light mode·tab-memory·privacy 경계·기존 WebP를 유지하고 새 시뮬레이션·이미지 생성을 추가하지 않음
- 검증 결과: 개별 `lint`, `typecheck`, `test:run`(106), `test:a11y`(3), `test:release`(4), `check:lines`, `build`, E2E(12)는 통과. 통합 `verify`도 E2E 직전까지 통과했으나, 최종 webServer가 다른 프로젝트가 점유한 `127.0.0.1:4173`에서 시작하지 못함
- 릴리스 상태: 사용자 후속 요청에 따라 커밋·푸시·배포 완료. 커밋 `3339324055e448b79c66f2ca1a82fd9a7814bc1a`, CI run `33358140545`, Pages run `33358140589`가 성공했고 공개 URL에서 6개 미션 학습 경로를 확인함

## 릴리스 업데이트 (2026-08-31)

- UX 개선 커밋을 `main`에 만들고 원격 저장소에 푸시했습니다.
- GitHub Actions `CI`와 `Deploy Pages`가 해당 커밋에서 모두 성공했습니다.
- 공개 URL에서 제목·자산·콘솔·320px 폭·미션 1 전체와 미션 2~6 보고서 경로를 확인했습니다.
- 교사·교육과정 검수, 실제 태블릿·Safari 확인, HVC 관리자 등록은 별도 사람 검수 게이트로 남겨 두었습니다.
