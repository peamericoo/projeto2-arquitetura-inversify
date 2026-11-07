import { injectable } from 'inversify';
import { IMailProvider, Mail } from './IMailProvider';

@injectable()
export class ConsoleMailProvider implements IMailProvider {
  async sendMail(mail: Mail): Promise<string | null> {
    console.log(
      ['', 'E-mail (modo test)', `Para: ${mail.to}`, `Assunto: ${mail.subject}`, '', mail.text, ''].join('\n'),
    );
    return null;
  }
}
