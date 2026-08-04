from pathlib import Path
import re

TASKS = Path("frontend/src/app/(app)/tasks/page.tsx")
HISTORY = Path("frontend/src/app/(app)/history/page.tsx")
MOCK = Path("frontend/src/lib/mock-data.ts")
API = Path("frontend/src/lib/api.ts")
OUT = Path("docs/_evidence")

OUT.mkdir(parents=True, exist_ok=True)

for path in [TASKS, HISTORY, MOCK, API]:
    if not path.exists():
        raise SystemExit(f"GAGAL: file tidak ditemukan: {path}")

def collect(paths, pattern, output):
    regex = re.compile(pattern)
    results = []

    for path in paths:
        lines = path.read_text(encoding="utf-8").splitlines()

        for number, line in enumerate(lines, 1):
            if regex.search(line):
                results.append(f"{path}:{number}:{line}")

    target = OUT / output
    target.write_text(
        "\n".join(results) + ("\n" if results else ""),
        encoding="utf-8",
    )

    return results

task_workflow = collect(
    [TASKS],
    r"useState|useMemo|useEffect|useSearchParams|useRouter|router\.|"
    r"selectedTask|activeTask|viewMode|statusFilter|sortKey|"
    r"handle[A-Z]|open[A-Z]|close[A-Z]|task=|view=map",
    "task-workflow-contract.txt",
)

task_data = collect(
    [TASKS, MOCK, API],
    r"type .*Task|interface .*Task|const .*TASK|status:|eta|target|"
    r"estimatedArrival|targetArrival|dwell|loading|unloading|"
    r"completedAt|driver|vehicle|progress",
    "task-data-contract.txt",
)

task_interactions = collect(
    [TASKS],
    r"<button|<Button|onClick=|aria-label=|title=|disabled=|"
    r"role=|tabIndex=",
    "task-interactions.txt",
)

history_workflow = collect(
    [HISTORY],
    r"useState|useMemo|useEffect|useSearchParams|useRouter|router\.|"
    r"selectedVehicle|selectedEvent|activeEvent|dateRange|playback|"
    r"replay|isPlaying|playbackSpeed|handle[A-Z]|vehicle=|event=",
    "history-workflow-contract.txt",
)

history_data = collect(
    [HISTORY, MOCK, API],
    r"type .*Event|interface .*Event|type .*Trip|interface .*Trip|"
    r"const .*EVENT|const .*REPLAY|timestamp|latitude|longitude|"
    r"lat:|lng:|speed|heading|distance|duration|deviation|"
    r"overspeed|ignition|stop",
    "history-data-contract.txt",
)

history_interactions = collect(
    [HISTORY],
    r"<button|<Button|onClick=|aria-label=|title=|disabled=|"
    r"role=|tabIndex=",
    "history-interactions.txt",
)

url_state = collect(
    [TASKS, HISTORY],
    r"useSearchParams|searchParams|get\(|router\.push|router\.replace|"
    r"window\.history|URLSearchParams|/tasks|/history|"
    r"vehicle=|event=|task=|view=",
    "task-history-url-state.txt",
)

mutations = collect(
    [TASKS, HISTORY],
    r"setSelected|setStatus|setFilter|setSort|setView|setDate|"
    r"setPlaying|setPlayback|setCurrent|setProgress|setRefreshing|"
    r"localStorage|sessionStorage",
    "task-history-state-mutations.txt",
)

groups = {
    "task workflow": task_workflow,
    "task data": task_data,
    "task interactions": task_interactions,
    "history workflow": history_workflow,
    "history data": history_data,
    "history interactions": history_interactions,
    "URL state": url_state,
    "state mutations": mutations,
}

print("=== EVIDENCE COUNTS ===")
for name, rows in groups.items():
    print(f"{len(rows):4}  {name}")

print("\n=== FIXED LAYOUTS ===")
layout_pattern = re.compile(r"grid-cols-\[|w-\[[0-9]+px\]")

for path in [TASKS, HISTORY]:
    for number, line in enumerate(
        path.read_text(encoding="utf-8").splitlines(),
        1,
    ):
        if layout_pattern.search(line):
            print(f"{path}:{number}:{line.strip()}")

print("\n=== URL STATE ===")
if url_state:
    for row in url_state:
        print(row)
else:
    print("Tidak ada URL-state implementation ditemukan.")

print("\n=== TASK USESTATE ===")
for number, line in enumerate(
    TASKS.read_text(encoding="utf-8").splitlines(),
    1,
):
    if "useState" in line:
        print(f"{number}:{line.strip()}")

print("\n=== HISTORY USESTATE ===")
for number, line in enumerate(
    HISTORY.read_text(encoding="utf-8").splitlines(),
    1,
):
    if "useState" in line:
        print(f"{number}:{line.strip()}")

combined_task = TASKS.read_text(encoding="utf-8")

task_statuses = sorted(set(
    re.findall(
        r'(?:status\s*[:=]{1,3}\s*|status\s*===\s*)["\']([^"\']+)["\']',
        combined_task,
    )
))

print("\n=== TASK STATUS VALUES ===")
if task_statuses:
    for status in task_statuses:
        print(status)
else:
    print("Tidak ada status literal yang terdeteksi.")

combined_history = HISTORY.read_text(encoding="utf-8")

event_values = sorted(set(
    re.findall(
        r'(?:type|eventType|category)\s*:\s*["\']([^"\']+)["\']',
        combined_history,
    )
))

print("\n=== HISTORY EVENT VALUES ===")
if event_values:
    for value in event_values:
        print(value)
else:
    print("Tidak ada event type literal yang terdeteksi.")

print("\n=== ACTION STUBS ===")
stub_file = OUT / "task-history-action-stubs.txt"

if stub_file.exists():
    print(stub_file.read_text(encoding="utf-8").rstrip())
else:
    print("Evidence action stub belum tersedia.")

print("\nSelesai. Source code tidak diubah.")
