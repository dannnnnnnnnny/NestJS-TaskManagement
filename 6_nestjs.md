# Object Relational Mapping (ORM) and TypeORM
- ORM(객체 관계 매핑)은 객체 지향 패러다임을 사용하여 DB의 데이터 쿼리를 조작할 수 있는 기술
- 개발자가 일반 쿼리를 직접 보내는 것보다 각자 선호하는 프로그래밍 언어를 사용하여 DB와 통신할 수 있는 ORM 라이브러리가 많음

## ORM의 장점
- 데이터 모델을 한 곳에 기록해서 유지 관리가 더 쉬워짐. 반복이 적음.
- 많은 것들이 자동으로 수행됨 (데이터 핸들링, 타입, 관계 등)
- SQL 구문을 작성할 필요 없음. 코딩으로 해결
- 데이터베이스 추상화 (원할 때 DB 타입 변경 가능)
- OOP를 활용하기 때문에 쉽게 상속 가능

## ORM의 단점
- ORM 라이브러리는 항상 단순한 것은 아님
- 다양한 유지 관리 문제로 이어질 수 있는 ORM 뒤에서 일어나고 있는 일을 무시하게 될 수 있음

## TypeORM
- Typescript에서 사용되는 ORM 라이브러리
- 엔티티, 저장소, 커럼, 관계, 복제, 쿼리, 로깅 등을 정의하고 관리하는 데 도움을 줌.

- * Ashley의 작업 중, Done 상태인 작업만 가져오는 ORM 코드는
```ts
const tasks = await Task.find({ user: 'Ashely', status: 'Done' });
```
- 순수 자바스크립트로 짠다면 db.query(~~~~~~~~) 로 직접 SQL문을 사용하며 처리해야하는 복잡함이 있음
- https://typeorm.io (TypeORM 공식 문서)
- yarn add @nestjs/typeorm typeorm pg

---
- /src/config/typeorm.config.ts 생성
```ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '1234',
  database: 'taskmanagement',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
};
```

- typeORM을 사용하기 위해서 app.module.ts 에서 import 하기
```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig), 
    TasksModule,
  ],
})
export class AppModule {}
```
---
### task 엔티티 생성
- /src/tasks/task.entity.ts
```ts
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TaskStatus } from './tasks.model';

@Entity()
export class Task extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  status: TaskStatus;
}
```
- extends BaseEntity
- @PrimaryGeneratedColumn() : 새 task 만들 시, 자동으로 생성

### task Repository
- task.repository.ts
- 캡슐화된 방식으로 Entity를 관리할 수 있음
- Entity 클래스에서 직접 수행하는 것과 동일한 작업을 수행하지만, 더 많은 사용자 정의를 추가할 수 있음
- DB 레이어와 관련된 무거운 로직을 캡슐화하고, 코드를 제거하여 더 짧은 메서드로 서비스 및 코드를 만들어낼 수 있음
```ts
// src/tasks/task.repository.ts
import { EntityRepository, Repository } from 'typeorm';
import { Task } from './task.entity';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {}
```

##### task.module.ts에 imports: [TypeOrmModule.forFeature([TaskRepository])] 추가
```ts
// src/tasks/task.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskRepository } from './task.repository';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([TaskRepository])],
  controllers: [TasksController], // nest g controllert tasks로 생성한 컨트롤러가 주입됨
  providers: [TasksService],
})
export class TasksModule {}
```
---
- tasks.controller.ts, tasks.service.ts 로직 주석 처리
- Task Interface, task.model.ts 삭제 (엔티티가 작업 정의 역할을 해줌)
- TaskStatus는 task-status.enum.ts로 옮김
- uuid 모듈 삭제 (@PrimaryGenerateColumn()이 자동적으로 ID를 생성해줌)

### tasks.service.ts 수정
```ts
@Injectable()
export class TasksService {
constructor(
  @InjectRepository(TaskRepository)
  private taskRepository: TaskRepository,
) {}

async getTaskById(id: number): Promise<Task> {
  const found = await this.taskRepository.findOne(id);
  if (!found) {
    throw new NotFoundException(`Task With ID "${id}" not found`);
  }
  return found;
}
```
- id는 이제 자동적으로 number가 들어감
- async, await 구문으로 변경 => Promise 반환
- 생성자로 taskRepository를 주입받음
- 해당 저장소에서 findOne(id)로 task를 찾음

### tasks.controller.ts 수정
```ts
@Get('/:id') // GET /tasks/1
getTaskById(@Param('id', ParseIntPipe) id: number): Promise<Task> {
  return this.tasksService.getTaskById(id);
}
```
- id는 number 타입이므로 숫자를 받는 것을 보장할 수 있도록 ParseIntPipe 추가
- 반환값 Promise로 변경