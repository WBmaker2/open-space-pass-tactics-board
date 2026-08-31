# 출시 증거 (Release Evidence)

> 2026-08-31 학습자 UX 개선을 main에 커밋·푸시하고 GitHub Pages 공개 배포를 완료했다. 사람 검수(교과 검수)와 HVC 관리자 등록은 별도 단계다.

## 최신 배포 (2026-08-31)

| 항목 | 값 |
|---|---|
| 릴리스 커밋 | [`3339324055e448b79c66f2ca1a82fd9a7814bc1a`](https://github.com/WBmaker2/open-space-pass-tactics-board/commit/3339324055e448b79c66f2ca1a82fd9a7814bc1a) |
| CI | [run 33358140545](https://github.com/WBmaker2/open-space-pass-tactics-board/actions/runs/33358140545) 성공 |
| Pages 배포 | [run 33358140589](https://github.com/WBmaker2/open-space-pass-tactics-board/actions/runs/33358140589) 성공 |
| 공개 URL | https://wbmaker2.github.io/open-space-pass-tactics-board/ |

### 최신 공개 검증

- [x] HTML과 favicon HTTP 200, 제목 `빈 공간 패스 전술판`
- [x] 해시 JS/CSS와 생성 WebP 자산 HTTP 200
- [x] 공개 브라우저에서 미션 1 전체 단계와 미션 2~6을 완료해 `전술 기록` 도달
- [x] 보고서에 미션별 기록 6개와 `다음에는 이렇게 말해 보세요` 표시
- [x] 공개 학습 흐름 콘솔 오류 0건, 비정적 네트워크 요청 0건
- [x] 320px에서 첫 화면 `학습 시작하기` 노출 및 가로 넘침 없음

## 기준선 배포 정보 (2026-08-30)

| 항목 | 값 |
|---|---|
| 저장소 | https://github.com/WBmaker2/open-space-pass-tactics-board |
| 브랜치 | main |
| 리디자인 커밋 | `9a55b89` |
| E2E 안정화 커밋 | `dfc4587` |
| 배포 URL | https://wbmaker2.github.io/open-space-pass-tactics-board/ |
| Pages 방식 | build_type=workflow (`deploy-pages.yml`) |

## 배포 전 검증

- `npm run lint` 통과
- `npm run typecheck` 통과
- `npm run test:run`: 10개 파일, 106개 통과
- `npm run test:a11y`: 3개 통과
- `npm run test:release`: 4개 통과
- `npm run check:lines`: TS·TSX·CSS 500줄 미만
- `npm run build` 통과
- `git diff --check` 통과

## CI / 배포 워크플로우

- CI: [run 33295157428](https://github.com/WBmaker2/open-space-pass-tactics-board/actions/runs/33295157428) 성공
  - `npm run verify` 전체 실행
  - Vitest 106 + 접근성 3 + 릴리스 4 통과
  - Playwright E2E 12개 통과, flaky 0건
- Deploy Pages: [run 33295157473](https://github.com/WBmaker2/open-space-pass-tactics-board/actions/runs/33295157473) 성공

## 이전 공개 URL 검증 (2026-08-30)

- [x] 제목: `빈 공간 패스 전술판`
- [x] favicon: `/open-space-pass-tactics-board/favicon.svg` HTTP 200
- [x] 생성 이미지: `bright-gym-tactics-board` WebP HTTP 200
- [x] HTML이 Pages 하위 경로의 해시 JS/CSS를 참조한다
- [x] MCP 브라우저에서 여섯 미션 완료 → `전술 기록`
- [x] 최종 기록 카드 6개 표시
- [x] 공개 학습 흐름 콘솔 오류 0건
- [x] 공개 학습 흐름 가로 넘침 없음

## 남은 별도 단계 (자동화로 대체 불가)

1. 체육 교과 검수자의 미션·문구 승인 (`docs/content-review.md`, reviewStatus는 전체 pending)
2. 실제 태블릿과 Safari에서의 가독성·사용성 확인
3. HVC 관리자 등록과 정적 갤러리 동기화 (관리자 권한 필요)
4. VoiceOver 수동 검증은 이번 제품 범위에서 제외하며, 별도 음성 기능을 추가하지 않음
