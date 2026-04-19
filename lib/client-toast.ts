type AppToastDetail = {
  message?: string;
  toastKey?: string;
};

export function emitAppToast(detail: AppToastDetail) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent("app-toast", { detail }));
}
