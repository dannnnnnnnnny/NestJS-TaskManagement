- 윈도우 환경변수
- yarn global add win-node-env

# Configuration
- 응용 프로그램 시작시 로드되는 값
- 런타임 중에 변경되어서는 안되며 정적 값 구성을 수행
- 환경별 구성 - 개발, 스테이징, 프로덕션 등
- 코드베이스에서 정의되며 버전 제어를 통해 여러 개발자와 작업하는 경우에 유용함. 구성은 항상 함께 제공된 코드와 함께 작동해야 함
- 사용자 정의 솔루션 또는 오픈 소스 라이브러리를 사용하여 다양한 방식으로 정의할 수 있음.(JSON, YAML, XML, 환경 변수 등)

# CodeBase VS Environment Variables
- CodeBase : 코드베이스에 구성을 정의할 수 있음. (예를 들어 구성 폴더에서)
- 환경변수 : 애플리케이션 실행 시 제공되는 환경 변수를 통한 값 구성도 지원할 수 있음.

## ex)
- CodeBase : 응용 프로그램을 실행할 포트와 같은 중요하지 않은 정보가 코드베이스에 정의
- 환경변수 : 응용 프로그램을 실행하면 데이터베이스 사용자 이름 및 프로덕션 모드의 암호와 같은 중요한 정보가 환경 변수를 통해 제공.

---
- config 폴더 생성 후 환경 변수 설정 (default, development, production)
- typeorm.config.ts 수정 (하드코딩이 아닌 설정을 해준 값을 가져오는 방식으로 사용)
```ts
// typeorm.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';

const dbConfig = config.get('db');

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: dbConfig.type,
  host: process.env.RDS_HOSTNAME || dbConfig.host,
  port: process.env.RDS_PORT || dbConfig.port,
  username: process.env.RDS_USERNAME || dbConfig.username,
  password: process.env.RDS_PASSWORD || dbConfig.password,
  database: process.env.RDS_DB_NAME || dbConfig.database,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: process.env.TYPEORM_SYNC || dbConfig.synchronize,
};
```
- jwt도 마찬가지
```ts
// auth.module.ts
// secret 키, expiresIn 숨기기
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from './user.repository';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import * as config from 'config';

const jwtConfig = config.get('jwt');

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: {
        expiresIn: jwtConfig.expiresIn,
      },
    }),
    TypeOrmModule.forFeature([UserRepository]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
```

```ts
// jwt.strategy.ts
// secretkey 숨기기
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from './jwt-payload.interface';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import * as config from 'config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserRepository) // 밑에 메소드에서 this.userRepository를 사용가능해짐
    private userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // JWT를 추출하여 사용할 방법
      secretOrKey: process.env.JWT_SECRET || config.get('jwt.secret'), // 토큰 서명을 확인할 비밀키
    });
  }

  // @UseGuard('jwt')을 선택한 controller에 대해서 동작함
  // return된 user는 Requset객체에 req.user로 할당됨.
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

