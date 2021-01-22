## Auth
- nest g module auth
- nest g controller auth --no-spec
- nest g service auth --no-spec

#### auth-credentials.dto.ts
```ts
import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export class AuthCredentialsDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
  password: string;
}
```
- username, password 유효성 검사 추가
- password에 @Matches를 이용해서 정규표현식 적용 
- 대문자와 소문자가 하나 이상씩 있게
- 하나 이상의 숫자 or 특수 문자 사용

### auth.controller.ts
```ts
@Post('/signup')
signUp(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto): Promise<void> {
  return this.authService.signUp(authCredentialsDto);
}
```
- 유효성 검사를 적용시키기 위해서 ValidationPipe 적용
