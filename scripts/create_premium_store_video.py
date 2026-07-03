from __future__ import annotations

import argparse
import math
import os
import random
import subprocess
import wave
from pathlib import Path

import imageio.v2 as imageio
import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(r"D:\Downloads\my_gallary")
ASSETS = ROOT / "playstore-assets"
VIDEO_DIR = ASSETS / "video"
VIDEO_DIR.mkdir(parents=True, exist_ok=True)

OUT_VIDEO_SILENT = VIDEO_DIR / "memolens-premium-store-video-silent.mp4"
OUT_VIDEO = VIDEO_DIR / "memolens-premium-store-video.mp4"
OUT_AUDIO = VIDEO_DIR / "memolens-premium-voiceover.mp3"
OUT_MUSIC = VIDEO_DIR / "memolens-premium-background.wav"
OUT_SCRIPT = VIDEO_DIR / "premium-voiceover-script.txt"
OUT_THUMB = VIDEO_DIR / "memolens-premium-youtube-thumbnail.png"
PREVIEW_DIR = VIDEO_DIR / "premium-preview-frames"

WIDTH = 1920
HEIGHT = 1080
FPS = 30
DURATION = 58.0

PHONE_HOME = ASSETS / "phone-screenshots" / "01-home.png"
PHONE_CREATE = ASSETS / "phone-screenshots" / "02-create-memory.png"
PHONE_DETAIL = ASSETS / "phone-screenshots" / "03-memory-detail.png"
PHONE_SEARCH = ASSETS / "phone-screenshots" / "04-search.png"
APP_ICON = ASSETS / "app-icon-512.png"

VOICEOVER = (
    "Some photos deserve more than a place in the camera roll. "
    "MemoLens helps you save the story around the moment. "
    "Open the app, choose camera or gallery, and add the photo. "
    "Then write a caption, or tap the mic and speak naturally while MemoLens turns your words into text. "
    "If the real sound matters, record a private voice note too: a message, a laugh, or the feeling behind the day. "
    "Add a mood, add tags, mark favorites, and use search to find memories again by caption, mood, or tag. "
    "In this version, your saved memories stay on this device until you delete them. "
    "When you want to share, MemoLens creates a clean memory image you can send to other apps. "
    "MemoLens. Save the photo. Keep the feeling."
)

SCENES = [
    {
        "start": 0.0,
        "end": 5.5,
        "kind": "hook",
        "title": "Some photos deserve a story.",
        "subtitle": "MemoLens keeps the photo, caption, mood, tags, and voice note together.",
    },
    {
        "start": 5.5,
        "end": 14.5,
        "kind": "feature",
        "image": PHONE_HOME,
        "label": "Home",
        "title": "A calmer memory space",
        "subtitle": "Save photos with the feeling behind them, not just the file.",
        "chips": ["Photos", "Captions", "Moods", "Tags"],
        "focus": "grid",
    },
    {
        "start": 14.5,
        "end": 24.0,
        "kind": "feature",
        "image": PHONE_CREATE,
        "label": "Create",
        "title": "Capture the moment fast",
        "subtitle": "Add a photo, dictate a caption, and record a private voice note.",
        "chips": ["Camera", "Speech to text", "Voice note"],
        "focus": "voice",
    },
    {
        "start": 24.0,
        "end": 33.5,
        "kind": "voice",
        "image": PHONE_DETAIL,
        "label": "Voice",
        "title": "Keep the real sound",
        "subtitle": "Save a laugh, a message, or the feeling behind the memory.",
        "chips": ["Private voice", "Playback", "Favorites"],
    },
    {
        "start": 33.5,
        "end": 43.0,
        "kind": "feature",
        "image": PHONE_SEARCH,
        "label": "Search",
        "title": "Find it again later",
        "subtitle": "Search captions, moods, and tags when the memory matters.",
        "chips": ["Search", "Moods", "Tags"],
        "focus": "search",
    },
    {
        "start": 43.0,
        "end": 51.5,
        "kind": "privacy",
        "title": "Private by design",
        "subtitle": "In this version, saved memories stay on the device until you delete them.",
        "chips": ["Local storage", "Delete anytime", "Share only when you choose"],
    },
    {
        "start": 51.5,
        "end": 58.0,
        "kind": "outro",
        "title": "MemoLens",
        "subtitle": "Save the photo. Keep the feeling.",
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


TITLE = font(78, True)
TITLE_BIG = font(92, True)
SUBTITLE = font(36)
BODY = font(31)
SMALL = font(24, True)
TINY = font(20)


def clamp(x: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, x))


def ease_out(x: float) -> float:
    x = clamp(x)
    return 1 - pow(1 - x, 3)


def ease_in_out(x: float) -> float:
    x = clamp(x)
    return x * x * (3 - 2 * x)


def scene_progress(scene: dict, t: float) -> float:
    return clamp((t - scene["start"]) / max(0.001, scene["end"] - scene["start"]))


def alpha_for_scene(scene: dict, t: float) -> float:
    p = scene_progress(scene, t)
    fade_in = ease_out(p / 0.14)
    fade_out = ease_out((1 - p) / 0.12)
    return min(fade_in, fade_out)


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def paste_alpha(base: Image.Image, layer: Image.Image, xy: tuple[int, int], alpha: float = 1.0) -> None:
    if alpha < 0.99:
        layer = layer.copy()
        a = layer.getchannel("A").point(lambda v: int(v * alpha))
        layer.putalpha(a)
    base.alpha_composite(layer, xy)


def draw_wrapped(
    draw: ImageDraw.ImageDraw,
    text: str,
    xy: tuple[int, int],
    max_width: int,
    fill: tuple[int, int, int, int],
    text_font: ImageFont.FreeTypeFont,
    line_gap: int = 8,
) -> int:
    x, y = xy
    words = text.split()
    line = ""
    for word in words:
        trial = word if not line else f"{line} {word}"
        if draw.textlength(trial, font=text_font) <= max_width:
            line = trial
            continue
        draw.text((x, y), line, fill=fill, font=text_font)
        y += text_font.size + line_gap
        line = word
    if line:
        draw.text((x, y), line, fill=fill, font=text_font)
        y += text_font.size + line_gap
    return y


def background(t: float) -> Image.Image:
    yy = np.linspace(0, 1, HEIGHT, dtype=np.float32)[:, None]
    xx = np.linspace(0, 1, WIDTH, dtype=np.float32)[None, :]
    pulse = 0.5 + 0.5 * math.sin(t * 0.45)
    r = 8 + 24 * yy + 34 * pulse * xx
    g = 8 + 10 * xx + 11 * yy
    b = 18 + 40 * xx + 32 * yy
    arr = np.stack([r, g, b], axis=2).clip(0, 255).astype(np.uint8)
    img = Image.fromarray(arr, "RGB").convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")

    # Wide cinematic light sweeps.
    sweep_x = int((t * 55) % (WIDTH + 500)) - 250
    draw.polygon(
        [(sweep_x, 0), (sweep_x + 210, 0), (sweep_x - 250, HEIGHT), (sweep_x - 520, HEIGHT)],
        fill=(128, 66, 255, 34),
    )
    draw.polygon(
        [(WIDTH - sweep_x, 0), (WIDTH - sweep_x + 180, 0), (WIDTH - sweep_x - 310, HEIGHT), (WIDTH - sweep_x - 540, HEIGHT)],
        fill=(0, 215, 235, 24),
    )

    for i, (x, y, size, speed, color) in enumerate(PARTICLES):
        px = int((x + t * speed * 35) % (WIDTH + 120) - 60)
        py = int((y + math.sin(t * speed + i) * 18) % HEIGHT)
        draw.ellipse((px, py, px + size, py + size), fill=color)
    return img


def glass_panel(size: tuple[int, int], radius: int = 44, opacity: int = 188) -> Image.Image:
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")
    draw.rounded_rectangle(
        (0, 0, size[0] - 1, size[1] - 1),
        radius=radius,
        fill=(17, 18, 31, opacity),
        outline=(255, 255, 255, 34),
        width=2,
    )
    draw.rounded_rectangle(
        (2, 2, size[0] - 3, int(size[1] * 0.42)),
        radius=radius,
        fill=(255, 255, 255, 14),
    )
    return layer


def load_phone(path: Path, height: int) -> Image.Image:
    src = Image.open(path).convert("RGBA")
    width = int(src.width * height / src.height)
    screen = src.resize((width, height), Image.Resampling.LANCZOS)
    frame = Image.new("RGBA", (width + 36, height + 36), (0, 0, 0, 0))
    draw = ImageDraw.Draw(frame, "RGBA")
    draw.rounded_rectangle((0, 0, frame.width - 1, frame.height - 1), radius=66, fill=(7, 8, 13, 255))
    frame.paste(screen, (18, 18), rounded_mask(screen.size, 48))
    draw.rounded_rectangle((0, 0, frame.width - 1, frame.height - 1), radius=66, outline=(255, 255, 255, 48), width=2)
    draw.rounded_rectangle((frame.width // 2 - 48, 12, frame.width // 2 + 48, 20), radius=4, fill=(255, 255, 255, 36))
    return frame


def phone_layer(path: Path, height: int, rotation: float = 0.0) -> Image.Image:
    phone = load_phone(path, height)
    shadow = Image.new("RGBA", phone.size, (0, 0, 0, 170)).filter(ImageFilter.GaussianBlur(32))
    comp = Image.new("RGBA", (phone.width + 90, phone.height + 110), (0, 0, 0, 0))
    comp.alpha_composite(shadow, (56, 72))
    comp.alpha_composite(phone, (30, 20))
    if rotation:
        comp = comp.rotate(rotation, resample=Image.Resampling.BICUBIC, expand=True)
    return comp


def draw_chip(draw: ImageDraw.ImageDraw, x: int, y: int, text: str, fill=(24, 23, 39, 232)) -> int:
    tw = int(draw.textlength(text, font=SMALL))
    w = tw + 42
    draw.rounded_rectangle((x, y, x + w, y + 44), radius=22, fill=fill, outline=(255, 255, 255, 40), width=1)
    draw.text((x + 21, y + 10), text, fill=(255, 238, 247, 255), font=SMALL)
    return x + w + 14


def draw_label(draw: ImageDraw.ImageDraw, x: int, y: int, label: str) -> None:
    tw = int(draw.textlength(label.upper(), font=TINY))
    draw.rounded_rectangle((x, y, x + tw + 34, y + 36), radius=18, fill=(255, 112, 151, 44), outline=(255, 112, 151, 150), width=1)
    draw.text((x + 17, y + 8), label.upper(), fill=(255, 166, 191, 255), font=TINY)


def draw_title_block(
    draw: ImageDraw.ImageDraw,
    x: int,
    y: int,
    label: str | None,
    title: str,
    subtitle: str,
    chips: list[str] | None,
    max_width: int = 680,
) -> None:
    if label:
        draw_label(draw, x, y, label)
        y += 64
    y = draw_wrapped(draw, title, (x, y), max_width, (255, 255, 255, 255), TITLE, line_gap=10)
    y += 14
    y = draw_wrapped(draw, subtitle, (x, y), max_width, (220, 212, 232, 255), SUBTITLE, line_gap=8)
    if chips:
        y += 32
        cx = x
        for chip in chips:
            cx = draw_chip(draw, cx, y, chip)


def focus_overlay(base: Image.Image, kind: str, t: float, alpha: float) -> None:
    draw = ImageDraw.Draw(base, "RGBA")
    pulse = int((0.55 + 0.45 * math.sin(t * 5.2)) * 210 * alpha)
    color = (255, 118, 158, pulse)
    if kind == "grid":
        draw.rounded_rectangle((1152, 624, 1595, 820), radius=28, outline=color, width=6)
    elif kind == "voice":
        draw.ellipse((1404, 655, 1512, 763), outline=color, width=8)
        for i in range(13):
            h = 24 + int(45 * abs(math.sin(t * 5 + i * 0.8)))
            x = 1268 + i * 24
            draw.rounded_rectangle((x, 760 - h // 2, x + 10, 760 + h // 2), radius=5, fill=(35, 229, 242, int(120 * alpha)))
    elif kind == "search":
        draw.rounded_rectangle((1150, 235, 1650, 318), radius=34, outline=color, width=6)


def render_hook(scene: dict, t: float, p: float, alpha: float) -> Image.Image:
    frame = background(t)
    layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")
    draw.rounded_rectangle((98, 102, 1822, 978), radius=58, fill=(0, 0, 0, 36), outline=(255, 255, 255, 28), width=1)

    phones = [
        (PHONE_HOME, 618, -8, 930, 150),
        (PHONE_CREATE, 690, 0, 1178, 122),
        (PHONE_DETAIL, 618, 8, 1448, 150),
    ]
    for img, h, rot, x, y in phones:
        ph = phone_layer(img, h, rot)
        paste_alpha(layer, ph, (x + int((1 - ease_out(p)) * 190), y), alpha)

    icon = Image.open(APP_ICON).convert("RGBA").resize((118, 118), Image.Resampling.LANCZOS)
    paste_alpha(layer, icon, (172, 216), alpha)
    draw.text((312, 220), "MemoLens", fill=(255, 255, 255, int(255 * alpha)), font=TITLE)
    draw_wrapped(draw, scene["title"], (172, 394), 710, (255, 255, 255, int(255 * alpha)), TITLE_BIG, 12)
    draw_wrapped(draw, scene["subtitle"], (176, 620), 720, (222, 214, 233, int(255 * alpha)), SUBTITLE, 8)
    return Image.alpha_composite(frame, layer)


def render_feature(scene: dict, t: float, p: float, alpha: float) -> Image.Image:
    frame = background(t)
    layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")

    phone = phone_layer(scene["image"], 802, rotation=-1.2 + math.sin(t * 0.8) * 0.45)
    phone_x = 1072 + int((1 - ease_out(p)) * 120)
    paste_alpha(layer, phone, (phone_x, 96), alpha)

    panel = glass_panel((792, 560), 46, 176)
    paste_alpha(layer, panel, (126, 260), alpha)
    draw_title_block(draw, 180, 320, scene["label"], scene["title"], scene["subtitle"], scene["chips"], 640)
    focus_overlay(layer, scene["focus"], t, alpha)
    return Image.alpha_composite(frame, layer)


def render_voice(scene: dict, t: float, p: float, alpha: float) -> Image.Image:
    frame = background(t)
    layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")

    left = phone_layer(PHONE_DETAIL, 792, rotation=1.6)
    paste_alpha(layer, left, (110, 108 + int(math.sin(t * 0.9) * 10)), alpha)
    panel = glass_panel((760, 580), 46, 178)
    paste_alpha(layer, panel, (1020, 248), alpha)
    draw_title_block(draw, 1076, 306, scene["label"], scene["title"], scene["subtitle"], scene["chips"], 620)

    wy = 706
    draw.rounded_rectangle((1076, wy - 58, 1690, wy + 88), radius=38, fill=(16, 18, 31, int(230 * alpha)), outline=(255, 255, 255, int(44 * alpha)), width=2)
    draw.ellipse((1120, wy - 24, 1200, wy + 56), fill=(170, 64, 255, int(240 * alpha)))
    draw.polygon((1153, wy + 1, 1153, wy + 33, 1179, wy + 17), fill=(255, 255, 255, int(240 * alpha)))
    for i in range(18):
        h = 20 + int(60 * abs(math.sin(t * 4.8 + i * 0.62)))
        x = 1250 + i * 22
        draw.rounded_rectangle((x, wy + 17 - h // 2, x + 10, wy + 17 + h // 2), radius=5, fill=(216, 205, 229, int(150 * alpha)))
    return Image.alpha_composite(frame, layer)


def render_privacy(scene: dict, t: float, p: float, alpha: float) -> Image.Image:
    frame = background(t)
    layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")

    panel = glass_panel((900, 602), 50, 178)
    paste_alpha(layer, panel, (510, 220), alpha)
    shield_x, shield_y = 858, 286
    draw.polygon(
        [
            (shield_x + 98, shield_y),
            (shield_x + 196, shield_y + 36),
            (shield_x + 174, shield_y + 178),
            (shield_x + 98, shield_y + 244),
            (shield_x + 22, shield_y + 178),
            (shield_x, shield_y + 36),
        ],
        fill=(41, 229, 196, int(52 * alpha)),
        outline=(41, 229, 196, int(170 * alpha)),
    )
    draw.line((shield_x + 62, shield_y + 124, shield_x + 92, shield_y + 156, shield_x + 143, shield_y + 92), fill=(255, 255, 255, int(240 * alpha)), width=10)
    draw_title_block(draw, 594, 568, None, scene["title"], scene["subtitle"], scene["chips"], 760)
    return Image.alpha_composite(frame, layer)


def render_outro(scene: dict, t: float, p: float, alpha: float) -> Image.Image:
    frame = background(t)
    layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")

    icon_size = int(132 + 24 * ease_out(p))
    icon = Image.open(APP_ICON).convert("RGBA").resize((icon_size, icon_size), Image.Resampling.LANCZOS)
    paste_alpha(layer, icon, ((WIDTH - icon_size) // 2, 246), alpha)

    tw = draw.textlength(scene["title"], font=TITLE_BIG)
    sw = draw.textlength(scene["subtitle"], font=SUBTITLE)
    draw.text(((WIDTH - tw) / 2, 438), scene["title"], fill=(255, 255, 255, int(255 * alpha)), font=TITLE_BIG)
    draw.text(((WIDTH - sw) / 2, 554), scene["subtitle"], fill=(255, 194, 219, int(255 * alpha)), font=SUBTITLE)
    x = (WIDTH - 620) // 2
    y = 656
    draw.rounded_rectangle((x, y, x + 620, y + 76), radius=38, fill=(39, 24, 48, int(236 * alpha)), outline=(255, 112, 151, int(124 * alpha)), width=2)
    cta = "Private photo memories for Android"
    cw = draw.textlength(cta, font=BODY)
    draw.text((x + (620 - cw) / 2, y + 21), cta, fill=(255, 246, 250, int(255 * alpha)), font=BODY)
    return Image.alpha_composite(frame, layer)


def render_frame(frame_index: int) -> np.ndarray:
    t = min(DURATION - 0.001, frame_index / FPS)
    scene = next(s for s in SCENES if s["start"] <= t < s["end"])
    p = scene_progress(scene, t)
    alpha = alpha_for_scene(scene, t)
    if scene["kind"] == "hook":
        frame = render_hook(scene, t, p, alpha)
    elif scene["kind"] == "voice":
        frame = render_voice(scene, t, p, alpha)
    elif scene["kind"] == "privacy":
        frame = render_privacy(scene, t, p, alpha)
    elif scene["kind"] == "outro":
        frame = render_outro(scene, t, p, alpha)
    else:
        frame = render_feature(scene, t, p, alpha)
    return np.asarray(frame.convert("RGB"))


def write_background_music() -> None:
    sample_rate = 44100
    total = int(DURATION * sample_rate)
    t = np.linspace(0, DURATION, total, endpoint=False)
    audio = np.zeros(total, dtype=np.float32)
    chord_cycle = [
        (146.83, 196.00, 246.94, 293.66),
        (164.81, 207.65, 261.63, 329.63),
        (130.81, 196.00, 261.63, 392.00),
        (174.61, 220.00, 293.66, 349.23),
    ]
    section = DURATION / len(chord_cycle)
    for idx, chord in enumerate(chord_cycle):
        start = int(idx * section * sample_rate)
        end = int((idx + 1) * section * sample_rate)
        tt = t[start:end]
        pad = np.zeros_like(tt)
        for freq in chord:
            pad += np.sin(2 * np.pi * freq * tt) + 0.35 * np.sin(2 * np.pi * freq * 2 * tt)
        pad /= len(chord) * 1.35
        fade = np.minimum(np.linspace(0, 1, len(pad)), np.linspace(1, 0, len(pad)))
        fade = np.clip(fade * 5, 0, 1)
        audio[start:end] += pad * fade * 0.038

    pulse = (np.sin(2 * np.pi * 1.55 * t) > 0.92).astype(np.float32)
    pulse = np.convolve(pulse, np.ones(360) / 360, mode="same")
    audio += pulse * 0.012
    shimmer = np.sin(2 * np.pi * 880 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.17 * t))
    audio += shimmer * 0.004
    audio *= 0.9
    pcm = np.int16(audio.clip(-1, 1) * 32767)
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
            "en-GB-SoniaNeural",
            "--rate=-2%",
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
        quality=9,
        macro_block_size=1,
        ffmpeg_params=["-pix_fmt", "yuv420p", "-movflags", "+faststart"],
    )
    try:
        total_frames = int(DURATION * FPS)
        for idx in range(total_frames):
            if idx % (FPS * 5) == 0:
                print(f"Rendered {idx // FPS:02d}s / {int(DURATION)}s")
            writer.append_data(render_frame(idx))
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
            "[1:a]volume=1.0[a1];[2:a]volume=0.18[a2];[a1][a2]amix=inputs=2:duration=longest:dropout_transition=2[a]",
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
            "-movflags",
            "+faststart",
            str(OUT_VIDEO),
        ],
        check=True,
    )


def write_thumbnail() -> None:
    Image.fromarray(render_frame(int(2.4 * FPS))).save(OUT_THUMB)


def write_preview_frames() -> None:
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    for seconds in (2.4, 8.0, 18.0, 28.0, 38.0, 46.0, 54.0):
        Image.fromarray(render_frame(int(seconds * FPS))).save(PREVIEW_DIR / f"{seconds:04.1f}s.png")
    print(f"Preview frames: {PREVIEW_DIR}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--preview", action="store_true", help="Write preview frames only.")
    parser.add_argument("--mux-only", action="store_true", help="Regenerate audio and mux with the existing silent render.")
    args = parser.parse_args()

    os.environ.setdefault("IMAGEIO_FFMPEG_EXE", imageio_ffmpeg.get_ffmpeg_exe())
    if args.preview:
        write_preview_frames()
        write_thumbnail()
        print(f"Thumbnail: {OUT_THUMB}")
        return
    if args.mux_only:
        generate_voiceover()
        write_background_music()
        mux_audio()
        write_thumbnail()
        write_preview_frames()
        print(f"Video: {OUT_VIDEO}")
        print(f"Thumbnail: {OUT_THUMB}")
        print(f"Voiceover script: {OUT_SCRIPT}")
        return

    generate_voiceover()
    write_background_music()
    render_video()
    mux_audio()
    write_thumbnail()
    write_preview_frames()
    print(f"Video: {OUT_VIDEO}")
    print(f"Thumbnail: {OUT_THUMB}")
    print(f"Voiceover script: {OUT_SCRIPT}")


random.seed(42)
PARTICLES = [
    (
        random.randint(0, WIDTH),
        random.randint(0, HEIGHT),
        random.randint(2, 5),
        random.uniform(0.18, 0.62),
        random.choice(
            [
                (255, 116, 150, 34),
                (172, 77, 255, 34),
                (42, 226, 236, 30),
                (255, 183, 96, 24),
            ]
        ),
    )
    for _ in range(110)
]


if __name__ == "__main__":
    main()
