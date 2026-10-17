import colorsys
import os
from PIL import Image

routes = ['landing', 'login', 'register', 'demo', 'dashboard']
viewports = ['390', '1440']

screenshots_dir = 'screenshots'
violations = {}

for route in routes:
    for vp in viewports:
        filename = f"{route}-{vp}.png"
        filepath = os.path.join(screenshots_dir, filename)
        if not os.path.exists(filepath):
            print(f"Missing screenshot: {filepath}")
            continue

        im = Image.open(filepath).convert('RGBA')
        pixels = list(im.getdata())
        bad_pixels = 0
        total_pixels = len(pixels)

        for r, g, b, a in pixels:
            if a == 0:
                continue
            # Convert rgb [0..255] to hsv [0..1]
            h, s, v = colorsys.rgb_to_hsv(r / 255.0, g / 255.0, b / 255.0)
            deg = h * 360.0
            # Hue 160 to 210 with saturation above 30%
            if 160.0 <= deg <= 210.0 and s > 0.30:
                bad_pixels += 1

        violations[filename] = bad_pixels
        status = "PASS" if bad_pixels == 0 else f"FAIL ({bad_pixels} pixels)"
        print(f"[{status}] {filename} ({total_pixels:,} total pixels) - hue-160-210 pixels: {bad_pixels}")

total_violations = sum(violations.values())
print(f"\nTotal violating pixels across all audited screenshots: {total_violations}")
assert total_violations == 0, f"Pixel check failed with {total_violations} violating pixels"
print("Pixel check 100% PASSED!")
