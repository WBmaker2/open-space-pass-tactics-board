# 빈 공간 패스 전술판 (Open Space Pass Tactics Board)

초등 3~6학년 체육 수업용 정적 학습 앱. 고정된 가상 경기판(7×5 격자)에서 **수비가 막지 않은 패스 길**과 **패스 뒤 지원 위치**를 찾고, 선택을 점수나 승패가 아니라 **공간 근거**로 설명한다.

- 대상: 초등 3~6학년 / 교과: 체육 / 권장 활동 시간: 15~25분
- 미션: 검수된 고정 6개(런타임 무작위 생성 없음)
- 판정: 검수된 lane 데이터만 사용(숨은 물리 공식 없음)

## 개인정보와 네트워크

- 서버, 로그인, 분석, 광고, 쿠키 없음
- `localStorage`, `sessionStorage`, IndexedDB, `document.cookie` 사용 금지
- 외부 네트워크 요청 0건(런타임 경계 테스트로 검증)
- 학생 응답은 탭 메모리에만 존재하며 새로고침하면 사라짐(앱 안내 문구로 명시)

## 개발 명령

```bash
npm install
npm run dev          # 로컬 개발(base = /)
npm run verify       # lint → typecheck → 단위/컴포넌트 → 접근성 → 줄 수 → build → 릴리스 자산 → E2E
npm run check:lines  # TS·TSX·CSS 500줄 미만 강제
npm run test:e2e     # Playwright(preview 서버, base = /open-space-pass-tactics-board/)
```

## 구조

- `src/domain` — 타입과 순수 판정 함수(`passEvaluator.ts`만 정오를 계산)
- `src/content` — 검수된 6개 미션 데이터와 콘텐츠 검증기
- `src/app` — useReducer 세션 상태와 전이 잠금
- `src/features` — 입구, 학습 화면, 결과 기록
- `tests`, `e2e` — 접근성·개인정보 경계·릴리스 자산·E2E

## 검수 상태

교과 내용·어린이용 문구·미션 정답은 `docs/content-review.md`의 검수 절차를 거친다. 사람 검수(체육 교과)와 출시 승인은 자동화 통과와 별개의 단계다. 생성 이미지 권리는 `docs/image-rights-ledger.md`에 기록한다.
