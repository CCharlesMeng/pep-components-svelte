declare const window: Window & {
  onEvent: Function;
};

interface CustomEvent {
  eventCategory: string;
  eventAction: string;
  eventLabel: string;
  eventValue: string;
  jsonParam: string;
}

export const onCustomEvent = (event: CustomEvent) => {
  const { eventCategory, eventAction, eventLabel, eventValue, jsonParam } =
    event;
  if (typeof window.onEvent !== "function") {
    const waitForUBA = setInterval(() => {
      if (typeof window.onEvent === "function") {
        window.onEvent(
          eventCategory,
          eventAction,
          eventLabel,
          eventValue,
          jsonParam,
        );

        clearInterval(waitForUBA);
      }
    }, 1000);
    // 5s后清除定时器
    setTimeout(() => {
      clearInterval(waitForUBA);
    }, 5000);
  } else {
    window.onEvent(
      eventCategory,
      eventAction,
      eventLabel,
      eventValue,
      jsonParam,
    );
  }
};
