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

-- Window snapping: Ctrl+Shift+Left/Right pins the focused window to that half
local function snap(side)
  local win = hs.window.focusedWindow()
  if not win then return end
  local f = win:screen():frame()  -- usable area (excludes menu bar / dock)
  if side == "left" then
    win:setFrame({ x = f.x,           y = f.y, w = f.w / 2, h = f.h })
  else
    win:setFrame({ x = f.x + f.w / 2, y = f.y, w = f.w / 2, h = f.h })
  end
end

hs.hotkey.bind({"ctrl", "shift"}, "left",  function() snap("left")  end)
hs.hotkey.bind({"ctrl", "shift"}, "right", function() snap("right") end)

-- Ctrl+Shift+F maximizes the focused window (fills screen, not macOS fullscreen)
hs.hotkey.bind({"ctrl", "shift"}, "f", function()
  local win = hs.window.focusedWindow()
  if win then win:setFrame(win:screen():frame()) end
end)

-- Ctrl+Shift+T centers the focused window at 80% width x 90% height
hs.hotkey.bind({"ctrl", "shift"}, "t", function()
  local win = hs.window.focusedWindow()
  if not win then return end
  local f = win:screen():frame()
  local w, h = f.w * 0.80, f.h * 0.90
  win:setFrame({ x = f.x + (f.w - w) / 2, y = f.y + (f.h - h) / 2, w = w, h = h })
end)
