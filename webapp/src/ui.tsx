import type { ReactNode } from "react";

export function PreviewCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="preview-card">
      <strong>{title}</strong>
      <p>{body}</p>
    </article>
  );
}

export function HeroCard({
  title,
  body,
  actions
}: {
  title: string;
  body: string;
  actions?: Array<{ label: string; onClick: () => void; tone?: "primary" | "secondary" }>;
}) {
  return (
    <section className="hero-card">
      <div>
        <p className="eyebrow">Overview</p>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
      {actions?.length ? (
        <div className="hero-actions">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={action.tone === "secondary" ? "ghost-button" : ""}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function MetricCard({
  label,
  value,
  tone = "default"
}: {
  label: string;
  value: string;
  tone?: "default" | "teal" | "amber" | "rose";
}) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}

export function LaneCard({ title, summary, items }: { title: string; summary: string; items: string[] }) {
  return (
    <article className="lane-card">
      <div className="panel-head">
        <div>
          <p className="eyebrow">{title}</p>
          <h3>{title}</h3>
        </div>
      </div>
      <p className="lane-summary">{summary}</p>
      <ul className="lane-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

export function LaneMiniGrid({ items }: { items: Array<{ label: string; value: number }> }) {
  return (
    <div className="mini-metric-grid">
      {items.map((item) => (
        <div key={item.label} className="mini-metric">
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function PanelCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="panel-card">
      <div className="panel-head">
        <div>
          <p className="eyebrow">{title}</p>
          <h3>{title}</h3>
        </div>
      </div>
      {children}
    </article>
  );
}

export function CompactList({
  items,
  emptyTitle = "Nothing to show yet."
}: {
  items: Array<{ title: string; detail: string; meta?: string; status?: string }>;
  emptyTitle?: string;
}) {
  if (!items.length) {
    return <EmptyState title={emptyTitle} body="" compact />;
  }

  return (
    <ul className="record-list">
      {items.map((item) => (
        <li key={`${item.title}-${item.meta ?? item.detail}`}>
          <div className="record-main">
            <strong>{item.title}</strong>
            <span>{item.detail}</span>
          </div>
          <div className="record-side">
            {item.meta ? <span>{item.meta}</span> : null}
            {item.status ? <StatusBadge value={item.status} /> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function TimelineList({
  items
}: {
  items: Array<{ title: string; detail: string; time: string; status: string }>;
}) {
  if (!items.length) {
    return <EmptyState title="No timeline entries yet." body="" compact />;
  }

  return (
    <ul className="timeline-list">
      {items.map((item) => (
        <li key={`${item.title}-${item.time}`}>
          <div className="timeline-dot" />
          <div className="timeline-body">
            <div className="timeline-top">
              <strong>{item.title}</strong>
              <StatusBadge value={item.status} />
            </div>
            <span>{item.detail}</span>
            <time>{formatDateTime(item.time)}</time>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function TableCard({
  title,
  headers,
  rows
}: {
  title: string;
  headers: string[];
  rows: Array<Array<ReactNode>>;
}) {
  return (
    <section className="table-card">
      <div className="panel-head">
        <div>
          <p className="eyebrow">{title}</p>
          <h3>{title}</h3>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${title}-${index}`}>
              {row.map((cell, cellIndex) => (
                <td key={`${title}-${index}-${cellIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function StatusBadge({ value }: { value: string }) {
  return <span className={`status-badge tone-${statusTone(value)}`}>{humanizeEnum(value)}</span>;
}

export function CatalogManager({
  label,
  options,
  draft,
  canEdit,
  onDraftChange,
  onAdd
}: {
  label: string;
  options: string[];
  draft: string;
  canEdit: boolean;
  onDraftChange: (value: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="catalog-manager">
      <div className="catalog-list">
        {options.map((item) => (
          <span key={item} className="catalog-chip">
            {item}
          </span>
        ))}
      </div>
      {canEdit ? (
        <div className="catalog-form">
          <label>
            Add to {label.toLowerCase()}
            <input value={draft} onChange={(event) => onDraftChange(event.target.value)} />
          </label>
          <button type="button" className="ghost-button" onClick={onAdd}>
            Add option
          </button>
        </div>
      ) : (
        <p className="helper-copy">Only admins can add new standard options.</p>
      )}
    </div>
  );
}

export function EmptyState({ title, body, compact = false }: { title: string; body: string; compact?: boolean }) {
  return (
    <div className={`empty-state${compact ? " compact" : ""}`}>
      <strong>{title}</strong>
      {body ? <p>{body}</p> : null}
    </div>
  );
}

export function humanizeEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatRole(role: string) {
  return humanizeEnum(role.replace("ROLE_", ""));
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export function currency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2
  }).format(value);
}

function statusTone(value: string) {
  const normalized = value.toUpperCase();

  if (
    normalized.includes("APPROVED") ||
    normalized.includes("ACTIVE") ||
    normalized.includes("OPEN") ||
    normalized.includes("ALIGNED")
  ) {
    return "teal";
  }

  if (
    normalized.includes("PENDING") ||
    normalized.includes("REVIEW") ||
    normalized.includes("CHECKED") ||
    normalized.includes("IN_PROGRESS")
  ) {
    return "amber";
  }

  if (normalized.includes("DENIED") || normalized.includes("CANCELLED") || normalized.includes("NO_SHOW")) {
    return "rose";
  }

  return "neutral";
}
