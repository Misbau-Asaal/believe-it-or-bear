# Believe It Or Bear: original mascot + profile assets.  python3 brand/bear.py  ->  avatar.png + banner_youtube.png (needs rsvg-convert)
import subprocess
INK = "#2a1a1e"
def bear(cx, cy, s, expr="grin"):
    # head centred at (cx, cy), head radius ~ 100*s
    g = f'<g transform="translate({cx},{cy}) scale({s})" stroke="{INK}" stroke-linejoin="round" stroke-linecap="round">'
    for x in (-78, 78):  # ears
        g += f'<circle cx="{x}" cy="-72" r="38" fill="#8b5a3c" stroke-width="10"/><circle cx="{x}" cy="-70" r="20" fill="#c98a62" stroke="none"/>'
    g += '<ellipse cx="0" cy="0" rx="112" ry="104" fill="#8b5a3c" stroke-width="11"/>'
    g += '<ellipse cx="-30" cy="-40" rx="52" ry="30" fill="#a3704c" stroke="none" opacity=".55"/>'
    g += '<ellipse cx="0" cy="38" rx="58" ry="44" fill="#e0b98f" stroke-width="8"/>'
    g += f'<ellipse cx="0" cy="16" rx="24" ry="16" fill="{INK}" stroke="none"/><ellipse cx="-7" cy="11" rx="7" ry="4" fill="#fff" opacity=".7" stroke="none"/>'
    if expr == "grin":
        g += f'<path d="M-26 46 Q0 78 26 46 Z" fill="#7a2230" stroke-width="7"/><path d="M-14 62 Q0 70 14 62" fill="none" stroke="#ff8a9a" stroke-width="6"/>'
    for x in (-44, 44):  # eyes
        g += f'<ellipse cx="{x}" cy="-14" rx="11" ry="14" fill="{INK}" stroke="none"/><circle cx="{x+4}" cy="-19" r="4" fill="#fff" stroke="none"/>'
    g += f'<path d="M-62 -38 Q-44 -48 -26 -40" fill="none" stroke-width="8"/><path d="M26 -40 Q44 -48 62 -38" fill="none" stroke-width="8"/>'
    # army cap
    g += '<path d="M-74 -62 Q-74 -128 0 -132 Q74 -128 74 -62 Z" fill="#6a6d3f" stroke-width="10"/>'
    g += '<path d="M-84 -60 Q0 -40 84 -60 L84 -48 Q0 -26 -84 -48 Z" fill="#4a4d2c" stroke-width="9"/>'
    g += '<circle cx="0" cy="-96" r="14" fill="#e8c868" stroke-width="7"/>'
    g += '</g>'
    return g
def save(name, w, h, body):
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{body}</svg>'
    open(name + ".svg", "w").write(svg)
    subprocess.run(["rsvg-convert", "-w", str(w), "-h", str(h), name + ".svg", "-o", name + ".png"], check=True)

# avatar: everything inside the central circle so round crops on every platform are safe
av = ('<defs><radialGradient id="bg" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#ffe3a8"/><stop offset="1" stop-color="#f0a85a"/></radialGradient></defs>'
      '<rect width="1000" height="1000" fill="url(#bg)"/>'
      + "".join(f'<path d="M500 560 L{500+900*__import__("math").cos(a*0.3927)} {560+900*__import__("math").sin(a*0.3927)} L{500+900*__import__("math").cos(a*0.3927+0.2)} {560+900*__import__("math").sin(a*0.3927+0.2)} Z" fill="#fff" opacity=".13"/>' for a in range(16))
      + bear(500, 560, 2.55))
save("avatar", 1000, 1000, av)

# YouTube banner 2560x1440; text-and-logo safe area is the central 1546x423 (x 507-2053, y 508-931)
import math
hills = "".join(f'<ellipse cx="{x}" cy="{1440+60}" rx="{r}" ry="{r*0.55}" fill="{c}"/>' for x, r, c in [(200, 520, "#c9a366"), (900, 620, "#d8b878"), (1700, 560, "#c9a366"), (2450, 600, "#d8b878")])
ban = ('<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b8fd8"/><stop offset=".62" stop-color="#cfe3f3"/><stop offset=".62" stop-color="#e9cf98"/><stop offset="1" stop-color="#d4b06c"/></linearGradient></defs>'
       '<rect width="2560" height="1440" fill="url(#sky)"/>' + hills +
       '<g fill="#fff" opacity=".9"><ellipse cx="380" cy="260" rx="150" ry="55"/><ellipse cx="460" cy="230" rx="90" ry="60"/><ellipse cx="2150" cy="330" rx="170" ry="60"/><ellipse cx="2060" cy="300" rx="90" ry="62"/></g>'
       '<rect x="507" y="508" width="1546" height="423" rx="40" fill="#fff6e4" stroke="' + INK + '" stroke-width="12"/>'
       + bear(760, 742, 1.35) +
       f'<text x="1040" y="672" font-family="DejaVu Sans" font-weight="bold" font-size="112" fill="{INK}">BELIEVE IT</text>'
       f'<text x="1040" y="788" font-family="DejaVu Sans" font-weight="bold" font-size="112" fill="#b0241f">OR BEAR</text>'
       f'<text x="1044" y="866" font-family="DejaVu Sans" font-weight="bold" font-size="46" fill="{INK}" opacity=".75">True stories. Twist endings.</text>')
save("banner_youtube", 2560, 1440, ban)
print("ok")
