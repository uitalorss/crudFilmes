import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as dotenv from 'dotenv';
import { SendMailForgotPasswordDto } from './dto/send-mail-dto';
import { UserTokenService } from 'src/user-token/user-token.service';
dotenv.config();

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly usersService: UsersService,
    private readonly userTokenService: UserTokenService,
  ) {}

  public async sendMail({ email }: SendMailForgotPasswordDto) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    const userToken = await this.userTokenService.generateToken(user.id);
    if (!userToken) {
      throw new BadRequestException('Token não gerado.');
    }

    await this.mailerService.sendMail({
      from: `${process.env.MAIL_FROM} <${process.env.MAIL_FROM}>`,
      to: email,
      subject: 'Redefinição de senha',
      template: 'resetPassword',
      context: {
        name: user.name,
        token: userToken.token,
      },
    });
  }
}
