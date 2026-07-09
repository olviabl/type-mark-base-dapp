"use client";

import {
  BadgeCheck,
  CaseSensitive,
  Loader2,
  Palette,
  Search,
  Stamp,
  Type,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { parseEventLogs, type Address } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import {
  MAX_INK_LENGTH,
  MAX_NOTE_LENGTH,
  MAX_PHRASE_LENGTH,
  MAX_STYLE_LENGTH,
  typeMarkAbi,
  typeMarkContractAddress,
} from "@/lib/type-mark";

const PRESETS = [
  {
    phrase: "SHIP SMALL THINGS",
    styleName: "Poster",
    ink: "Acid green",
    note: "A visible mark for a useful Base app iteration.",
  },
  {
    phrase: "PROOF OVER PROMISE",
    styleName: "Mono",
    ink: "Signal blue",
    note: "A compact phrase for receipts, launch notes, and builder updates.",
  },
  {
    phrase: "MAKE IT REAL",
    styleName: "Editorial",
    ink: "Hot coral",
    note: "A public type mark for a product moment worth remembering.",
  },
] as const;

const INKS = ["Acid green", "Signal blue", "Hot coral", "Black"] as const;
const STYLES = ["Poster", "Mono", "Editorial", "Block"] as const;

function shortAddress(address?: Address) {
  if (!address || address === "0x0000000000000000000000000000000000000000") return "--";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(value?: bigint) {
  if (!value) return "--";
  return new Date(Number(value) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function friendlyError(error: unknown) {
  if (!(error instanceof Error)) return "Transaction was cancelled.";
  if (error.message.includes("User rejected")) return "Request cancelled in wallet.";
  if (error.message.includes("Invalid phrase")) return "Phrase needs 1 to 64 characters.";
  if (error.message.includes("Invalid style")) return "Style needs 1 to 24 characters.";
  if (error.message.includes("Invalid ink")) return "Ink needs 1 to 24 characters.";
  if (error.message.includes("Invalid note")) return "Note needs 1 to 120 characters.";
  return error.message;
}

function inkClass(ink: string) {
  if (ink === "Signal blue") return "ink-blue";
  if (ink === "Hot coral") return "ink-coral";
  if (ink === "Black") return "ink-black";
  return "ink-green";
}

function MarkPoster({
  phrase,
  styleName,
  ink,
  note,
  maker,
  createdAt,
}: {
  phrase: string;
  styleName: string;
  ink: string;
  note: string;
  maker?: Address;
  createdAt?: bigint;
}) {
  const words = phrase.trim().split(/\s+/).slice(0, 5);

  return (
    <article className={`type-poster ${inkClass(ink)}`}>
      <div className="poster-rule" />
      <header>
        <p>Type Mark</p>
        <span>{styleName || "Poster"}</span>
      </header>
      <section className="phrase-wall" aria-label={phrase}>
        {words.length > 0
          ? words.map((word, index) => (
              <strong key={`${word}-${index}`} style={{ transform: `translateX(${index % 2 ? "7%" : "0"})` }}>
                {word}
              </strong>
            ))
          : <strong>TYPE</strong>}
      </section>
      <footer>
        <div>
          <span>Ink</span>
          <strong>{ink || "--"}</strong>
        </div>
        <div>
          <span>Note</span>
          <strong>{note || "Stamp a phrase on Base."}</strong>
        </div>
        <div>
          <Wallet />
          <span>{shortAddress(maker)}</span>
        </div>
        <div>
          <BadgeCheck />
          <span>{formatDate(createdAt)}</span>
        </div>
      </footer>
    </article>
  );
}

export function TypeMarkApp() {
  const [markIdInput, setMarkIdInput] = useState("1");
  const [phrase, setPhrase] = useState<string>(PRESETS[0].phrase);
  const [styleName, setStyleName] = useState<string>(PRESETS[0].styleName);
  const [ink, setInk] = useState<string>(PRESETS[0].ink);
  const [note, setNote] = useState<string>(PRESETS[0].note);
  const [message, setMessage] = useState("Compose a short mark and stamp it on Base.");
  const [lastAction, setLastAction] = useState<"stamp" | null>(null);

  const { address, chainId, connector, isConnected } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { disconnectAsync } = useDisconnect();
  async function disconnectWallet() {
    try {
      if (connector) {
        await disconnectAsync({ connector });
      } else {
        await disconnectAsync();
      }
    } catch {}
  }
  const { switchChain, isPending: switching } = useSwitchChain();
  const { data: hash, writeContractAsync, isPending: writing } = useWriteContract();
  const { data: receipt, isLoading: confirming } = useWaitForTransactionReceipt({ hash });

  const selectedConnector =
    connectors.find((connector) => connector.id === "injected") ??
    connectors.find((connector) => connector.id === "baseAccount") ??
    connectors[0];
  const parsedMarkId = BigInt(Math.max(1, Number(markIdInput || "1")));

  const markQuery = useReadContract({
    abi: typeMarkAbi,
    address: typeMarkContractAddress,
    functionName: "getMark",
    args: [parsedMarkId],
    query: { enabled: Boolean(typeMarkContractAddress), refetchInterval: 12000 },
  });

  const totalQuery = useReadContract({
    abi: typeMarkAbi,
    address: typeMarkContractAddress,
    functionName: "nextMarkId",
    query: { enabled: Boolean(typeMarkContractAddress), refetchInterval: 12000 },
  });

  const tuple = markQuery.data as
    | readonly [Address, string, string, string, string, bigint]
    | undefined;

  const liveMark = useMemo(
    () =>
      tuple
        ? {
            maker: tuple[0],
            phrase: tuple[1],
            styleName: tuple[2],
            ink: tuple[3],
            note: tuple[4],
            createdAt: tuple[5],
          }
        : undefined,
    [tuple],
  );

  const totalMarks = totalQuery.data ? Math.max(Number(totalQuery.data) - 1, 0) : 0;
  const validFields =
    phrase.trim().length > 0 &&
    phrase.trim().length <= MAX_PHRASE_LENGTH &&
    styleName.trim().length > 0 &&
    styleName.trim().length <= MAX_STYLE_LENGTH &&
    ink.trim().length > 0 &&
    ink.trim().length <= MAX_INK_LENGTH &&
    note.trim().length > 0 &&
    note.trim().length <= MAX_NOTE_LENGTH;

  const stampBlocker = !typeMarkContractAddress
    ? "Contract not deployed yet. Run npm run deploy:contract, then add NEXT_PUBLIC_TYPE_MARK_CONTRACT_ADDRESS."
    : !isConnected
      ? "Connect wallet first."
      : chainId !== base.id
        ? "Switch to Base first."
        : !validFields
          ? "Fill phrase, style, ink, and note."
          : "";

  useEffect(() => {
    if (!receipt || lastAction !== "stamp") return;
    void totalQuery.refetch();
    void markQuery.refetch();
    const logs = parseEventLogs({ abi: typeMarkAbi, logs: receipt.logs, eventName: "MarkStamped" });
    const markId = logs[0]?.args.markId;
    window.setTimeout(() => {
      if (markId) setMarkIdInput(markId.toString());
      setMessage(markId ? `Type mark #${markId.toString()} stamped on Base.` : "Type mark stamped on Base.");
    }, 0);
  }, [lastAction, receipt, totalQuery, markQuery]);

  async function connectWallet() {
    const connectorQueue = [
      connectors.find((connector) => connector.id === "injected"),
      connectors.find((connector) => connector.id === "baseAccount"),
      selectedConnector,
    ]
      .filter((connector): connector is NonNullable<typeof selectedConnector> => Boolean(connector))
      .filter((connector, index, queue) => queue.findIndex((item) => item.id === connector.id) === index);

    if (connectorQueue.length === 0) {
      setMessage("No wallet connector found. Open this app inside Base App or a wallet browser.");
      return;
    }

    let lastError: unknown;
    setMessage("Opening wallet connection...");
    for (const connector of connectorQueue) {
      try {
        await connectAsync({ connector });
        setMessage("Wallet connected. Stamp the mark when ready.");
        return;
      } catch (error) {
        lastError = error;
      }
    }
    setMessage(friendlyError(lastError));
  }

  async function stampMark() {
    const contractAddress = typeMarkContractAddress;
    if (stampBlocker) {
      setMessage(stampBlocker);
      return;
    }
    if (!contractAddress) {
      setMessage("Contract not deployed yet. Run npm run deploy:contract first.");
      return;
    }
    try {
      setLastAction("stamp");
      setMessage("Confirm the type mark in your wallet.");
      await writeContractAsync({
        address: contractAddress,
        abi: typeMarkAbi,
        functionName: "stampMark",
        args: [phrase.trim(), styleName.trim(), ink.trim(), note.trim()],
        chainId: base.id,
      });
      setMessage("Type mark sent. Waiting for Base confirmation...");
    } catch (error) {
      setMessage(friendlyError(error));
    }
  }

  function applyPreset(index: number) {
    const preset = PRESETS[index];
    setPhrase(preset.phrase);
    setStyleName(preset.styleName);
    setInk(preset.ink);
    setNote(preset.note);
  }

  return (
    <main className="type-shell">
      <section className="studio-panel">
        <div className="studio-top">
          <div>
            <p>TYPE MARK</p>
            <h1>Stamp your phrase.</h1>
          </div>
          <Stamp aria-hidden="true" />
        </div>

        <div className="stat-strip">
          <div>
            <span>Marks</span>
            <strong>{totalMarks}</strong>
          </div>
          <div>
            <span>Chain</span>
            <strong>Base</strong>
          </div>
        </div>

        <div className="preset-grid">
          {PRESETS.map((preset, index) => (
            <button key={preset.phrase} onClick={() => applyPreset(index)}>
              <span>0{index + 1}</span>
              {preset.phrase}
            </button>
          ))}
        </div>

        <label>
          <span><Type aria-hidden="true" /> Phrase</span>
          <input value={phrase} onChange={(event) => setPhrase(event.target.value.toUpperCase())} maxLength={MAX_PHRASE_LENGTH} />
        </label>

        <div className="choice-grid">
          <label>
            <span><CaseSensitive aria-hidden="true" /> Style</span>
            <select value={styleName} onChange={(event) => setStyleName(event.target.value)}>
              {STYLES.map((style) => <option key={style}>{style}</option>)}
            </select>
          </label>
          <label>
            <span><Palette aria-hidden="true" /> Ink</span>
            <select value={ink} onChange={(event) => setInk(event.target.value)}>
              {INKS.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <label>
          <span>Note</span>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={MAX_NOTE_LENGTH} rows={3} />
        </label>

        <div className="type-actions">
          {isConnected && chainId !== base.id ? (
            <button className="type-primary" disabled={switching} onClick={() => switchChain({ chainId: base.id })}>
              {switching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Switch to Base
            </button>
          ) : (
            <button className="type-primary" disabled={writing || confirming} onClick={stampMark}>
              {writing || confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Stamp className="h-4 w-4" />}
              Stamp on Base
            </button>
          )}
          {isConnected ? (
            <button className="type-secondary" onClick={disconnectWallet}>
              {shortAddress(address)}
            </button>
          ) : (
            <button className="type-secondary" disabled={!selectedConnector || connecting} onClick={connectWallet}>
              {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
              Connect wallet
            </button>
          )}
        </div>
        <p className="type-status">{message}</p>
        {hash ? (
          <a className="type-tx" href={`https://basescan.org/tx/${hash}`} rel="noreferrer" target="_blank">
            View transaction on BaseScan
          </a>
        ) : null}
      </section>

      <section className="poster-panel">
        <MarkPoster
          phrase={liveMark?.phrase || phrase}
          styleName={liveMark?.styleName || styleName}
          ink={liveMark?.ink || ink}
          note={liveMark?.note || note}
          maker={liveMark?.maker}
          createdAt={liveMark?.createdAt}
        />

        <div className="bottom-panels">
          <section>
            <div>
              <Search aria-hidden="true" />
              <h2>Load mark</h2>
            </div>
            <label>
              <span>Mark ID</span>
              <input value={markIdInput} onChange={(event) => setMarkIdInput(event.target.value.replace(/\D/g, ""))} />
            </label>
          </section>
          <section>
            <p>What it does</p>
            <strong>
              Type Mark stamps a short phrase with style, ink, note, wallet, and timestamp on Base.
            </strong>
          </section>
        </div>
      </section>
    </main>
  );
}
