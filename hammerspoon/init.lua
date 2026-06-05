local prefix = hs.hotkey.modal.new()

prefix:bind({}, "n", function()
  hs.eventtap.keyStroke({"cmd", "shift"}, "]")  -- next tab
  prefix:exit()
end)

prefix:bind({}, "p", function()
  hs.eventtap.keyStroke({"cmd", "shift"}, "[")  -- previous tab
  prefix:exit()
end)

prefix:bind({}, "c", function()
  hs.eventtap.keyStroke({"cmd"}, "t")  -- new tab
  prefix:exit()
end)

prefix:bind({}, "escape", function() prefix:exit() end)

-- Ctrl-A hotkey, only enabled while Safari is frontmost
local ctrlA = hs.hotkey.new({"ctrl"}, "a", function()
  prefix:enter()
  hs.alert.show("Ctrl-A", 0.5)
end)

local function updateForApp(appName)
  if appName == "Safari" then
    ctrlA:enable()
  else
    ctrlA:disable()
    prefix:exit()
  end
end

appWatcher = hs.application.watcher.new(function(name, eventType, app)
  if eventType == hs.application.watcher.activated then
    updateForApp(name)
  end
end)
appWatcher:start()

-- Initial state
local front = hs.application.frontmostApplication()
updateForApp(front and front:name() or "")

-- Ctrl+Shift+C copies the URL of the frontmost Safari tab via AppleScript
hs.hotkey.bind({ "ctrl", "shift" }, "c", function()
  local front = hs.application.frontmostApplication()
  local name = front and front:name() or ""
  if name ~= "Safari" then return end
  local ok, url = hs.osascript.applescript('tell application "Safari" to return URL of front document')
  if ok and url then
    hs.pasteboard.setContents(url)
    hs.alert.show("URL copied", 0.8)
  end
end)

-- Window snapping: Ctrl+Shift+Left/Right cycles through 1/3, 1/2, 2/3 width
local snapFractions = { 1 / 3, 1 / 2, 2 / 3 }
local snapState = { winId = nil, side = nil, step = 0 }

local function snap(side)
  local win = hs.window.focusedWindow()
  if not win then return end
  if snapState.winId == win:id() and snapState.side == side then
    snapState.step = (snapState.step % #snapFractions) + 1
  else
    snapState.winId = win:id()
    snapState.side = side
    snapState.step = 1
  end
  local frac = snapFractions[snapState.step]
  local f = win:screen():frame()  -- usable area (excludes menu bar / dock)
  if side == "left" then
    win:setFrame({ x = f.x,                    y = f.y, w = f.w * frac, h = f.h })
  else
    win:setFrame({ x = f.x + f.w * (1 - frac), y = f.y, w = f.w * frac, h = f.h })
  end
end

hs.hotkey.bind({"ctrl", "shift"}, "left",  function() snap("left")  end)
hs.hotkey.bind({"ctrl", "shift"}, "right", function() snap("right") end)

-- Ctrl+Shift+F maximizes the focused window (fills screen, not macOS fullscreen)
hs.hotkey.bind({"ctrl", "shift"}, "f", function()
  local win = hs.window.focusedWindow()
  if win then win:setFrame(win:screen():frame()) end
end)

-- Ctrl+Shift+T centers the focused window at 90% width x 90% height
-- Uses eventtap instead of hs.hotkey because something (likely Ghostty) claims
-- Ctrl+Shift+T globally before the hotkey system sees it.
centerTap = hs.eventtap.new({ hs.eventtap.event.types.keyDown }, function(e)
  if e:getFlags().ctrl and e:getFlags().shift and not e:getFlags().alt and not e:getFlags().cmd then
    if e:getKeyCode() == hs.keycodes.map["t"] then
      local win = hs.window.focusedWindow()
      if win then
        local f = win:screen():frame()
        local w, h = f.w * 0.90, f.h * 0.90
        win:setFrame({ x = f.x + (f.w - w) / 2, y = f.y + (f.h - h) / 2, w = w, h = h })
      end
      return true
    end
  end
end)
centerTap:start()
