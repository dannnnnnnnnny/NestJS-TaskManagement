## 관계, 권한, 소유권
### 1:N 관계
```ts
// user.entity.ts
@OneToMany((type) => Task, (task) => task.user, { eager: true })
tasks: Task[];
```
- user, tasks 양측으로의 관계 설정 (1:N)

```ts
// task.entity.ts
@ManyToOne((type) => User, (user) => user.tasks, { eager: false })
user: User;
```
- eager 옵션: 부울 - 참으로 설정되면 엔티티에서 find* 메서드 또는 쿼리빌더를 사용할 때 항상 관계 도면요소가 로드됩니다, 관계 소유자 엔티티가 find* 메소드를 사용하여 로드하면 항상 상위 관계가 자동으로 로드됨. 쿼리빌더를 사용해야만 사위 관계가 로드되지 않음. 관계의 한 쪽에서만 로드 가능
- eager가 true면 사용자를 검색할 때 사용자의 작업에 액세스 가능해지며 해당 사용자가 소유한 작업 배열을 가져옴
---

```ts
// tasks.controller.ts
@Post() // POST /tasks (x-www-form-urlencoded/ title, description)
@UsePipes(ValidationPipe)
createTask(
  @Body() createTaskDto: CreateTaskDto,
  @GetUser() user: User,
): Promise<Task> {
  return this.tasksService.createTask(createTaskDto, user);
}
```
- (createTask Controller 수정)
- 유저 컬럼을 추가했기 때문에 해당 task를 누가 작성했는지 user데이터를 추가할 수 있게 수정함

```ts
// tasks.service.ts
async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
  return this.taskRepository.createTask(createTaskDto, user);
}
```

```ts
// task.repository.ts
async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
  const { title, description } = createTaskDto;
  const task = new Task();
  task.title = title;
  task.description = description;
  task.status = TaskStatus.OPEN;
  task.user = user; // 추가한 user 컬럼에 대해 데이터를 넣어줌
  await task.save();

  delete task.user; // 실제 엔티티에서 삭제하는 것이 아님. 반환내용에서 정보에 관련이 없고 민감하다고 생각하기에 제거

  return task;
}
```
---
### getTasks() -> 사용자가 소유한 작업만 반환하게 user 추가로 받기
```ts
// tasks.controller.ts
@Get() // GET /tasks or /tasks?status=OPEN&search=hello
getTasks(
  @Query(ValidationPipe) filterDto: GetTasksFilterDto,
  @GetUser() user: User,
): Promise<Task[]> {
  return this.tasksService.getTasks(filterDto, user);
}
```
```ts
// task.repository.ts
async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
  const { status, search } = filterDto;
  const query = this.createQueryBuilder('task');

  query.where('task.userId = :userId', { userId: user.id });
  // task.userId는 자동적으로 생성되는데 typeorm의 Entity에 userId를 따로 정의해줘야 함
```

### getTaskById() -> 사용자가 소유한 작업 중에서 id 검색
```ts
// tasks.controller.ts
@Get('/:id') // GET /tasks/1
getTaskById(
  @Param('id', ParseIntPipe) id: number,
  @GetUser() user: User,
): Promise<Task> {
  return this.tasksService.getTaskById(id, user);
}
```
```ts
// tasks.service.ts
async getTaskById(id: number, user: User): Promise<Task> {
  const found = await this.taskRepository.findOne({
    where: { id, userId: user.id },
  });
```

### patchTask() -> 변경된 getTaskById()에 맞춰 리팩토링
```ts
// tasks.controller.ts
@Patch('/:id/status')
patchTask(
  @Param('id', ParseIntPipe) id: number,
  @Body('status', TaskStatusValidationPipe) status: TaskStatus,
  @GetUser() user: User,
): Promise<Task> {
  return this.tasksService.updateTaskStatus(id, status, user);
}
``` 
```ts
// tasks.service.ts
async updateTaskStatus(
  id: number,
  status: TaskStatus,
  user: User,
): Promise<Task> {
  const task = await this.getTaskById(id, user);
  task.status = status;
  await task.save();
  return task;
}
```

### deleteTask() -> 마찬가지로 리팩토링
```ts
// tasks.controller.ts
@Delete('/:id')
deleteTask(
  @Param('id', ParseIntPipe) id: number,
  @GetUser() user: User,
): Promise<void> {
  return this.tasksService.deleteTask(id, user);
}
```
```ts
// tasks.service.ts
async deleteTask(id: number, user: User): Promise<void> {
  const result = await this.taskRepository.delete({ id, userId: user.id });
```


