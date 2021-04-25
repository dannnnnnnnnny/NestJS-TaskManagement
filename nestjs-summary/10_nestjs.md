# Logging
- 문제 발생시 로깅을 사용하여 인식할 수 있음
- 문제와 무엇이 잘못되었는지 원인을 찾는 데 도움이 되는 몇가지 유용한 정보를 제공할 수 있음


##### Log: 중요한 정보의 범용 기록
##### Warning: 치명적이지 않거나 파괴적이지 않은 문제 처리
##### Error: 치명적이거나 파괴적인 문제 처리
##### Debug: 오류/경고 발생 시 논리를 디버깅하는 데 도움이 되는 유용한 개발자용 정보
##### Verbose: 상세 정보: 응용 프로그램의 동작에 대한 휘장을 제공하는 정보 운영자(예: 지원)를 대상으로. 일반적으로 "너무 많은 정보"
![image](https://user-images.githubusercontent.com/23697868/105968282-3859c680-60ca-11eb-8bb5-94379e4cb21b.png)

---
### Logger 생성
```ts
// main.ts
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('bootstrap');

  const app = await NestFactory.create(AppModule);

  const port = 3000;
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}
bootstrap();
```
- => [bootstrap] Application listening on port 3000 출력

### 클래스 멤버로 Logger 생성
```ts
// tasks.controller.ts
@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
  private logger = new Logger('TaskController');
  constructor(private tasksService: TasksService) {}
```
- logger 추가
```ts
@Get() // GET /tasks or /tasks?status=OPEN&search=hello
getTasks(
  @Query(ValidationPipe) filterDto: GetTasksFilterDto,
  @GetUser() user: User,
): Promise<Task[]> {
  this.logger.verbose(
    `User "${user.username}" retrieving all tasks. Filters: ${JSON.stringify(
      filterDto,
    )}`,
  );
  return this.tasksService.getTasks(filterDto, user);
}
```
- 클래스 멤버변수로 선언한 logger를 이용해서 기록
- => [TaskController] User "test01" retrieving all tasks. Filters: {"status":"IN_PROGRESS","search":"1"} 출력

### task.repository.ts에도 클래스 멤버로 선언하여 에러 추적 처리
```ts
// task.repository.ts
@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  private logger = new Logger('TaskRepository');
```
- logger 추가
```ts
try {
  const tasks = await query.getMany();
  return tasks;
} catch (error) {
  this.logger.error(
    `Failed to get tasks for user "${user.username}", DTO: ${JSON.stringify(
      filterDto,
    )}`,
    error.stack,
  );
  throw new InternalServerErrorException();
}
```
- try로 감싼 후 에러 처리시 logger를 통해 에러추적 용이하게 함
- => [TaskRepository] Failed to get tasks for user "test01", DTO: {"search":"1"} +16ms
QueryFailedError: task.useridasd 칼럼 없음
    at new QueryFailedError (C:\Users\rlaeh\Desktop\nestjs-task-management\node_modules\typeorm\error\QueryFailedError.js:11:28)
    at Query.callback (C:\Users\rlaeh\Desktop\nestjs-task-management\node_modules\typeorm\driver\postgres\PostgresQueryRunner.js:235:38)
    at Query.handleError (C:\Users\rlaeh\Desktop\nestjs-task-management\node_modules\pg\lib\query.js:128:19)
    at Client._handleErrorMessage (C:\Users\rlaeh\Desktop\nestjs-task-management\node_modules\pg\lib\client.js:335:17)
    at Connection.emit (events.js:315:20)
    at C:\Users\rlaeh\Desktop\nestjs-task-management\node_modules\pg\lib\connection.js:115:12
    at Parser.parse (C:\Users\rlaeh\Desktop\nestjs-task-management\node_modules\pg-protocol\dist\parser.js:40:17)
    at Socket.<anonymous> (C:\Users\rlaeh\Desktop\nestjs-task-management\node_modules\pg-protocol\dist\index.js:10:42)
    at Socket.emit (events.js:315:20)
    at addChunk (_stream_readable.js:309:12)  출력

- createTask에도 추가.

---
### AuthService에도 Debug Logger 추가
```ts
@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');
```
```ts
async signIn(
  authCredentialsDto: AuthCredentialsDto,
): Promise<{ accessToken: string }> {
  const username = await this.userRepository.validateUserPassword(
    authCredentialsDto,
  );
  if (!username) {
    throw new UnauthorizedException('유효하지 않은 인증입니다.');
  }

  const payload: JwtPayload = { username };
  const accessToken = await this.jwtService.sign(payload);
  this.logger.debug(
    `Generated JWT Token with payload ${JSON.stringify(payload)}`,
  );

  return { accessToken };
}
```
- => [AuthService] Generated JWT Token with payload {"username":"test01"} 출력
