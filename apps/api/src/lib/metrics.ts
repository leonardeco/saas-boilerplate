/**
 * Lightweight in-process metrics (Prometheus text exposition).
 * No heavy OTel SDK dependency — can bridge to OTel collector later.
 */

type Labels = Record<string, string>;

function key(name: string, labels?: Labels) {
  if (!labels || !Object.keys(labels).length) return name;
  const parts = Object.entries(labels)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}="${String(v).replace(/"/g, '\\"')}"`)
    .join(",");
  return `${name}{${parts}}`;
}

const counters = new Map<string, number>();
const histograms = new Map<string, number[]>();

const startedAt = Date.now();

export const metrics = {
  inc(name: string, labels?: Labels, by = 1) {
    const k = key(name, labels);
    counters.set(k, (counters.get(k) ?? 0) + by);
  },

  observe(name: string, valueMs: number, labels?: Labels) {
    const k = key(name, labels);
    const arr = histograms.get(k) ?? [];
    arr.push(valueMs);
    // cap memory
    if (arr.length > 500) arr.shift();
    histograms.set(k, arr);
  },

  /** Prometheus exposition format */
  render(): string {
    const lines: string[] = [];
    lines.push("# HELP nighttable_up 1 if process is up");
    lines.push("# TYPE nighttable_up gauge");
    lines.push("nighttable_up 1");

    lines.push("# HELP nighttable_process_uptime_seconds Process uptime");
    lines.push("# TYPE nighttable_process_uptime_seconds gauge");
    lines.push(
      `nighttable_process_uptime_seconds ${(Date.now() - startedAt) / 1000}`,
    );

    const region = process.env.REGION ?? process.env.FLY_REGION ?? "local";
    lines.push("# HELP nighttable_region_info Region label");
    lines.push("# TYPE nighttable_region_info gauge");
    lines.push(`nighttable_region_info{region="${region}"} 1`);

    for (const [k, v] of counters) {
      const metric = k.includes("{") ? k : k;
      lines.push(`# TYPE ${k.split("{")[0]} counter`);
      lines.push(`${metric} ${v}`);
    }

    for (const [k, values] of histograms) {
      if (!values.length) continue;
      const sum = values.reduce((a, b) => a + b, 0);
      const count = values.length;
      const base = k.split("{")[0];
      const labels = k.includes("{") ? k.slice(k.indexOf("{")) : "";
      lines.push(`# TYPE ${base}_ms summary`);
      lines.push(`${base}_ms_sum${labels} ${sum}`);
      lines.push(`${base}_ms_count${labels} ${count}`);
    }

    return lines.join("\n") + "\n";
  },

  reset() {
    counters.clear();
    histograms.clear();
  },
};
