import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Raw } from 'typeorm';
import { AuthCredentialsDto } from '../dto/auth-credentials.dto';
import { JwtPayload } from '../interface/jwt-payload.interface';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');

  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
    @InjectQueue('audio') private audioQueue: Queue,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.userRepository.signUp(authCredentialsDto);
  }

  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
    const username = await this.userRepository.validateUserPassword(authCredentialsDto);
    if (!username) {
      throw new UnauthorizedException('유효하지 않은 인증입니다.');
    }

    const payload: JwtPayload = { username };
    const accessToken = await this.jwtService.sign(payload);
    this.logger.debug(`Generated JWT Token with payload ${JSON.stringify(payload)}`);

    return { accessToken };
  }

  async authFilter(data = '', type = 'delivery,pickup') {
    const badgeArr: string[] = data.split(',');
    const typeData: string = type.split(',').length === 1 ? type.split(',')[0] : '';

    const filterObj = badgeArr.reduce((acc, cur) => {
      if (cur === '') return acc;
      acc[cur] = Raw(`true`);
      return acc;
    }, {});

    if (typeData === 'delivery') Object.assign(filterObj, { isPartner: Raw(`true`) });
    else if (typeData === 'pickup') Object.assign(filterObj, { isPartner: Raw(`false`) });

    return await this.userRepository.filterData(filterObj);
  }
}
