/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  OnModuleInit,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { genkit, Genkit, z } from 'genkit';
// Usamos un modelo Flash vigente para evitar 404 por modelos retirados.
import {
  googleAI,
  gemini20Flash,
  gemini20FlashLite,
  gemini25FlashPreview0417,
  gemini25FlashLite,
} from '@genkit-ai/googleai';

// 1. Esquema Zod: Obliga a Gemini a devolver la misma estructura que tu Mock anterior
const TravelRequirementsSchema = z.object({
  documentation: z.object({
    passport: z.boolean(),
    visa: z.boolean(),
    visa_info: z
      .string()
      .describe('Breve explicación sobre la visa para ciudadanos españoles.'),
  }),
  health_info: z.object({
    vaccines: z
      .array(z.string())
      .describe('Lista de vacunas recomendadas u obligatorias.'),
    insurance_required: z.boolean(),
  }),
  currency_info: z.object({
    currency: z
      .string()
      .describe('Nombre de la moneda local (ej. Yen, Dólar).'),
    exchange_rate: z
      .number()
      .describe('Tipo de cambio aproximado respecto al Euro.'),
    cash_recommended: z.boolean(),
  }),
});

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);
  private aiInstance!: Genkit;
  private readonly modelCandidates = [
    { name: 'gemini-2.0-flash', ref: gemini20Flash },
    { name: 'gemini-2.0-flash-lite', ref: gemini20FlashLite },
    { name: 'gemini-2.5-flash-lite', ref: gemini25FlashLite },
    { name: 'gemini-2.5-flash-preview-04-17', ref: gemini25FlashPreview0417 },
  ] as const;

  private isDailyQuotaExceeded(error: any): boolean {
    const quotaFailure = error?.errorDetails?.find(
      (detail: any) =>
        detail?.['@type'] === 'type.googleapis.com/google.rpc.QuotaFailure',
    );

    const violations = quotaFailure?.violations;
    if (!Array.isArray(violations)) return false;

    return violations.some(
      (violation: any) =>
        typeof violation?.quotaId === 'string' &&
        violation.quotaId.includes('PerDay'),
    );
  }

  private extractRetryDelaySeconds(error: any): number | null {
    const retryInfo = error?.errorDetails?.find(
      (detail: any) =>
        detail?.['@type'] === 'type.googleapis.com/google.rpc.RetryInfo',
    );

    const retryDelay = retryInfo?.retryDelay as string | undefined;
    if (!retryDelay) return null;

    const match = retryDelay.match(/^(\d+)s$/);
    if (!match) return null;

    const seconds = Number(match[1]);
    return Number.isFinite(seconds) ? seconds : null;
  }

  onModuleInit() {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      this.logger.error('Falta la variable de entorno GOOGLE_GENAI_API_KEY');
      return;
    }

    // Inicializamos Genkit con tu API Key gratuita de Google AI Studio
    this.aiInstance = genkit({
      plugins: [googleAI({ apiKey })],
    });
  }

  async generateTravelRequirements(destination: string) {
    // 🛡️ ESCUDO ANTI-UUID: Evita gastar cuota si el frontend envía un ID por error
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(destination)) {
      this.logger.warn(
        `¡Ojo! Se recibió un UUID en lugar del nombre del país: ${destination}`,
      );
      throw new HttpException(
        'Por favor, envía el nombre de la ciudad o país, no su ID interno.',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.log(
      `Consultando requisitos reales a Gemini (Gratis) para: ${destination}...`,
    );

    const prompt = `Actúa como un agente de viajes experto. Proporciona los requisitos de viaje, salud y moneda actuales para un turista que viaja desde España hacia: ${destination}.`;
    let lastError: any;

    for (const model of this.modelCandidates) {
      try {
        const response = await this.aiInstance.generate({
          model: model.ref,
          prompt,
          output: {
            schema: TravelRequirementsSchema,
          },
        });

        const requirements = response.output;

        if (!requirements) {
          this.logger.error(
            `La IA falló al devolver JSON con ${model.name}. Respuesta cruda: ${response.text}`,
          );
          throw new Error('Formato de IA inválido');
        }

        this.logger.log(
          `Exito: requisitos generados para ${destination} con ${model.name}.`,
        );
        return requirements;
      } catch (error: any) {
        lastError = error;
        const isQuotaError =
          error?.status === 429 || error?.message?.includes('429');

        if (isQuotaError) {
          this.logger.warn(
            `Sin cuota en ${model.name}. Probando siguiente modelo...`,
          );
          continue;
        }

        if (error?.message?.includes('404')) {
          this.logger.warn(
            `Modelo no disponible (${model.name}). Probando siguiente...`,
          );
          continue;
        }

        this.logger.error(`Error no recuperable con ${model.name}:`, error);
        throw new HttpException(
          'Error al generar los requisitos de viaje. Intenta nuevamente.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    const isDailyQuota = this.isDailyQuotaExceeded(lastError);
    const retrySeconds = this.extractRetryDelaySeconds(lastError);
    const quotaMessage = isDailyQuota
      ? 'Se agotó la cuota diaria gratuita en todos los modelos configurados. Espera al reinicio diario o usa una clave/proyecto con billing.'
      : retrySeconds
        ? `No hay cuota disponible ahora. Google sugiere reintentar en ~${retrySeconds}s, pero no esta garantizado.`
        : 'No hay cuota disponible en los modelos configurados.';

    throw new HttpException(
      `Se alcanzó la cuota de la API de IA (plan gratuito). ${quotaMessage}`,
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
