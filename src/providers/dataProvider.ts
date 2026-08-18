import type { DataProvider, GetListParams, GetOneParams, CreateParams, UpdateParams, DeleteOneParams, BaseRecord } from '@refinedev/core';
import {
  categoriesApi,
  productsApi,
  bannersApi,
  ordersApi,
} from '../api/client';

/**
 * DataProvider personalizado que integra la API existente de Merkee
 * con el sistema de datos de Refine.
 *
 * Mapea los recursos del admin a las llamadas API correspondientes,
 * manteniendo la compatibilidad con los endpoints existentes.
 */
export const dataProvider: DataProvider = {
  /**
   * Lista items paginados o completos según el recurso.
   */
  getList: async <TData extends BaseRecord = BaseRecord>(params: GetListParams) => {
    const { resource, pagination } = params;
    const { currentPage = 1, pageSize = 20 } = pagination ?? {};

    switch (resource) {
      case 'categories': {
        const items = await categoriesApi.list();
        return { data: items as unknown as TData[], total: items.length };
      }
      case 'products': {
        const response = await productsApi.list(currentPage, pageSize);
        return { data: response.items as unknown as TData[], total: response.page.total };
      }
      case 'banners': {
        const items = await bannersApi.list();
        return { data: items as unknown as TData[], total: items.length };
      }
      case 'orders': {
        const response = await ordersApi.list(currentPage, pageSize);
        return { data: response.items as unknown as TData[], total: response.page.total };
      }
      default:
        throw new Error(`Recurso no soportado: ${resource}`);
    }
  },

  /**
   * Obtiene un item por ID.
   */
  getOne: async <TData extends BaseRecord = BaseRecord>(params: GetOneParams) => {
    const { resource, id } = params;
    switch (resource) {
      case 'orders': {
        const item = await ordersApi.get(id as string);
        return { data: item as unknown as TData };
      }
      default:
        throw new Error(`Recurso no soportado para getOne: ${resource}`);
    }
  },

  /**
   * Crea un item.
   */
  create: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(params: CreateParams<TVariables>) => {
    const { resource, variables } = params;
    switch (resource) {
      case 'categories': {
        const item = await categoriesApi.create(variables as { name: string; image_key: string });
        return { data: item as unknown as TData };
      }
      case 'products': {
        const item = await productsApi.create(variables as Parameters<typeof productsApi.create>[0]);
        return { data: item as unknown as TData };
      }
      case 'banners': {
        const item = await bannersApi.create(variables as Parameters<typeof bannersApi.create>[0]);
        return { data: item as unknown as TData };
      }
      default:
        throw new Error(`Recurso no soportado para create: ${resource}`);
    }
  },

  /**
   * Actualiza un item.
   */
  update: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(params: UpdateParams<TVariables>) => {
    const { resource, id, variables } = params;
    switch (resource) {
      case 'categories': {
        const data = variables as { name: string; image_key: string; version: number };
        const item = await categoriesApi.update(id as string, { name: data.name, image_key: data.image_key }, data.version);
        return { data: item as unknown as TData };
      }
      case 'products': {
        const data = variables as Parameters<typeof productsApi.update>[1] & { version: number };
        const { version, ...rest } = data;
        const item = await productsApi.update(id as string, rest, version);
        return { data: item as unknown as TData };
      }
      case 'banners': {
        const data = variables as Parameters<typeof bannersApi.update>[1] & { version: number };
        const { version, ...rest } = data;
        const item = await bannersApi.update(id as string, rest, version);
        return { data: item as unknown as TData };
      }
      default:
        throw new Error(`Recurso no soportado para update: ${resource}`);
    }
  },

  /**
   * Elimina un item.
   */
  deleteOne: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(params: DeleteOneParams<TVariables>) => {
    const { resource, id } = params;
    switch (resource) {
      case 'categories': {
        await categoriesApi.delete(id as string);
        return { data: { id } as unknown as TData };
      }
      case 'products': {
        await productsApi.delete(id as string);
        return { data: { id } as unknown as TData };
      }
      case 'banners': {
        await bannersApi.delete(id as string);
        return { data: { id } as unknown as TData };
      }
      default:
        throw new Error(`Recurso no soportado para deleteOne: ${resource}`);
    }
  },

  /**
   * Obtiene múltiples items por IDs (no soportado actualmente).
   */
  getMany: async () => {
    throw new Error('getMany no implementado');
  },

  /**
   * Crea múltiples items (no soportado actualmente).
   */
  createMany: async () => {
    throw new Error('createMany no implementado');
  },

  /**
   * Actualiza múltiples items (no soportado actualmente).
   */
  updateMany: async () => {
    throw new Error('updateMany no implementado');
  },

  /**
   * Elimina múltiples items (no soportado actualmente).
   */
  deleteMany: async () => {
    throw new Error('deleteMany no implementado');
  },

  /**
   * Obtiene API personalizada (no soportado).
   */
  custom: async () => {
    throw new Error('custom no implementado');
  },

  /**
   * Obtiene la URL base de la API.
   */
  getApiUrl: () => {
    return import.meta.env.VITE_API_BASE_URL || 'https://api.merkee.shop/v1';
  },
};
