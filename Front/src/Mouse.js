class Mouse {
  element = null;

  under = false;
  prevUnder = false;

  x = null;
  y = null;

  prevX = null;
  prevY = null;

  left = false;
  prevLeft = false;

  delta = 0;
  prevDelta = 0;

  constructor(element) {
    this.element = element;

    const update = (e) => {
      this.x = e.clientX;
      this.y = e.clientY;
      this.delta = 0;
      this.under = true;
    };

    element.addEventListener("mousemove", (e) => {
      this.tick();
      update(e);
    });
    element.addEventListener("mousecenter", (e) => {
      this.tick();
      update(e);
    });
    element.addEventListener("mouseleave", (e) => {
      this.tick();
      update(e);
      this.under = false;
    });
    element.addEventListener("mousedown", (e) => {
      this.tick();
      update(e);

      if (e.button === 0) {
        this.left = true;
      }
    });
    element.addEventListener("mouseup", (e) => {
      this.tick();
      update(e);

      if (e.button === 0) {
        this.left = false;
      }
    });
    element.addEventListener("wheel", (e) => {
      this.tick();

      this.x = e.clientX;
      this.y = e.clientY;
      this.under = true;
      this.delta = e.deltaY > 0 ? 1 : -1;
    });
  }

  tick() {
    this.prevX = this.x;
    this.prevY = this.y;
    this.prevUnder = this.under;
    this.prevLeft = this.left;
    this.prevDelta = this.delta;
    this.delta = 0;
  }
}
