import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { genkit, Genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);
  private aiInstance!: Genkit;

  onModuleInit() {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      this.logger.error('Falta la variable de entorno GOOGLE_GENAI_API_KEY');
      return;
    }

    this.aiInstance = genkit({
      plugins: [googleAI({ apiKey })],
    });
  }

  async generateTravelRequirements(destination: string) {
    this.logger.warn(
      `Usando MOCK para ${destination} debido a restricciones de cuota de Google`,
    );
    // Simulamos un retraso de red para que parezca real
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      documentation: {
        passport: true,
        visa:
          destination.toLowerCase() === 'japón' ||
          destination.toLowerCase() === 'eeuu'
            ? false
            : true,
        visa_info: 'Requisito estándar para ciudadanos españoles.',
      },
      health_info: {
        vaccines: ['Hepatitis A', 'Tétanos'],
        insurance_required: true,
      },
      currency_info: {
        currency: 'Moneda local',
        exchange_rate: 1.12,
        cash_recommended: true,
      },
    };
  }
}
