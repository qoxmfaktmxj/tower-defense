import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  gameModeCatalog,
  stageCatalog,
  towerCatalog,
  type GameBridge,
  type GameRunFinishedPayload,
  type GameSelection,
  type GameStateSnapshot
} from "@tower-defense/game";
import { GameViewport } from "../../components/game/GameViewport";
import { HotkeyPrompt, type HotkeyCode } from "../../components/ui/HotkeyPrompt";
import { StatCard } from "../../components/ui/StatCard";
import { submitGameResult } from "../../lib/api/client";
import { queryKeys } from "../../lib/query/keys";
import { formatNumber } from "../../lib/utils/format";
import { useUiStore } from "../../stores/useUiStore";

const specialEffectLabels = {
  overdrive: "오버드라이브 연사",
  "blast-nova": "폭발 진동파",
  "freeze-nova": "빙결 확산"
} as const;

const getReadyFeedback = (modeName: string, stageName: string) =>
  `${modeName} · ${stageName} 로드 완료. 출격 시작 버튼으로 20웨이브 방어를 개시하세요.`;

export const GamePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    nickname,
    rememberResult,
    volume,
    selectedStageId,
    setSelectedStageId
  } = useUiStore();
  const [bridge, setBridge] = useState<GameBridge | null>(null);
  const [snapshot, setSnapshot] = useState<GameStateSnapshot | null>(null);
  const [selection, setSelection] = useState<GameSelection | null>(null);

  const selectedMode = gameModeCatalog[0]!;
  const selectedStage = stageCatalog.find((entry) => entry.id === selectedStageId) ?? stageCatalog[0]!;
  const [feedback, setFeedback] = useState(getReadyFeedback(selectedMode.name, selectedStage.name));
  const previousStageIdRef = useRef(selectedStageId);

  const {
    data: submittedResult,
    mutate: submitResult,
    reset: resetSubmittedResult
  } = useMutation({
    mutationFn: submitGameResult,
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.rankings.all
      });
      setFeedback(
        response.accepted
          ? "전투 결과가 랭킹 기록에 반영되었습니다."
          : "비정상 수치로 감지되어 이번 기록은 랭킹 반영이 보류되었습니다."
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
    if (previousStageIdRef.current === selectedStageId) {
      return;
    }

    previousStageIdRef.current = selectedStageId;
    setSnapshot(null);
    setSelection(null);
    setFeedback(getReadyFeedback(selectedMode.name, selectedStage.name));
    resetSubmittedResult();
  }, [resetSubmittedResult, selectedMode.name, selectedStageId, selectedStage.name]);

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
        setFeedback(`${key}배속 전술 모드로 전환했습니다.`);
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
      setSelectedStageId(stageId);
    },
    [selectedStageId, setSelectedStageId]
  );

  const currentGold = snapshot?.gold ?? 0;
  const selectedTower = selection?.tower;
  const isBridgeReady = bridge !== null;
  const upgradeDisabledReason = !selectedTower
    ? "업그레이드할 타워를 먼저 선택하세요."
    : selectedTower.isMaxLevel
      ? "이미 최대 레벨입니다."
      : currentGold < (selectedTower.upgradeCost ?? 0)
        ? "골드가 부족합니다."
        : null;
  const operationStatus = snapshot?.paused ? "일시 정지" : snapshot?.running ? "교전 중" : "대기 중";
  const totalWaves = snapshot?.totalWaves ?? 20;

  return (
    <section className="game-layout">
      <div className="game-layout__board">
        <div className="page-header">
          <div>
            <p className="panel-tag">TOWER DEFENSE</p>
            <h1>타워 디펜스 출격</h1>
          </div>
          <p className="page-header__copy">
            기본 전장 테마로 3개 맵을 플레이할 수 있습니다. 모든 맵은 20웨이브까지 진행되며,
            타워는 5레벨에 도달하면 특별한 오버드라이브 효과가 발동합니다.
          </p>
        </div>

        <article className="stack-card">
          <div className="stack-card__row">
            <h3>맵 선택</h3>
            <span className="pill">{selectedMode.name}</span>
          </div>
          <div className="selector-grid selector-grid--compact">
            {stageCatalog.map((stage) => (
              <button
                className={stage.id === selectedStageId ? "selector-card selector-card--active" : "selector-card"}
                key={stage.id}
                onClick={() => handleStageSelect(stage.id)}
                type="button"
              >
                <strong>{stage.name}</strong>
                <small>{stage.description}</small>
              </button>
            ))}
          </div>
        </article>

        <GameViewport
          gameMode={selectedMode.id}
          key={selectedStageId}
          onBridgeReady={setBridge}
          onError={setFeedback}
          onRunFinished={handleRunFinished}
          onSelectionChange={setSelection}
          onStateChange={setSnapshot}
          stageId={selectedStageId}
        />

        <div className="game-controls">
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

        <article className="stack-card">
          <div className="stack-card__row">
            <h3>전술 핫키</h3>
            <span className="pill">INPUT PROMPTS</span>
          </div>
          <div className="hotkey-grid">
            <HotkeyPrompt code="q" detail="70 골드" label="기관포 배치" />
            <HotkeyPrompt code="w" detail="110 골드" label="중화기 배치" />
            <HotkeyPrompt code="e" detail="95 골드" label="빙결 배치" />
            <HotkeyPrompt code="u" detail="선택 타워" label="업그레이드" />
            <HotkeyPrompt code="s" detail="선택 타워" label="판매" />
            <HotkeyPrompt code="1" detail="기본 속도" label="1배속" />
            <HotkeyPrompt code="2" detail="빠른 진행" label="2배속" />
            <HotkeyPrompt code="space" detail="전투 제어" label="일시 정지 / 재개" />
          </div>
        </article>
      </div>

      <aside className="game-layout__panel">
        <div className="stats-grid">
          <StatCard accent="teal" label="골드" value={formatNumber(snapshot?.gold ?? 0)}>
            배치와 업그레이드에 사용하는 자원
          </StatCard>
          <StatCard accent="amber" label="생명" value={formatNumber(snapshot?.lives ?? 0)}>
            적이 도달할 때마다 1 감소
          </StatCard>
          <StatCard accent="coral" label="웨이브" value={`${snapshot?.currentWave ?? 0} / ${totalWaves}`}>
            현재 속도 x{snapshot?.speed ?? 1}
          </StatCard>
        </div>

        <article className="stack-card">
          <div className="stack-card__row">
            <h3>작전 상태</h3>
            <span className="pill">{operationStatus}</span>
          </div>
          <p>{feedback}</p>
          <div className="status-list">
            <span>테마 {selectedMode.name}</span>
            <span>전장 {selectedStage.name}</span>
            <span>점수 {formatNumber(snapshot?.score ?? 0)}</span>
            <span>현장 적 {formatNumber(snapshot?.enemiesAlive ?? 0)}기</span>
            <span>다음 웨이브 {snapshot?.nextWaveSummary ?? "전투 준비 중"}</span>
          </div>
        </article>

        <article className="stack-card">
          <div className="stack-card__row">
            <h3>선택 정보</h3>
            {selection ? <span className="pill">{selection.slotId}</span> : null}
          </div>
          {selection ? (
            <>
              {selection.tower ? (
                <>
                  <p>
                    {selection.tower.displayName} Lv.{selection.tower.level}
                  </p>
                  <p className="muted">
                    업그레이드 비용:{" "}
                    {selection.tower.upgradeCost
                      ? `${formatNumber(selection.tower.upgradeCost)} 골드`
                      : "없음"}
                    {" / "}판매 환급: {formatNumber(selection.tower.sellValue)} 골드
                  </p>
                  {selection.tower.specialEffect ? (
                    <span className="pill">
                      {specialEffectLabels[selection.tower.specialEffect]} 활성
                    </span>
                  ) : null}
                  <div className="hero-card__actions">
                    <button
                      className="button button--primary"
                      disabled={Boolean(upgradeDisabledReason)}
                      onClick={() => bridge?.upgradeTower(selection.slotId)}
                      title={upgradeDisabledReason ?? "업그레이드"}
                      type="button"
                    >
                      업그레이드
                    </button>
                    <button
                      className="button button--ghost"
                      onClick={() => bridge?.sellTower(selection.slotId)}
                      type="button"
                    >
                      판매
                    </button>
                  </div>
                  {upgradeDisabledReason ? <p className="muted">{upgradeDisabledReason}</p> : null}
                </>
              ) : (
                <p>빈 슬롯입니다. 아래 타워 중 하나를 선택해 즉시 배치할 수 있습니다.</p>
              )}
            </>
          ) : (
            <p>슬롯이나 타워를 선택하면 상세 정보가 이곳에 표시됩니다.</p>
          )}
        </article>

        <article className="stack-card">
          <div className="stack-card__row">
            <h3>타워 배치</h3>
            <span className="pill">Q / W / E</span>
          </div>
          <div className="stack-grid">
            {towerCatalog.map((option) => {
              const keyCode = option.hotkey.toLowerCase() as HotkeyCode;
              const blockedReason = !selection
                ? "먼저 슬롯을 선택하세요."
                : selection.tower
                  ? "이미 타워가 배치된 슬롯입니다."
                  : currentGold < option.buildCost
                    ? "골드가 부족합니다."
                    : null;

              return (
                <button
                  className="tower-choice"
                  disabled={Boolean(blockedReason)}
                  key={option.key}
                  onClick={() => selection && bridge?.buildTower(selection.slotId, option.key)}
                  title={blockedReason ?? `${option.displayName} 배치`}
                  type="button"
                >
                  <div className="tower-choice__header">
                    <strong>{option.displayName}</strong>
                    <HotkeyPrompt code={keyCode} compact label={option.hotkey} />
                  </div>
                  <span>{option.description}</span>
                  <div className="tower-choice__meta">
                    <small>{formatNumber(option.buildCost)} 골드</small>
                    <small>{blockedReason ?? "배치 가능"}</small>
                  </div>
                </button>
              );
            })}
          </div>
        </article>

        {submittedResult ? (
          <article className="stack-card">
            <div className="stack-card__row">
              <h3>결과 제출</h3>
              <span className="pill">{submittedResult.accepted ? "정상 기록" : "검증 보류"}</span>
            </div>
            <p>
              {submittedResult.accepted
                ? "랭킹 반영까지 완료되었습니다."
                : "의심 수치로 분류되어 수동 검증 대기 상태입니다."}
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
      </aside>
    </section>
  );
};
