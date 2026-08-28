# 출시 증거 (Release Evidence)

> 2026-08-28 사용자의 출시 승인에 따라 배포를 수행했다. 사람 검수(교과 검수)와 HVC 관리자 등록은 별도 단계로 남는다.

## 배포 정보

| 항목 | 값 |
|---|---|
| 저장소 | https://github.com/WBmaker2/open-space-pass-tactics-board |
| 브랜치 | main (커밋 8eddca5 기준 + 증거 문서) |
| 배포 URL | https://wbmaker2.github.io/open-space-pass-tactics-board/ |
| Pages 방식 | build_type=workflow (deploy-pages.yml) |
| 배포 일시 | 2026-08-28 |

## 배포 전 검증 (npm run verify 전체 통과)

- lint 0건 · typecheck 0건
- 단위·컴포넌트 테스트 116건 통과 (6개 미션 무결성, 판정 계약, 세션 전이 잠금, 개인정보·네트워크 경계, 자산 장부 1:1, 모션 규칙)
- 자동 접근성 serious/critical 0건
- TS·TSX·CSS 500줄 이상 0개
- dist 자산 base `/open-space-pass-tactics-board/` 검증 (tests/release)
- E2E 12건 통과
- `git diff --check` 출력 없음

## 배포 후 공개 URL 검증 (2026-08-28, headless Chromium)

- [x] 제목: 빈 공간 패스 전술판
- [x] favicon: `/open-space-pass-tactics-board/favicon.svg`
- [x] HTML 참조 자산 전부 하위 경로에서 200
- [x] 콘솔 오류 0건
- [x] 실제 학습 흐름(시작 → 관찰 → 예측 확인) 동작
- [x] 375px 가로 넘침 없음

## CI / 배포 워크플로우

- Deploy Pages: success (run 33179512037)
- CI verify: success (run 33179512008)

## 남은 별도 단계 (자동화로 대체 불가)

1. 체육 교과 검수자의 미션·문구 승인 (`docs/content-review.md`, reviewStatus는 전체 pending)
2. 생성 이미지 맥락·편향·권리 확인 (`docs/image-rights-ledger.md`)
3. HVC 관리자 등록과 정적 갤러리 동기화 (관리자 권한 필요)
4. 확인 링크: https://www.vibehong.shop/
