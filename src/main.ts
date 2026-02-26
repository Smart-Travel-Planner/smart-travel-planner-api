import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:4200',
      // añadir las URLs de producción cuando estén
    ],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Smart Travel Planner API')
    .setDescription(
      'API REST para gestionar viajes, ubicaciones y actividades.',
    )
    .setVersion('1.0')
    .addTag('Auth')
    .addTag('Usuarios')
    .addTag('Viajes')
    .addTag('Ubicaciones')
    .addTag('Actividades')
    .addTag('Requisitos del viaje')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`Swagger disponible en http://localhost:${PORT}/api-docs`);
}

bootstrap().catch((err) => {
  console.error('Error arrancando la aplicación:', err);
  process.exit(1);
});
