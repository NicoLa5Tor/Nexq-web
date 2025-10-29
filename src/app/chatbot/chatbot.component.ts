import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, signal, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DeviceTokenService } from '../services/device-token.service';
interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ChatbotComponent {
  constructor() {
    void this.initializeDeviceToken();
  }

  private initializeDeviceToken(): Promise<string> | void {
    if (typeof window === 'undefined') {
      return;
    }
    const existing = window.localStorage.getItem('device_token_nexq');
    if (!existing) {
      return;
    }
    this.hasConsented.set(true);
    return this.deviceTokenService.ensureToken();
  }

  private syncConsentFromStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }
    const existing = window.localStorage.getItem('device_token_nexq');
    this.hasConsented.set(!!existing);
  }

  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('promptInput') private promptInput?: ElementRef<HTMLInputElement>;
  readonly isOpen = signal(false);
  readonly prompt = signal('');
  readonly messages = signal<ChatMessage[]>([]);
  readonly hasConsented = signal(false);
  readonly suggestions = [
    'Quiero una demo de sus soluciones',
    'Necesito precios aproximados',
    '¿Cómo empieza un proyecto con NEXQ?'
  ];
  readonly showSuggestions = signal(false);
  readonly panelState = signal<'entering' | 'leaving' | 'hidden'>('hidden');
  private readonly deviceTokenService = inject(DeviceTokenService);

  get promptModel(): string {
    return this.prompt();
  }

  set promptModel(value: string) {
    this.prompt.set(value);
  }

  readonly trackMessage = (index: number, message: ChatMessage) => `${message.sender}-${message.time}-${index}`;
  readonly trackSuggestion = (index: number, value: string) => `${index}-${value}`;

  toggle(): void {
    this.syncConsentFromStorage();

    if (this.panelState() === 'leaving') {
      return;
    }

    if (this.isOpen()) {
      this.panelState.set('leaving');
      this.showSuggestions.set(false);
      setTimeout(() => {
        this.isOpen.set(false);
        this.panelState.set('hidden');
        this.prompt.set('');
      }, 400);
      return;
    }

    this.isOpen.set(true);
    this.panelState.set('entering');
    this.showSuggestions.set(false);
    setTimeout(() => this.panelState.set('hidden'), 520);

    if (this.hasConsented()) {
      queueMicrotask(() => this.focusPrompt());
      queueMicrotask(() => this.scrollMessagesToBottom());
    }
  }

  giveConsent(): void {
    if (this.hasConsented()) {
      return;
    }
    this.hasConsented.set(true);
    this.panelState.set('entering');
    void this.deviceTokenService.ensureToken();
    setTimeout(() => this.panelState.set('hidden'), 520);
    queueMicrotask(() => this.focusPrompt());
    queueMicrotask(() => this.scrollMessagesToBottom());
  }

  private focusPrompt(): void {
    const input = this.promptInput?.nativeElement;
    if (!input) return;
    setTimeout(() => input.focus(), 60);
  }

  useSuggestion(text: string): void {
    if (!this.hasConsented()) {
      this.hasConsented.set(true);
    }
    if (!this.isOpen()) {
      this.isOpen.set(true);
      this.panelState.set('entering');
      setTimeout(() => this.panelState.set('hidden'), 520);
    }
    this.showSuggestions.set(false);
    this.sendUserMessage({ text });
    queueMicrotask(() => this.focusPrompt());
  }

  toggleSuggestions(): void {
    const next = !this.showSuggestions();
    this.showSuggestions.set(next);
  }

  sendMessage(): void {
    if (!this.hasConsented()) {
      return;
    }

    const trimmed = this.prompt().trim();
    if (!trimmed) {
      return;
    }

    this.sendUserMessage({ text: trimmed });
    this.prompt.set('');
    this.showSuggestions.set(false);
  }

  sendUserMessage(payload: { text: string }): void {
    const trimmed = payload.text.trim();
    if (!trimmed) {
      return;
    }
    this.appendMessage('user', trimmed);
  }

  handleIncomingMessage(payload: { text: string; sender?: 'user' | 'bot' | 'system' }): void {
    const role: ChatMessage['sender'] = payload.sender === 'user' ? 'user' : 'bot';
    this.appendMessage(role, payload.text);
  }


  private appendMessage(sender: ChatMessage['sender'], text: string): void {
    const next: ChatMessage = {
      sender,
      text,
      time: this.formatTime(new Date())
    };
    this.messages.update((items) => [...items, next]);
    queueMicrotask(() => this.scrollMessagesToBottom());
  }

  private scrollMessagesToBottom(): void {
    const container = this.messagesContainer?.nativeElement;
    if (!container) return;
    requestAnimationFrame(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    });
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
