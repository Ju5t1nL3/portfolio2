import gsap from "gsap";

export class FallingTextAnimator {
  private container: HTMLElement;
  private chars: NodeListOf<HTMLElement>;
  private delayMs;

  constructor(container: HTMLElement, delayMs: number = 1000) {
    this.container = container;
    this.chars = this.container.querySelectorAll(".falling-char");
    this.delayMs = delayMs;

    this.init();
  }

  private init() {
    setTimeout(() => this.triggerFall(), this.delayMs);
  }

  private triggerFall() {
    this.chars.forEach((char) => {
      const rect = char.getBoundingClientRect();
      const dropHeight = window.innerHeight - rect.bottom - 20;

      gsap.to(char, {
        y: dropHeight,
        x: gsap.utils.random(-50, 50),
        rotation: gsap.utils.random(-90, 90),
        duration: gsap.utils.random(1.5, 2.5),
        ease: "bounce.out",
        delay: gsap.utils.random(0, 0.4),
        overwrite: "auto",
      });
    });
  }
}
