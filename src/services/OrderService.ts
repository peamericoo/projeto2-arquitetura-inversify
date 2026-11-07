import { injectable, inject } from 'inversify';
import { TYPES } from '../container/types';
import logger from '../lib/logger';
import { ValidationError } from '../domain/errors';
import { OrderItem, OrderLine } from '../domain/Order';
import { ProductFactory } from '../domain/ProductFactory';
import { IProductRepository } from '../repositories/IProductRepository';
import { IOrderRepository } from '../repositories/IOrderRepository';
import type { PaymentMethodRegistry } from '../payments/PaymentMethodRegistry';
import type { NotificationService } from './NotificationService';

@injectable()
export class OrderService {
  constructor(
    @inject(TYPES.ProductRepository) private products: IProductRepository,
    @inject(TYPES.OrderRepository) private orders: IOrderRepository,
    @inject(TYPES.PaymentRegistry) private payments: PaymentMethodRegistry,
    @inject(TYPES.NotificationService) private notification: NotificationService,
  ) {}

  async placeOrder(customer: string, items: OrderItem[], paymentMethod: string, paymentDetails: any) {
    if (!items || items.length === 0) {
      logger.error('Tentativa de pedido sem itens');
      throw new ValidationError('Carrinho vazio');
    }

    let total = 0;
    const lines: OrderLine[] = [];
    for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new ValidationError(`Quantidade inválida para o produto ${item.productId}`);
      }
      const data = await this.products.findById(item.productId);
      if (!data) throw new ValidationError(`Produto ${item.productId} não encontrado`);

      const product = ProductFactory.create(data);
      total += product.price * item.quantity + product.calculateFreight();
      lines.push({ productId: product.id, name: product.name, price: product.price, quantity: item.quantity });
    }

    const payment = this.payments.get(paymentMethod);
    if (!payment) throw new ValidationError('Método de pagamento não suportado');
    await payment.process(total, paymentDetails);

    const order = await this.orders.create(customer, lines, total);

    const emailPreview = await this.notification.orderConfirmed(order);
    logger.info(`E-mail enviado: ${emailPreview ?? 'console'}`);

    return { orderId: order.id, total, emailPreview };
  }
}
