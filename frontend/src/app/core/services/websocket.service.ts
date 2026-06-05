import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, filter, take } from 'rxjs';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private authService = inject(AuthService);
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private connected$ = new BehaviorSubject<boolean>(false);
  private readonly WS_URL = environment.wsUrl;

  connect(): void {
    if (this.client && this.client.connected) {
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(this.WS_URL),
      connectHeaders: {
        Authorization: 'Bearer ' + this.authService.getToken()
      },
      reconnectDelay: 5000,
      onConnect: () => {
        this.connected$.next(true);
      },
      onDisconnect: () => {
        this.connected$.next(false);
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame);
      }
    });

    this.client.activate();
  }

  disconnect(): void {
    if (this.client) {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
      this.client = null;
    }
    this.connected$.next(false);
  }

  suscribir<T>(topico: string, callback: (mensaje: T) => void): void {
    if (this.subscriptions.has(topico)) {
      return;
    }

    this.connected$.pipe(
      filter(connected => connected),
      take(1)
    ).subscribe(() => {
      if (this.client) {
        const sub = this.client.subscribe(topico, (msg) => {
          callback(JSON.parse(msg.body));
        });
        this.subscriptions.set(topico, sub);
      }
    });
  }

  desuscribir(topico: string): void {
    const sub = this.subscriptions.get(topico);
    if (sub) {
      sub.unsubscribe();
      this.subscriptions.delete(topico);
    }
  }

  isConnected(): Observable<boolean> {
    return this.connected$.asObservable();
  }
}
