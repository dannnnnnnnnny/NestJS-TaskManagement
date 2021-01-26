## JSON Web Token
- 오픈 소스 산업 표준 (RFC-7519)
- 허가 또는 당사자 간의 안전한 정보 교환에 사용
- 발신인이 자신이 누구인지 확인
- 발급자가 비밀 또는 키 쌍(HMAC 알고리즘, RSA 또는 ECDSA)을 사용하여 서명

---
- Header: 토큰에 대한 메타데이터 포함 (type, hashing algorithm)
- Payload: 클레임(예: 사용자) 및 추가 데이터가 포함
- Signature: 암호로 서명된 인코딩된 헤더의 결과

---
- 아무나 해독할 수 있는건 아니지만 패스워드같은 민감한 정보를 포함해서는 안됨

### passportJS
- yarn add @nestjs/jwt @nestjs/passport passport passport-jwt

```ts
// auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from './user.repository';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'topSecret51',
      signOptions: {
        expiresIn: 3600,
      },
    }),
    TypeOrmModule.forFeature([UserRepository]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
```
- 1시간 후 만료되는 jwt 토큰

```ts
// jwt-payload.interface.ts
export interface JwtPayload {
  username: string;
}
```

#### auth.module에 import 한 후, service에서 의존성 주입사용하여 주입할 수 있음.
```ts
// auth.service.ts
constructor(
  @InjectRepository(UserRepository)
  private userRepository: UserRepository,
  private jwtService: JwtService,
) {}

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

  return { accessToken };
}
```

```ts
// auth.controller.ts
@Post('/signin')
signIn(
  @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
): Promise<{ accessToken: string }> {
  return this.authService.signIn(authCredentialsDto);
}
```
- POST localhost:3000/signin (username, password)로 로그인 요청을 하면 accessToken이 반환됨
- jwt.io 사이트에서 확인 가능함

---
## Jwt 전략 설정
```ts
// jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from './jwt-payload.interface';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserRepository) // 밑에 메소드에서 this.userRepository를 사용가능해짐
    private userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // JWT를 추출하여 사용할 방법
      secretOrKey: 'topSecret51', // 토큰 서명을 확인할 비밀키
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { username } = payload;
    const user = await this.userRepository.findOne({ username });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
``` 
- 추출된 정보를 사용하여 요청을 진행할 수 있는지 여부 결정
- jwtFromRequest: Request로부터 Bearer JWT을 추출. (표준은 Request의 헤더인 Authorization header에서 bearer 토큰을 사용하는 것)
- validate() : jwt.strategy를 사용할 때, passport는 JWT sign을 json으로 decode하고 validate()를 호출함.
- 이전에 서명한 사용자가 유효한지 검증. validate()의 return으로 정보들이 들어있는 객체를 Request 객체에 리턴함
- 검증은 passport에서, jwt sign은 auth.service에서

```ts
// auth.module.ts
providers: [AuthService, JwtStrategy],
exports: [JwtStrategy, PassportModule],
```
- providers, exports 수정 및 추가
- 다른 모듈에서도 사용할 수 있도록

```ts
// auth.controller.ts
@Post('/test')
@UseGuards(AuthGuard())
test(@Req() req) {
  console.log(req);
}
```
- /auth/signin 에서 로그인 성공 후 받은 accessToken을 /auth/test에 Headers를 통해서 Authorization : Bearer $%#bBD241563... 이렇게 값을 보내주면 jwt.strategy.ts에서 BearerToken을 추출하여 검증함