import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  gameModeCatalog,
  getStageDefinition,
  getWaveDefinitions,
  stageCatalog,
  towerCatalog,
  type GameBridge,
  type GameRunFinishedPayload,
  type GameSelection,
  type GameStateSnapshot,
  type TowerKind
} from "@tower-defense/game";
import { GameViewport } from "../../components/game/GameViewport";
import { StatCard } from "../../components/ui/StatCard";
import { submitGameResult } from "../../lib/api/client";
import { queryKeys } from "../../lib/query/keys";
import { formatNumber } from "../../lib/utils/format";
import { useUiStore } from "../../stores/useUiStore";

const specialEffectLabels = {
  overdrive: "오버드라이브",
  "blast-nova": "폭발 확산",
  "freeze-nova": "빙결 확산"
} as const;

const getReadyFeedback = (stageName: string) =>
  `${stageName} 준비 완료. 슬롯을 선택한 뒤 화면 안 버튼으로 포대를 배치하세요.`;

export const GamePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { nickname, rememberResult, volume, selectedStageId, setSelectedStageId } = useUiStore();
  const [bridge, setBridge] = useState<GameBridge | null>(null);
  const [snapshot, setSnapshot] = useState<GameStateSnapshot | null>(null);
  const [selection, setSelection] = useState<GameSelection | null>(null);
  const [feedback, setFeedback] = useState(
    getReadyFeedback(getStageDefinition(selectedStageId).name)
  );
  const debugAutostartRef = useRef(false);
  const previousStageIdRef = useRef(selectedStageId);
  const fullscreenTargetRef = useRef<HTMLDivElement | null>(null);
  const fullscreenToggleLockRef = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const selectedMode = gameModeCatalog[0]!;
  const selectedStage = stageCatalog.find((entry) => entry.id === selectedStageId) ?? stageCatalog[0]!;
  const stageDefinition = getStageDefinition(selectedStageId);

  const {
    data: submittedResult,
    mutate: submitResult,
    reset: resetSubmittedResult
  } = useMutation({
    mutationFn: submitGameResult,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rankings.all });
      setFeedback(
        response.accepted
          ? "전투 결과가 랭킹에 반영되었습니다."
          : "기록 수치를 검증 중입니다. 랭킹 반영은 잠시 보류됩니다."
      );
    }
  });

  useEffect(() => {
    if (!bridge) {
      return;
    }

    bridge.setSoundVolume(volume);
  }, [bridge, volume]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === fullscreenTargetRef.current);
      window.setTimeout(() => {
        fullscreenToggleLockRef.current = false;
      }, 120);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (previousStageIdRef.current === selectedStageId) {
      return;
    }

    previousStageIdRef.current = selectedStageId;
    setSnapshot(null);
    setSelection(null);
    setFeedback(getReadyFeedback(selectedStage.name));
    resetSubmittedResult();
  }, [resetSubmittedResult, selectedStage.name, selectedStageId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!bridge) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === " ") {
        event.preventDefault();
        if (snapshot?.paused) {
          bridge.resumeGame();
          setFeedback("전투를 재개했습니다.");
        } else {
          bridge.pauseGame();
          setFeedback("전투를 일시 정지했습니다.");
        }
        return;
      }

      if (key === "1" || key === "2") {
        bridge.setGameSpeed(Number(key) as 1 | 2);
        setFeedback(`${key}배속으로 전환했습니다.`);
        return;
      }

      if (!selection) {
        return;
      }

      if (!selection.tower) {
        const hotkeyMatch = towerCatalog.find((tower) => tower.hotkey.toLowerCase() === key);
        if (hotkeyMatch) {
          bridge.buildTower(selection.slotId, hotkeyMatch.key);
        }
        return;
      }

      if (key === "u") {
        bridge.upgradeTower(selection.slotId);
      }

      if (key === "s") {
        bridge.sellTower(selection.slotId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [bridge, selection, snapshot?.paused]);

  const handleRunFinished = useCallback(
    (payload: GameRunFinishedPayload) => {
      rememberResult(payload.result);
      submitResult({
        nickname,
        result: payload.result
      });
    },
    [nickname, rememberResult, submitResult]
  );

  const handleStageSelect = useCallback(
    (stageId: (typeof stageCatalog)[number]["id"]) => {
      if (stageId === selectedStageId) {
        return;
      }

      setBridge(null);
      debugAutostartRef.current = false;
      setSelectedStageId(stageId);
    },
    [selectedStageId, setSelectedStageId]
  );

  const handleToggleFullscreen = useCallback(async (event?: MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    event?.stopPropagation();

    const target = fullscreenTargetRef.current;
    if (!target) {
      return;
    }

    if (fullscreenToggleLockRef.current) {
      return;
    }

    fullscreenToggleLockRef.current = true;

    try {
      if (document.fullscreenElement === target) {
        await document.exitFullscreen();
        return;
      }

      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }

      await target.requestFullscreen();
    } catch {
      fullscreenToggleLockRef.current = false;
      setFeedback("전체 화면 전환에 실패했습니다. 브라우저 권한을 확인하세요.");
    }
  }, []);

  useEffect(() => {
    if (!bridge || debugAutostartRef.current) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const autoStart = params.get("autostart") === "1";
    if (!autoStart) {
      return;
    }

    const stageParam = params.get("stage") as (typeof stageCatalog)[number]["id"] | null;
    if (stageParam && stageParam !== selectedStageId) {
      handleStageSelect(stageParam);
      return;
    }

    debugAutostartRef.current = true;
    const slotId = params.get("slot");
    const towerType = params.get("tower");
    const isSupportedTower =
      towerType === "arrow" || towerType === "cannon" || towerType === "frost";
    let startAttempts = 0;
    let buildTimeoutId: number | undefined;

    const clearTimers = () => {
      window.clearInterval(startIntervalId);
      if (buildTimeoutId) {
        window.clearTimeout(buildTimeoutId);
      }
    };

    const offRunStarted = bridge.on("onRunStarted", () => {
      window.clearInterval(startIntervalId);

      if (!slotId || !isSupportedTower) {
        return;
      }

      buildTimeoutId = window.setTimeout(() => {
        bridge.buildTower(slotId, towerType as TowerKind);
      }, 900);
    });

    const requestStart = () => {
      startAttempts += 1;
      bridge.startGame();

      if (startAttempts >= 8) {
        window.clearInterval(startIntervalId);
      }
    };

    const startIntervalId = window.setInterval(requestStart, 650);
    requestStart();

    return () => {
      clearTimers();
      offRunStarted();
    };
  }, [bridge, handleStageSelect, selectedStageId]);

  const displayedGold = snapshot?.gold ?? stageDefinition.initialGold;
  const displayedLives = snapshot?.lives ?? stageDefinition.initialLives;
  const currentGold = snapshot?.gold ?? stageDefinition.initialGold;
  const currentWave = snapshot?.currentWave ?? 0;
  const totalWaves = snapshot?.totalWaves ?? getWaveDefinitions(selectedStageId).length;
  const currentSpeed = snapshot?.speed ?? 1;
  const selectedTower = selection?.tower;
  const isBridgeReady = bridge !== null;
  const operationStatus = snapshot?.paused ? "일시 정지" : snapshot?.running ? "교전 중" : "출격 준비";
  const nextWaveSummary = snapshot?.nextWaveSummary ?? "다음 웨이브 대기 중";

  const getBuildDisabledReason = (buildCost: number) => {
    if (!selection) {
      return "포대 슬롯을 먼저 선택하세요.";
    }

    if (selection.tower) {
      return "이미 포대가 배치된 슬롯입니다.";
    }

    if (currentGold < buildCost) {
      return "골드가 부족합니다.";
    }

    return null;
  };

  const upgradeDisabledReason = !selectedTower
    ? "업그레이드할 포대를 먼저 선택하세요."
    : selectedTower.isMaxLevel
      ? "이미 최대 레벨입니다."
      : currentGold < (selectedTower.upgradeCost ?? 0)
        ? "골드가 부족합니다."
        : null;

  const selectedTowerSummary = selectedTower
    ? `${selectedTower.displayName} / Lv.${selectedTower.level}`
    : selection
      ? `${selection.slotId} 빈 슬롯`
      : "선택 없음";

  const selectedTowerDetail = selectedTower
    ? `업그레이드 ${selectedTower.upgradeCost ? `${formatNumber(selectedTower.upgradeCost)} 골드` : "불가"} / 판매 ${formatNumber(selectedTower.sellValue)} 골드`
    : "포대를 고르면 배치와 업그레이드를 바로 진행할 수 있습니다.";

  return (
    <section className="game-screen game-screen--wide">
      <div className="page-header game-screen__header">
        <div>
          <p className="panel-tag">Tower Defense</p>
          <h1>타워 디펜스 출격</h1>
          <p className="page-header__copy">
            포대 배치 버튼을 전장 안으로 넣었습니다. 슬롯을 먼저 선택한 뒤 화면 안 하단 바에서
            바로 배치하고, 선택한 포대는 같은 오버레이에서 업그레이드하거나 판매할 수 있습니다.
          </p>
        </div>

        <div className="game-screen__header-meta">
          <div className="profile-chip">
            <small>현재 전장</small>
            <strong>{selectedStage.name}</strong>
          </div>
          <div className="profile-chip">
            <small>작전 상태</small>
            <strong>{operationStatus}</strong>
          </div>
        </div>
      </div>

      <div className="game-stage-tabs">
        {stageCatalog.map((stage) => (
          <button
            className={stage.id === selectedStageId ? "game-stage-tab game-stage-tab--active" : "game-stage-tab"}
            key={stage.id}
            onClick={() => handleStageSelect(stage.id)}
            type="button"
          >
            <strong>{stage.name}</strong>
            <small>
              {stage.threatLevel} / {stage.recommendedTowerLabel}
            </small>
          </button>
        ))}
      </div>

      <div className="game-screen__body game-screen__body--single">
        <div className="game-screen__board">
          <div className="game-hud-strip">
            <StatCard accent="teal" label="골드" value={formatNumber(displayedGold)}>
              배치와 업그레이드에 사용
            </StatCard>
            <StatCard accent="amber" label="생명" value={formatNumber(displayedLives)}>
              적이 도달할 때마다 1 감소
            </StatCard>
            <StatCard accent="coral" label="웨이브" value={`${currentWave} / ${totalWaves}`}>
              현재 속도 x{currentSpeed}
            </StatCard>
            <StatCard accent="teal" label="점수" value={formatNumber(snapshot?.score ?? 0)}>
              보상과 웨이브 클리어 점수
            </StatCard>
          </div>

          <div className="game-viewport-shell">
            <GameViewport
              gameMode={selectedMode.id}
              key={selectedStageId}
              onBridgeReady={setBridge}
              onError={setFeedback}
              onRunFinished={handleRunFinished}
              onSelectionChange={setSelection}
              onStateChange={setSnapshot}
              stageId={selectedStageId}
              viewportRef={fullscreenTargetRef}
            >
              <div className="game-overlay-topbar">
                <button
                  className="game-overlay-fullscreen"
                  onClick={handleToggleFullscreen}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  type="button"
                >
                  {isFullscreen ? "전체 화면 종료" : "전체 화면"}
                </button>
              </div>
              <div className="game-overlay-controls">
                <div className="game-overlay-panel game-overlay-panel--build">
                  <div className="game-overlay-panel__header">
                    <strong>포대 배치</strong>
                    <span>{selection ? `선택 슬롯 ${selection.slotId}` : "슬롯 선택 필요"}</span>
                  </div>
                  <div className="game-overlay-build-list">
                    {towerCatalog.map((option) => {
                      const blockedReason = getBuildDisabledReason(option.buildCost);

                      return (
                        <button
                          className="game-overlay-button"
                          disabled={Boolean(blockedReason)}
                          key={option.key}
                          onClick={() => selection && bridge?.buildTower(selection.slotId, option.key)}
                          title={blockedReason ?? `${option.displayName} 배치`}
                          type="button"
                        >
                          <strong>{option.displayName}</strong>
                          <span>{formatNumber(option.buildCost)} 골드</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="game-overlay-panel game-overlay-panel--selection">
                  <div className="game-overlay-panel__header">
                    <strong>{selectedTowerSummary}</strong>
                    <span>{selection ? selectedStage.tagline : "포대 선택 대기"}</span>
                  </div>
                  <p className="game-overlay-panel__copy">{selectedTowerDetail}</p>
                  {selectedTower?.specialEffect ? (
                    <p className="game-overlay-panel__copy">
                      특수 효과: {specialEffectLabels[selectedTower.specialEffect]}
                    </p>
                  ) : null}
                  <div className="game-overlay-utility-actions">
                    <button
                      className="game-overlay-button game-overlay-button--utility"
                      disabled={Boolean(upgradeDisabledReason)}
                      onClick={() => selection && bridge?.upgradeTower(selection.slotId)}
                      title={upgradeDisabledReason ?? "포대 업그레이드"}
                      type="button"
                    >
                      업그레이드
                    </button>
                    <button
                      className="game-overlay-button game-overlay-button--utility"
                      disabled={!selectedTower}
                      onClick={() => selection && bridge?.sellTower(selection.slotId)}
                      type="button"
                    >
                      판매
                    </button>
                  </div>
                  {upgradeDisabledReason ? (
                    <p className="game-overlay-panel__hint">{upgradeDisabledReason}</p>
                  ) : null}
                </div>
              </div>
            </GameViewport>
          </div>

          <article className="stack-card game-bottom-controls">
            <div className="stack-card__row">
              <h3>전투 제어</h3>
              <span className="pill">{operationStatus}</span>
            </div>

            <div className="game-bottom-controls__buttons">
              <button
                className="button button--primary"
                disabled={!isBridgeReady}
                onClick={() => bridge?.startGame()}
                type="button"
              >
                출격 시작
              </button>
              <button
                className="button button--ghost"
                disabled={!isBridgeReady}
                onClick={() => bridge?.pauseGame()}
                type="button"
              >
                일시 정지
              </button>
              <button
                className="button button--ghost"
                disabled={!isBridgeReady}
                onClick={() => bridge?.resumeGame()}
                type="button"
              >
                재개
              </button>
              <button
                className="button button--ghost"
                disabled={!isBridgeReady}
                onClick={() => bridge?.setGameSpeed(1)}
                type="button"
              >
                1배속
              </button>
              <button
                className="button button--ghost"
                disabled={!isBridgeReady}
                onClick={() => bridge?.setGameSpeed(2)}
                type="button"
              >
                2배속
              </button>
            </div>

            <div className="status-list status-list--strong game-runtime-panel__grid">
              <span>현재 맵 {selectedStage.name}</span>
              <span>다음 웨이브 {nextWaveSummary}</span>
              <span>잔여 적 {formatNumber(snapshot?.enemiesAlive ?? 0)}기</span>
              <span>선택 슬롯: {selection ? selection.slotId : "없음"}</span>
            </div>

            <p className="game-inline-note">
              단축키: Q/W/E 배치, U 업그레이드, S 판매, Space 일시 정지
            </p>
            <p className="muted">{feedback}</p>
          </article>

          {submittedResult ? (
            <article className="stack-card">
              <div className="stack-card__row">
                <h3>결과 제출</h3>
                <span className="pill">{submittedResult.accepted ? "정상 기록" : "검증 대기"}</span>
              </div>
              <p>
                {submittedResult.accepted
                  ? "랭킹 반영까지 완료되었습니다."
                  : "수동 검증 대상으로 분류되어 확인을 기다리는 상태입니다."}
              </p>
              <div className="hero-card__actions">
                <button className="button button--primary" onClick={() => bridge?.startGame()} type="button">
                  다시 출격
                </button>
                <button className="button button--ghost" onClick={() => navigate("/ranking")} type="button">
                  랭킹 보기
                </button>
                <Link className="button button--ghost" to="/lobby">
                  로비 이동
                </Link>
              </div>
            </article>
          ) : null}
        </div>
      </div>
    </section>
  );
};
