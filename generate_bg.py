"""
FinVerse AI — Ultra-Premium 4K Background Generator
Style: Apple WWDC x OpenAI x Bloomberg Terminal x Stripe x Vercel
"""
import math
import random
from PIL import Image, ImageDraw, ImageFilter

W, H = 3840, 2160
random.seed(42)

# Colors
MIDNIGHT = (5, 8, 22)
DEEP_NAVY = (8, 26, 58)
ROYAL_BLUE = (37, 99, 235)
ELECTRIC_CYAN = (0, 229, 255)
EMERALD = (16, 185, 129)
PURPLE = (124, 58, 237)

img = Image.new("RGB", (W, H), MIDNIGHT)
draw = ImageDraw.Draw(img)

# === 1. Radial gradient background ===
for y in range(H):
    for x in range(0, W, 4):
        dx = (x - W * 0.5) / W
        dy = (y - H * 0.55) / H
        dist = math.sqrt(dx * dx + dy * dy)
        t = min(dist * 1.2, 1.0)
        r = int(MIDNIGHT[0] * (1 - t) + DEEP_NAVY[0] * t)
        g = int(MIDNIGHT[1] * (1 - t) + DEEP_NAVY[1] * t)
        b = int(MIDNIGHT[2] * (1 - t) + DEEP_NAVY[2] * t)
        draw.rectangle([x, y, x + 3, y], fill=(r, g, b))

print("Step 1: Background gradient done")

# === 2. Subtle grid pattern ===
grid_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(grid_layer)
for x in range(0, W, 120):
    gd.line([(x, 0), (x, H)], fill=(37, 99, 235, 6), width=1)
for y in range(0, H, 120):
    gd.line([(0, y), (W, y)], fill=(37, 99, 235, 6), width=1)
img.paste(Image.alpha_composite(img.convert("RGBA"), grid_layer).convert("RGB"))
print("Step 2: Grid pattern done")

# === 3. Circular radar rings ===
radar_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
rd = ImageDraw.Draw(radar_layer)
centers = [(W * 0.7, H * 0.4), (W * 0.3, H * 0.65)]
for cx, cy in centers:
    for r in range(80, 600, 90):
        alpha = max(3, 18 - r // 50)
        rd.ellipse(
            [cx - r, cy - r, cx + r, cy + r],
            outline=(0, 229, 255, alpha), width=1
        )
    # Cross hairs
    for angle in range(0, 360, 30):
        rad = math.radians(angle)
        ex = cx + 580 * math.cos(rad)
        ey = cy + 580 * math.sin(rad)
        rd.line([(cx, cy), (ex, ey)], fill=(37, 99, 235, 4), width=1)
img.paste(Image.alpha_composite(img.convert("RGBA"), radar_layer).convert("RGB"))
print("Step 3: Radar rings done")

# === 4. Abstract candlestick chart patterns ===
chart_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
cd = ImageDraw.Draw(chart_layer)
base_x, base_y = W * 0.15, H * 0.35
for i in range(40):
    x = base_x + i * 55
    open_p = base_y + random.uniform(-80, 80)
    close_p = open_p + random.uniform(-60, 60)
    high_p = max(open_p, close_p) + random.uniform(10, 40)
    low_p = min(open_p, close_p) - random.uniform(10, 40)
    color = EMERALD if close_p > open_p else (239, 68, 68)
    alpha = random.randint(15, 35)
    cd.line([(x, low_p), (x, high_p)], fill=(*color, alpha), width=2)
    body_top = min(open_p, close_p)
    body_bot = max(open_p, close_p)
    cd.rectangle([x - 8, body_top, x + 8, body_bot], fill=(*color, alpha + 10))
# Volume bars below
for i in range(40):
    x = base_x + i * 55
    h = random.uniform(5, 30)
    alpha = random.randint(8, 18)
    cd.rectangle([x - 6, H * 0.48 - h, x + 6, H * 0.48], fill=(37, 99, 235, alpha))
img.paste(Image.alpha_composite(img.convert("RGBA"), chart_layer).convert("RGB"))
print("Step 4: Candlestick charts done")

# === 5. Flowing market data lines ===
flow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
fd = ImageDraw.Draw(flow_layer)
for line_idx in range(6):
    points = []
    y_base = H * (0.25 + line_idx * 0.1)
    x_start = W * 0.05
    for x in range(0, W, 8):
        t = x / W
        wave = math.sin(t * 6 + line_idx * 1.5) * 40
        wave2 = math.sin(t * 12 + line_idx * 0.8) * 20
        y = y_base + wave + wave2
        points.append((x_start + x, y))
    color = [ELECTRIC_CYAN, ROYAL_BLUE, PURPLE, EMERALD, ELECTRIC_CYAN, ROYAL_BLUE][line_idx]
    alpha = [12, 8, 6, 10, 5, 7][line_idx]
    if len(points) > 1:
        fd.line(points, fill=(*color, alpha), width=2)
img.paste(Image.alpha_composite(img.convert("RGBA"), flow_layer).convert("RGB"))
print("Step 5: Flowing data lines done")

# === 6. AI neural network nodes ===
nn_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
nd = ImageDraw.Draw(nn_layer)
nodes = []
for _ in range(80):
    nx = random.uniform(W * 0.1, W * 0.9)
    ny = random.uniform(H * 0.1, H * 0.9)
    nodes.append((nx, ny))
# Draw connections
for i in range(len(nodes)):
    for j in range(i + 1, len(nodes)):
        dx = nodes[i][0] - nodes[j][0]
        dy = nodes[i][1] - nodes[j][1]
        dist = math.sqrt(dx * dx + dy * dy)
        if dist < 350:
            alpha = int(max(2, 15 - dist / 30))
            nd.line([nodes[i], nodes[j]], fill=(0, 229, 255, alpha), width=1)
# Draw nodes
for nx, ny in nodes:
    r = random.randint(2, 5)
    alpha = random.randint(20, 50)
    nd.ellipse([nx - r, ny - r, nx + r, ny + r], fill=(0, 229, 255, alpha))
    # Glow
    nd.ellipse([nx - r * 3, ny - r * 3, nx + r * 3, ny + r * 3], fill=(0, 229, 255, 4))
img.paste(Image.alpha_composite(img.convert("RGBA"), nn_layer).convert("RGB"))
print("Step 6: Neural network done")

# === 7. World map outline (simplified dots) ===
map_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
md = ImageDraw.Draw(map_layer)
# Simple continent outlines as dot clusters
continents = [
    (W * 0.22, H * 0.35, 180, 120, 60),   # Americas
    (W * 0.48, H * 0.3, 120, 140, 50),     # Europe/Africa
    (W * 0.65, H * 0.38, 200, 100, 55),    # Asia
    (W * 0.75, H * 0.7, 60, 30, 15),       # Australia
]
for cx, cy, rw, rh, count in continents:
    for _ in range(count):
        angle = random.uniform(0, 2 * math.pi)
        r = random.uniform(0, 1)
        x = cx + rw * r * math.cos(angle) * random.uniform(0.3, 1)
        y = cy + rh * r * math.sin(angle) * random.uniform(0.3, 1)
        alpha = random.randint(3, 10)
        md.ellipse([x - 1, y - 1, x + 1, y + 1], fill=(37, 99, 235, alpha))
img.paste(Image.alpha_composite(img.convert("RGBA"), map_layer).convert("RGB"))
print("Step 7: World map done")

# === 8. Floating geometric particles ===
particle_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
pd = ImageDraw.Draw(particle_layer)
for _ in range(300):
    px = random.uniform(0, W)
    py = random.uniform(0, H)
    size = random.uniform(1, 4)
    alpha = random.randint(8, 40)
    color_choice = random.choice([ELECTRIC_CYAN, ROYAL_BLUE, PURPLE, EMERALD])
    if random.random() > 0.6:
        # Diamond
        pts = [(px, py - size), (px + size, py), (px, py + size), (px - size, py)]
        pd.polygon(pts, fill=(*color_choice, alpha))
    else:
        pd.ellipse([px - size, py - size, px + size, py + size], fill=(*color_choice, alpha))
img.paste(Image.alpha_composite(img.convert("RGBA"), particle_layer).convert("RGB"))
print("Step 8: Floating particles done")

# === 9. Glowing orbs (ambient light) ===
orb_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
od = ImageDraw.Draw(orb_layer)
orbs = [
    (W * 0.75, H * 0.2, 500, ELECTRIC_CYAN, 8),
    (W * 0.2, H * 0.7, 400, PURPLE, 6),
    (W * 0.5, H * 0.45, 600, ROYAL_BLUE, 5),
    (W * 0.85, H * 0.75, 350, EMERALD, 4),
    (W * 0.1, H * 0.15, 300, ELECTRIC_CYAN, 5),
]
for ox, oy, radius, color, alpha in orbs:
    od.ellipse([ox - radius, oy - radius, ox + radius, oy + radius], fill=(*color, alpha))
# Apply heavy blur to orbs
orb_layer = orb_layer.filter(ImageFilter.GaussianBlur(radius=120))
img.paste(Image.alpha_composite(img.convert("RGBA"), orb_layer).convert("RGB"))
print("Step 9: Glowing orbs done")

# === 10. Digital financial grid (perspective) ===
persp_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
pdd = ImageDraw.Draw(persp_layer)
vanish_x, vanish_y = W * 0.5, H * 0.35
for i in range(30):
    angle = (i / 30) * math.pi
    ex = vanish_x + 2000 * math.cos(angle)
    ey = vanish_y + 2000 * math.sin(angle)
    pdd.line([(vanish_x, vanish_y), (ex, ey)], fill=(37, 99, 235, 3), width=1)
# Horizontal perspective lines
for i in range(1, 20):
    y = vanish_y + i * 80
    spread = i * 180
    pdd.line([(vanish_x - spread, y), (vanish_x + spread, y)], fill=(0, 229, 255, 3), width=1)
img.paste(Image.alpha_composite(img.convert("RGBA"), persp_layer).convert("RGB"))
print("Step 10: Perspective grid done")

# === 11. Glass reflection highlights ===
glass_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gld = ImageDraw.Draw(glass_layer)
# Top-left highlight
for i in range(20):
    alpha = max(0, 8 - i)
    gld.rectangle([0, i * 3, W, i * 3 + 2], fill=(255, 255, 255, alpha))
# Bottom subtle gradient
for i in range(30):
    alpha = max(0, 4 - i // 8)
    gld.rectangle([0, H - i * 4, W, H - i * 4 + 3], fill=(0, 229, 255, alpha))
glass_layer = glass_layer.filter(ImageFilter.GaussianBlur(radius=8))
img.paste(Image.alpha_composite(img.convert("RGBA"), glass_layer).convert("RGB"))
print("Step 11: Glass reflections done")

# === 12. Final glow + vignette ===
final_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
fd2 = ImageDraw.Draw(final_layer)
# Vignette
for i in range(200):
    alpha = int((i / 200) * 80)
    inset = i * 3
    fd2.rectangle([0, 0, W, inset], fill=(5, 8, 22, alpha))
    fd2.rectangle([0, H - inset, W, H], fill=(5, 8, 22, alpha))
    fd2.rectangle([0, 0, inset, H], fill=(5, 8, 22, alpha // 2))
    fd2.rectangle([W - inset, 0, W, H], fill=(5, 8, 22, alpha // 2))
final_layer = final_layer.filter(ImageFilter.GaussianBlur(radius=30))
img.paste(Image.alpha_composite(img.convert("RGBA"), final_layer).convert("RGB"))
print("Step 12: Vignette done")

# === Save ===
output_path = r"C:\Users\ravin\Downloads\FINVERSE AI\apps\frontend\public\images\backgrounds\finverse-bg.png"
img.save(output_path, "PNG", optimize=True)
print(f"Saved: {output_path} ({img.size[0]}x{img.size[1]})")

# Also create WebP version for performance
webp_path = r"C:\Users\ravin\Downloads\FINVERSE AI\apps\frontend\public\images\backgrounds\finverse-bg.webp"
img.save(webp_path, "WEBP", quality=85)
print(f"Saved WebP: {webp_path}")
