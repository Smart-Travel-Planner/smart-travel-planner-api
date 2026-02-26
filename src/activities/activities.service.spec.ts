import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesService } from './activities.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { ActivityCategory } from '../common/enums/activity-category.enum';

const mockActivity = {
  id: 'activity-123',
  title: 'Visita a Tokyo Tower',
  trip_id: 'trip-123',
  location_id: null,
  start_time: '2026-06-01T10:00:00Z',
  end_time: '2026-06-01T12:00:00Z',
  cost: 25.5,
  user_notes: 'Comprar entradas con antelación',
  category: 'cultura',
};

const mockTrip = {
  id: 'trip-123',
  user_id: 'user-123',
};

const mockSupabase = {
  from: jest.fn(),
};

describe('ActivitiesService', () => {
  let service: ActivitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        { provide: SUPABASE_CLIENT, useValue: mockSupabase },
      ],
    }).compile();

    service = module.get<ActivitiesService>(ActivitiesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear una actividad si el usuario es el owner del viaje', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockTrip, error: null }),
      });

      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: mockActivity, error: null }),
      });

      const result = await service.create(
        {
          title: 'Visita a Tokyo Tower',
          trip_id: 'trip-123',
          start_time: '2026-06-01T10:00:00Z',
          end_time: '2026-06-01T12:00:00Z',
          cost: 25.5,
          category: ActivityCategory.Cultura,
        },
        'user-123',
      );

      expect(result).toEqual(mockActivity);
    });

    it('debería crear una actividad si el usuario es colaborador del viaje', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockTrip, user_id: 'owner-123' },
          error: null,
        }),
      });

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: { id: 'member-123' }, error: null }),
      });

      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: mockActivity, error: null }),
      });

      const result = await service.create(
        {
          title: 'Visita a Tokyo Tower',
          trip_id: 'trip-123',
          start_time: '2026-06-01T10:00:00Z',
          end_time: '2026-06-01T12:00:00Z',
          cost: 25.5,
          category: ActivityCategory.Cultura,
        },
        'collaborator-123',
      );

      expect(result).toEqual(mockActivity);
    });

    it('debería lanzar ForbiddenException si el usuario no tiene acceso al viaje', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockTrip, user_id: 'owner-123' },
          error: null,
        }),
      });

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'No encontrado' },
        }),
      });

      await expect(
        service.create(
          {
            title: 'Visita a Tokyo Tower',
            trip_id: 'trip-123',
            start_time: '',
            cost: 0,
            category: ActivityCategory.Transporte,
          },
          'usuario-sin-acceso',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findByTrip', () => {
    it('debería devolver las actividades de un viaje si el usuario tiene acceso', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockTrip, error: null }),
      });

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [mockActivity], error: null }),
      });

      const result = await service.findByTrip('trip-123', 'user-123');

      expect(result).toHaveLength(1);
      expect(result[0].trip_id).toBe('trip-123');
    });
  });

  describe('findOne', () => {
    it('debería devolver una actividad si el usuario tiene acceso', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: mockActivity, error: null }),
      });

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockTrip, error: null }),
      });

      const result = await service.findOne('activity-123', 'user-123');

      expect(result.id).toBe('activity-123');
    });

    it('debería lanzar NotFoundException si la actividad no existe', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'No encontrado' },
        }),
      });

      await expect(service.findOne('inexistente', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('debería eliminar una actividad si el usuario tiene acceso', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: mockActivity, error: null }),
      });

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockTrip, error: null }),
      });

      mockSupabase.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const result = await service.remove('activity-123', 'user-123');

      expect(result).toEqual({ message: 'Actividad borrada correctamente' });
    });
  });
});
