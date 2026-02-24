import gsap from "gsap";
import { $isSticky } from "../stores/cursorStore";

const CURSOR_CONFIG = {
  duration: {
    move: 0.1, // mouse follow delay
    enter: 0.3, // speed to stick to button
    leave: 0.3, // speed to snap back to dot
    magnetic: 0.3, // speed of magnet
  },
  ease: {
    move: "power3",
    enter: "elastic.out(1, 0.75)",
    leave: "power2.out",
    magnetic: "power2.out",
  },
  magneticStrength: 0.3, // higher = stiff
};

export class StickyCursorManager {
  private cursor: HTMLElement;
  private stickyElements: NodeListOf<HTMLElement>;

  private isHovered: boolean = false;
  private cursorSize: number = 15;

  private xSet: gsap.QuickToFunc;
  private ySet: gsap.QuickToFunc;

  private elementListeners = new Map<
    HTMLElement,
    { enter: EventListener; leave: EventListener; move?: EventListener }
  >();

  constructor(cursorElement: HTMLElement) {
    this.cursor = cursorElement;
    this.stickyElements = document.querySelectorAll("[data-sticky]");

    const style = window.getComputedStyle(this.cursor);
    this.cursorSize = parseFloat(style.width) || 15;

    this.xSet = gsap.quickTo(this.cursor, "x", {
      duration: CURSOR_CONFIG.duration.move,
      ease: CURSOR_CONFIG.ease.move,
    });
    this.ySet = gsap.quickTo(this.cursor, "y", {
      duration: CURSOR_CONFIG.duration.move,
      ease: CURSOR_CONFIG.ease.move,
    });

    this.init();
  }

  private init() {
    $isSticky.subscribe((enabled) => {
      if (enabled) {
        this.cursor.style.display = "block";
        this.enable();
      } else {
        this.cursor.style.display = "none";
        this.disable();
      }
    });
  }

  private enable() {
    window.addEventListener("mousemove", this.onMouseMove);

    this.stickyElements.forEach((el) => {
      const enter = () => this.onStickyEnter(el);
      const leave = () => this.onStickyLeave(el);

      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);

      const listeners: any = { enter, leave };

      if (el.dataset.magnetic === "true") {
        const move = (e: Event) => this.onMagneticMove(e as MouseEvent, el);
        el.addEventListener("mousemove", move);
        listeners.move = move;
      }

      this.elementListeners.set(el, listeners);
    });
  }

  private disable() {
    window.removeEventListener("mousemove", this.onMouseMove);

    this.elementListeners.forEach((listeners, element) => {
      element.removeEventListener("mouseenter", listeners.enter);
      element.removeEventListener("mouseleave", listeners.leave);
      if (listeners.move) {
        element.removeEventListener("mousemove", listeners.move);
      }
      gsap.to(element, { x: 0, y: 0, duration: 0.3 });
    });
    this.elementListeners.clear();
  }

  private onMouseMove = (e: MouseEvent) => {
    if (!this.isHovered) {
      this.xSet(e.clientX - this.cursorSize / 2);
      this.ySet(e.clientY - this.cursorSize / 2);
    }
  };

  private onStickyEnter = (target: HTMLElement) => {
    this.isHovered = true;

    const rect = target.getBoundingClientRect();
    const radius = target.dataset.radius || "0px";

    gsap.to(this.cursor, {
      width: rect.width,
      height: rect.height,
      borderRadius: radius,
      x: rect.left,
      y: rect.top,
      duration: CURSOR_CONFIG.duration.enter,
      ease: CURSOR_CONFIG.ease.enter,
    });
  };

  private onStickyLeave = (target: HTMLElement) => {
    this.isHovered = false;

    gsap.to(this.cursor, {
      width: this.cursorSize,
      height: this.cursorSize,
      borderRadius: "50%",
      duration: CURSOR_CONFIG.duration.leave,
      ease: CURSOR_CONFIG.ease.leave,
    });

    if (target.dataset.magnetic === "true") {
      gsap.to(target, {
        x: 0,
        y: 0,
        duration: CURSOR_CONFIG.duration.magnetic,
        ease: CURSOR_CONFIG.ease.magnetic,
      });
    }
  };

  private onMagneticMove = (e: MouseEvent, target: HTMLElement) => {
    const rect = target.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const moveX = (e.clientX - centerX) * CURSOR_CONFIG.magneticStrength;
    const moveY = (e.clientY - centerY) * CURSOR_CONFIG.magneticStrength;

    gsap.to(target, {
      x: moveX,
      y: moveY,
      duration: CURSOR_CONFIG.duration.magnetic,
      ease: CURSOR_CONFIG.ease.magnetic,
    });

    gsap.to(this.cursor, {
      x: rect.left + moveX,
      y: rect.top + moveY,
      duration: 0.1,
    });
  };
}
