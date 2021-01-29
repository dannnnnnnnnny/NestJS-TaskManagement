import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as config from 'config';

async function bootstrap() {
  const serverConfig = config.get('server'); // default.yml -> { port: 3000 }
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV === 'development') {
    app.enableCors();
  } else {
    app.enableCors({ origin: serverConfig.origin }); // S3 URL 허용
    logger.log(`Accepting requests from origin "${serverConfig.origin}"`);
  }

  const port = process.env.PORT || serverConfig.port; // 3000
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}
bootstrap();
