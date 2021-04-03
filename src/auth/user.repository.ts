import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, getManager, getRepository, Raw, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  // 회원가입
  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;

    const user = new User();
    user.username = username;
    user.salt = await bcrypt.genSalt(); // $2b$10$RiXWjJNwOEaKD5UhatiEne 같은 암호
    user.password = await this.hashPassword(password, user.salt); // password hashing

    try {
      await user.save();
    } catch (error) {
      // 아이디 중복 (충돌, http status 409 Error)
      if (error.code === '23505') {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  // 로그인
  async validateUserPassword(authCredentialsDto: AuthCredentialsDto): Promise<string> {
    const { username, password } = authCredentialsDto;
    const user = await this.findOne({ username });

    if (user && (await user.validatePassword(password))) {
      return user.username;
    } else {
      return null;
    }
  }

  // 비밀번호 암호화
  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }

  async filterData(data) {
    const sub = await getRepository(User)
      .createQueryBuilder()
      .select('username, "isPartner", certified')
      .where({
        ...data,
      });

    const res = await getManager()
      .createQueryBuilder()
      .select('s.*')
      .from('(' + sub.getQuery() + ')', 's')
      .getRawMany();

    return res;
  }
}
