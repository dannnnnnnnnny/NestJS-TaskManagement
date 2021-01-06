# Nest JS란?

- 효율적이고 확장 가능한 지식을 구축하기 위한 오픈소스 프레임워크
- 타입스크립트를 완벽하게 지원함
- 객체 지향 프로그래밍, 함수 프로그래밍 및 반응 프로그래밍
- 기본적으로 Express 사용
- CLI를 통해 프로젝트 구조 측면에서 실수를 할 일이 거의 없고, 보일러플레이트 코드를 작성하는 시간을 절약할 수 있다.

## Task management App

### AppModule (root)

### TaskModule

- TasksController
- TasksService
- Status, ValidationPipe
- TaskEntity
- TaskRepository

### AuthModule

- AuthController
- AuthService
- UserEntity
- UserRepository
- JwtStrategy

---

## EndPoint

### Task

- GET /tasks (Get tasks (incl. filters))
- GET /tasks/:id (Get a task)
- POST /tasks (Create a task)
- DELETE /tasks/:id (Delete a task)
- PATCH /tasks/:id/status (Update task status)

### Auth

- POST /auth/signup (Sign Up)
- POST /auth/signin (Sign In)

---

## 목표 - NESTJS

- NestJS 모듈
- NestJS 컨트롤러
- NestJS 서비스 및 공급자
- 컨트롤러와 서비스 간 통신
- NestJS Pipe를 이용한 검증

## 목표 - Backend & Architecture

- 배포 준비 REST API 개발
- CRUD 작업
- 오류 처리
- 데이터 전송 객체(DTO)
- 시스템 모듈화
- 백엔드 개발 모범 사례
- 구성 관리
- 로깅
- 보안 모범 사례

## 목표 - Persistence (지속성)

- 애플리케이션을 데이터베이스에 연결
- 관계형 데이터베이스 관련 작업
- Type ORM 사용
- QueryBuilder를 사용하여 간단하고 복잡한 쿼리 작성
- 데이터베이스 작업 성능

## 목표 - Authorization / Authentication

- 가입, 로그인
- 인증 및 인증
- 보호 리소스
- 사용자별 업무 소유권
- JWT 토큰 사용
- 비밀번호 hash, salt 및 비밀번호의 적절한 저장

## 목표 - Deployment

- 생산용 응용 프로그램 다듬기
- AWS에 NestJS 앱 배포
- Amazon S3에 프런트엔드 애플리케이션 배포
- 프론트 엔드 및 백 엔드 연결

---

### NestJS Controllers

- 수신 요청 처리 및 클라이언트에 대한 응답 반환 담당
- 컨트롤러는 특정 경로에 바인딩됨 (task 리소스 컨트롤러는 "/tasks")
- endpoint 처리 및 요청 메소드가 포함됨 (get, post, delete ...)
- 동일한 모듈 내의 Providers를 소비하는 데 의존성 주입을 할 수 있음

### Defining a Controller

- 컨트롤러는 @Controller 데코레이터로 정의됨
- 컨트롤러는 문자열을 통해서 경로를 처리함

## Defining a Handler

- 핸들러는 단순히 데코레이팅된 컨트롤러 클래스 내의 메소드임 (@Get, @Post, @Delete)

```JS
@Controller('/tasks')
export class TasksController {
  @Get()
  getAllTasks() {
    return ...;
  }

  @Post()
  createTask() {
    return ...;
  }
}
```

### Http Request Incoming (http 요청 수신)

- 요청이 컨트롤러로 라우팅되고, 핸들러가 인수로 호출됨 (nestJS가 관련 요청 데이터를 구문 분석하여 처리기에서 사용할 수 있음)
- 핸들러가 요청을 처리함 (서비스와의 통신과 같은 작업을 수행합니다. 예를 들어 데이터베이스에서 항목 검색)
- 핸들러는 응답값을 반환함 (응답은 모든 유형 및 예외일 수 있음. NestJS는 반환된 값을 HTTP 응답으로 감싼 후 클라이언트로 반환)
