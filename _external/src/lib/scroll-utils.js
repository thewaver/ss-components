const SCROLL_TICK_INTERVAL = 1000 / 120;
const SCROLL_INCREMENT = 20;

export function scrollToElement(
  elementId,
  scrollContainer = window,
  smooth = false,
  interval = SCROLL_TICK_INTERVAL,
  increment = SCROLL_INCREMENT
) {
  const { offsetTop } = document.getElementById(elementId);
  _scrollTo(
    offsetTop - scrollContainer.offsetTop,
    scrollContainer,
    smooth,
    interval,
    increment
  );
}

export function scrollToPos(
  targetScrollTop,
  scrollContainer = window,
  smooth = false,
  interval = SCROLL_TICK_INTERVAL,
  increment = SCROLL_INCREMENT
) {
  _scrollTo(targetScrollTop, scrollContainer, smooth, interval, increment);
}

// PRIVATE

let scrollTimer = null;

function _killScrollTimer() {
  clearInterval(scrollTimer);
  scrollTimer = null;
}

function _navigateTick(targetScrollTop, scrollContainer, increment) {
  const scrollTop =
    scrollContainer.pageYOffset || document.documentElement.scrollTop;

  if (Math.abs(scrollTop - targetScrollTop) <= increment) {
    scrollContainer.scrollTo(0, targetScrollTop);
    _killScrollTimer();
  } else if (scrollTop < targetScrollTop) {
    scrollContainer.scrollBy(0, increment);
  } else {
    scrollContainer.scrollBy(0, -increment);
  }
}

function _scrollTo(
  targetScrollTop,
  scrollContainer,
  smooth,
  interval,
  increment
) {
  if (smooth) {
    if (!scrollTimer) {
      scrollTimer = setInterval(
        () =>
          _navigateTick(
            targetScrollTop,
            scrollContainer,
            increment || SCROLL_INCREMENT
          ),
        interval || SCROLL_TICK_INTERVAL
      );
    }
  } else {
    if (scrollTimer) {
      _killScrollTimer();
    }

    scrollContainer.scrollTo(0, targetScrollTop);
  }
}
