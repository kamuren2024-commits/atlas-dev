import gsap from 'gsap';

export class GridMotionController {
  private static instance: GridMotionController;
  private prefersReducedMotion: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.prefersReducedMotion = mediaQuery.matches;
      mediaQuery.addEventListener('change', (e) => {
        this.prefersReducedMotion = e.matches;
      });
    }
  }

  public static getInstance(): GridMotionController {
    if (!GridMotionController.instance) {
      GridMotionController.instance = new GridMotionController();
    }
    return GridMotionController.instance;
  }

  public isReducedMotion(): boolean {
    return this.prefersReducedMotion;
  }

  // Smooth camera pan & zoom orchestration for 2D/3D map
  public animateMapCamera(
    target: { x: number; y: number; zoom: number },
    current: { x: number; y: number; zoom: number },
    onUpdate: (val: { x: number; y: number; zoom: number }) => void,
    onComplete?: () => void
  ) {
    if (this.prefersReducedMotion) {
      onUpdate(target);
      onComplete?.();
      return;
    }

    gsap.to(current, {
      x: target.x,
      y: target.y,
      zoom: target.zoom,
      duration: 1.2,
      ease: 'power3.inOut',
      onUpdate: () => onUpdate({ ...current }),
      onComplete
    });
  }

  // Number counter animation for telemetry
  public animateValue(
    fromVal: number,
    toVal: number,
    onUpdate: (val: number) => void,
    durationSec: number = 0.8
  ) {
    if (this.prefersReducedMotion) {
      onUpdate(toVal);
      return;
    }

    const state = { value: fromVal };
    gsap.to(state, {
      value: toVal,
      duration: durationSec,
      ease: 'power2.out',
      onUpdate: () => onUpdate(state.value)
    });
  }

  // Flash highlight on active asset node
  public pulseNode(element: SVGElement | HTMLElement | null) {
    if (!element || this.prefersReducedMotion) return;
    gsap.fromTo(
      element,
      { scale: 1, filter: 'drop-shadow(0 0 0px rgba(56,189,248,0))' },
      {
        scale: 1.25,
        filter: 'drop-shadow(0 0 16px rgba(56,189,248,0.9))',
        duration: 0.35,
        yoyo: true,
        repeat: 3,
        ease: 'power2.inOut'
      }
    );
  }
}

export const motionController = GridMotionController.getInstance();
