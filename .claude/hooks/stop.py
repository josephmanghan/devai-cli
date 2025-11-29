import subprocess
import sys

def send_notification(title, message):
    """
    Sends a system notification on macOS.
    """
    try:
        # Try AppleScript first
        script = f'display notification "{message}" with title "{title}" sound name "Glass"'
        subprocess.run(["osascript", "-e", script], check=True)

        # Also play a sound as backup
        subprocess.run(["afplay", "/System/Library/Sounds/Glass.aiff"], check=True)

        # And print to console
        print(f"\n🔔 [{title}] {message}")

    except Exception as e:
        # Fallback to simple print if the notification system fails
        print(f"\n[Notification Error]: Could not send system ping. {e}")
        print(f"[{title}] {message}")
        # Try just the sound
        try:
            subprocess.run(["afplay", "/System/Library/Sounds/Glass.aiff"], check=False)
        except:
            pass

if __name__ == "__main__":
    # You can customize the message here
    APP_NAME = "Claude Code"
    MSG = "Agent has finished the task."

    # Check if an exit code was passed by the hook (optional)
    # If Claude passes the exit code as an argument, we can change the message.
    if len(sys.argv) > 1:
        if sys.argv[1] != '0':
            MSG = f"Agent stopped with error (Exit Code: {sys.argv[1]})"

    send_notification(APP_NAME, MSG)