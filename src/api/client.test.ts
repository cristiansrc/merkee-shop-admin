import { describe, it, expect } from 'vitest';
import { getLocalizedError, extractErrorMessage } from './client';

describe('Error Localization', () => {
  describe('getLocalizedError', () => {
    it('debería retornar mensaje para INVALID_CREDENTIALS', () => {
      expect(getLocalizedError('INVALID_CREDENTIALS')).toBe('Correo o contraseña incorrectos');
    });

    it('debería retornar mensaje para AUTHENTICATION_REQUIRED', () => {
      expect(getLocalizedError('AUTHENTICATION_REQUIRED')).toBe('Debe iniciar sesión para realizar esta acción');
    });

    it('debería retornar mensaje para INITIAL_PASSWORD_CHANGE_REQUIRED', () => {
      expect(getLocalizedError('INITIAL_PASSWORD_CHANGE_REQUIRED')).toBe('Debe cambiar su contraseña antes de continuar');
    });

    it('debería retornar mensaje para RESOURCE_NOT_FOUND', () => {
      expect(getLocalizedError('RESOURCE_NOT_FOUND')).toBe('El recurso solicitado no fue encontrado');
    });

    it('debería retornar mensaje para VERSION_MISMATCH (409)', () => {
      expect(getLocalizedError('VERSION_MISMATCH')).toBe('Conflicto de edición: otro usuario modificó este recurso. Actualice y vuelva a intentar');
    });

    it('debería retornar mensaje para CATEGORY_HAS_PRODUCTS', () => {
      expect(getLocalizedError('CATEGORY_HAS_PRODUCTS')).toBe('No se puede eliminar: la categoría tiene productos asociados');
    });

    it('debería retornar mensaje para IDEMPOTENCY_KEY_REUSED', () => {
      expect(getLocalizedError('IDEMPOTENCY_KEY_REUSED')).toBe('Conflicto de idempotencia: la solicitud ya fue procesada');
    });

    it('debería retornar mensaje para STOCK_INSUFFICIENT (422)', () => {
      expect(getLocalizedError('STOCK_INSUFFICIENT')).toBe('Stock insuficiente para realizar esta operación');
    });

    it('debería retornar mensaje para INVALID_DOMAIN_INPUT', () => {
      expect(getLocalizedError('INVALID_DOMAIN_INPUT')).toBe('Los datos enviados no son válidos');
    });

    it('debería retornar mensaje para CURRENT_PASSWORD_INVALID', () => {
      expect(getLocalizedError('CURRENT_PASSWORD_INVALID')).toBe('La contraseña actual es incorrecta');
    });

    it('debería retornar mensaje para ACTIVATION_TOKEN_INVALID_OR_EXPIRED', () => {
      expect(getLocalizedError('ACTIVATION_TOKEN_INVALID_OR_EXPIRED')).toBe('El token de activación es inválido o ha expirado');
    });

    it('debería retornar mensaje para PASSWORD_RESET_TOKEN_INVALID_OR_EXPIRED', () => {
      expect(getLocalizedError('PASSWORD_RESET_TOKEN_INVALID_OR_EXPIRED')).toBe('El token de restablecimiento es inválido o ha expirado');
    });

    it('debería retornar mensaje para TECHNICAL_DEPENDENCY_FAILURE (500)', () => {
      expect(getLocalizedError('TECHNICAL_DEPENDENCY_FAILURE')).toBe('Error del servidor. Intente nuevamente más tarde');
    });

    it('debería retornar mensaje para RATE_LIMITED (429)', () => {
      expect(getLocalizedError('RATE_LIMITED')).toBe('Demasiadas solicitudes. Intente nuevamente en unos minutos');
    });

    it('debería retornar mensaje por defecto para código desconocido', () => {
      expect(getLocalizedError('UNKNOWN_ERROR')).toBe('Error desconocido. Intente nuevamente');
    });
  });

  describe('extractErrorMessage', () => {
    it('debería extraer mensaje de error de Axios', () => {
      const error = {
        isAxiosError: true,
        response: {
          data: {
            code: 'INVALID_CREDENTIALS',
            message: 'Credenciales inválidas',
          },
        },
      } as any;

      expect(extractErrorMessage(error, 'Fallback')).toBe('Credenciales inválidas');
    });

    it('debería usar mensaje localizado si no hay message en response', () => {
      const error = {
        isAxiosError: true,
        response: {
          data: {
            code: 'VERSION_MISMATCH',
          },
        },
      } as any;

      expect(extractErrorMessage(error, 'Fallback')).toBe('Conflicto de edición: otro usuario modificó este recurso. Actualice y vuelva a intentar');
    });

    it('debería retornar fallback para error no Axios', () => {
      expect(extractErrorMessage(new Error('Test'), 'Fallback')).toBe('Fallback');
    });

    it('debería retornar fallback para null/undefined', () => {
      expect(extractErrorMessage(null, 'Fallback')).toBe('Fallback');
      expect(extractErrorMessage(undefined, 'Fallback')).toBe('Fallback');
    });
  });
});
