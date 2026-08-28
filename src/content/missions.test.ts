import { describe, expect, it } from "vitest";
import { missions } from "./missions";
import { MISSION_IDS } from "./missionIds";

describe("검수된 패스 전술 미션 데이터", () => {
  it("정확히 6개 미션을 계획된 순서로 제공한다", () => {
    expect(missions.map((mission) => mission.id)).toEqual(MISSION_IDS);
  });

  it("미션 ID는 유일하다", () => {
    const ids = missions.map((mission) => mission.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("모든 미션은 검수 메타데이터(sourceNote, reviewStatus, misconceptionGuard)를 가진다", () => {
    for (const mission of missions) {
      expect(mission.sourceNote.trim().length, `${mission.id} sourceNote`).toBeGreaterThan(0);
      expect(["pending", "approved"], `${mission.id} reviewStatus`).toContain(mission.reviewStatus);
      expect(mission.misconceptionGuard.trim().length, `${mission.id} misconceptionGuard`).toBeGreaterThan(0);
    }
  });

  it("사람 검수 전까지 모든 미션은 pending 상태로 남는다", () => {
    for (const mission of missions) {
      expect(mission.reviewStatus, `${mission.id}는 아직 교과 검수 전이다`).toBe("pending");
    }
  });

  it("모든 미션은 최소 2개의 승인된 해법 선택지를 제공한다", () => {
    for (const mission of missions) {
      const acceptedOptionCount =
        mission.openLaneIds.length +
        mission.approvedSupportCellIds.length +
        mission.acceptedSequenceIds.length;
      expect(
        acceptedOptionCount,
        `${mission.id}는 복수 해법 또는 복수 선택지를 검수 데이터로 보장해야 한다`,
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it("flow 단계는 정의된 SessionStep만 사용하고 INTRO·REPORT를 포함하지 않는다", () => {
    const allowed = new Set(["OBSERVE", "PREDICT", "MOVE", "PASS", "REVEAL", "SUPPORT"]);
    for (const mission of missions) {
      expect(mission.flow.steps.length, `${mission.id} 단계 수`).toBeGreaterThan(0);
      for (const step of mission.flow.steps) {
        expect(allowed.has(step), `${mission.id}의 잘못된 단계 ${step}`).toBe(true);
      }
    }
  });

  it("각 flow는 OBSERVE 단계로 시작한다", () => {
    for (const mission of missions) {
      expect(mission.flow.steps[0]).toBe("OBSERVE");
    }
  });

  it("모든 미션의 flow 단계가 필요한 페이즈 데이터를 가진다", () => {
    for (const mission of missions) {
      for (const step of mission.flow.steps) {
        if (step === "OBSERVE") expect(mission.flow.observe, mission.id).toBeDefined();
        if (step === "PREDICT") expect(mission.flow.predict, mission.id).toBeDefined();
        if (step === "MOVE") expect(mission.flow.move, mission.id).toBeDefined();
        if (step === "PASS") expect(mission.flow.pass, mission.id).toBeDefined();
        if (step === "REVEAL") expect(mission.flow.reveal, mission.id).toBeDefined();
        if (step === "SUPPORT") expect(mission.flow.support, mission.id).toBeDefined();
      }
    }
  });
});
