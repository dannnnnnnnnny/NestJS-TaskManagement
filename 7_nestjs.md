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
---
### 아이디 중복 검사
```ts
// user.repository.ts
async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
  const { username, password } = authCredentialsDto;

  const exists = this.findOne({ username });
  if (exists) {
    //
  }

  const user = new User();
  user.username = username;
  user.password = password;
  await user.save();
}
```
- 회원가입을 하기 위해서 2번의 쿼리를 돌아야 하는 문제가 생김

``` ts
// user.entity.ts
import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['username'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;
}
```
- userEntity에서 @Unique() 데코레이터를 통해서 고유한 값을 지정할 필드명을 Array로 설정하면 됨
- 중복된 아이디로 가입하려고할 시, 자동적으로 500 Server Error를 뿜어내는데, 

```ts
// user.repository.ts
try {
  await user.save();
} catch (error) {
  // 아이디 중복일 때 에러코드는 '23505'
  if (error.code === '23505') {
    throw new ConflictException('Username already exists');
  } else {
    throw new InternalServerErrorException();
  }
}
}
```