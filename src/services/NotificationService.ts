import { injectable, inject } from 'inversify';
import { TYPES } from '../container/types';
import { Order } from '../domain/Order';
import { IMailProvider } from '../providers/IMailProvider';

@injectable()
export class NotificationService {
  constructor(@inject(TYPES.MailProvider) private mailProvider: IMailProvider) {}

  orderConfirmed(order: Order): Promise<string | null> {
    return this.mailProvider.sendMail({
      to: order.customer,
      subject: `Confirmação do pedido #${order.id}`,
      text: [
        `Seu pedido #${order.id} foi confirmado.`,
        '',
        ...order.items.map((item) => `- ${item.quantity}x ${item.name} (R$ ${item.price})`),
        '',
        `Total: R$ ${order.total}`,
      ].join('\n'),
      html: `
        <h1>Pedido confirmado</h1>
        <p>Seu pedido <b>#${order.id}</b> foi processado.</p>
        <p>Total: <strong>R$ ${order.total}</strong></p>
        <ul>
          ${order.items.map((item) => `<li>${item.quantity}x ${item.name}</li>`).join('')}
        </ul>
      `,
    });
  }
}
