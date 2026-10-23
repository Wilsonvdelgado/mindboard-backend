import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE','OPTIONS']; // OR comma-delimited string 'GET,POST,PUT,PATH,DELETE'
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
 app.enableCors({
    origin:process.env.FRONTEND_URL,
    methods,
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('MindBoard API')
    .setDescription('API para gestão de brainstorm em tempo real')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
