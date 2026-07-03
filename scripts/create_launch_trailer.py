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

WIDTH = 1920
HEIGHT = 1080
FPS = 30
DURATION = 42.0
OPENER_DURATION = 4.0

OPENER_VIDEO = VIDEO_DIR / "higgsfield-veo-opener.mp4"
OUT_VIDEO_SILENT = VIDEO_DIR / "memolens-launch-trailer-silent.mp4"
OUT_VIDEO = VIDEO_DIR / "memolens-launch-trailer.mp4"
OUT_AUDIO = VIDEO_DIR / "memolens-launch-voiceover.mp3"
OUT_MUSIC = VIDEO_DIR / "memolens-launch-background.wav"
OUT_SCRIPT = VIDEO_DIR / "launch-voiceover-script.txt"
OUT_THUMB = VIDEO_DIR / "memolens-launch-youtube-thumbnail.png"
PREVIEW_DIR = VIDEO_DIR / "launch-preview-frames"

PHONE_HOME = ASSETS / "phone-screenshots" / "01-home.png"
PHONE_CREATE = ASSETS / "phone-screenshots" / "02-create-memory.png"
PHONE_DETAIL = ASSETS / "phone-screenshots" / "03-memory-detail.png"
PHONE_SEARCH = ASSETS / "phone-screenshots" / "04-search.png"
APP_ICON = ASSETS / "app-icon-512.png"

VOICEOVER = (
    "Some photos deserve more than a place in the camera roll. "
    "MemoLens keeps the photo, caption, mood, tags, and voice notes together. "
    "Add a photo from your camera or gallery, then type the story, or tap the mic and speak naturally. "
    "If the real sound matters, record a private voice note too. "
    "Search by caption, mood, or tag, mark favorites, and share a clean memory image when you want to. "
    "In this version, memories stay on your device until you delete them. "
    "MemoLens. Save the photo. Keep the feeling."
)

SCENES = [
    {
        "start": 4.0,
        "end": 10.0,
        "image": PHONE_HOME,
        "label": "Memory Space",
        "title": "A calmer place for moments",
        "subtitle": "Photos, captions, moods, tags, and voice notes stay together.",
        "chips": ["Photos", "Moods", "Tags"],
        "focus": "home",
        "side": "right",
    },
    {
        "start": 10.0,
        "end": 16.5,
        "image": PHONE_CREATE,
        "label": "Create",
        "title": "Add the story fast",
        "subtitle": "Choose a photo, type a caption, or speak naturally.",
        "chips": ["Camera", "Gallery", "Dictation"],
        "focus": "create",
        "side": "left",
    },
    {
        "start": 16.5,
        "end": 23.0,
        "image": PHONE_DETAIL,
        "label": "Voice Note",
        "title": "Keep the real sound",
        "subtitle": "Save a private voice note when the moment needs more than text.",
        "chips": ["Private audio", "Playback", "Favorites"],
        "focus": "voice",
        "side": "right",
    },
    {
        "start": 23.0,
        "end": 29.5,
        "image": PHONE_SEARCH,
        "label": "Search",
        "title": "Find it again later",
        "subtitle": "Search captions, moods, and tags when the memory matters.",
        "chips": ["Search", "Captions", "Tags"],
        "focus": "search",
        "side": "left",
    },
    {
        "start": 29.5,
        "end": 36.0,
        "image": PHONE_DETAIL,
        "label": "Share",
        "title": "Share only when you choose",
        "subtitle": "Create a clean memory image for other apps while the saved memory stays yours.",
        "chips": ["Clean image", "Local storage", "Delete anytime"],
        "focus": "share",
        "side": "right",
    },
    {
        "start": 36.0,
        "end": 42.0,
        "kind": "outro",
        "title": "MemoLens",
        "subtitle": "Save the photo. Keep the feeling.",
        "caption": "Private photo memories for Android.",
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


TITLE = font(70, True)
TITLE_BIG = font(92, True)
SUBTITLE = font(34)
BODY = font(30)
SMALL = font(24, True)
TINY = font(18, True)


def clamp(x: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, x))


def ease_out(x: float) -> float:
    x = clamp(x)
    return 1 - pow(1 - x, 3)


def ease_in_out(x: float) -> float:
    x = clamp(x)
    return x * x * (3 - 2 * x)


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


def load_opener_frames() -> list[Image.Image]:
    if not OPENER_VIDEO.exists():
        return []
    frames: list[Image.Image] = []
    reader = imageio.get_reader(str(OPENER_VIDEO))
    try:
        for frame in reader:
            img = Image.fromarray(frame).convert("RGBA")
            img = img.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
            frames.append(img)
    finally:
        reader.close()
    return frames


def background(t: float) -> Image.Image:
    yy = np.linspace(0, 1, HEIGHT, dtype=np.float32)[:, None]
    xx = np.linspace(0, 1, WIDTH, dtype=np.float32)[None, :]
    pulse = 0.5 + 0.5 * math.sin(t * 0.52)
    r = 7 + 22 * yy + 18 * pulse * xx
    g = 7 + 8 * xx + 10 * yy
    b = 18 + 44 * xx + 30 * yy
    arr = np.stack([r, g, b], axis=2).clip(0, 255).astype(np.uint8)
    img = Image.fromarray(arr, "RGB").convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")

    sweep = int((t * 72) % (WIDTH + 540)) - 270
    draw.polygon([(sweep, 0), (sweep + 190, 0), (sweep - 320, HEIGHT), (sweep - 560, HEIGHT)], fill=(170, 66, 255, 28))
    draw.polygon([(WIDTH - sweep, 0), (WIDTH - sweep + 160, 0), (WIDTH - sweep - 340, HEIGHT), (WIDTH - sweep - 560, HEIGHT)], fill=(0, 219, 231, 22))
    draw.ellipse((-250, -180, 500, 520), fill=(106, 54, 206, 72))
    draw.ellipse((1420, 530, 2120, 1220), fill=(255, 88, 126, 56))

    for i, (x, y, size, speed, color) in enumerate(PARTICLES):
        px = int((x + t * speed * 42) % (WIDTH + 120) - 60)
        py = int((y + math.sin(t * speed + i) * 16) % HEIGHT)
        draw.ellipse((px, py, px + size, py + size), fill=color)
    return img


def phone_layer(path: Path, height: int, rotation: float = 0.0) -> Image.Image:
    src = Image.open(path).convert("RGBA")
    width = int(src.width * height / src.height)
    screen = src.resize((width, height), Image.Resampling.LANCZOS)

    phone = Image.new("RGBA", (width + 38, height + 38), (0, 0, 0, 0))
    draw = ImageDraw.Draw(phone, "RGBA")
    draw.rounded_rectangle((0, 0, phone.width - 1, phone.height - 1), radius=66, fill=(7, 8, 13, 255))
    phone.paste(screen, (19, 19), rounded_mask(screen.size, 48))
    draw.rounded_rectangle((0, 0, phone.width - 1, phone.height - 1), radius=66, outline=(255, 255, 255, 48), width=2)
    draw.rounded_rectangle((phone.width // 2 - 42, 12, phone.width // 2 + 42, 21), radius=5, fill=(255, 255, 255, 36))

    shadow = Image.new("RGBA", phone.size, (0, 0, 0, 185)).filter(ImageFilter.GaussianBlur(34))
    comp = Image.new("RGBA", (phone.width + 96, phone.height + 120), (0, 0, 0, 0))
    comp.alpha_composite(shadow, (58, 78))
    comp.alpha_composite(phone, (28, 18))
    if rotation:
        comp = comp.rotate(rotation, resample=Image.Resampling.BICUBIC, expand=True)
    return comp


def draw_chip(draw: ImageDraw.ImageDraw, x: int, y: int, text: str) -> int:
    tw = int(draw.textlength(text, font=SMALL))
    w = tw + 40
    draw.rounded_rectangle((x, y, x + w, y + 44), radius=22, fill=(22, 21, 36, 232), outline=(255, 255, 255, 45), width=1)
    draw.text((x + 20, y + 9), text, fill=(255, 239, 247, 255), font=SMALL)
    return x + w + 14


def draw_label(draw: ImageDraw.ImageDraw, x: int, y: int, label: str) -> None:
    text = label.upper()
    tw = int(draw.textlength(text, font=TINY))
    draw.rounded_rectangle((x, y, x + tw + 34, y + 36), radius=18, fill=(255, 112, 151, 48), outline=(255, 112, 151, 150), width=1)
    draw.text((x + 17, y + 8), text, fill=(255, 168, 192, 255), font=TINY)


def draw_copy(draw: ImageDraw.ImageDraw, x: int, y: int, scene: dict) -> None:
    draw.rounded_rectangle(
        (x - 34, y - 34, x + 720, y + 416),
        radius=38,
        fill=(5, 6, 13, 142),
        outline=(255, 255, 255, 18),
        width=1,
    )
    draw_label(draw, x, y, scene["label"])
    y += 64
    y = draw_wrapped(draw, scene["title"], (x, y), 650, (255, 255, 255, 255), TITLE, line_gap=10)
    y += 16
    y = draw_wrapped(draw, scene["subtitle"], (x, y), 650, (222, 214, 232, 255), SUBTITLE, line_gap=8)
    y += 28
    cx = x
    for chip in scene["chips"]:
        cx = draw_chip(draw, cx, y, chip)


def focus_overlay(layer: Image.Image, kind: str, t: float, alpha: float) -> None:
    draw = ImageDraw.Draw(layer, "RGBA")
    pulse = int((0.58 + 0.42 * math.sin(t * 5.0)) * 210 * alpha)
    pink = (255, 114, 153, pulse)
    teal = (35, 229, 242, int(130 * alpha))

    if kind == "home":
        draw.rounded_rectangle((1210, 610, 1660, 812), radius=30, outline=pink, width=6)
    elif kind == "create":
        draw.ellipse((390, 654, 506, 770), outline=pink, width=8)
        for i in range(14):
            h = 24 + int(46 * abs(math.sin(t * 5 + i * 0.72)))
            x = 248 + i * 24
            draw.rounded_rectangle((x, 796 - h // 2, x + 10, 796 + h // 2), radius=5, fill=teal)
    elif kind == "voice":
        draw.rounded_rectangle((1240, 676, 1684, 806), radius=42, outline=pink, width=6)
        for i in range(18):
            h = 22 + int(62 * abs(math.sin(t * 4.8 + i * 0.64)))
            x = 1350 + i * 22
            draw.rounded_rectangle((x, 738 - h // 2, x + 10, 738 + h // 2), radius=5, fill=(216, 205, 229, int(150 * alpha)))
    elif kind == "search":
        draw.rounded_rectangle((255, 272, 732, 364), radius=35, outline=pink, width=6)
    elif kind == "share":
        draw.rounded_rectangle((1295, 818, 1465, 918), radius=24, outline=pink, width=6)


def render_feature(scene: dict, t: float) -> Image.Image:
    p = clamp((t - scene["start"]) / (scene["end"] - scene["start"]))
    frame = background(t)
    layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")

    if scene["side"] == "right":
        phone = phone_layer(scene["image"], 804, rotation=-1.2 + math.sin(t * 0.78) * 0.4)
        phone_x = 1088 + int((1 - ease_out(p)) * 130)
        paste_alpha(layer, phone, (phone_x, 94))
        draw_copy(draw, 150, 322, scene)
    else:
        phone = phone_layer(scene["image"], 804, rotation=1.1 + math.sin(t * 0.78) * 0.38)
        phone_x = 154 - int((1 - ease_out(p)) * 130)
        paste_alpha(layer, phone, (phone_x, 94))
        draw_copy(draw, 1040, 322, scene)

    focus_overlay(layer, scene["focus"], t, 1.0)
    return Image.alpha_composite(frame, layer)


def render_outro(scene: dict, t: float) -> Image.Image:
    p = clamp((t - scene["start"]) / (scene["end"] - scene["start"]))
    frame = background(t)
    layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")

    icon_size = int(136 + 20 * ease_out(p))
    icon = Image.open(APP_ICON).convert("RGBA").resize((icon_size, icon_size), Image.Resampling.LANCZOS)
    paste_alpha(layer, icon, ((WIDTH - icon_size) // 2, 232))

    title_w = draw.textlength(scene["title"], font=TITLE_BIG)
    sub_w = draw.textlength(scene["subtitle"], font=SUBTITLE)
    cap_w = draw.textlength(scene["caption"], font=BODY)
    draw.text(((WIDTH - title_w) / 2, 426), scene["title"], fill=(255, 255, 255, 255), font=TITLE_BIG)
    draw.text(((WIDTH - sub_w) / 2, 548), scene["subtitle"], fill=(255, 194, 219, 255), font=SUBTITLE)
    draw.text(((WIDTH - cap_w) / 2, 628), scene["caption"], fill=(222, 214, 232, 255), font=BODY)
    return Image.alpha_composite(frame, layer)


OPENER_FRAMES: list[Image.Image] = []


def opener_frame(t: float) -> Image.Image:
    if not OPENER_FRAMES:
        return background(t)
    idx = min(len(OPENER_FRAMES) - 1, int((t / OPENER_DURATION) * len(OPENER_FRAMES)))
    img = OPENER_FRAMES[idx].copy()
    if t > 3.55:
        fade = clamp((t - 3.55) / 0.45)
        next_frame = render_feature(SCENES[0], 4.0 + fade * 0.45)
        img = Image.blend(img.convert("RGBA"), next_frame.convert("RGBA"), ease_in_out(fade))
    return img


def render_frame(frame_index: int) -> np.ndarray:
    t = min(DURATION - 0.001, frame_index / FPS)
    if t < OPENER_DURATION:
        frame = opener_frame(t)
    else:
        scene = next(s for s in SCENES if s["start"] <= t < s["end"])
        if scene.get("kind") == "outro":
            frame = render_outro(scene, t)
        else:
            frame = render_feature(scene, t)
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
            pad += np.sin(2 * np.pi * freq * tt) + 0.25 * np.sin(2 * np.pi * freq * 2 * tt)
        pad /= len(chord) * 1.28
        fade = np.minimum(np.linspace(0, 1, len(pad)), np.linspace(1, 0, len(pad)))
        fade = np.clip(fade * 6, 0, 1)
        audio[start:end] += pad * fade * 0.032

    pulse = (np.sin(2 * np.pi * 1.75 * t) > 0.93).astype(np.float32)
    pulse = np.convolve(pulse, np.ones(320) / 320, mode="same")
    audio += pulse * 0.010
    shimmer = np.sin(2 * np.pi * 880 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.2 * t))
    audio += shimmer * 0.0035
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
            "--rate=-1%",
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
            "[1:a]volume=1.0[a1];[2:a]volume=0.16[a2];[a1][a2]amix=inputs=2:duration=longest:dropout_transition=2[a]",
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


def write_preview_frames() -> None:
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    for seconds in (1.0, 5.0, 12.0, 19.0, 26.0, 32.0, 39.0):
        Image.fromarray(render_frame(int(seconds * FPS))).save(PREVIEW_DIR / f"{seconds:04.1f}s.png")
    Image.fromarray(render_frame(int(1.0 * FPS))).save(OUT_THUMB)
    print(f"Preview frames: {PREVIEW_DIR}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--preview", action="store_true", help="Write preview frames only.")
    parser.add_argument("--mux-only", action="store_true", help="Regenerate audio and mux with the existing silent render.")
    args = parser.parse_args()

    os.environ.setdefault("IMAGEIO_FFMPEG_EXE", imageio_ffmpeg.get_ffmpeg_exe())
    global OPENER_FRAMES
    OPENER_FRAMES = load_opener_frames()

    if args.preview:
        write_preview_frames()
        print(f"Thumbnail: {OUT_THUMB}")
        return

    if args.mux_only:
        generate_voiceover()
        write_background_music()
        mux_audio()
        write_preview_frames()
        print(f"Video: {OUT_VIDEO}")
        print(f"Thumbnail: {OUT_THUMB}")
        print(f"Voiceover script: {OUT_SCRIPT}")
        return

    generate_voiceover()
    write_background_music()
    render_video()
    mux_audio()
    write_preview_frames()
    print(f"Video: {OUT_VIDEO}")
    print(f"Thumbnail: {OUT_THUMB}")
    print(f"Voiceover script: {OUT_SCRIPT}")


random.seed(48)
PARTICLES = [
    (
        random.randint(0, WIDTH),
        random.randint(0, HEIGHT),
        random.randint(2, 5),
        random.uniform(0.16, 0.58),
        random.choice(
            [
                (255, 116, 150, 34),
                (172, 77, 255, 34),
                (42, 226, 236, 30),
                (255, 183, 96, 24),
            ]
        ),
    )
    for _ in range(95)
]


if __name__ == "__main__":
    main()
