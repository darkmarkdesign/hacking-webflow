import Lenis from "@studio-freight/lenis";
import { injectCSS } from "../util/injectCSS";
import { handleEditor } from "../util/webflow";
import { evalConfig } from "../util/eval";
/*
  TODO

  - add lenis listenable events from wf DOM
  - add configurable external interface
*/

/* ---  Additional CSS */
const customcss = injectCSS(`
    .lenis.lenis-smooth {
      scroll-behavior: auto;  
    }
    html.lenis {
      height: auto;
    }
`);

/*  --- Additional CSS */
class Scroll extends Lenis {
  constructor(params) {
    super({
      params,
    });

    this.params = params;
    this.isActive = true;
    this.init();
  }

  init() {
    this.config();
    this.render();

    // console.log(this.params.useRaf);
    if (this.params.useRaf) {
      this.y = window.scrollY;
      this.max = window.innerHeight;
      this.speed = 0;
      this.percent = this.y / (document.body.scrollHeight - window.innerHeight);
      this.direction = 0;
      this.on("scroll", (e) => this.outScroll(e));
    }

    handleEditor(this.destroy);
  }

  config() {
    if (this.params.useAnchor)
      [...document.querySelectorAll("[data-scrolllink]")].forEach((item) => {
        const target = document.querySelector(item.dataset.scrolllink);
        if (target)
          item.addEventListener("click", () => {
            this.scrollTo(target);
          });
      });
    if (this.params.useOverscroll)
      [...document.querySelectorAll('[data-scroll="overscroll"]')].forEach(
        (item) => item.setAttribute("onwheel", "event.stopPropagation()")
      );

    if (this.params.useControls) {
      [...document.querySelectorAll('[data-scroll="stop"]')].forEach((item) => {
        item.onclick = () => {
          this.stop();
          this.isActive = false;
        };
      });

      [...document.querySelectorAll('[data-scroll="start"]')].forEach(
        (item) => {
          item.onclick = () => {
            this.start();
            this.isActive = true;
          };
        }
      );

      [...document.querySelectorAll('[data-scroll="toggle"]')].forEach(
        (item) => {
          item.onclick = () => {
            if (this.isActive) {
              this.stop();
              this.isActive = false;
            } else {
              this.start();
              this.isActive = true;
            }
          };
        }
      );
    }
  }

  render(time) {
    this.raf(time);
    window.requestAnimationFrame(this.render.bind(this));
    if (this.params.useRaf) this.renderWebflow(time);
  }

  outScroll({ scroll, limit, velocity, progress, direction }) {
    // console.log(scroll, limit, velocity, progress, direction);
    this.y = scroll || 0;
    this.max = limit || window.innerHeight;
    this.speed = velocity || 0;
    this.percent = progress || 0;
    this.direction = 0;
  }

  renderWebflow(t) {
    // empty function to access the raf from webflow
  }
}

/*  --- Init */
const params = evalConfig("[data-id-scroll]", {
  // defaults
  wrapper: window,
  duration: 1.5,
  easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)), // https://easings.net
  orientation: "vertical",
  smoothWheel: true,
  smoothTouch: false,
  touchMultiplier: 1.5,
  // internal
  useOverscroll: true,
  useControls: true,
  useAnchor: true,
  useRaf: true,
});

window.SmoothScroll = new Scroll(params);
