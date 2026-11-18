"""KZMD128 identity: custom geometric K/ascending-chevron monogram.
SVG master vector -> PNG variants, with distinct icon safe-area artwork.
"""
from pathlib import Path
import cairosvg
root=Path(__file__).resolve().parent
brand=root/'brand'; icons=root/'icons'; brand.mkdir(exist_ok=True); icons.mkdir(exist_ok=True)

# This is a new custom geometric mark, not a modification of the staircase logo.
# A straight vertical anchor and two rising/falling beveled wings form an abstract K.
# The blue wing visually points up-right, retaining the idea of personal progress.
GLYPH='''
  <path d="M68 70 Q68 64 74 64 H91 Q97 64 97 70 V186 Q97 192 91 192 H74 Q68 192 68 186 Z" fill="#F8FBFF"/>
  <path d="M110 127 L159 65 Q162 62 168 62 H194 Q200 62 196 68 L135 139 Z" fill="url(#wing)"/>
  <path d="M113 131 L136 113 L196 186 Q201 192 193 192 H163 Q159 192 156 188 Z" fill="#F8FBFF"/>
  <path d="M161 65 H194 Q200 65 196 71 L182 86 H145 Z" fill="white" fill-opacity=".16"/>
'''
DEFS='''<defs>
 <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#152A4F"/><stop offset="1" stop-color="#121B37"/></linearGradient>
 <linearGradient id="wing" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#4B79EF"/><stop offset="1" stop-color="#71CBEE"/></linearGradient>
</defs>'''

def svg(kind='icon',mask=False):
  if kind=='white':
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><defs><linearGradient id="wing"><stop stop-color="#FFFFFF"/></linearGradient></defs>'+GLYPH.replace('#F8FBFF','#FFFFFF')+'</svg>'
  if kind=='light':
    glyph=GLYPH.replace('#F8FBFF','#1B2A49')
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">'+DEFS+'<g>'+glyph+'</g></svg>'
  if kind=='mono':
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">'+DEFS+'<rect width="256" height="256" rx="57" fill="#17253F"/>'+GLYPH.replace('url(#wing)','#F8FBFF')+'</svg>'
  rect='<rect width="256" height="256" fill="url(#bg)"/>' if mask else '<rect width="256" height="256" rx="57" fill="url(#bg)"/>'
  # Constrain complete emblem into center safe region for OS adaptive masks.
  mark='<g transform="translate(27 27) scale(.79)">'+GLYPH+'</g>' if mask else GLYPH
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">'+DEFS+rect+mark+'</svg>'

(brand/'kzmd128-symbol.svg').write_text(svg(),encoding='utf-8')
(brand/'kzmd128-symbol-on-light.svg').write_text(svg('light'),encoding='utf-8')
(brand/'kzmd128-maskable.svg').write_text(svg(mask=True),encoding='utf-8')
(brand/'kzmd128-monochrome.svg').write_text(svg('mono'),encoding='utf-8')
(brand/'kzmd128-symbol-white.svg').write_text(svg('white'),encoding='utf-8')

def wordmark(dark=False):
  fg='#F2F6FF' if dark else '#1B2944'; secondary='#A7B5D0' if dark else '#687993'
  return f'''<svg xmlns="http://www.w3.org/2000/svg" width="880" height="176" viewBox="0 0 880 176">{DEFS}
    <rect width="164" height="164" y="6" rx="38" fill="url(#bg)"/>
    <g transform="translate(0 6) scale(.640625)">{GLYPH}</g>
    <text x="198" y="99" font-family="Arial,Helvetica,sans-serif" font-weight="700" letter-spacing="3" font-size="64" fill="{fg}">KZMD128</text>
    <text x="202" y="141" font-family="Arial,Helvetica,sans-serif" font-weight="500" letter-spacing="3.2" font-size="20" fill="{secondary}">PROGRESS, EVERY DAY.</text>
  </svg>'''
(brand/'kzmd128-wordmark.svg').write_text(wordmark(),encoding='utf-8')
(brand/'kzmd128-wordmark-dark.svg').write_text(wordmark(True),encoding='utf-8')

for name,size,mask in [('icon-192',192,False),('icon-512',512,False),('icon-maskable-512',512,True),('apple-touch-icon',180,False),('favicon-32',32,False)]:
  data=cairosvg.svg2png(bytestring=svg(mask=mask).encode('utf-8'),output_width=size,output_height=size)
  (icons/(name+'.png')).write_bytes(data)
  # New URLs avoid aggressive icon-cache retention on operating systems and browsers.
  (icons/(name+'-v4.png')).write_bytes(data)

(brand/'BRAND_GUIDE.md').write_text('''# KZMD128 — Visual identity / v4

**Direction selected: Geometric Monogram (B).** The old ascending three-node
staircase was too similar to the previous icon. Version 4 introduces a custom
K formed from a white vertical anchor, white bevelled lower wing, and an
ascending azure upper wing. The upward diagonal still signifies progress.

- Alternative A: refine old stepped track — rejected as insufficient differentiation.
- Alternative C: fully abstract arrows — rejected as less readable at 24–32 px.
- Icon background: deep navy `#152A4F → #121B37` (matte, no bright full-frame gradient).
- Accent wing: azure `#4B79EF → #71CBEE`; foreground: off-white `#F8FBFF`.
- Assets: symbol SVG, standalone light, monochrome, dark/light wordmark,
  maskable SVG and PNG PWA/iOS icons.
- All icon assets share a center-focused layout and generous edge space.
- For icon changes browsers may cache old images: v4 assets use new filenames.
''',encoding='utf-8')
print('Rebuilt brand SVG and PNG icon assets')
