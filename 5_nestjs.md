# NestJS Pipes
- Handler가 호출되기 적전에 Route Handler가 처리할 arguments에서 동작함
- 데이터 변환 또는 데이터 유효성 검사를 수행할 수 있음
- 원본 또는 수정된 데이터를 반환하며, 이 데이터는 Route Handler로 전달됨
- 파이프는 예외를 발생시킬 수 있음. 예외는 NestJS에 의해 Error Response로 처리
- 비동기적일 수 있음.

## Default Pipes in NestJS
- NestJS의 '@nestjs/common' 모듈 내에 유용한 파이프가 내장되어 있음
1. ValidationPipe
  - 클래스에 대한 전체 개체의 호환성을 확인 (DTO와 잘어울림)
  - 속성을 매칭할 수 없는 경우, 유효성 검사가 실패함 (ex. mismatching type)
  - 가장 일반적으로 사용됨

2. ParseIntPipe
  - 기본적으로 arguments(인수)는 문자열임
  - 인수가 숫자인지 확인하고, 맞다면 숫자로 변환되고 handler로 전달됨.

## Custom Pipe Implementation
- @Injectable() 데코레이터로 주석이 달린 클래스
- PipeTransform 제네릭 인터페이스를 구현해야 함. 그러므로 모든 파이프는 transform() 메소드를 가지고 있어야 하며, 이 메소드는 NestJS에서 호출하여 인수를 처리함
  * transform()
  - 2가지 파라미터를 허용
  - value : 처리된 인수의 값
  - metadata : (Optional) 인수에 대한 메타데이터를 포함하는 객체
- transform() 메소드에서 반환되는 모든 항목은 Route Handler로 전달됨. 예외는 클라이언트에게 다시 전송됨.
- 파이프는 여러가지 방법으로 사용될 수 있음.

#### Handler-level pipes : @UsePipes() 데코레이터를 통해 핸들러 레벨에서 정의됨
```ts
@Post()
@UsePipes(SomePipe)
createTask(
  @Body('description') description
) {
  // ...
}
```

#### Parameter-level pipes: 지정된 특수 매개변수만 처리
```ts
@Post()
createTask(
  @Body('description', SomePipe) description
) {
  // ...
}
```

#### Global pipes: 앱 단위에서 정의되며, 모든 수신 요청에 적용
```ts
async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  app.useGlobalPipes(SomePipe);
  await app.listen(3000);
}
bootstrap();
```


### Parameter-level VS Handler-level
- 상황에 따라 다름.
#### Parameter-level
- 더 깔끔해질 수 있음
- 하지만 코드가 추가되는 경우에 지저분해지고 유지 관리가 어려워질 수 있음
#### Handler-level
- 더 많은 코드를 작성하지만, 몇가지 큰 이점이 있음
- 매개변수 레벨에서 추가 코드가 필요하지 않음
- 유지 보수 및 확장이 용이. 데이터 모양이 변경되면 파이프 내에서만 필요한 변경을 쉽게 수행 가능
- 처리할 인수를 식별하는 책임은 하나의 특정 파일인 파이프 파일로 이동됨.
- DTO의 활용을 촉진시킴

---
##### Client
=>
##### HTTP Request 
##### POST /task { "description": "Clean up" }
=>
##### Handler is identified
=>
##### Pipe Validates arguments
=> (if Success)
##### TasksController.createTask() => Client
##### (
=> (if Failure)
##### throw BadRequestException
##### )