# my-ToDoList 스타일 가이드

## 버전 이력
| 버전 | 요약 내용 | 근거/출처 | 날짜 |
|---|---|---|---|
| 1.0 | 최초 작성: 레퍼런스 이미지(1999년 Tim Berners-Lee/초기 WWW 컨셉 일러스트) 분석 기반 컬러/타이포/컴포넌트 스타일 가이드 정의 | 사용자 제공 레퍼런스 이미지, 4-wireframe.md 8개 화면 | 2026-08-27 |

## 문서 개요
- 목적: `4-wireframe.md`에 "실제 스타일(색상/폰트 등) 미정의"로 남겨둔 부분을 채운다. 레이아웃 구조는 `4-wireframe.md`를 그대로 따르고, 이 문서는 색상/타이포그래피/컴포넌트 스타일/인터랙션 톤만 정의한다.
- 범위: 프론트엔드(React 19 + TypeScript) 전용. 별도 UI 프레임워크(Tailwind, MUI 등) 도입 없이 순수 CSS(CSS Custom Properties + 일반 CSS 파일)로 구현 가능한 수준으로 정의한다(`5-project-principle.md` 오버엔지니어링 금지 원칙 준수).
- 적용 대상: `4-wireframe.md`의 8개 화면(회원가입/로그인/Todo목록/Todo등록/Todo편집/회원정보수정/관리자-회원목록/관리자-카테고리관리) 전체.

## 1. 컨셉: "1999년의 월드와이드웹"
레퍼런스 이미지는 Tim Berners-Lee가 CRT 모니터 앞에서 전세계로 뻗어나가는 빛나는 연결선(네트워크)을 구상하는 장면이다. 어두운 사무실, 코르크 게시판에 붙은 메모/차트, 스탠드 조명의 따뜻한 빛, 모니터에서 뿜어져 나오는 청록색 발광 네트워크 구체 — 이 세 요소(어두운 배경 / 따뜻한 조명 포인트 / 청록색 발광 연결선)를 앱의 시각 언어로 가져온다.

- **할일(Todo)을 "네트워크에 연결된 노드"로 은유**: 카테고리는 게시판의 메모 카드처럼, Todo는 그 메모를 잇는 연결선처럼 표현한다.
- **어둡고 차분한 배경 위에 발광하는 강조색**: 눈이 편한 다크 테마를 기본으로 하되, 완료/진행중/지연 등 상태 표시에는 레퍼런스의 청록색 글로우를 사용한다.
- **아날로그(종이/코르크) 질감은 카드 컴포넌트에만 절제해서 반영**: 배경 전체를 텍스처로 채우지 않고, Todo 카드·모달처럼 "메모 한 장"에 해당하는 요소에만 은은한 뉘앙스(그림자, 미세한 보더)로 남긴다.

## 2. 컬러 팔레트

이미지에서 추출한 3계열(다크 네이비, 발광 시안, 따뜻한 앰버) + 상태색(4가지: 시작전/진행중/완료/지연)으로 구성한다. 모든 값은 `frontend/src/app/styles/tokens.css`(가칭) 하나에 CSS Custom Property로 선언하고, 컴포넌트는 이 변수만 참조한다(하드코딩 금지).

### 2.1 베이스(다크 네이비 — 사무실의 어두운 배경)
| 토큰 | 값 | 용도 |
|---|---|---|
| `--color-bg` | `#12161f` | 앱 전체 배경 |
| `--color-surface` | `#1b212e` | 카드/모달/네비게이션 바 배경 |
| `--color-surface-raised` | `#242b3a` | 카드 위에 얹히는 요소(입력창, 드롭다운) |
| `--color-border` | `#2f3849` | 카드/입력창 경계선 |
| `--color-text` | `#e8ecf4` | 기본 텍스트(밝은 회백색, 종이 메모 느낌) |
| `--color-text-muted` | `#9aa5b8` | 보조 텍스트(설명, placeholder, 타임스탬프) |

### 2.2 강조색(발광 시안 — 모니터에서 뿜어나오는 네트워크 빛)
| 토큰 | 값 | 용도 |
|---|---|---|
| `--color-accent` | `#4fd8e6` | 주요 액션 버튼, 링크, 포커스 링, 로고 |
| `--color-accent-strong` | `#22c7dc` | 버튼 hover/active, 강조 텍스트 |
| `--color-accent-glow` | `rgba(79, 216, 230, 0.35)` | 포커스/hover 시 box-shadow 글로우 |

### 2.3 포인트(따뜻한 앰버 — 스탠드 조명)
| 토큰 | 값 | 용도 |
|---|---|---|
| `--color-warm` | `#e8a94c` | 완료(Todo 체크), 즐겨찾기성 강조, 배지 |
| `--color-warm-soft` | `#f0c98a` | 완료 상태 배경/보더의 은은한 버전 |

### 2.4 상태색(Todo 상태 4종 — 도메인 정의서 5장)
| 상태 | 토큰 | 값 | 근거 |
|---|---|---|---|
| 시작전 | `--color-status-upcoming` | `#7d8aa3` (뉴트럴 블루그레이) | 아직 발광하지 않은, 대기 중인 노드 |
| 진행중 | `--color-status-active` | `--color-accent`(`#4fd8e6`) | 현재 활성 연결선(가장 밝게 빛남) |
| 완료 | `--color-status-done` | `--color-warm`(`#e8a94c`) | 스탠드 조명처럼 따뜻하게 마무리된 상태 |
| 지연 | `--color-status-overdue` | `#e6556b` | 경고, 신규로 도입하는 유일한 레드 계열 |

### 2.5 시스템색(에러/성공, 최소 사용)
| 토큰 | 값 | 용도 |
|---|---|---|
| `--color-danger` | `#e6556b` | 폼 유효성 에러 텍스트/보더, 삭제 버튼 |
| `--color-success` | `#5fd88a` | 저장/등록 성공 토스트(있다면) |

**라이트 모드는 지원하지 않는다** — PRD/와이어프레임에 다크/라이트 전환 요구사항이 없고, 레퍼런스 이미지 자체가 어두운 사무실 장면이라 다크 테마 하나로 고정한다(오버엔지니어링 금지).

## 3. 타이포그래피

레퍼런스 이미지의 게시판 메모/차트는 손글씨~인쇄물이 섞인 아날로그 느낌이지만, 실제 앱은 가독성이 우선이므로 **본문은 시스템 폰트 스택**을, **로고/헤딩 한정으로 모노스페이스**를 섞어 "터미널/초기 웹" 뉘앙스만 살짝 남긴다.

| 토큰 | 값 |
|---|---|
| `--font-sans` | `"Pretendard", -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--font-mono` | `"JetBrains Mono", "Consolas", monospace` |

- 로고("my-ToDoList")와 화면 타이틀(예: "Todo 목록", "회원가입")에만 `--font-mono` 사용, 나머지 본문/버튼/입력값은 `--font-sans`.
- 크기 스케일(8px 그리드 기반): `--fs-xs: 12px`, `--fs-sm: 14px`, `--fs-base: 16px`, `--fs-lg: 20px`, `--fs-xl: 28px`.
- 줄간격: 본문 `1.5`, 헤딩 `1.2`.
- 폰트 굵기: 본문 `400`, 버튼/강조 `600`, 화면 타이틀 `700`.
- 웹폰트(Pretendard, JetBrains Mono)는 로컬 번들 또는 시스템 폴백만 사용하고 외부 CDN 의존은 두지 않는다(오프라인/사내망 환경 고려, PRD 비기능요구사항).

## 4. 여백/그리드

8px 기준 스케일 하나로 통일한다.

| 토큰 | 값 |
|---|---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 16px |
| `--space-4` | 24px |
| `--space-5` | 32px |
| `--space-6` | 48px |

- 카드 내부 패딩: `--space-3`(모바일) / `--space-4`(데스크톱).
- 화면 좌우 여백: 모바일 `--space-3`, 데스크톱 콘텐츠 최대 폭 `1024px` 중앙 정렬(`4-wireframe.md` 브레이크포인트와 동일).
- 폼 필드 간 간격: `--space-3`.

## 5. 모서리/그림자/글로우

레퍼런스의 "발광"을 인터랙션 피드백(포커스, hover, 강조)에만 제한적으로 사용한다 — 화면 전체를 네온으로 채우지 않는다.

| 토큰 | 값 | 용도 |
|---|---|---|
| `--radius-sm` | 6px | 입력창, 배지, 칩 |
| `--radius-md` | 10px | 버튼, 카드 |
| `--radius-lg` | 16px | 모달 |
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.4)` | 기본 카드 그림자(코르크판에서 살짝 뜬 메모 느낌) |
| `--shadow-focus` | `0 0 0 3px var(--color-accent-glow)` | 입력창/버튼 포커스 시 |
| `--shadow-glow-active` | `0 0 12px var(--color-accent-glow)` | 진행중 상태 배지, 활성 네비 탭 |

## 6. 컴포넌트별 스타일 (`shared/ui`)

`5-project-principle.md` FSD 구조의 `shared/ui/{Button,Input,Modal}.tsx`(FE-2)에 대응한다.

### Button
- Primary(등록/저장/로그인 등 주요 액션): 배경 `--color-accent`, 텍스트 `--color-bg`(어두운 배경 위 밝은 버튼이라 텍스트는 반대로 어둡게 해 대비 확보), hover 시 `--color-accent-strong` + `--shadow-glow-active`.
- Secondary(취소/뒤로): 배경 투명, 보더 `1px solid --color-border`, 텍스트 `--color-text`.
- Danger(삭제): 배경 투명, 텍스트/보더 `--color-danger`, hover 시 배경 `rgba(230,85,107,0.12)`.
- 높이: 44px 고정(와이어프레임의 터치 최소 높이 규칙 준수), 모서리 `--radius-md`.

### Input / Textarea
- 배경 `--color-surface-raised`, 보더 `1px solid --color-border`, 포커스 시 보더 `--color-accent` + `--shadow-focus`.
- placeholder 색상 `--color-text-muted`.
- 유효성 에러 시 보더/헬퍼텍스트 `--color-danger`(4-wireframe.md의 인라인 에러 메시지에 대응).
- 날짜 입력(Todo 시작일/종료일)은 브라우저 기본 `<input type="date">` 사용, 커스텀 캘린더 라이브러리 도입하지 않음(YAGNI).

### Modal (데스크톱 Todo 등록/편집)
- 배경 오버레이: `rgba(10,13,20,0.7)`(레퍼런스의 어두운 사무실 톤).
- 모달 카드: `--color-surface`, `--radius-lg`, `--shadow-card` 강화 버전(`0 8px 24px rgba(0,0,0,0.5)`).
- 헤더 타이틀은 `--font-mono` + `--fs-lg`.

### Card (Todo 카드, 모바일 목록/카테고리/회원 카드형)
- `--color-surface`, `--radius-md`, `--shadow-card`, 좌측에 상태색 4px 세로 바(해당 Todo의 시작전/진행중/완료/지연 색을 그대로 사용) — 코르크판에 꽂힌 메모의 "핀" 은유.

### Badge/Chip (카테고리 태그, 상태 필터 칩)
- 배경은 해당 상태색의 저채도 버전(`color-mix(in srgb, 상태색 20%, --color-surface)`), 텍스트는 해당 상태색 그대로.
- 선택된 필터 칩: `--shadow-glow-active` 적용.

### NavBar
- 배경 `--color-surface`, 하단 보더 `1px solid --color-border`.
- 로고: `--font-mono`, `--color-accent`.
- 활성 메뉴 항목: 텍스트 `--color-accent`, 하단에 2px 언더라인(`--color-accent`, 은은한 glow).
- 모바일 햄버거 메뉴 펼침 시 배경은 `--color-surface`를 그대로 유지, 슬라이드 다운 애니메이션(`transition: 0.2s ease`) 하나만 적용 — 과한 모션 지양.

## 7. 상태별 시각 표현 (Todo 목록)

`3-user-scenario.md` 시나리오7·10, `1-domain-definition.md` 5장 상태 규칙과 연결된다.

| 상태 | 텍스트 라벨 색 | 좌측 바/배지 색 | 비고 |
|---|---|---|---|
| 시작전 | `--color-status-upcoming` | 동일 | 흐릿하게, 아직 "연결되지 않은" 느낌 |
| 진행중 | `--color-status-active` | 동일 + `--shadow-glow-active` | 유일하게 은은한 glow 적용(현재 진행 중임을 강조) |
| 완료 | `--color-status-done` | 동일, 제목 텍스트에 취소선 | 체크박스 체크 시 즉시 반영(FE-10) |
| 지연 | `--color-status-overdue` | 동일 | 별도 아이콘(⚠) 없이 색상만으로 구분(과한 장식 지양) |

완료 체크박스는 커스텀 SVG 대신 네이티브 `<input type="checkbox">`에 accent-color(`--color-accent`)만 적용해 구현한다(YAGNI).

## 8. 아이콘/이미지

- 아이콘 라이브러리는 별도 설치하지 않는다. 필요한 아이콘(햄버거 ☰, 닫기 ✕, 체크 ✓, 경고 ⚠, 삭제 🗑)은 유니코드 문자 또는 최소한의 인라인 SVG로 처리한다(`5-project-principle.md` 오버엔지니어링 금지).
- 로고는 텍스트("my-ToDoList", `--font-mono`) 하나로 충분하며 별도 이미지 로고를 만들지 않는다.

## 9. 접근성/대비 메모

- PRD상 a11y는 범위 제외(`4-wireframe.md`, `8-plan.md` FE-14 참고)이지만, 다크 테마 특성상 최소한의 대비는 지킨다: 본문 텍스트(`--color-text` on `--color-bg`) 대비비 12:1 이상, 강조 버튼 텍스트 대비비 7:1 이상 확보되도록 위 팔레트 값을 선정했다.
- 상태 구분을 색상에만 의존하지 않도록 완료 상태에는 취소선을, 지연 상태에는 목록 정렬 시 상단 노출 등 색 이외의 보조 신호를 함께 둔다(색맹 사용자 고려, 최소 조치).

## 10. 적용 매핑 (4-wireframe.md 화면 ↔ 이 문서)

| 화면 | 주요 적용 요소 |
|---|---|
| 1. 회원가입 / 2. 로그인 | 중앙 카드(Card 스타일), Input, Primary Button, 에러 텍스트(Danger) |
| 3. Todo 목록 | NavBar, 상태별 색상(7장), 필터 Chip, 데스크톱 표/모바일 Card |
| 4. Todo 등록 / 5. Todo 편집 | Modal(데스크톱)/전체화면 폼(모바일), Input, date input, Textarea(메모) |
| 6. 회원정보 수정 | Card, Input(이메일은 읽기전용 스타일 = `--color-text-muted` + 배경 `--color-surface`) |
| 7. 관리자-회원목록 / 8. 관리자-카테고리관리 | NavBar(Admin 메뉴), 표/Card, Badge(기본 카테고리는 `--color-warm` 배지로 구분) |
