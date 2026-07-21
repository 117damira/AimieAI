export interface WeeklyActivityDay {
  label: string;
  writing: number;
  speaking: number;
}

const TRACK_HEIGHT_PX = 112;

function barHeightPercent(value: number, max: number): number {
  if (value <= 0) return 0;
  return Math.max((value / max) * 100, 8);
}

export function WeeklyActivityChart({
  days,
  writingLabel,
  speakingLabel,
}: {
  days: WeeklyActivityDay[];
  writingLabel: string;
  speakingLabel: string;
}) {
  const max = Math.max(1, ...days.flatMap((day) => [day.writing, day.speaking]));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary-500" />
          {writingLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-info-500" />
          {speakingLabel}
        </span>
      </div>

      <div className="flex items-end justify-between gap-2 rounded-2xl border border-border bg-background/50 p-4 sm:gap-4">
        {days.map((day) => (
          <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex items-end gap-1.5">
              <div className="flex w-3.5 flex-col items-center sm:w-4">
                <span className="mb-1 h-3.5 text-[10px] font-medium leading-none text-muted">
                  {day.writing > 0 ? day.writing : ""}
                </span>
                <div
                  className="flex w-full items-end rounded-t-[4px] bg-surface"
                  style={{ height: TRACK_HEIGHT_PX }}
                  title={`${writingLabel}: ${day.writing}`}
                >
                  <div
                    className="w-full rounded-t-[4px] bg-primary-500 transition-[height] duration-500 transition-smooth"
                    style={{ height: `${barHeightPercent(day.writing, max)}%` }}
                  />
                </div>
              </div>
              <div className="flex w-3.5 flex-col items-center sm:w-4">
                <span className="mb-1 h-3.5 text-[10px] font-medium leading-none text-muted">
                  {day.speaking > 0 ? day.speaking : ""}
                </span>
                <div
                  className="flex w-full items-end rounded-t-[4px] bg-surface"
                  style={{ height: TRACK_HEIGHT_PX }}
                  title={`${speakingLabel}: ${day.speaking}`}
                >
                  <div
                    className="w-full rounded-t-[4px] bg-info-500 transition-[height] duration-500 transition-smooth"
                    style={{ height: `${barHeightPercent(day.speaking, max)}%` }}
                  />
                </div>
              </div>
            </div>
            <span className="text-xs font-medium text-muted">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
