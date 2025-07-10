import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
    app.use(helmet()); // Utilisation de Helmet pour sécuriser l'application

    // Configuration CORS pour le frontend
    app.enableCors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });

  app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
  );

  const config = new DocumentBuilder()
      .setTitle('Recipe Generator API')
      .setDescription('API pour la génération et gestion de recettes personnalisées')
      .setVersion('1.0')
      .addTag('recipes', 'Gestion des recettes')
      .addTag('nutrition', 'Analyse nutritionnelle')
      .addTag('ai', 'Génération IA')
      .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

    app.setGlobalPrefix('api', {
        exclude: ['health'],
    });

    const port = process.env.PORT || 3001;
    await app.listen(port);

    console.log(`🚀 Recipe API is running on: http://localhost:${port}`);
    console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();
