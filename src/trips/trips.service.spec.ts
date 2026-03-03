import { Test, TestingModule } from '@nestjs/testing';
import { TripsService } from './trips.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';

const mockTrip = {
  id: 'trip-123',
  title: 'Viaje a Japón',
  destination: 'Tokio, Japón',
  user_id: 'user-123',
  image_url: null,
  start_date: '2026-01-01T00:00:00Z',
  end_date: '2026-01-15T00:00:00Z',
  total_budget: 3000,
  is_public: false,
  created_at: '2026-01-01T00:00:00Z',
};

const mockSupabase = {
  from: jest.fn(),
};

describe('TripsService', () => {
  let service: TripsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsService,
        { provide: SUPABASE_CLIENT, useValue: mockSupabase },
      ],
    }).compile();

    service = module.get<TripsService>(TripsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear un viaje correctamente', async () => {
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockTrip, error: null }),
      });

      const result = await service.create(
        {
          title: 'Viaje a Japón',
          start_date: '2026-01-01T00:00:00Z',
          end_date: '2026-01-15T00:00:00Z',
          total_budget: 3000,
          is_public: false,
        },
        'user-123',
      );

      expect(result).toEqual(mockTrip);
    });
  });

  describe('findMyTrips', () => {
    it('debería devolver solo los viajes del usuario', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [mockTrip], error: null }),
      });

      const result = await service.findMyTrips('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].user_id).toBe('user-123');
    });
  });

  describe('findOne', () => {
    it('debería devolver un viaje si el usuario es el owner', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockTrip, error: null }),
      });

      const result = await service.findOne('trip-123', 'user-123');

      expect(result.id).toBe('trip-123');
    });

    it('debería lanzar ForbiddenException si el viaje es privado y el usuario no es el owner', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockTrip, error: null }),
      });

      await expect(service.findOne('trip-123', 'otro-user')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('debería lanzar NotFoundException si el viaje no existe', async () => {
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

  describe('update', () => {
    it('debería actualizar un viaje si el usuario es el owner', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockTrip, error: null }),
      });

      const updatedTrip = { ...mockTrip, total_budget: 5000 };

      mockSupabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: updatedTrip, error: null }),
      });

      const result = await service.update(
        'trip-123',
        { total_budget: 5000 },
        'user-123',
      );

      expect(result.total_budget).toBe(5000);
    });

    it('debería lanzar ForbiddenException si el usuario no es el owner', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockTrip, error: null }),
      });

      await expect(
        service.update('trip-123', { total_budget: 5000 }, 'otro-user'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('debería eliminar un viaje si el usuario es el owner', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockTrip, error: null }),
      });

      mockSupabase.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const result = await service.remove('trip-123', 'user-123');

      expect(result).toEqual({ message: 'Viaje borrado correctamente' });
    });

    it('debería lanzar ForbiddenException si el usuario no es el owner', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockTrip, error: null }),
      });

      await expect(service.remove('trip-123', 'otro-user')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
