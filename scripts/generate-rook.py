"""Generates public/models/rook.glb - the site logo as a low-poly 3D rook.

Run from repo root: python3 scripts/generate-rook.py
Geometry mirrors the blocky logo: base slab, plinth, body, collar, 3 merlons.
Units: modeled in mm, exported in meters (glTF requirement); ~27 cm tall,
a natural desk-object size in AR.
"""
import trimesh
from trimesh.visual import TextureVisuals
from trimesh.visual.material import PBRMaterial

MM = 0.001

# baseColorFactor is linear RGB per glTF spec (sRGB #e4e357 / #17181c converted).
ACCENT = PBRMaterial(baseColorFactor=[0.767, 0.760, 0.095, 1.0], metallicFactor=0.05, roughnessFactor=0.45, name="accent")
DARK = PBRMaterial(baseColorFactor=[0.0091, 0.0098, 0.0122, 1.0], metallicFactor=0.1, roughnessFactor=0.6, name="dark")


def box(w: float, h: float, d: float, x: float, y_bottom: float, mat: PBRMaterial) -> trimesh.Trimesh:
    b = trimesh.creation.box(extents=[w * MM, h * MM, d * MM])
    b.apply_translation([x * MM, (y_bottom + h / 2) * MM, 0.0])
    b.visual = TextureVisuals(material=mat)
    return b


parts = [
    box(190, 40, 120, 0, 0, DARK),        # base slab
    box(150, 25, 100, 0, 40, ACCENT),     # plinth
    box(120, 145, 80, 0, 65, ACCENT),     # body
    box(170, 25, 100, 0, 210, ACCENT),    # collar
    box(45, 35, 100, -62.5, 235, ACCENT), # merlon left
    box(45, 35, 100, 0, 235, ACCENT),     # merlon center
    box(45, 35, 100, 62.5, 235, ACCENT),  # merlon right
]

scene = trimesh.Scene(parts)
scene.export("public/models/rook.glb")
print("rook.glb written, bounds (m):", scene.bounds.tolist())
