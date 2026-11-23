"""Wrap every :hover rule in @media (hover:hover) and (pointer:fine).

Why: on phones and tablets a tap applies :hover and it sticks until the
next tap elsewhere, so lifted cards / zoomed photos stay stuck. Gating by
capability (not screen width) keeps hover for mice and trackpads, including
iPads with a trackpad, and drops it for fingers.

Usage: python tools/gate_hover.py css/style.css index.html ...
Works on .css files and on <style> blocks inside .html files.
Safe to re-run: rules already inside a hover media query are left alone.
"""
import re
import sys

GATE = "@media (hover:hover) and (pointer:fine)"
# Left alone on request: the New arrivals belt keeps its original hover.
SKIP = (".rx-line", ".rx-arrow")


def skip_comment_or_string(s, i):
    """If s[i] starts a comment or string, return index just past it, else None."""
    if s.startswith("/*", i):
        j = s.find("*/", i + 2)
        return len(s) if j < 0 else j + 2
    if s[i] in "\"'":
        q, j = s[i], i + 1
        while j < len(s) and s[j] != q:
            j += 2 if s[j] == "\\" else 1
        return j + 1
    return None


def match_brace(s, i):
    """s[i] == '{'; return index of the matching '}'."""
    depth = 0
    while i < len(s):
        k = skip_comment_or_string(s, i)
        if k is not None:
            i = k
            continue
        if s[i] == "{":
            depth += 1
        elif s[i] == "}":
            depth -= 1
            if depth == 0:
                return i
        i += 1
    raise ValueError("unbalanced braces")


def split_selectors(prelude):
    parts, depth, start = [], 0, 0
    for i, ch in enumerate(prelude):
        if ch in "([":
            depth += 1
        elif ch in ")]":
            depth -= 1
        elif ch == "," and depth == 0:
            parts.append(prelude[start:i])
            start = i + 1
    parts.append(prelude[start:])
    return parts


def gate(css, inside_hover=False):
    out, i, last = [], 0, 0
    while i < len(css):
        k = skip_comment_or_string(css, i)
        if k is not None:
            i = k
            continue
        ch = css[i]
        if ch == ";":  # statement at-rule like @import
            i += 1
            continue
        if ch == "}":  # stray close (shouldn't happen at this level)
            i += 1
            continue
        if ch != "{":
            i += 1
            continue
        # find where this prelude starts: after the last ; or } we emitted
        seg = css[last:i]
        m = re.search(r"[;}][^;}]*$", seg)
        pre_start = last + (m.start() + 1 if m else 0)
        out.append(css[last:pre_start])
        prelude = css[pre_start:i]
        end = match_brace(css, i)
        body = css[i + 1:end]
        p = prelude.strip()
        if p.startswith("@"):
            if re.match(r"@(media|supports|layer|container)\b", p):
                hov = inside_hover or "hover" in p
                out.append(prelude + "{" + gate(body, hov) + "}")
            else:
                out.append(css[pre_start:end + 1])
        elif inside_hover or ":hover" not in prelude or any(k in prelude for k in SKIP):
            out.append(css[pre_start:end + 1])
        else:
            sels = split_selectors(prelude)
            hov = [s for s in sels if ":hover" in s]
            rest = [s for s in sels if ":hover" not in s]
            lead = re.match(r"\s*", prelude).group(0)
            if rest:
                out.append(",".join(rest) + "{" + body + "}")
            hsel = ",".join(s.strip() for s in hov)
            out.append(lead if not rest else "" )
            out.append(GATE + "{" + hsel + "{" + body + "}}")
        i = last = end + 1
    out.append(css[last:])
    return "".join(out)


def process(path):
    src = open(path, encoding="utf-8", newline="").read()
    if path.endswith(".html"):
        new = re.sub(r"(<style[^>]*>)(.*?)(</style>)",
                     lambda m: m.group(1) + gate(m.group(2)) + m.group(3),
                     src, flags=re.S)
    else:
        new = gate(src)
    if new != src:
        open(path, "w", encoding="utf-8", newline="").write(new)
    before = len(re.findall(r":hover", src))
    print(f"{path}: {before} :hover refs, changed={new != src}")


if __name__ == "__main__":
    for p in sys.argv[1:]:
        process(p)
