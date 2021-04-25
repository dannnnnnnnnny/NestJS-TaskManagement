# Data Transfer Object (DTO: 데이터 전송 객체)
- 프로세스 간 데이터를 전달하는 객체 (wikipedia)
- 데이터 전송 객체가 캡슐화하는 데 사용되는 객체(stack-overflow)
- 네트워크를 통해 데이터가 전송되는 방식을 정의하는 객체(nestjs documentation)

## More About DTOs
- NestJS에 국한되지 않는 소프트웨어 개발의 공통 개념
- 타입스크립트 유형으로 사용할 수 있으므로 안전함
- 자체 데이터 저장, 검색, 직렬화 및 비직렬화를 제외한 다른 동작은 X
- 결과적으로 성능이 향상
- 데이터 유효성 검사에 유용
- DTO는 모델 정의가 아님
- 인터페이스 또는 클래스를 사용하여 정의

## Class vs Interface for DTOs
- NestJS 공식문서에 문서화되어 있는, 클래스를 사용하는 것 권장
- 그 이유는 인터페이스는 타입스크립트의 일부라서 컴파일 후 유지되지 않기 때문
- 클래스는 더 많은 것을 할 수 있게 해주며, 컴파일 후에도 유지됨
- NestJS는 런타임의 인터페이스를 참조할 수 없지만 클래스는 참조할 수 있음
=> Class 사용 권장

---
- DTO는 필수항목이 아님
- 하지만 DTO를 쓰면서 따라오는 가치로 인해 충분히 쓸만 함
- 코드를 쉽게 유지하고 리팩터링 가능


### tasksDTO 생성
- /tasks/dto 폴더 생성
- /dto/create-task.dto.ts 생성

``` ts
export class CreateTaskDto {
  title: string;
  description: string;
}
```

#### tasksController 수정
```ts
@Post()
createTask(@Body() createTaskDto: CreateTaskDto): Task {
  return this.tasksService.createTask(createTaskDto);
}
```

#### tasksService 수정
```ts
createTask(createTaskDto: CreateTaskDto): Task {
  const { title, description } = createTaskDto;

  const task: Task = {
    id: uuid.v4(),
    title,
    description,
    status: TaskStatus.OPEN,
  };

  this.tasks.push(task);
  return task;
}
```

- 이런 식으로 Application 전체에서 DTO를 사용하게 되면 데이터의 형태를 보다 쉽게 유지할 수 있음
- 유효성 검사에도 유용