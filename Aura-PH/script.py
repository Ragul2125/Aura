import subprocess
import time
import json
from datetime import datetime
from collections import defaultdict

ADB_PATH = r"E:\platform-tools\adb.exe"

def adb(cmd):
    full_cmd = f'"{ADB_PATH}" {cmd}'
    try:
        return subprocess.check_output(
            full_cmd,
            shell=True,
            text=True,
            stderr=subprocess.DEVNULL
        )
    except subprocess.CalledProcessError:
        return ""

def now():
    return datetime.now()

def is_device_connected():
    out = adb("devices")
    lines = out.strip().splitlines()
    return len(lines) > 1 and "device" in lines[1]

# ---------------- STATE ----------------
screen_on = False
total_screen_on = 0
total_screen_off = 0
last_tick = now()

current_app = None
app_start_time = None
app_usage = defaultdict(int)

battery_start = None
battery_end = None

# ---------------- INIT BATTERY ----------------
battery_info = adb("shell dumpsys battery")
for line in battery_info.splitlines():
    if "level:" in line:
        battery_start = int(line.split(":")[1].strip())
        battery_end = battery_start

# ---------------- MAIN LOOP ----------------
try:
    while True:
        time.sleep(2)
        current_time = now()
        delta = int((current_time - last_tick).total_seconds())

        if not is_device_connected():
            break

        # Screen state
        power = adb("shell dumpsys power")
        screen_on = any(
            "Display Power: state=ON" in l or "mWakefulness=Awake" in l
            for l in power.splitlines()
        )

        if screen_on:
            total_screen_on += delta
        else:
            total_screen_off += delta

        # Foreground app
        activity = adb("shell dumpsys activity activities")
        resumed = [l for l in activity.splitlines() if "ResumedActivity" in l]

        app = None
        if resumed:
            for part in resumed[0].split():
                if "/" in part:
                    app = part.split("/")[0]
                    break

        if app != current_app:
            if current_app and app_start_time:
                app_usage[current_app] += int(
                    (current_time - app_start_time).total_seconds()
                )
            current_app = app
            app_start_time = current_time

        # Battery
        battery_info = adb("shell dumpsys battery")
        for line in battery_info.splitlines():
            if "level:" in line:
                battery_end = int(line.split(":")[1].strip())

        last_tick = current_time

except KeyboardInterrupt:
    pass

# ---------------- FINALIZE LAST APP ----------------
if current_app and app_start_time:
    app_usage[current_app] += int((now() - app_start_time).total_seconds())

# ---------------- FINAL JSON ONLY ----------------
summary = {
    "screen": {
        "on_seconds": total_screen_on,
        "off_seconds": total_screen_off
    },
    "battery": {
        "start_percent": battery_start,
        "end_percent": battery_end,
        "drain_percent": (
            battery_start - battery_end
            if battery_start is not None and battery_end is not None
            else None
        )
    },
    "apps": {
        app: seconds for app, seconds in app_usage.items()
    }
}

print(json.dumps(summary, indent=2))
