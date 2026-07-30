import {
  Component, ElementRef, ViewChild, AfterViewInit,
  Output, EventEmitter, signal
} from '@angular/core';

@Component({
  selector: 'app-signature-pad',
  standalone: true,
  template: `
    <div class="flex flex-col gap-3">
      <div class="relative border-2 border-cream-tan rounded-xl bg-cream-pure overflow-hidden"
           style="height:180px">
        <canvas
          #canvas
          class="absolute inset-0 w-full h-full touch-none cursor-crosshair"
          (mousedown)="startDraw($event)"
          (mousemove)="draw($event)"
          (mouseup)="stopDraw()"
          (mouseleave)="stopDraw()"
          (touchstart)="startDraw($event)"
          (touchmove)="draw($event)"
          (touchend)="stopDraw()">
        </canvas>
        @if (!hasSignature()) {
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p class="text-brown-muted/40 text-sm">Firme aquí</p>
          </div>
        }
      </div>
      <div class="flex items-center gap-3">
        <button type="button" (click)="clear()"
          class="flex-1 py-2.5 rounded-xl border border-brown-muted/40 text-brown-muted text-sm font-medium
                 active:bg-cream-tan transition-colors">
          Limpiar
        </button>
        <div class="flex items-center gap-2">
          @if (hasSignature()) {
            <span class="inline-flex items-center gap-1.5 text-success text-sm font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Firma capturada
            </span>
          } @else {
            <span class="text-error/70 text-sm">Sin firma</span>
          }
        </div>
      </div>
    </div>
  `
})
export class SignaturePadComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() signatureChange = new EventEmitter<string>();

  private ctx!: CanvasRenderingContext2D;
  private painting = false;
  readonly hasSignature = signal(false);

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const dpr    = window.devicePixelRatio || 1;
    const rect   = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.scale(dpr, dpr);
    this.ctx.strokeStyle = '#241A0C';
    this.ctx.lineWidth   = 2.5;
    this.ctx.lineCap     = 'round';
    this.ctx.lineJoin    = 'round';
  }

  startDraw(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    this.painting = true;
    const { x, y } = this.getCoords(event);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  draw(event: MouseEvent | TouchEvent): void {
    if (!this.painting) return;
    event.preventDefault();
    const { x, y } = this.getCoords(event);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.hasSignature.set(true);
  }

  stopDraw(): void {
    if (this.painting) {
      this.painting = false;
      this.signatureChange.emit(this.canvasRef.nativeElement.toDataURL('image/png'));
    }
  }

  clear(): void {
    const c = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, c.width, c.height);
    this.hasSignature.set(false);
    this.signatureChange.emit('');
  }

  private getCoords(event: MouseEvent | TouchEvent): { x: number; y: number } {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    if (event instanceof TouchEvent) {
      const t = event.touches[0] || event.changedTouches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
}
