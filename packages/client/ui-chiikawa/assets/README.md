# Character art (not in version control)

The room renders official 《ちいかわぽけっと》 character art. Those files are
third-party copyrighted material, so they are **deliberately not committed** —
`assets/*.png` is ignored. A fresh clone has this directory empty, and the room
page says so instead of showing broken images.

To make the room work, drop these ten PNGs here (exact file names matter):

| Key | File | Role |
| --- | --- | --- |
| `chiikawa_face` | `official-chiikawa-b.png` | ちいかわ, square card art |
| `chiikawa_body` | `official-chiikawa.png` | ちいかわ, tall star art |
| `hachiware_face` | `official-hachiware-b.png` | ハチワレ, square card art |
| `hachiware_body` | `official-hachiware.png` | ハチワレ, tall star art |
| `usagi_face` | `official-usagi.png` | うさぎ, square card art |
| `usagi_body` | `official-usagi-b.png` | うさぎ, tall star art |
| `kurimanju` | `official-kurimanju.png` | 栗まんじゅう |
| `momonga` | `official-momonga.png` | モモンガ |
| `shisa` | `official-shisa.png` | シーサー |
| `kv` | `official-kv.png` | key visual (unused by the current page) |

The keys are the ones the host half advertises at `GET /chiikawa/room`; a file
that is absent is simply not advertised, and the browser half hides the
characters it has no art for.

Only supply files you are entitled to use. The images this plugin was developed
against came from the official game site <https://gl.chiikawa-pocket.com>
(© nagano / ちいかわ製作委員会) and are for local use only.
