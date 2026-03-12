const promptAssetMap = {
  q: "/assets/ui/prompts/q.png",
  w: "/assets/ui/prompts/w.png",
  e: "/assets/ui/prompts/e.png",
  u: "/assets/ui/prompts/u.png",
  s: "/assets/ui/prompts/s.png",
  "1": "/assets/ui/prompts/1.png",
  "2": "/assets/ui/prompts/2.png",
  space: "/assets/ui/prompts/space.png"
} as const;

export type HotkeyCode = keyof typeof promptAssetMap;

interface HotkeyPromptProps {
  code: HotkeyCode;
  label: string;
  detail?: string;
  compact?: boolean;
}

export const HotkeyPrompt = ({ code, label, detail, compact = false }: HotkeyPromptProps) => {
  return (
    <span className={compact ? "hotkey-prompt hotkey-prompt--compact" : "hotkey-prompt"}>
      <img alt={`${code} 키`} className="hotkey-prompt__image" src={promptAssetMap[code]} />
      <span className="hotkey-prompt__copy">
        <strong className="hotkey-prompt__label">{label}</strong>
        {detail ? <small className="hotkey-prompt__detail">{detail}</small> : null}
      </span>
    </span>
  );
};
