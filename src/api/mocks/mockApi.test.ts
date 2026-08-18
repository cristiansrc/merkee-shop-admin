import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockApi } from './mockApi';

describe('MockAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Auth', () => {
    it('debería login exitosamente con credenciales válidas', async () => {
      const result = await mockApi.auth.login('admin@merkee.shop', 'password');
      expect(result.user.email).toBe('admin@merkee.shop');
      expect(result.access_token).toBeDefined();
    });

    it('debería fallar login con credenciales inválidas', async () => {
      await expect(mockApi.auth.login('wrong@email.com', 'password')).rejects.toThrow();
    });

    it('debería obtener perfil', async () => {
      const result = await mockApi.auth.getProfile();
      expect(result.email).toBe('admin@merkee.shop');
      expect(result.role).toBe('admin');
    });
  });

  describe('Categories', () => {
    it('debería listar categorías', async () => {
      const result = await mockApi.categories.list();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBeDefined();
    });

    it('debería crear categoría', async () => {
      const result = await mockApi.categories.create({ name: 'Nueva Categoría', image_key: 'test-key' });
      expect(result.name).toBe('Nueva Categoría');
      expect(result.version).toBe(1);
    });

    it('debería actualizar categoría con versión correcta', async () => {
      const categories = await mockApi.categories.list();
      const result = await mockApi.categories.update(categories[0].id, { name: 'Actualizada', image_key: 'new-key' }, categories[0].version);
      expect(result.name).toBe('Actualizada');
      expect(result.version).toBe(categories[0].version + 1);
    });

    it('debería fallar actualización con versión incorrecta (409)', async () => {
      const categories = await mockApi.categories.list();
      await expect(mockApi.categories.update(categories[0].id, { name: 'Test', image_key: 'key' }, 999)).rejects.toThrow();
    });

    it('debería eliminar categoría sin productos', async () => {
      const categories = await mockApi.categories.list();
      // Crear categoría temporal para eliminar
      const newCat = await mockApi.categories.create({ name: 'Temporal', image_key: 'temp' });
      await expect(mockApi.categories.delete(newCat.id)).resolves.not.toThrow();
    });
  });

  describe('Products', () => {
    it('debería listar productos con paginación', async () => {
      const result = await mockApi.products.list(1, 2);
      expect(result.items.length).toBeLessThanOrEqual(2);
      expect(result.page.page).toBe(1);
      expect(result.page.size).toBe(2);
    });

    it('debería crear producto', async () => {
      const categories = await mockApi.categories.list();
      const result = await mockApi.products.create({
        name: 'Nuevo Producto',
        description: 'Descripción',
        regular_price_cop: 10000,
        sale_price_cop: 9000,
        unit: 'kg',
        category_id: categories[0].id,
      });
      expect(result.name).toBe('Nuevo Producto');
      expect(result.version).toBe(1);
    });

    it('debería actualizar producto con versión correcta', async () => {
      const { items: products } = await mockApi.products.list();
      const result = await mockApi.products.update(products[0].id, { name: 'Actualizado', category_id: products[0].category.id }, products[0].version);
      expect(result.name).toBe('Actualizado');
    });

    it('debería fallar actualización con versión incorrecta (409)', async () => {
      const { items: products } = await mockApi.products.list();
      await expect(mockApi.products.update(products[0].id, { name: 'Test', category_id: products[0].category.id }, 999)).rejects.toThrow();
    });
  });

  describe('Banners', () => {
    it('debería listar banners', async () => {
      const result = await mockApi.banners.list();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBeDefined();
    });

    it('debería crear banner', async () => {
      const result = await mockApi.banners.create({
        name: 'Nuevo Banner',
        image_key: 'banner-key',
        display_order: 2,
        active: true,
      });
      expect(result.name).toBe('Nuevo Banner');
      expect(result.active).toBe(true);
    });
  });

  describe('Stock', () => {
    it('debería ajustar stock positivo', async () => {
      const { items: products } = await mockApi.products.list();
      const initialStock = products[0].stock_available;
      const result = await mockApi.stock.createAdjustment(products[0].id, { quantity_delta: 10, reason: 'Reposición' });
      expect(result.quantity_delta).toBe(10);
      expect(result.stock_on_hand_before).toBe(initialStock);
      expect(result.stock_on_hand_after).toBe(initialStock + 10);
    });

    it('debería rechazar delta cero', async () => {
      const { items: products } = await mockApi.products.list();
      await expect(mockApi.stock.createAdjustment(products[0].id, { quantity_delta: 0, reason: 'Test' })).rejects.toThrow();
    });

    it('debería rechazar stock negativo (422)', async () => {
      const { items: products } = await mockApi.products.list();
      await expect(mockApi.stock.createAdjustment(products[0].id, { quantity_delta: -999999, reason: 'Test' })).rejects.toThrow();
    });
  });

  describe('Orders', () => {
    it('debería listar órdenes con paginación', async () => {
      const result = await mockApi.orders.list(1, 10);
      expect(result.items.length).toBeLessThanOrEqual(10);
      expect(result.page.page).toBe(1);
    });

    it('debería obtener orden por ID', async () => {
      const result = await mockApi.orders.get('order-001');
      expect(result.id).toBe('order-001');
      expect(result.order_number).toBeDefined();
    });

    it('debería fallar obtener orden inexistente (404)', async () => {
      await expect(mockApi.orders.get('order-999')).rejects.toThrow();
    });
  });

  describe('Admin Users', () => {
    it('debería provisionar admin', async () => {
      const result = await mockApi.adminUsers.provision({
        display_name: 'Nuevo Admin',
        email: 'nuevo@merkee.shop',
      });
      expect(result.display_name).toBe('Nuevo Admin');
      expect(result.must_change_password).toBe(true);
      expect(result.activation_expires_at).toBeDefined();
    });
  });

  describe('Activation', () => {
    it('debería activar con token válido', async () => {
      await expect(mockApi.activation.activate({ token: 'a'.repeat(32), new_password: 'password123' })).resolves.not.toThrow();
    });

    it('debería fallar con token inválido (422)', async () => {
      await expect(mockApi.activation.activate({ token: 'short', new_password: 'password123' })).rejects.toThrow();
    });
  });

  describe('Password', () => {
    it('debería cambiar contraseña exitosamente', async () => {
      await expect(mockApi.password.change({ current_password: 'correct', new_password: 'newpassword' })).resolves.not.toThrow();
    });

    it('debería fallar con contraseña actual incorrecta (422)', async () => {
      await expect(mockApi.password.change({ current_password: 'wrong', new_password: 'newpassword' })).rejects.toThrow();
    });
  });
});
