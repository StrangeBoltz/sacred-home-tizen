# Sacred Home

A sacred-geometry home screen and ambient mode for Samsung Tizen TVs, as a
[TizenBrew](https://github.com/reisxd/TizenBrew) app module.

Gold ornamental line work on deep night: a Flower of Life inside Metatron's Cube, star polygons and
tick-marked rings that draw themselves in, then rotate and breathe slowly around a clock.

- **Dock** of your apps, each with its own star-polygon sigil
- **Inputs row**: HDMI ports, Sources, Settings
- **Ambient mode** after 5 minutes idle (or Back / Yellow): the mandala fills the screen and drifts
  slowly to avoid burn-in. Any key wakes it.

Built for the 2017 Tizen 3.0 web engine (Chromium 47): plain ES5, no CSS variables, grid or flex `gap`,
and every geometry layer rotates as one composited element. Tested on a 2017 UN55MU800D.

## Install

1. Install TizenBrew on the TV (Developer Mode → TizenBrew Installer). For site mods like TizenTube,
   set Developer Mode's Host PC IP to `127.0.0.1` afterwards.
2. In TizenBrew, open the Module Manager, add a **GitHub** module:
   ```
   gh/StrangeBoltz/sacred-home-tizen
   ```
3. Optional: set it to **autolaunch** so it opens whenever TizenBrew starts.

## Customise

Fork the repo and edit [`app/config.js`](app/config.js): your name, the idle time, the apps (ids from
`GET http://<tv>:8001/api/v2/applications/<id>` or any Samsung TV app list) and the inputs row.

## How it talks to the TV

From inside the TV it uses the TV's own local API:
- apps: `POST http://127.0.0.1:8001/api/v2/applications/<appId>`
- keys (HDMI, Sources, Menu): the remote websocket on `ws://127.0.0.1:8001` (the TV may ask to
  Allow "SacredHome" the first time)

## Remote keys

| Key | Action |
|---|---|
| Arrows / OK | move, open |
| Back or Yellow | ambient mode |
| Blue | reload |
| Red (or the TizenBrew tile) | back to TizenBrew's module list |

If a module is set to autolaunch and you can't get back to TizenBrew's home, turn Developer Mode
off and restart the TV: TizenBrew only autolaunches in debug mode, so it opens on its module list.

MIT licensed.
