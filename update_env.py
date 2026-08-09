import subprocess
import time

envs = {
    "VITE_FIREBASE_AUTH_DOMAIN": "studio-7328371401-9d600.firebaseapp.com",
    "VITE_FIREBASE_PROJECT_ID": "studio-7328371401-9d600",
    "VITE_FIREBASE_STORAGE_BUCKET": "studio-7328371401-9d600.firebasestorage.app",
    "VITE_FIREBASE_MESSAGING_SENDER_ID": "976765407893",
    "VITE_FIREBASE_APP_ID": "1:976765407893:web:b31abd32465c6442f2419c"
}

for key, value in envs.items():
    print(f"Updating {key}...")
    try:
        subprocess.run(
            ["npx.cmd", "vercel", "env", "add", key, "production", "--value", value, "--force", "--yes"],
            timeout=10,
            check=True,
            capture_output=True,
            text=True
        )
    except subprocess.TimeoutExpired as e:
        print(f"Timeout expired for {key}. Output before timeout:")
        print(e.output)
    except Exception as e:
        print(f"Error updating {key}: {e}")

print("Done updating environment variables.")
