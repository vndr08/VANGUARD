const { execFileSync } = require("child_process");
const fs = require("fs");

const pages = [
  ["dashboard", "https://tramos.systems/iv/dashboard"],
  ["rtmon", "https://tramos.systems/iv/rtmon"],
  ["dashcam", "https://tramos.systems/iv/rtmon/dashcam"],
  ["history", "https://tramos.systems/iv/history"],
  ["photocam", "https://tramos.systems/iv/photocam"],
  ["locate", "https://tramos.systems/iv/history/locate"],
  ["accident", "https://tramos.systems/iv/history/accident"],
  ["report_idle", "https://tramos.systems/iv/report/idle"],
  ["report_stop", "https://tramos.systems/iv/report/stop"],
  ["report_trip", "https://tramos.systems/iv/report/trip"],
  ["report_dims", "https://tramos.systems/iv/report/dims"],
  ["report_month", "https://tramos.systems/iv/report/month"],
  ["task_manage", "https://tramos.systems/task/manage"],
  ["task_tracking", "https://tramos.systems/iv/task/tracking"],
  ["task_history", "https://tramos.systems/iv/task/history"],
  ["cpanel_unit", "https://tramos.systems/iv/cpanel/unit"],
  ["cpanel_driver", "https://tramos.systems/iv/cpanel/driver"],
  ["cpanel_user", "https://tramos.systems/iv/cpanel/user"],
  ["telegram", "https://tramos.systems/cpanel/telegram"],
];

function osa(script) {
  return execFileSync("osascript", ["-e", script], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 8,
  });
}

function jsString(value) {
  return JSON.stringify(value);
}

const results = [];

for (const [name, url] of pages) {
  console.error(`Inspecting ${name}`);
  osa(`tell application "Google Chrome for Testing" to set URL of active tab of front window to ${jsString(url)}`);
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2500);
  const script = `
tell application "Google Chrome for Testing"
  tell active tab of front window
    set pageUrl to URL
    set pageTitle to title
    set pageText to execute javascript "document.body.innerText.slice(0, 9000)"
    set linksJson to execute javascript "JSON.stringify(Array.from(document.querySelectorAll('a[href]')).map(a=>({text:(a.innerText||a.textContent||'').trim().replace(/\\\\s+/g,' '),href:a.href})).filter(x=>x.text||x.href.includes('/iv/')).slice(0,80))"
    set formJson to execute javascript "JSON.stringify(Array.from(document.querySelectorAll('input,select,textarea,button')).map(el=>({tag:el.tagName.toLowerCase(),type:el.getAttribute('type')||'',text:(el.innerText||el.value||el.getAttribute('placeholder')||el.getAttribute('aria-label')||el.getAttribute('title')||el.name||el.id||'').trim().replace(/\\\\s+/g,' '),name:el.name||'',id:el.id||''})).filter(x=>x.text||x.name||x.id).slice(0,100))"
    return pageUrl & "\\n---TITLE---\\n" & pageTitle & "\\n---TEXT---\\n" & pageText & "\\n---LINKS---\\n" & linksJson & "\\n---FORM---\\n" & formJson
  end tell
end tell`;
  try {
    const raw = osa(script);
    results.push({ name, url, raw });
  } catch (error) {
    results.push({ name, url, error: error.message });
  }
}

fs.mkdirSync("/tmp/vanguard-tramos", { recursive: true });
fs.writeFileSync("/tmp/vanguard-tramos/inspect.txt", results.map((r) => `# ${r.name}\n${r.raw || r.error}`).join("\n\n"));
console.log(fs.readFileSync("/tmp/vanguard-tramos/inspect.txt", "utf8"));
