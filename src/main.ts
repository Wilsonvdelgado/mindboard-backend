import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']; // OR comma-delimited string 'GET,POST,PUT,PATH,DELETE'
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { methods },
  });
  await app.listen(process.env.PORT ?? 3000);

  // Habilita CORS globalmente
  // app.enableCors({
  //   origin: 'http://localhost:5173/', // URL do seu frontend React
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   credentials: true, // se precisar enviar cookies
  // });
}
bootstrap();
