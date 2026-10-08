'use client';
import { Component, useEffect, useImperativeHandle, useMemo, useRef, useState, type ReactNode, type Ref } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import * as opentype from 'opentype.js';
import { COLORS, TAG_PATHS, contrast, designStyle } from './ui';

// Everything is modeled in TagArt viewBox units (y pointing down, like the SVG); the scene
// group flips y and scales down, and three.js corrects face winding for the mirrored group.
const UNIT = 0.01;
const BODY_DEPTH = 8;
const BODY_BEVEL = 5;
const FACE_Z = BODY_DEPTH / 2 + BODY_BEVEL;
/** Rim tube radius; the bone is long and slim, so its rim is thinner. */
const RIM_RADIUS: Record<string, number> = { bone: 7.5 };
const rimRadius = (design: string) => RIM_RADIUS[design] ?? 11;
const BAIL = { radius: 13, tube: 5.5 };
const RING = { radius: 26, tube: 3.2 };
const FONT_FILES: Record<string, string> = { Rounded: '/fonts/tag/fredoka-latin-600-normal.woff', Classic: '/fonts/tag/roboto-slab-latin-700-normal.woff', Playful: '/fonts/tag/chewy-latin-400-normal.woff' };

/** The area the name fills on each design's face (centered on x, y), in viewBox units. */
const NAME_AREAS: Record<string, Box> = {
  bone: { x: 126, y: 137, w: 156, h: 38 },
  paw: { x: 138, y: 182, w: 178, h: 60 },
  round: { x: 130, y: 166, w: 150, h: 56 },
  heart: { x: 130, y: 146, w: 150, h: 58 },
  cat: { x: 130, y: 172, w: 140, h: 52 },
};

export type TagPreviewHandle = { turnOver: () => void };
type Props = { design: string; color: string; rim: string; secondary: string; name: string; font: string; onReady?: () => void; onError?: () => void; controller?: Ref<TagPreviewHandle> };

const fonts = new Map<string, Promise<opentype.Font>>();
function loadFont(font: string) {
  const url = FONT_FILES[font] ?? FONT_FILES.Rounded;
  if (!fonts.has(url)) fonts.set(url, fetch(url).then(r => { if (!r.ok) throw new Error(`Font ${url} failed to load`); return r.arrayBuffer(); }).then(buffer => opentype.parse(buffer)));
  return fonts.get(url)!;
}

function shapesFromPath(d: string) { return new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`).paths.flatMap(p => p.toShapes()); }
/**
 * Turns one glyph into extrudable shapes. These fonts build some letters from overlapping
 * contours, which triangulation cannot fill as one polygon, so each outer contour becomes its
 * own shape (overlapping solids read as one letter) and each counter (the hole in "o") is
 * attached to the outer contour that contains it.
 */
function glyphShapes(path: opentype.Path) {
  const contours: THREE.Shape[] = []; let current: THREE.Shape | undefined;
  for (const c of path.commands) {
    if (c.type === 'M') { current = new THREE.Shape(); current.moveTo(c.x, c.y); contours.push(current); }
    else if (!current) continue;
    else if (c.type === 'L') current.lineTo(c.x, c.y);
    else if (c.type === 'Q') current.quadraticCurveTo(c.x1, c.y1, c.x, c.y);
    else if (c.type === 'C') current.bezierCurveTo(c.x1, c.y1, c.x2, c.y2, c.x, c.y);
    else if (c.type === 'Z') current.closePath();
  }
  const measured = contours.map(shape => { const points = shape.getPoints(6); return { shape, points, area: THREE.ShapeUtils.area(points) }; }).filter(c => Math.abs(c.area) > 1e-3);
  if (!measured.length) return [];
  // The largest contour is always an outer one; contours wound the same way are outers too.
  const outerSign = Math.sign(measured.reduce((a, b) => Math.abs(b.area) > Math.abs(a.area) ? b : a).area);
  const outers = measured.filter(c => Math.sign(c.area) === outerSign);
  for (const hole of measured.filter(c => Math.sign(c.area) !== outerSign)) {
    const inside = outers.filter(o => contains(o.points, hole.points[0])).sort((a, b) => Math.abs(a.area) - Math.abs(b.area))[0];
    inside?.shape.holes.push(hole.shape);
  }
  return outers.map(o => o.shape);
}
function contains(polygon: THREE.Vector2[], p: THREE.Vector2) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) { const a = polygon[i], b = polygon[j]; if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) inside = !inside; }
  return inside;
}
/** Glyph-by-glyph layout; opentype's full text shaping trips on some fonts' substitution tables. */
function textShapes(font: opentype.Font, text: string) {
  const size = 100; const scale = size / font.unitsPerEm; let x = 0; let prev: opentype.Glyph | null = null; const shapes: THREE.Shape[] = [];
  for (const ch of text) { const glyph = font.charToGlyph(ch); if (prev) x += font.getKerningValue(prev, glyph) * scale; shapes.push(...glyphShapes(glyph.getPath(x, 0, size))); x += (glyph.advanceWidth ?? 0) * scale; prev = glyph; }
  return shapes;
}
/** Raised "bubble" relief: a rounded top layer over a slightly wider outline layer, sized in viewBox units. */
function relief(shapes: THREE.Shape[], scale: number) {
  const top = new THREE.ExtrudeGeometry(shapes, { depth: 3.2 / scale, bevelEnabled: true, bevelThickness: 2 / scale, bevelSize: .8 / scale, bevelSegments: 5, curveSegments: 10 });
  const outline = new THREE.ExtrudeGeometry(shapes, { depth: 1.5 / scale, bevelEnabled: true, bevelThickness: 1 / scale, bevelSize: 2.2 / scale, bevelSegments: 3, curveSegments: 10 });
  return { top, outline };
}
type Box = { x: number; y: number; w: number; h: number };
/** Scale and offset that fit shapes into a box centered on (x, y). */
function fit(shapes: THREE.Shape[], box: Box) {
  const b = new THREE.Box2(); shapes.forEach(s => s.getPoints(8).forEach(p => b.expandByPoint(p)));
  const scale = Math.min(box.w / (b.max.x - b.min.x), box.h / (b.max.y - b.min.y));
  return { scale, x: box.x - (b.min.x + b.max.x) / 2 * scale, y: box.y - (b.min.y + b.max.y) / 2 * scale };
}

function buildTag(design: string) {
  const shape = shapesFromPath(TAG_PATHS[design] ?? TAG_PATHS.round)[0];
  // SVG "Z" only marks the path closed; add the closing edge so sampling includes it (the bone's top).
  shape.closePath();
  // A deep inset bevel gives the face its puffy, pillowed look.
  const body = new THREE.ExtrudeGeometry(shape, { depth: BODY_DEPTH, bevelEnabled: true, bevelThickness: BODY_BEVEL, bevelSize: 12, bevelOffset: -12, bevelSegments: 8, curveSegments: 40 });
  body.translate(0, 0, -BODY_DEPTH / 2);
  // The rim is a round tube traced along the outline, like the moulded border in the artwork.
  const outline = shape.getSpacedPoints(260).map(p => new THREE.Vector3(p.x, p.y, 0));
  const rim = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(outline, true, 'centripetal'), 520, rimRadius(design), 18, true);
  const topY = Math.min(...outline.filter(p => Math.abs(p.x - 130) < 10).map(p => p.y));
  const bail = new THREE.Vector2(130, topY - BAIL.radius + 2);
  body.computeBoundingBox(); const b = body.boundingBox!;
  const top = bail.y - BAIL.radius - BAIL.tube - RING.radius * 2;
  const bottom = b.max.y + rimRadius(design);
  return { body, rim, bail, center: new THREE.Vector2((b.min.x + b.max.x) / 2, (top + bottom) / 2), width: b.max.x - b.min.x + rimRadius(design) * 2, height: bottom - top, bodyCenter: new THREE.Vector2((b.min.x + b.max.x) / 2, (b.min.y + b.max.y) / 2) };
}

/** The pet's name as raised bubble lettering, centered in the design's name area. */
function buildLettering(design: string, font: opentype.Font, name: string) {
  const shapes = textShapes(font, name); const placed = fit(shapes, NAME_AREAS[design] ?? NAME_AREAS.round);
  return [{ ...placed, ...relief(shapes, placed.scale) }];
}

function canvasTexture(size: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = size; draw(canvas.getContext('2d')!);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8; return texture;
}
/** Back of the tag: the NFC mark and a prompt for whoever finds the pet. */
function backLettering(color: string) {
  return canvasTexture(512, ctx => {
    ctx.fillStyle = color; ctx.strokeStyle = color; ctx.textAlign = 'center'; ctx.lineCap = 'round'; ctx.lineWidth = 9;
    for (const r of [22, 40, 58]) { ctx.beginPath(); ctx.arc(226, 190, r, -Math.PI / 4, Math.PI / 4); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(226, 190, 7, 0, Math.PI * 2); ctx.fill();
    ctx.font = "700 40px 'Wooblet Rounded', Arial, sans-serif"; ctx.fillText('TAP OR SCAN', 256, 305);
    ctx.globalAlpha = .8; ctx.font = "700 26px 'Wooblet Rounded', Arial, sans-serif"; ctx.fillText('wooblet', 256, 350);
  });
}

function Studio() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl); const room = new RoomEnvironment(); const env = pmrem.fromScene(room, .04).texture;
    scene.environment = env; scene.environmentIntensity = .4;
    return () => { scene.environment = null; env.dispose(); pmrem.dispose(); room.dispose?.(); };
  }, [gl, scene]);
  return null;
}

/** Matte, non-glossy finish for every moulded part. */
function Matte({ color }: { color: string }) { return <meshStandardMaterial color={color} roughness={.82} metalness={0} />; }

function Tag({ design, color, rim, secondary, name, font, controller, onReady, onError }: Props) {
  const tag = useMemo(() => buildTag(design), [design]);
  const callbacks = useRef({ onReady, onError }); callbacks.current = { onReady, onError };
  const [typeface, setTypeface] = useState<opentype.Font>();
  useEffect(() => { let live = true; loadFont(font).then(f => { if (live) setTypeface(f); }).catch(() => { if (live) callbacks.current.onError?.(); }); return () => { live = false; }; }, [font]);
  const label = name || designStyle(design).sample;
  const lettering = useMemo(() => typeface ? buildLettering(design, typeface, label) : [], [design, typeface, label]);
  const back = useMemo(() => backLettering(COLORS[secondary] ?? secondary), [secondary]);
  // Swap out the SVG placeholder only once the lettering exists, so the tag never appears blank.
  const announced = useRef(false);
  useEffect(() => { if (lettering.length && !announced.current) { announced.current = true; callbacks.current.onReady?.(); } }, [lettering]);
  useEffect(() => () => { tag.body.dispose(); tag.rim.dispose(); }, [tag]);
  useEffect(() => () => lettering.forEach(p => { p.top.dispose(); p.outline.dispose(); }), [lettering]);
  useEffect(() => () => back.dispose(), [back]);

  const group = useRef<THREE.Group>(null);
  const motion = useRef({ target: 0, angle: 0, dragging: false, lastX: 0, settled: false });
  const reducedMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const { gl, camera, size } = useThree();

  // Any new customization swings the tag back to its front so the change is visible.
  useEffect(() => { const m = motion.current; m.target = Math.round(m.target / (Math.PI * 2)) * Math.PI * 2; m.settled = false; }, [design, color, rim, secondary, name, font]);
  useImperativeHandle(controller, () => ({ turnOver() { const m = motion.current; m.settled = true; m.target += Math.PI; } }), []);

  // Horizontal drags turn the tag; vertical swipes keep scrolling the page on touch screens.
  useEffect(() => {
    const el = gl.domElement; const m = motion.current;
    el.style.touchAction = 'pan-y'; el.style.cursor = 'grab';
    const down = (e: PointerEvent) => { m.dragging = true; m.lastX = e.clientX; el.setPointerCapture(e.pointerId); el.style.cursor = 'grabbing'; };
    const move = (e: PointerEvent) => { if (!m.dragging) return; m.settled = true; m.target += (e.clientX - m.lastX) * .012; m.lastX = e.clientX; };
    const up = () => { m.dragging = false; el.style.cursor = 'grab'; };
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    return () => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
  }, [gl]);

  // Frame the whole tag and ring at any container size.
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera; const half = THREE.MathUtils.degToRad(cam.fov / 2);
    const fitHeight = (tag.height * UNIT / 2) / Math.tan(half); const fitWidth = (tag.width * UNIT / 2) / (Math.tan(half) * (size.width / size.height));
    cam.position.set(0, 0, Math.max(fitHeight, fitWidth) * 1.18 + FACE_Z * UNIT); cam.lookAt(0, 0, 0); cam.updateProjectionMatrix();
  }, [camera, size, tag]);

  useFrame(({ clock }, delta) => {
    const m = motion.current; if (!group.current) return;
    m.angle = THREE.MathUtils.damp(m.angle, m.target, 6, delta);
    group.current.rotation.y = m.angle + (reducedMotion || m.settled ? 0 : Math.sin(clock.elapsedTime * .9) * .32);
  });

  const tagColor = COLORS[color] ?? color; const rimColor = COLORS[rim] ?? rim; const letterColor = COLORS[secondary] ?? secondary;
  // Lettering is outlined in the rim color; when they match (brown on brown), deepen the outline so letters keep their edge.
  const outlineColor = useMemo(() => contrast(rimColor, letterColor) < 1.4 ? `#${new THREE.Color(rimColor).multiplyScalar(.55).getHexString()}` : rimColor, [rimColor, letterColor]);
  return <group ref={group} rotation-x={-.1}>
    <group scale={[UNIT, -UNIT, UNIT]} position={[-tag.center.x * UNIT, tag.center.y * UNIT, 0]}>
      <mesh geometry={tag.body}><Matte color={tagColor} /></mesh>
      <mesh geometry={tag.rim}><Matte color={rimColor} /></mesh>
      <mesh position={[tag.bail.x, tag.bail.y, 0]}><torusGeometry args={[BAIL.radius, BAIL.tube, 20, 48]} /><Matte color={rimColor} /></mesh>
      <mesh position={[tag.bail.x, tag.bail.y - RING.radius, 0]} rotation-y={Math.PI / 2 + .3}><torusGeometry args={[RING.radius, RING.tube, 20, 80]} /><meshStandardMaterial color="#d7dbdf" metalness={1} roughness={.35} /></mesh>
      {lettering.map((p, i) => <group key={i} position={[p.x, p.y, FACE_Z - .6]} scale={[p.scale, p.scale, p.scale]}>
        <mesh geometry={p.outline}><Matte color={outlineColor} /></mesh>
        <mesh geometry={p.top} position-z={.6 / p.scale}><Matte color={letterColor} /></mesh>
      </group>)}
      <mesh position={[tag.bodyCenter.x, tag.bodyCenter.y, -FACE_Z - .3]} rotation-y={Math.PI} scale={[1, -1, 1]}><planeGeometry args={[150, 150]} /><meshStandardMaterial map={back} transparent depthWrite={false} roughness={.8} polygonOffset polygonOffsetFactor={-2} /></mesh>
    </group>
  </group>;
}

/** WebGL can still fail after the support check (blocked GPU, lost context); fall back to the SVG. */
class Fallback extends Component<{ onError?: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError?.(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function TagPreview3D(props: Props) {
  return <Fallback onError={props.onError}><Canvas className="tag-3d-canvas" style={{ position: 'absolute', inset: '0 0 44px' }} dpr={[1, 2]} camera={{ fov: 32, near: .1, far: 50 }} gl={{ antialias: true, alpha: true }} onCreated={({ gl }) => { gl.toneMapping = THREE.NeutralToneMapping; }}>
    <Studio />
    <hemisphereLight args={['#ffffff', '#d9c7b0', .9]} />
    <directionalLight position={[2.5, 3, 4]} intensity={1.5} />
    <directionalLight position={[-3, -1, 2]} intensity={.35} />
    <Tag {...props} />
  </Canvas></Fallback>;
}
