import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('promptInput') private promptInput?: ElementRef<HTMLInputElement>;
  readonly isOpen = signal(false);
  readonly prompt = signal('');
  readonly messages = signal<ChatMessage[]>([
    {
      sender: 'bot',
      text: '¡Hola! Soy el asistente virtual de NEXQ. ¿Qué te gustaría descubrir hoy sobre nuestros servicios de analítica e IA? 🚀',
      time: this.formatTime(new Date())
    }
  ]);
  readonly hasConsented = signal(false);
  readonly suggestions = [
    'Quiero una demo de sus soluciones',
    'Necesito precios aproximados',
    '¿Cómo empieza un proyecto con NEXQ?'
  ];
  readonly showSuggestions = signal(false);

  get promptModel(): string {
    return this.prompt();
  }

  set promptModel(value: string) {
    this.prompt.set(value);
  }

  readonly trackMessage = (index: number, message: ChatMessage) => `${message.sender}-${message.time}-${index}`;
  readonly trackSuggestion = (index: number, value: string) => `${index}-${value}`;

  toggle(): void {
    const next = !this.isOpen();
    this.isOpen.set(next);
    if (!next) {
      this.showSuggestions.set(false);
      this.hasConsented.set(false);
      this.prompt.set('');
      return;
    }

    this.showSuggestions.set(false);
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
    this.isOpen.set(true);
    this.prompt.set(text);
    this.showSuggestions.set(false);
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

    this.pushMessage('user', trimmed);
    this.prompt.set('');
    this.showSuggestions.set(false);
    this.scrollMessagesToBottom();

    const reply = this.buildAutoReply(trimmed);
    setTimeout(() => {
      this.pushMessage('bot', reply);
      this.scrollMessagesToBottom();
    }, 600);
  }

  private pushMessage(sender: ChatMessage['sender'], text: string): void {
    const next: ChatMessage = {
      sender,
      text,
      time: this.formatTime(new Date())
    };
    this.messages.update((items) => [...items, next]);
  }

  private scrollMessagesToBottom(): void {
    const container = this.messagesContainer?.nativeElement;
    if (!container) return;
    requestAnimationFrame(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    });
  }

  private buildAutoReply(userMessage: string): string {
    const lower = userMessage.toLowerCase();

    if (lower.includes('precio') || lower.includes('cost')) {
      return 'Podemos preparar una propuesta a medida según el alcance de tu proyecto. ¿Te gustaría que te contacte nuestro equipo comercial?';
    }

    if (lower.includes('demo') || lower.includes('presentación')) {
      return 'Agendemos una sesión breve para mostrarte cómo aplicamos analítica avanzada y IA en tu empresa. ¿Qué día te acomoda?';
    }

    if (lower.includes('contacto') || lower.includes('hablar')) {
      return 'Claro. Puedes dejarnos tus datos y un consultor se comunicará contigo en menos de 24 horas.';
    }

    return 'Te acompaño en lo que necesites: implementación de IA, analítica de datos, dashboards o ciencia de datos aplicada. ¿En qué frente quieres profundizar?';
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
