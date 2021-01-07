## id를 이용한 task 조회 (GET)

#### tasksService
```ts
getTaskById(id: string): Task {
  return this.tasks.find((task) => task.id === id);
}
```

#### tasksController
```ts
@Get('/:id') // GET /tasks/1
getTaskById(@Param('id') id: string): Task {
  return this.tasksService.getTaskById(id);
}
```
- @Param 데코레이터를 통해서 @Get 데코레이터에서 지정한 id 파라미터를 가져온 후 Service의 getTaskById 메소드로 넘겨줌

--- 
## task 삭제 (DELETE)
- DELETE HTTP 요청
- URL에 삭제할 작업의 ID 포함
- ID를 추출하고 task 삭제

#### tasksService
```ts
deleteTask(id: string): void {
  // 내가 한 방법
  // const taskToFind = this.tasks.find((item) => item.id === id);
  // const idx = this.tasks.indexOf(taskToFind);
  // if (idx > -1) {
  //   this.tasks.splice(idx, 1);
  // }

  this.tasks = this.tasks.filter((task) => task.id !== id);
}
```

#### tasksController
```ts
@Delete('/:id')
deleteTask(@Param('id') id: string): void {
  this.tasksService.deleteTask(id);
}
```