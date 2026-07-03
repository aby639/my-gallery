from __future__ import annotations

import math
import os
import subprocess
from pathlib import Path

import imageio.v2 as imageio
import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(r"D:\Downloads\my_gallary")
ASSETS = ROOT / "playstore-assets"
VIDEO_DIR = ASSETS / "video"
VIDEO_DIR.mkdir(parents=True, exist_ok=True)

OUT_VIDEO_SILENT = VIDEO_DIR / "memolens-demo-silent.mp4"
OUT_VIDEO = VIDEO_DIR / "memolens-youtube-demo.mp4"
OUT_AUDIO = VIDEO_DIR / "memolens-voiceover.mp3"
OUT_MUSIC = VIDEO_DIR / "memolens-background.wav"
OUT_SCRIPT = VIDEO_DIR / "voiceover-script.txt"
OUT_THUMB = VIDEO_DIR / "memolens-youtube-thumbnail.png"

WIDTH = 1920
HEIGHT = 1080
FPS = 30
DURATION = 58.0

VOICEOVER = (
    "Meet MemoLens, a private way to save the moments behind your photos. "
    "Start with a picture from your camera or gallery, then add the story in your own words. "
    "You can type a caption, or tap the microphone and let MemoLens turn your speech into text. "
    "When the sound matters, record a private voice note too: a message, a laugh, or the feeling behind the memory. "
    "Choose a mood, add tags, mark favorites, and find memories later with search. "
    "Each memory is stored on this device in this version, so your personal moments stay close to you. "
    "When you want to share, MemoLens creates a clean image you can send to other apps. "
    "Simple, private, and personal. MemoLens. Save the photo. Keep the feeling."
)


SCENES = [
    {
        "start": 0,
        "end": 6,
        "kind": "intro",
        "title": "MemoLens",
        "subtitle": "Save the photo. Keep the feeling.",
        "caption": "Private photo memories with captions, moods, and voice notes.",
    },
    {
        "start": 6,
        "end": 16,
        "image": ASSETS / "phone-screenshots" / "01-home.png",
        "title": "Your Memory Space",
        "caption": "Keep photos, captions, moods, tags, and favorites together.",
        "accent": "Home",
    },
    {
        "start": 16,
        "end": 27,
        "image": ASSETS / "phone-screenshots" / "02-create-memory.png",
        "title": "Create a Memory",
        "caption": "Add a photo, write or dictate the story, then choose mood and tags.",
        "accent": "Create",
    },
    {
        "start": 27,
        "end": 38,
        "image": ASSETS / "phone-screenshots" / "03-memory-detail.png",
        "title": "Save the Voice",
        "caption": "Record a private voice note when the real sound matters.",
        "accent": "Voice note",
    },
    {
        "start": 38,
        "end": 49,
        "image": ASSETS / "phone-screenshots" / "04-search.png",
        "title": "Find It Again",
        "caption": "Search by caption, mood, or tag and reopen memories quickly.",
        "accent": "Search",
    },
    {
        "start": 49,
        "end": 58,
        "kind": "outro",
        "title": "Simple. Private. Personal.",
        "subtitle": "MemoLens",
        "caption": "A calmer way to keep the moments behind your photos.",
    },
]


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


TITLE_FONT = font(72, True)
SUBTITLE_FONT = font(40)
CAPTION_FONT = font(32)
SMALL_FONT = font(25)


def ease(x: float) -> float:
    x = max(0.0, min(1.0, x))
    return 1 - pow(1 - x, 3)


def rounded_rect_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def paste_rounded(base: Image.Image, img: Image.Image, xy: tuple[int, int], radius: int) -> None:
    mask = rounded_rect_mask(img.size, radius)
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 180))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    base.alpha_composite(shadow, (xy[0] + 18, xy[1] + 24))
    base.paste(img, xy, mask)


def draw_text_block(
    draw: ImageDraw.ImageDraw,
    x: int,
    y: int,
    title: str,
    caption: str,
    accent: str | None = None,
) -> None:
    if accent:
        pill_w = int(draw.textlength(accent, font=SMALL_FONT)) + 52
        draw.rounded_rectangle((x, y, x + pill_w, y + 46), radius=23, fill=(38, 28, 56, 235), outline=(110, 82, 150, 255), width=2)
        draw.text((x + 26, y + 9), accent, fill=(237, 230, 255), font=SMALL_FONT)
        y += 78
    draw.text((x, y), title, fill=(255, 255, 255), font=TITLE_FONT)
    draw.text((x, y + 95), caption, fill=(220, 210, 230), font=CAPTION_FONT)


def make_background(t: float) -> Image.Image:
    y = np.linspace(0, 1, HEIGHT, dtype=np.float32)[:, None]
    x = np.linspace(0, 1, WIDTH, dtype=np.float32)[None, :]
    pulse = 0.5 + 0.5 * math.sin(t * 0.55)

    r = 13 + 26 * y + 16 * pulse * x
    g = 10 + 12 * x + 6 * y
    b = 24 + 34 * x + 24 * y
    arr = np.stack([r, g, b], axis=2).clip(0, 255).astype(np.uint8)
    bg = Image.fromarray(arr, "RGB").convert("RGBA")
    draw = ImageDraw.Draw(bg, "RGBA")
    draw.ellipse((-210, -150, 430, 490), fill=(119, 62, 220, 115))
    draw.ellipse((1280, -230, 1840, 320), fill=(0, 184, 215, 90))
    draw.ellipse((1420, 540, 2070, 1250), fill=(255, 92, 123, 82))
    return bg


def load_phone(path: Path, height: int = 790) -> Image.Image:
    src = Image.open(path).convert("RGBA")
    w = int(src.width * (height / src.height))
    return src.resize((w, height), Image.Resampling.LANCZOS)


def render_frame(frame: int) -> np.ndarray:
    t = frame / FPS
    scene = next(s for s in SCENES if s["start"] <= t < s["end"] or (t >= DURATION and s is SCENES[-1]))
    local = (t - scene["start"]) / max(0.001, scene["end"] - scene["start"])
    bg = make_background(t)
    draw = ImageDraw.Draw(bg, "RGBA")

    if scene.get("kind") == "intro":
        icon = Image.open(ASSETS / "app-icon-512.png").convert("RGBA").resize((155, 155), Image.Resampling.LANCZOS)
        scale = 0.94 + 0.06 * ease(local)
        iw = int(icon.width * scale)
        icon = icon.resize((iw, iw), Image.Resampling.LANCZOS)
        paste_rounded(bg, icon, (160, 260), 34)
        draw.text((360, 300), scene["title"], fill=(255, 255, 255), font=TITLE_FONT)
        draw.text((365, 390), scene["subtitle"], fill=(238, 232, 246), font=SUBTITLE_FONT)
        draw.text((365, 455), scene["caption"], fill=(207, 194, 220), font=CAPTION_FONT)
        return np.asarray(bg.convert("RGB"))

    if scene.get("kind") == "outro":
        icon = Image.open(ASSETS / "app-icon-512.png").convert("RGBA").resize((145, 145), Image.Resampling.LANCZOS)
        paste_rounded(bg, icon, (887, 218), 32)
        tw = draw.textlength(scene["title"], font=TITLE_FONT)
        sw = draw.textlength(scene["subtitle"], font=SUBTITLE_FONT)
        cw = draw.textlength(scene["caption"], font=CAPTION_FONT)
        draw.text(((WIDTH - tw) / 2, 405), scene["title"], fill=(255, 255, 255), font=TITLE_FONT)
        draw.text(((WIDTH - sw) / 2, 505), scene["subtitle"], fill=(255, 187, 218), font=SUBTITLE_FONT)
        draw.text(((WIDTH - cw) / 2, 575), scene["caption"], fill=(220, 210, 230), font=CAPTION_FONT)
        return np.asarray(bg.convert("RGB"))

    phone = load_phone(scene["image"])
    bob = int(math.sin(t * 1.2) * 8)
    slide = int((1 - ease(local)) * 70)
    paste_rounded(bg, phone, (1180 + slide, 145 + bob), 58)
    draw_text_block(draw, 170, 285, scene["title"], scene["caption"], scene["accent"])

    # Animated focus ring for a demo feel.
    ring_alpha = int(90 + 80 * (0.5 + 0.5 * math.sin(t * 4.2)))
    ring_pen = (255, 118, 157, ring_alpha)
    if scene["accent"] == "Create":
        draw.ellipse((1470, 765, 1565, 860), outline=ring_pen, width=8)
    elif scene["accent"] == "Voice note":
        draw.ellipse((1265, 730, 1365, 830), outline=ring_pen, width=8)
    elif scene["accent"] == "Search":
        draw.rounded_rectangle((1270, 250, 1650, 330), radius=28, outline=ring_pen, width=7)
    else:
        draw.rounded_rectangle((1260, 600, 1710, 740), radius=32, outline=ring_pen, width=7)

    return np.asarray(bg.convert("RGB"))


def write_background_music() -> None:
    sample_rate = 44100
    total = int(DURATION * sample_rate)
    t = np.linspace(0, DURATION, total, endpoint=False)
    chords = [
        (196.00, 246.94, 293.66),
        (174.61, 220.00, 261.63),
        (207.65, 261.63, 329.63),
        (164.81, 196.00, 246.94),
    ]
    audio = np.zeros(total, dtype=np.float32)
    for i, chord in enumerate(chords):
        start = int(i * total / len(chords))
        end = int((i + 1) * total / len(chords))
        tt = t[start:end]
        segment = np.zeros_like(tt)
        for freq in chord:
            segment += np.sin(2 * np.pi * freq * tt)
        segment /= len(chord)
        fade = np.minimum(np.linspace(0, 1, len(segment)), np.linspace(1, 0, len(segment)))
        fade = np.clip(fade * 7, 0, 1)
        audio[start:end] += segment * fade
    audio *= 0.035
    pcm = np.int16(audio.clip(-1, 1) * 32767)
    import wave

    with wave.open(str(OUT_MUSIC), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(pcm.tobytes())


def generate_voiceover() -> None:
    OUT_SCRIPT.write_text(VOICEOVER + "\n", encoding="utf-8")
    if OUT_AUDIO.exists():
        OUT_AUDIO.unlink()
    subprocess.run(
        [
            "python",
            "-m",
            "edge_tts",
            "--voice",
            "en-GB-RyanNeural",
            "--rate=-4%",
            "--text",
            VOICEOVER,
            "--write-media",
            str(OUT_AUDIO),
        ],
        check=True,
    )


def render_video() -> None:
    if OUT_VIDEO_SILENT.exists():
        OUT_VIDEO_SILENT.unlink()
    writer = imageio.get_writer(
        str(OUT_VIDEO_SILENT),
        fps=FPS,
        codec="libx264",
        quality=8,
        macro_block_size=1,
        ffmpeg_params=["-pix_fmt", "yuv420p", "-movflags", "+faststart"],
    )
    try:
        for frame in range(int(DURATION * FPS)):
            writer.append_data(render_frame(frame))
    finally:
        writer.close()


def mux_audio() -> None:
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    if OUT_VIDEO.exists():
        OUT_VIDEO.unlink()
    subprocess.run(
        [
            ffmpeg,
            "-y",
            "-i",
            str(OUT_VIDEO_SILENT),
            "-i",
            str(OUT_AUDIO),
            "-i",
            str(OUT_MUSIC),
            "-filter_complex",
            "[1:a]volume=1.0[a1];[2:a]volume=0.16[a2];[a1][a2]amix=inputs=2:duration=first:dropout_transition=2[a]",
            "-map",
            "0:v:0",
            "-map",
            "[a]",
            "-c:v",
            "copy",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-shortest",
            "-movflags",
            "+faststart",
            str(OUT_VIDEO),
        ],
        check=True,
    )


def write_thumbnail() -> None:
    frame = Image.fromarray(render_frame(90))
    frame.save(OUT_THUMB)


def main() -> None:
    os.environ.setdefault("IMAGEIO_FFMPEG_EXE", imageio_ffmpeg.get_ffmpeg_exe())
    generate_voiceover()
    write_background_music()
    render_video()
    mux_audio()
    write_thumbnail()
    print(f"Video: {OUT_VIDEO}")
    print(f"Thumbnail: {OUT_THUMB}")
    print(f"Voiceover script: {OUT_SCRIPT}")


if __name__ == "__main__":
    main()
