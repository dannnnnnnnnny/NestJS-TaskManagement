import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../../domain/entities';
import { UserRepository } from '../repository';
import { AuthService } from './auth.service';

describe('DiagnosisQueryService', () => {
  let service: AuthService;
  let rep: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, UserRepository]
    }).compile();

    service = module.get<AuthService>(AuthService);
    rep = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('first', async () => {
    const user = new User();
    jest.spyOn(rep, 'findOneOrFail').mockResolvedValue(user);
    expect(await service.getUserById(1)).toEqual(user);
  });
});
