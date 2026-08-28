import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { App } from "../../src/app/App";
import { missions } from "../../src/content/missions";

type User = ReturnType<typeof userEvent.setup>;

const restored: Array<() => void> = [];

function blockNetworkAndStorage() {
  const calls: string[] = [];

  const originalFetch = window.fetch;
  window.fetch = ((input: RequestInfo | URL) => {
    calls.push(`fetch:${String(input)}`);
    return Promise.reject(new Error("runtime boundary"));
  }) as typeof window.fetch;
  restored.push(() => {
    window.fetch = originalFetch;
  });

  const originalXhr = window.XMLHttpRequest;
  class BlockedXHR {
    open(_method: string, url: string) {
      calls.push(`xhr:${url}`);
    }
    send() {}
  }
  window.XMLHttpRequest = BlockedXHR as unknown as typeof window.XMLHttpRequest;
  restored.push(() => {
    window.XMLHttpRequest = originalXhr;
  });

  const originalWebSocket = window.WebSocket;
  class BlockedWebSocket {
    static OPEN = 1;
    constructor(url: string) {
      calls.push(`websocket:${url}`);
    }
  }
  window.WebSocket = BlockedWebSocket as unknown as typeof window.WebSocket;
  restored.push(() => {
    window.WebSocket = originalWebSocket;
  });

  const originalEventSource = window.EventSource;
  class BlockedEventSource {
    constructor(url: string) {
      calls.push(`eventsource:${url}`);
    }
  }
  window.EventSource = BlockedEventSource as unknown as typeof window.EventSource;
  restored.push(() => {
    window.EventSource = originalEventSource;
  });

  const navigatorRecord = navigator as unknown as Record<string, unknown>;
  const originalBeacon = navigatorRecord.sendBeacon;
  navigatorRecord.sendBeacon = (url: string) => {
    calls.push(`sendBeacon:${url}`);
    return true;
  };
  restored.push(() => {
    navigatorRecord.sendBeacon = originalBeacon;
  });

  const setItemSpy = vi
    .spyOn(Storage.prototype, "setItem")
    .mockImplementation(() => {
      calls.push("localStorage/sessionStorage:setItem");
    });
  restored.push(() => setItemSpy.mockRestore());

  const cookieDescriptor = Object.getOwnPropertyDescriptor(document, "cookie");
  const cookieWrites: string[] = [];
  Object.defineProperty(document, "cookie", {
    configurable: true,
    get() {
      return "";
    },
    set(value: string) {
      cookieWrites.push(value);
      calls.push(`cookie:${value}`);
    },
  });
  restored.push(() => {
    if (cookieDescriptor) Object.defineProperty(document, "cookie", cookieDescriptor);
  });

  const windowRecord = window as unknown as Record<string, unknown>;
  if (typeof windowRecord.indexedDB !== "undefined" && windowRecord.indexedDB !== null) {
    const openSpy = vi
      .spyOn(windowRecord.indexedDB as IDBFactory, "open")
      .mockImplementation(() => {
        calls.push("indexedDB:open");
        throw new Error("runtime boundary");
      });
    restored.push(() => openSpy.mockRestore());
  }

  return calls;
}

async function completeAllMissions(user: User) {
  for (let missionIndex = 0; missionIndex < missions.length; missionIndex += 1) {
    const mission = missions[missionIndex];
    for (const step of mission.flow.steps) {
      if (step === "OBSERVE") {
        await user.click(
          screen.getByRole("button", { name: new RegExp(`선수 ${mission.flow.observe.ballHolderPlayerId}`) }),
        );
      } else if (step === "PREDICT") {
        await user.click(screen.getAllByRole("radio", { name: /→/ })[0]);
        await user.click(screen.getByRole("button", { name: "생각 확인하기" }));
      } else if (step === "MOVE") {
        await user.click(screen.getAllByRole("radio", { name: /→/ })[0]);
        await user.click(screen.getByRole("button", { name: "이동해 보기" }));
      } else if (step === "PASS") {
        await passWithAnyOpenLane(user);
      } else if (step === "REVEAL") {
        await user.click(screen.getByRole("radio", { name: "계획을 유지할래요" }));
        await user.click(screen.getByRole("button", { name: "계획 정하기" }));
      } else if (step === "SUPPORT") {
        await user.click(screen.getAllByRole("radio", { name: /→/ })[0]);
        await user.click(screen.getByRole("button", { name: "다음 지원 시험" }));
      }
      await user.click(screen.getByRole("button", { name: "다음 단계로" }));
    }
  }
}

async function passWithAnyOpenLane(user: User) {
  const radios = screen.getAllByRole("radio", { name: /→/ });
  for (const radio of radios) {
    await user.click(radio);
    await user.click(screen.getByRole("button", { name: "패스 길 확인" }));
    const rejected = screen
      .getAllByRole("status")
      .some((element) => element.textContent?.includes("다시 볼까요"));
    if (!rejected) return;
  }
  throw new Error("열린 패스 길을 찾지 못했다");
}

afterEach(() => {
  while (restored.length > 0) {
    restored.pop()?.();
  }
});

it("입구 렌더링에서 외부 요청과 저장소 쓰기가 0건이다", () => {
  const calls = blockNetworkAndStorage();
  render(<App />);
  expect(calls).toEqual([]);
});

it("여섯 미션 전체 학습 흐름에서 네트워크·저장소·센서 요청이 0건이다", async () => {
  const calls = blockNetworkAndStorage();
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "학습 시작하기" }));
  await completeAllMissions(user);
  expect(screen.getByRole("heading", { level: 1, name: "전술 기록" })).toBeInTheDocument();
  expect(calls).toEqual([]);
});

it("인쇄 기록에는 이름 입력란과 식별자가 없다", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "학습 시작하기" }));
  await completeAllMissions(user);
  expect(screen.queryByLabelText(/이름/)).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/학급|반|번호/)).not.toBeInTheDocument();
  const body = document.body.textContent ?? "";
  expect(body).not.toMatch(/navigator\.userAgent|user-agent/i);
});
