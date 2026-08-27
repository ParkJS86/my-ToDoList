# my-ToDoList 관리자(Admin) 시나리오

## 버전 이력
| 버전 | 요약 내용 | 근거/출처 | 날짜 |
|---|---|---|---|
| 1.0 | 최초 작성: Admin 시나리오 3건(회원 목록 조회, Category 등록/수정, Category 삭제 시 기본 Category 자동 재할당) | PRD(2-prd.md) 5.2·3.1, 도메인 정의서(1-domain-definition.md) 7·8장 | 2026-08-26 |
| 1.1 | 시나리오3: 기본 Category 삭제/수정 정책을 '범위 밖(미정)'에서 '400 차단'으로 확정(실제 백엔드 구현 반영) | 백엔드 구현(BE-7) 결과와 문서 정합성 검토 | 2026-08-27 |

## 문서 개요
- 목적: PRD 5.2 관리자 기능표와 도메인 정의서 7장 Admin 유스케이스를 실제 사용 흐름 단위로 구체화한다.
- 범위: PRD 3.1 MVP 범위에 해당하는 Admin 기능(회원 목록 조회, Category 등록/수정/삭제, Category 삭제 시 기본 Category 자동 재할당)만 다룬다.
- 범위 밖(미정): Admin이 타 회원의 Todo·회원정보를 직접 수정·삭제하는 기능은 PRD 3.2 확장 범위 및 도메인 정의서 9장 미정 항목으로 본 문서에서 다루지 않는다. (기본 Category 자체의 삭제/수정은 시나리오3에서 400 차단으로 확정됨)
- 권한 원칙: Category 등록/수정/삭제는 Admin 전용이며, 일반 사용자는 Category를 조회·선택만 할 수 있다(도메인 정의서 6장 규칙3).

---

## 시나리오 1. 회원 목록 조회

**사전조건(Precondition)**
- Role이 Admin인 User가 로그인하여 유효한 Access Token을 보유한다.

**기본 흐름(Main Flow)**
1. Admin이 관리자 화면에서 "회원 관리" 메뉴에 진입한다.
2. 시스템은 요청자의 Role이 Admin인지 검증한다.
3. 시스템은 전체 회원(id, email, name, role, createdAt 등)의 목록을 조회하여 반환한다.
4. Admin은 화면에 표시된 회원 목록을 열람한다.

**예외/대안 흐름(Alternative/Exception Flow)**
- 미인증 상태로 회원 목록 API 호출 시: 401 반환, 로그인 화면으로 유도(도메인 8장).
- Role이 Member인 User가 회원 목록 API를 직접 호출 시: 403(권한 없음) 반환.

**완료 조건(Postcondition)**
- Admin이 전체 회원 목록을 확인한다. 목록 화면에서 회원정보 수정/삭제는 제공되지 않는다(범위 밖, 3.2 참조).

---

## 시나리오 2. Category 등록 / 수정

**사전조건(Precondition)**
- Role이 Admin인 User가 로그인한 상태다.

**기본 흐름(Main Flow) — 등록**
1. Admin이 "카테고리 관리" 화면에서 신규 Category 이름을 입력하고 등록을 요청한다.
2. 시스템은 요청자의 Role이 Admin인지 검증한다.
3. 시스템은 Category(id, name, isDefault=false, createdBy=요청 Admin의 userId)를 저장한다.
4. 시스템은 갱신된 전역 Category 목록을 반환한다.

**기본 흐름(Main Flow) — 수정**
1. Admin이 기존 Category를 선택해 이름 등을 변경하고 저장을 요청한다.
2. 시스템은 Role 검증 후 해당 Category를 수정한다.
3. 이후 해당 Category를 참조하는 모든 사용자의 Todo에는 변경된 이름이 즉시 반영되어 조회된다(전역 참조 구조, 도메인 4장).

**예외/대안 흐름(Alternative/Exception Flow)**
- Role이 Member인 User가 Category 등록/수정 API를 직접 호출 시: 403(권한 없음) 반환(도메인 8장, 6장 규칙3).
- 미인증 상태로 호출 시: 401 반환.

**완료 조건(Postcondition)**
- 전역 Category 목록에 신규 항목이 추가되거나 기존 항목이 수정된다.
- 일반 사용자는 Todo 등록/수정 화면에서 변경된 Category 목록을 조회·선택할 수 있을 뿐, 목록을 직접 추가/수정할 수는 없다.

---

## 시나리오 3. Category 삭제 (참조 중인 Todo의 기본 Category 자동 재할당)

**사전조건(Precondition)**
- Role이 Admin인 User가 로그인한 상태다.
- 삭제 대상 Category는 기본(isDefault=true) Category가 아니다(기본 Category 삭제 시도는 400으로 차단됨).
- 전역 '기본' Category가 정확히 1개 존재한다(도메인 6장 규칙5).

**기본 흐름(Main Flow)**
1. Admin이 "카테고리 관리" 화면에서 특정 Category의 삭제를 요청한다.
2. 시스템은 요청자의 Role이 Admin인지 검증한다.
3. 시스템은 삭제 대상 Category를 참조 중인 Todo가 있는지 조회한다.
4. 참조 중인 Todo가 존재하면, 해당 Todo들의 categoryId를 전역 '기본' Category로 일괄 재할당한다.
5. 시스템은 대상 Category를 삭제한다.
6. 시스템은 갱신된 Category 목록과 처리 결과(재할당 건수 등)를 반환한다.

**예외/대안 흐름(Alternative/Exception Flow)**
- Role이 Member인 User가 Category 삭제 API를 직접 호출 시: 403(권한 없음) 반환(도메인 8장).
- 미인증 상태로 호출 시: 401 반환.
- 삭제 대상이 참조 중인 Todo가 없는 경우: 재할당 절차 없이 바로 삭제한다.
- 삭제 대상이 기본 Category인 경우: 400(수정/삭제 불가) 응답.

**완료 조건(Postcondition)**
- 대상 Category는 전역 목록에서 제거된다.
- 삭제 전 해당 Category를 선택했던 모든 사용자의 Todo는 categoryId가 기본 Category로 자동 변경되어, 소유자에게는 카테고리별 필터링/조회 시 '기본' 카테고리 항목으로 표시된다.

---

## 참고: 범위 밖(미정) 안내
아래 항목은 PRD 3.2 확장 범위 및 도메인 정의서 9장 미정 항목으로, 본 시나리오 문서에 포함하지 않는다.
- Admin이 다른 회원의 Todo 또는 회원정보를 직접 수정·삭제하는 기능
