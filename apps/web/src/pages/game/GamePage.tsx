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
import { StageRoutePreview } from "../../components/ui/StageRoutePreview";
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
  `${stageName} 전장 링크 완료. 슬롯을 선택한 뒤 하단 액션 바에서 포대를 배치하십시오.`;

const buildCommandCopy: Record<TowerKind, string> = {
  arrow: "기본 연사 포대",
  cannon: "범위 화력 포대",
  frost: "감속 지원 포대"
};

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
          ? "전투 결과가 랭킹 보드에 반영되었습니다."
          : "기록 검증 중입니다. 랭킹 반영은 잠시 보류됩니다."
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
      const target = fullscreenTargetRef.current;
      setIsFullscreen(document.fullscreenElement === target);
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
          setFeedback("전투 재개.");
        } else {
          bridge.pauseGame();
          setFeedback("전투 일시 정지.");
        }
        return;
      }

      if (key === "1" || key === "2") {
        bridge.setGameSpeed(Number(key) as 1 | 2);
        setFeedback(`${key}배속 전환.`);
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
      setFeedback(`${getStageDefinition(stageId).name} 전장 데이터로 전환합니다.`);
    },
    [selectedStageId, setSelectedStageId]
  );

  const handleToggleFullscreen = useCallback(async (event?: MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    event?.stopPropagation();

    const target = fullscreenTargetRef.current;
    if (!target || fullscreenToggleLockRef.current) {
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
      setFeedback("전체 화면 전환 실패. 브라우저 권한을 확인하십시오.");
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
  const isRunning = Boolean(snapshot?.running);
  const isPaused = Boolean(snapshot?.paused);
  const operationStatus = isPaused ? "정지" : isRunning ? "교전" : "대기";
  const nextWaveSummary = snapshot?.nextWaveSummary ?? "다음 웨이브 대기 중";

  const getBuildDisabledReason = (buildCost: number) => {
    if (!selection) {
      return "슬롯을 먼저 선택해야 합니다.";
    }

    if (selection.tower) {
      return "이미 포대가 설치된 슬롯입니다.";
    }

    if (currentGold < buildCost) {
      return "골드가 부족합니다.";
    }

    return null;
  };

  const upgradeDisabledReason = !selectedTower
    ? "업그레이드할 포대를 선택하십시오."
    : selectedTower.isMaxLevel
      ? "이미 최대 레벨입니다."
      : currentGold < (selectedTower.upgradeCost ?? 0)
        ? "골드가 부족합니다."
        : null;

  const selectionTitle = selectedTower
    ? `${selectedTower.displayName} · Lv.${selectedTower.level}`
    : selection
      ? `${selection.slotId} 빈 슬롯`
      : "선택 없음";

  const selectionSubtitle = selectedTower
    ? `판매 ${formatNumber(selectedTower.sellValue)}G / 다음 ${selectedTower.upgradeCost ? `${formatNumber(selectedTower.upgradeCost)}G` : "없음"}`
    : selection
      ? "여기에 새 포대를 배치할 수 있습니다."
      : "슬롯이나 포대를 선택하면 세부 정보가 표시됩니다.";

  const handleStart = () => {
    bridge?.startGame();
    setFeedback(`${selectedStage.name} 전장 출격 명령 전송.`);
  };

  const handlePause = () => {
    bridge?.pauseGame();
    setFeedback("전투 일시 정지.");
  };

  const handleResume = () => {
    bridge?.resumeGame();
    setFeedback("전투 재개.");
  };

  const handleSpeed = (speed: 1 | 2) => {
    bridge?.setGameSpeed(speed);
    setFeedback(`${speed}배속 전환.`);
  };

  const handleBuild = (towerType: TowerKind) => {
    if (!selection) {
      setFeedback("슬롯을 먼저 선택하십시오.");
      return;
    }

    bridge?.buildTower(selection.slotId, towerType);
    setFeedback(`${buildCommandCopy[towerType]} 배치 명령 전송.`);
  };

  const handleUpgrade = () => {
    if (!selection) {
      setFeedback("업그레이드 대상이 선택되지 않았습니다.");
      return;
    }

    bridge?.upgradeTower(selection.slotId);
    setFeedback("포대 업그레이드 명령 전송.");
  };

  const handleSell = () => {
    if (!selection) {
      setFeedback("판매 대상이 선택되지 않았습니다.");
      return;
    }

    bridge?.sellTower(selection.slotId);
    setFeedback("포대 회수 명령 전송.");
  };

  return (
    <section className="game-screen">
      <div className="page-header page-header--game">
        <div>
          <p className="panel-tag">TACTICAL DEFENSE</p>
          <h1>전장 관제</h1>
          <p className="page-header__copy">
            상단 HUD에서 핵심 전황을 확인하고, 하단 액션 바에서 포대를 배치하십시오. 세부 조작은
            우측 인스펙터에서 바로 이어집니다.
          </p>
        </div>
        <div className="status-list status-list--stacked">
          <span>현재 전장 {selectedStage.name}</span>
          <span>작전 상태 {operationStatus}</span>
        </div>
      </div>

      <div className="game-stage-tabs">
        {stageCatalog.map((stage) => {
          const isActive = stage.id === selectedStageId;

          return (
            <button
              className={isActive ? "game-stage-tab game-stage-tab--active" : "game-stage-tab"}
              key={stage.id}
              onClick={() => handleStageSelect(stage.id)}
              type="button"
            >
              <StageRoutePreview className="game-stage-tab__preview" stageId={stage.id} />
              <div className="game-stage-tab__body">
                <div className="game-stage-tab__header">
                  <strong>{stage.name}</strong>
                  <span className="pill">{stage.threatLevel}</span>
                </div>
                <div className="status-list">
                  <span>{stage.recommendedTowerLabel}</span>
                  <span>{stage.id === selectedStageId ? "선택됨" : "전환"}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="combat-grid">
        <div className="combat-main">
          <div className="combat-hud">
            <div className="combat-hud__overview">
              <div className="combat-hud__identity">
                <span className="panel-tag">LIVE OPERATION</span>
                <strong>{selectedStage.name}</strong>
                <div className="status-list">
                  <span>{stageDefinition.presentation.sector}</span>
                  <span>{operationStatus}</span>
                  <span>속도 x{currentSpeed}</span>
                </div>
              </div>
            </div>

            <div className="game-hud-strip">
              <StatCard accent="amber" label="골드" value={formatNumber(displayedGold)}>
                포대 설치와 업그레이드에 사용
              </StatCard>
              <StatCard accent="coral" label="생명" value={formatNumber(displayedLives)}>
                적 도달 시 1 감소
              </StatCard>
              <StatCard accent="teal" label="웨이브" value={`${currentWave} / ${totalWaves}`}>
                다음 접적 {nextWaveSummary}
              </StatCard>
              <StatCard accent="teal" label="점수" value={formatNumber(snapshot?.score ?? 0)}>
                현재 잔여 적 {formatNumber(snapshot?.enemiesAlive ?? 0)}기
              </StatCard>
            </div>
          </div>

          <div className="combat-alerts">
            <div className="system-banner">
              <span className="system-banner__label">시스템</span>
              <strong>{feedback}</strong>
            </div>
            <div className="system-banner system-banner--secondary">
              <span className="system-banner__label">단축키</span>
              <strong>Q/W/E 배치 · U 업그레이드 · S 판매 · Space 정지</strong>
            </div>
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
                <span className="game-overlay-chip">{operationStatus}</span>
                <button
                  className="game-overlay-fullscreen"
                  onClick={handleToggleFullscreen}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  type="button"
                >
                  {isFullscreen ? "축소" : "전체"}
                </button>
              </div>
              {!isBridgeReady ? (
                <div className="game-overlay-loading">
                  <span className="panel-tag">LINK</span>
                  <strong>전장 엔진 연결 중</strong>
                </div>
              ) : null}
            </GameViewport>
          </div>

          <div className="combat-actionbar">
            <div className="combat-actionbar__build">
              {towerCatalog.map((tower) => {
                const blockedReason = getBuildDisabledReason(tower.buildCost);

                return (
                  <button
                    className={
                      blockedReason ? "tower-action tower-action--disabled" : "tower-action"
                    }
                    disabled={Boolean(blockedReason)}
                    key={tower.key}
                    onClick={() => handleBuild(tower.key)}
                    type="button"
                  >
                    <div className="tower-action__head">
                      <strong>{tower.displayName}</strong>
                      <span className="tower-action__hotkey">{tower.hotkey}</span>
                    </div>
                    <div className="tower-action__body">
                      <span className="tower-action__cost">{formatNumber(tower.buildCost)} G</span>
                      <span className="tower-action__copy">
                        {blockedReason ?? buildCommandCopy[tower.key]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="combat-actionbar__controls">
              <button className="button button--primary" disabled={!isBridgeReady} onClick={handleStart} type="button">
                출격 시작
              </button>
              <button
                className="button button--ghost"
                disabled={!isBridgeReady || !isRunning || isPaused}
                onClick={handlePause}
                type="button"
              >
                일시 정지
              </button>
              <button
                className="button button--ghost"
                disabled={!isBridgeReady || !isPaused}
                onClick={handleResume}
                type="button"
              >
                재개
              </button>
              <button
                className={currentSpeed === 1 ? "button button--primary" : "button button--ghost"}
                disabled={!isBridgeReady}
                onClick={() => handleSpeed(1)}
                type="button"
              >
                1배속
              </button>
              <button
                className={currentSpeed === 2 ? "button button--primary" : "button button--ghost"}
                disabled={!isBridgeReady}
                onClick={() => handleSpeed(2)}
                type="button"
              >
                2배속
              </button>
            </div>
          </div>

          {submittedResult ? (
            <article className="stack-card game-result-card">
              <div className="stack-card__row">
                <h3>전투 결과 제출</h3>
                <span className="pill">{submittedResult.accepted ? "반영 완료" : "검증 대기"}</span>
              </div>
              <p>
                {submittedResult.accepted
                  ? "기록이 순위표에 반영되었습니다."
                  : "기록이 검증 대기 상태로 전환되었습니다."}
              </p>
              <div className="hero-card__actions">
                <button className="button button--primary" onClick={handleStart} type="button">
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

        <aside className="combat-sidebar">
          <article className="stack-card inspector-card">
            <div className="stack-card__row">
              <h3>인스펙터</h3>
              <span className="pill">{selection ? selection.slotId : "미선택"}</span>
            </div>

            <div className="inspector-card__summary">
              <strong>{selectionTitle}</strong>
              <p>{selectionSubtitle}</p>
            </div>

            <div className="inspector-metrics">
              <div>
                <span>상태</span>
                <strong>{selectedTower ? "설치 완료" : selection ? "배치 가능" : "대기"}</strong>
              </div>
              <div>
                <span>특수 효과</span>
                <strong>
                  {selectedTower?.specialEffect
                    ? specialEffectLabels[selectedTower.specialEffect]
                    : "없음"}
                </strong>
              </div>
              <div>
                <span>추천 포대</span>
                <strong>{selectedStage.recommendedTowerLabel}</strong>
              </div>
              <div>
                <span>위험도</span>
                <strong>{selectedStage.threatLevel}</strong>
              </div>
            </div>

            <div className="inspector-actions">
              <button
                className="button button--primary"
                disabled={Boolean(upgradeDisabledReason)}
                onClick={handleUpgrade}
                type="button"
              >
                업그레이드
              </button>
              <button
                className="button button--ghost"
                disabled={!selectedTower}
                onClick={handleSell}
                type="button"
              >
                판매
              </button>
            </div>

            {upgradeDisabledReason ? (
              <p className="inspector-panel__reason">{upgradeDisabledReason}</p>
            ) : null}
          </article>

          <article className="stack-card inspector-card inspector-card--secondary">
            <div className="stack-card__row">
              <h3>작전 정보</h3>
              <span className="pill">LIVE</span>
            </div>

            <div className="status-list status-list--stacked">
              <span>섹터 {selectedStage.sector}</span>
              <span>기상 {selectedStage.weather}</span>
              <span>다음 접적 {nextWaveSummary}</span>
              <span>남은 적 {formatNumber(snapshot?.enemiesAlive ?? 0)}기</span>
            </div>

            <p className="inspector-panel__copy">{selectedStage.tacticalNote}</p>
          </article>
        </aside>
      </div>
    </section>
  );
};
