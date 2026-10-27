import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';

type SocketTicket = {
  userId: number;
  expiresAt: number;
  jwtExpiresAt: number;
};

@Injectable()
export class SocketTicketService {
  private readonly tickets = new Map<string, SocketTicket>();

  create(userId: number, jwtExpiresAt: number): string {
    if (jwtExpiresAt <= Date.now()) {
      throw new UnauthorizedException('Token expirado.');
    }

    const ticket = randomBytes(32).toString('base64url');

    this.tickets.set(ticket, {
      userId,
      expiresAt: Math.min(Date.now() + 30_000, jwtExpiresAt),
      jwtExpiresAt,
    });

    return ticket;
  }

  consume(ticket: string): { userId: number; jwtExpiresAt: number } | null {
    const stored = this.tickets.get(ticket);

    this.tickets.delete(ticket);

    if (
      !stored ||
      stored.expiresAt <= Date.now() ||
      stored.jwtExpiresAt <= Date.now()
    ) {
      return null;
    }

    return {
      userId: stored.userId,
      jwtExpiresAt: stored.jwtExpiresAt,
    };
  }
}
