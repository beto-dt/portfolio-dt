"""Generates public/models/rook.usdz - the rook for iOS AR Quick Look.

Run from repo root: python3 scripts/generate-rook-usdz.py
Same geometry and colors as generate-rook.py, authored natively in USD
(usd-core) instead of converting the glb, so no Reality Converter is needed.
"""
import os
import tempfile

from pxr import Kind, Sdf, Usd, UsdGeom, UsdShade, UsdUtils

# Same linear-RGB colors as the glb (sRGB #e4e357 / #17181c).
ACCENT = ((0.767, 0.760, 0.095), 0.05, 0.45)  # color, metallic, roughness
DARK = ((0.0091, 0.0098, 0.0122), 0.1, 0.6)
MM = 0.001

# (w, h, d, x, y_bottom, material) - mirrors generate-rook.py.
PARTS = [
    (190, 40, 120, 0, 0, "dark"),        # base slab
    (150, 25, 100, 0, 40, "accent"),     # plinth
    (120, 145, 80, 0, 65, "accent"),     # body
    (170, 25, 100, 0, 210, "accent"),    # collar
    (45, 35, 100, -62.5, 235, "accent"), # merlon left
    (45, 35, 100, 0, 235, "accent"),     # merlon center
    (45, 35, 100, 62.5, 235, "accent"),  # merlon right
]

# Quad faces with outward (right-handed) winding for the 8 box corners.
FACES = [(0, 1, 2, 3), (4, 7, 6, 5), (3, 2, 6, 7), (1, 0, 4, 5), (2, 1, 5, 6), (0, 3, 7, 4)]


def make_material(stage: Usd.Stage, name: str, spec) -> UsdShade.Material:
    (r, g, b), metallic, roughness = spec
    material = UsdShade.Material.Define(stage, f"/Rook/Materials/{name}")
    shader = UsdShade.Shader.Define(stage, f"/Rook/Materials/{name}/PBRShader")
    shader.CreateIdAttr("UsdPreviewSurface")
    shader.CreateInput("diffuseColor", Sdf.ValueTypeNames.Color3f).Set((r, g, b))
    shader.CreateInput("metallic", Sdf.ValueTypeNames.Float).Set(metallic)
    shader.CreateInput("roughness", Sdf.ValueTypeNames.Float).Set(roughness)
    material.CreateSurfaceOutput().ConnectToSource(shader.ConnectableAPI(), "surface")
    return material


def add_box(stage: Usd.Stage, i: int, part, materials) -> None:
    w, h, d, x, y0, mat = part
    w2, d2 = w / 2 * MM, d / 2 * MM
    cx, yb, yt = x * MM, y0 * MM, (y0 + h) * MM
    points = [
        (cx - w2, yb, -d2), (cx + w2, yb, -d2), (cx + w2, yb, d2), (cx - w2, yb, d2),
        (cx - w2, yt, -d2), (cx + w2, yt, -d2), (cx + w2, yt, d2), (cx - w2, yt, d2),
    ]
    mesh = UsdGeom.Mesh.Define(stage, f"/Rook/Geom/part{i}")
    mesh.CreatePointsAttr(points)
    mesh.CreateFaceVertexCountsAttr([4] * len(FACES))
    mesh.CreateFaceVertexIndicesAttr([idx for face in FACES for idx in face])
    mesh.CreateSubdivisionSchemeAttr(UsdGeom.Tokens.none)
    color = materials[mat][1]
    mesh.CreateDisplayColorAttr([color])
    UsdShade.MaterialBindingAPI.Apply(mesh.GetPrim()).Bind(materials[mat][0])


def main() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        usdc = os.path.join(tmp, "rook.usdc")
        stage = Usd.Stage.CreateNew(usdc)
        UsdGeom.SetStageUpAxis(stage, UsdGeom.Tokens.y)
        UsdGeom.SetStageMetersPerUnit(stage, 1.0)
        root = UsdGeom.Xform.Define(stage, "/Rook")
        Usd.ModelAPI(root.GetPrim()).SetKind(Kind.Tokens.component)
        stage.SetDefaultPrim(root.GetPrim())
        UsdGeom.Scope.Define(stage, "/Rook/Materials")
        UsdGeom.Scope.Define(stage, "/Rook/Geom")
        materials = {
            "accent": (make_material(stage, "accent", ACCENT), ACCENT[0]),
            "dark": (make_material(stage, "dark", DARK), DARK[0]),
        }
        for i, part in enumerate(PARTS):
            add_box(stage, i, part, materials)
        stage.Save()
        ok = UsdUtils.CreateNewARKitUsdzPackage(usdc, "public/models/rook.usdz")
        print("rook.usdz written:", ok, os.path.getsize("public/models/rook.usdz"), "bytes")


if __name__ == "__main__":
    main()
