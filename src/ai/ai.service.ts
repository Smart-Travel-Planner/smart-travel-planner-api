// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { genkit, z } from 'genkit';
// import { googleAI } from '@genkit-ai/google-genai';

// @Injectable()
// export class AiService implements OnModuleInit {
//   private ai: ReturnType<typeof genkit>;

//   onModuleInit() {
//     //     if (!process.env.GOOGLE_GENAI_API_KEY) {
//     //       console.error('Falta la API KEY de Google GenAI');
//     //     }
//     //     this.ai = genkit({
//     //       plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
//     //     });
//     //   }
//     try {
//       // Verifica que la API KEY existe
//       if (!process.env.GOOGLE_GENAI_API_KEY) {
//         throw new Error('Falta la variable de entorno GOOGLE_GENAI_API_KEY');
//       }

//       this.ai = genkit({
//         plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
//       });
//       console.log('✅ Genkit inicializado correctamente');
//     } catch (error) {
//       console.error('❌ Error inicializando Genkit:', error);
//     }
//   }
//   //   async generateTravelRequirements(destination: string) {
//   //     const TravelRequirementsSchema = z.object({
//   //       documentation: z.object({
//   //         passport: z.boolean(),
//   //         visa: z.boolean(),
//   //         visa_info: z.string(),
//   //       }),
//   //       health_info: z.object({
//   //         vaccines: z.array(z.string()),
//   //         insurance_required: z.boolean(),
//   //       }),
//   //       currency_info: z.object({
//   //         currency: z.string(),
//   //         exchange_rate: z.number(),
//   //         cash_recommended: z.boolean(),
//   //       }),
//   //     });

//   //     const { output } = await this.ai.generate({
//   //       model: googleAI.model('gemini-2.0-flash'),
//   //       prompt: `Eres un experto en requisitos de viaje internacionales.
//   // Dado el destino "${destination}", genera los requisitos de viaje para un ciudadano español.
//   // Devuelve únicamente un JSON válido, sin texto adicional ni bloques de código.`,
//   //       output: { schema: TravelRequirementsSchema },
//   //     });

//   //     return output;
//   //   }
//   async generateTravelRequirements(destination: string) {
//     try {
//       // 1. Verificación de seguridad
//       if (!this.ai) {
//         throw new Error('El servicio de IA no se ha inicializado');
//       }

//       const TravelRequirementsSchema = z.object({
//         documentation: z.object({
//           passport: z.boolean(),
//           visa: z.boolean(),
//           visa_info: z.string(),
//         }),
//         health_info: z.object({
//           vaccines: z.array(z.string()),
//           insurance_required: z.boolean(),
//         }),
//         currency_info: z.object({
//           currency: z.string(),
//           exchange_rate: z.number(),
//           cash_recommended: z.boolean(),
//         }),
//       });

//       // 2. Ejecución del modelo
//       const { output } = await this.ai.generate({
//         model: googleAI.model('gemini-2.0-flash'),
//         prompt: `Eres un experto en requisitos de viaje internacionales.
//         Genera los requisitos para un ciudadano español viajando a ${destination}.`,
//         output: { schema: TravelRequirementsSchema },
//       });

//       return output;
//     } catch (error) {
//       console.error('❌ Error en generateTravelRequirements:', error);
//       // Lanzamos una excepción que NestJS pueda entender para darte más info
//       // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
//       throw new Error(`Error en el Agente de IA: ${error.message}`);
//     }
//   }
// }

// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { genkit, z } from 'genkit';
// import { googleAI } from '@genkit-ai/googleai';

// @Injectable()
// export class AiService implements OnModuleInit {
//   private ai: ReturnType<typeof genkit>;

//   onModuleInit() {
//     try {
//       if (!process.env.GOOGLE_GENAI_API_KEY) {
//         throw new Error('Falta la variable de entorno GOOGLE_GENAI_API_KEY');
//       }

//       this.ai = genkit({
//         plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
//       });
//       console.log('✅ Genkit inicializado correctamente');
//     } catch (error) {
//       console.error('❌ Error inicializando Genkit:', error);
//     }
//   }

//   async generateTravelRequirements(destination: string) {
//     if (!this.ai) {
//       throw new Error('El servicio de IA no se ha inicializado');
//     }

//     // Definimos el orden de prioridad de los modelos
//     // Cambia el array de modelos por este
//     const models = [
//       googleAI.model('gemini-1.5-flash-latest'), // Añadimos -latest que es más estable
//       googleAI.model('gemini-2.0-flash'),
//       googleAI.model('gemini-1.5-flash'),
//     ];

//     const TravelRequirementsSchema = z.object({
//       documentation: z.object({
//         passport: z.boolean(),
//         visa: z.boolean(),
//         visa_info: z.string(),
//       }),
//       health_info: z.object({
//         vaccines: z.array(z.string()),
//         insurance_required: z.boolean(),
//       }),
//       currency_info: z.object({
//         currency: z.string(),
//         exchange_rate: z.number(),
//         cash_recommended: z.boolean(),
//       }),
//     });

//     let lastError: any;

//     // Intentamos con cada modelo en orden
//     for (const modelRef of models) {
//       try {
//         console.log(
//           `🤖 Intentando generar requisitos con: ${modelRef.name}...`,
//         );

//         const { output } = await this.ai.generate({
//           model: modelRef,
//           prompt: `Eres un experto en requisitos de viaje internacionales.
//           Genera los requisitos para un ciudadano español viajando a ${destination}.`,
//           output: { schema: TravelRequirementsSchema },
//         });

//         console.log(`✅ Éxito con el modelo: ${modelRef.name}`);
//         return output;
//       } catch (error) {
//         lastError = error;
//         // Si el error es de cuota (429), avisamos y probamos el siguiente
//         if (
//           // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
//           error.status === 'RESOURCE_EXHAUSTED' ||
//           // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
//           error.message?.includes('429')
//         ) {
//           console.warn(
//             `⚠️ Cuota agotada en ${modelRef.name}. Saltando al siguiente modelo...`,
//           );
//           continue;
//         }
//         // Si es otro tipo de error, lo lanzamos directamente
//         break;
//       }
//     }

//     // Si llegamos aquí, es que todos los intentos fallaron
//     console.error('❌ Todos los modelos de IA han fallado:', lastError);
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
//     throw new Error(`Error en el Agente de IA: ${lastError.message}`);
//   }
// }

// import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
// import { genkit, z, Genkit } from 'genkit'; // Importamos el tipo Genkit
// // import { googleAI, gemini15Flash } from '@genkit-ai/googleai';
// // import { googleAI, gemini15Flash, gemini20Flash } from '@genkit-ai/googleai';
// import { googleAI, gemini15Flash } from '@genkit-ai/googleai';

// @Injectable()
// export class AiService implements OnModuleInit {
//   private readonly logger = new Logger(AiService.name);
//   private aiInstance!: Genkit; // Usamos el tipo correcto y ! para decir que se iniciará luego

//   onModuleInit() {
//     const apiKey = process.env.GOOGLE_GENAI_API_KEY;
//     console.log(`🔑 API Key cargada: ${apiKey?.substring(0, 4)}...`);
//     if (!apiKey) {
//       this.logger.error('Falta la variable GOOGLE_GENAI_API_KEY en el .env');
//       return;
//     }

//     this.aiInstance = genkit({
//       plugins: [googleAI({ apiKey })],
//     });

//     this.logger.log('✅ Genkit inicializado correctamente');
//   }

//   async generateTravelRequirements(destination: string) {
//     if (!this.aiInstance) {
//       throw new Error('El agente de IA no está disponible');
//     }

//     const TravelRequirementsSchema = z.object({
//       documentation: z.object({
//         passport: z.boolean(),
//         visa: z.boolean(),
//         visa_info: z.string(),
//       }),
//       health_info: z.object({
//         vaccines: z.array(z.string()),
//         insurance_required: z.boolean(),
//       }),
//       currency_info: z.object({
//         currency: z.string(),
//         exchange_rate: z.number(),
//         cash_recommended: z.boolean(),
//       }),
//     });

//     try {
//       // Usamos el 1.5 Flash para asegurar que la cuota no nos bloquee
//       const response = await this.aiInstance.generate({
//         // Prueba con este string exacto (sin el prefijo googleai/)
//         model: 'gemini-1.5-flash-001',
//         prompt: `Experto en viajes. Requisitos JSON para ciudadano español a: ${destination}`,
//         output: { schema: TravelRequirementsSchema },
//       });
//       return response.output;
//     } catch (error: unknown) {
//       this.logger.error('Error en el agente de IA', error);
//       const errorMessage =
//         error instanceof Error ? error.message : 'Error desconocido';
//       throw new Error(`IA Agent failure: ${errorMessage}`);
//     }
//   }
// }

// import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
// import { genkit, z, Genkit } from 'genkit';
// import { googleAI, gemini15Flash } from '@genkit-ai/googleai';

// @Injectable()
// export class AiService implements OnModuleInit {
//   private readonly logger = new Logger(AiService.name);
//   private aiInstance!: Genkit;

//   onModuleInit() {
//     const apiKey = process.env.GOOGLE_GENAI_API_KEY;
//     if (!apiKey) {
//       this.logger.error('Falta la API KEY');
//       return;
//     }

//     // this.aiInstance = genkit({
//     //   plugins: [googleAI({ apiKey })],
//     // });
//     this.aiInstance = genkit({
//       plugins: [
//         googleAI({
//           apiKey,
//           apiVersion: 'v1', // <--- Añade esto para evitar el 404 de la v1beta
//         }),
//       ],
//     });
//   }

//   async generateTravelRequirements(destination: string) {
//     const TravelRequirementsSchema = z.object({
//       documentation: z.object({
//         passport: z.boolean(),
//         visa: z.boolean(),
//         visa_info: z.string(),
//       }),
//       health_info: z.object({
//         vaccines: z.array(z.string()),
//         insurance_required: z.boolean(),
//       }),
//       currency_info: z.object({
//         currency: z.string(),
//         exchange_rate: z.number(),
//         cash_recommended: z.boolean(),
//       }),
//     });

//     try {
//       const response = await this.aiInstance.generate({
//         // IMPORTANTE: En tu versión, usa la referencia directa importada
//         model: 'googleai/gemini-1.5-flash-001',
//         prompt: `Como experto en viajes, genera requisitos JSON para un español a: ${destination}`,
//         output: { schema: TravelRequirementsSchema },
//       });

//       return response.output;
//     } catch (error: any) {
//       this.logger.error('Error en el agente de IA', error);
//       // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
//       throw new Error(`IA Agent failure: ${error.message}`);
//     }
//   }
// }

// import { Injectable, Logger } from '@nestjs/common';
// import { GoogleGenerativeAI } from '@google/generative-ai';

// @Injectable()
// export class AiService {
//   private readonly logger = new Logger(AiService.name);

//   async generateTravelRequirements(destination: string) {
//     const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY!);
//     // Forzamos el modelo pro/flash que esté disponible sin prefijos de genkit
//     // const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
//     const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

//     const prompt = `Actúa como experto en viajes.
//     Genera los requisitos para un ciudadano español viajando a ${destination}.
//     Devuelve estrictamente un objeto JSON con esta estructura:
//     {
//       "documentation": { "passport": boolean, "visa": boolean, "visa_info": string },
//       "health_info": { "vaccines": string[], "insurance_required": boolean },
//       "currency_info": { "currency": string, "exchange_rate": number, "cash_recommended": boolean }
//     }`;

//     try {
//       const result = await model.generateContent(prompt);
//       const text = result.response.text();
//       // Limpiamos el texto por si la IA añade bloques de código Markdown ```json
//       const cleanJson = text.replace(/```json|```/g, '').trim();
//       return JSON.parse(cleanJson);
//     } catch (error: any) {
//       this.logger.error('Error directo de Gemini:', error);
//       throw new Error(`Error en la IA: ${error.message}`);
//     }
//   }
// }

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { genkit, z, Genkit } from 'genkit';
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

  //   async generateTravelRequirements(destination: string) {
  //     // Definimos el esquema de salida para que Genkit fuerce el JSON estructurado
  //     const TravelRequirementsSchema = z.object({
  //       documentation: z.object({
  //         passport: z.boolean(),
  //         visa: z.boolean(),
  //         visa_info: z.string(),
  //       }),
  //       health_info: z.object({
  //         vaccines: z.array(z.string()),
  //         insurance_required: z.boolean(),
  //       }),
  //       currency_info: z.object({
  //         currency: z.string(),
  //         exchange_rate: z.number(),
  //         cash_recommended: z.boolean(),
  //       }),
  //     });

  //     try {
  //       const response = await this.aiInstance.generate({
  //         // Usamos el modelo confirmado en tu lista de modelos disponibles
  //         model: 'googleai/gemini-2.0-flash-lite',
  //         prompt: `Actúa como un experto en viajes. Genera los requisitos actualizados para un ciudadano español que desea viajar a: ${destination}.`,
  //         output: { schema: TravelRequirementsSchema },
  //       });

  //       // Validamos que exista respuesta antes de retornar
  //       if (!response || !response.output) {
  //         throw new Error('La IA no devolvió un resultado válido');
  //       }

  //       this.logger.log(`Requisitos generados con éxito para: ${destination}`);
  //       return response.output;
  //     } catch (error: any) {
  //       this.logger.error('Error en el agente de IA:', error.message);
  //       // Lanzamos el error para que NestJS lo capture en el ExceptionsHandler
  //       throw new Error(`IA Agent failure: ${error.message}`);
  //     }
  //   }

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
