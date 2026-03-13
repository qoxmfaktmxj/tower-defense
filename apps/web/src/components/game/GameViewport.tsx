import { type ReactNode, type RefObject, useEffect, useRef } from "react";
import {
  createGameBridge,
  type GameBridge,
  type GameModeId,
  type GameRunFinishedPayload,
  type GameSelection,
  type GameStateSnapshot,
  type StageId
} from "@tower-defense/game";

interface GameViewportProps {
  gameMode: GameModeId;
  stageId: StageId;
  onBridgeReady: (bridge: GameBridge | null) => void;
  onRunFinished: (payload: GameRunFinishedPayload) => void;
  onSelectionChange: (selection: GameSelection | null) => void;
  onStateChange: (snapshot: GameStateSnapshot) => void;
  onError: (message: string) => void;
  children?: ReactNode;
  viewportRef?: RefObject<HTMLDivElement>;
}

export const GameViewport = ({
  gameMode,
  stageId,
  onBridgeReady,
  onRunFinished,
  onSelectionChange,
  onStateChange,
  onError,
  children,
  viewportRef
}: GameViewportProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onBridgeReadyRef = useRef(onBridgeReady);
  const onRunFinishedRef = useRef(onRunFinished);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onStateChangeRef = useRef(onStateChange);
  const onErrorRef = useRef(onError);

  onBridgeReadyRef.current = onBridgeReady;
  onRunFinishedRef.current = onRunFinished;
  onSelectionChangeRef.current = onSelectionChange;
  onStateChangeRef.current = onStateChange;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const bridge = createGameBridge({
      container: containerRef.current,
      gameMode,
      stageId
    });

    const offSelection = bridge.on("onSelectionChanged", (selection) => {
      onSelectionChangeRef.current(selection);
    });
    const offState = bridge.on("onStateChanged", (snapshot) => {
      onStateChangeRef.current(snapshot);
    });
    const offFinished = bridge.on("onRunFinished", (payload) => {
      onRunFinishedRef.current(payload);
    });
    const offError = bridge.on("onError", (error) => {
      onErrorRef.current(error.message);
    });

    onBridgeReadyRef.current(bridge);

    return () => {
      offSelection();
      offState();
      offFinished();
      offError();
      bridge.destroyGame();
      onBridgeReadyRef.current(null);
    };
  }, [gameMode, stageId]);

  return (
    <div className="game-viewport" ref={viewportRef}>
      <div className="game-viewport__canvas" ref={containerRef} />
      {children ? <div className="game-viewport__overlay">{children}</div> : null}
    </div>
  );
};
